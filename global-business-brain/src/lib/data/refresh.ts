/**
 * Rifreskimi i të dhënave: merr burimet publike dhe i ruan me prejardhje të plotë.
 *
 * Order: World Bank country classification → every WB indicator for all economies over the
 * last 15 years → IMF indicators for the catalogue countries → ECB reference FX rates.
 * Each (source, scope) is independent: a scope still fresh per the registry's
 * `refreshEveryHours` is skipped (unless `force`), a failure keeps previously stored data
 * untouched and writes a 'gabim' fetch log with an Albanian message, and after 3 consecutive
 * failures of one source its remaining scopes are skipped for this run. Demo data is never
 * written here. `now` drives year ranges and skip decisions; `clock` only stamps the logs.
 */
import type { Country, FetchLogEntry, IndicatorDefinition, IsoTimestamp } from '@/lib/domain/types';
import type { DataStore } from '@/lib/server/store/types';
import { getCountries } from '@/lib/data/countries';
import { DEMO_COUNTRY_CODES } from '@/lib/data/demo/dataset';
import { HostRateLimiter, SourceError, isSourceError, type FetchJsonOptions } from '@/lib/data/http';
import { INDICATORS } from '@/lib/data/indicators';
import { fetchFrankfurterLatest, resolveFxBaseUrl, FX_SOURCE_ID } from '@/lib/data/sources/fx';
import { fetchImfIndicator, IMF_SOURCE_ID } from '@/lib/data/sources/imf';
import { getSource } from '@/lib/data/sources/registry';
import { fetchWbCountries, fetchWbIndicator, WB_COUNTRIES_SOURCE_ID, WB_SOURCE_ID } from '@/lib/data/sources/worldbank';
import { formatDateTime } from '@/lib/finance/format';

export const REFRESHABLE_SOURCES = [WB_COUNTRIES_SOURCE_ID, WB_SOURCE_ID, IMF_SOURCE_ID, FX_SOURCE_ID] as const;
export const CIRCUIT_BREAKER_THRESHOLD = 3;
/** Years of history requested from the World Bank on every refresh. */
export const WB_HISTORY_YEARS = 15;

export const COUNTRIES_SCOPE = 'countries';
export const FX_SCOPE = 'fx:EUR';
export function indicatorScope(code: string): string {
  return `indicator:${code}`;
}

export const CIRCUIT_OPEN_SQ = `Burimi u çaktivizua përkohësisht pas ${CIRCUIT_BREAKER_THRESHOLD} dështimeve radhazi; provohet sërish në rifreskimin e ardhshëm.`;
const KEPT_SQ = 'Të dhënat e ruajtura më parë nuk u prekën.';

export interface RefreshLogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export interface RefreshDeps {
  store: DataStore;
  fetchImpl?: typeof fetch;
  now: Date;
  /** Source ids to refresh (default: every refreshable source). */
  sources?: string[];
  /** Limit indicator scopes to these internal codes. */
  indicatorCodes?: string[];
  force?: boolean;
  sleep?: (ms: number) => Promise<void>;
  logger?: RefreshLogger;
  fxBaseUrl?: string;
  /** Clock for fetch-log timestamps and retrievedAt (default: always `now`). */
  clock?: () => Date;
  limiter?: HostRateLimiter;
  timeoutMs?: number;
  retries?: number;
  /** Catalogue override (tests); defaults to getCountries() without demo economies. */
  countries?: Country[];
}

export interface RefreshResult {
  sourceId: string;
  scope: string;
  status: FetchLogEntry['status'];
  rows: number;
  messageSq: string;
}

export interface RefreshReport {
  startedAt: IsoTimestamp;
  finishedAt: IsoTimestamp;
  results: RefreshResult[];
  okCount: number;
  errorCount: number;
  skippedCount: number;
}

interface ScopeOutcome {
  rows: number;
  status?: 'ok' | 'pjesshem';
  messageSq: string;
}

interface RunState {
  deps: RefreshDeps;
  clock: () => Date;
  logger: RefreshLogger;
  latestLogs: Map<string, FetchLogEntry>;
  failures: Map<string, number>;
  results: RefreshResult[];
}

const SILENT_LOGGER: RefreshLogger = { info: () => undefined, warn: () => undefined, error: () => undefined };

function logKey(sourceId: string, scope: string): string {
  return `${sourceId}|${scope}`;
}

/** Albanian message for the skip-if-fresh rule, or null when the scope must be fetched. */
function freshSkipMessage(sourceId: string, log: FetchLogEntry | undefined, now: Date): string | null {
  if (!log || log.status !== 'ok') return null;
  const hours = getSource(sourceId)?.refreshEveryHours;
  if (!hours) return null;
  const at = Date.parse(log.finishedAt ?? log.startedAt);
  if (!Number.isFinite(at)) return null;
  if (now.getTime() - at >= hours * 3_600_000) return null;
  return `Ende i freskët: rifreskimi i fundit i suksesshëm ishte më ${formatDateTime(new Date(at).toISOString())}; kontrollohet sërish pas ${hours} orësh.`;
}

function failureMessageSq(err: unknown): string {
  if (isSourceError(err)) return `${err.messageSq} ${KEPT_SQ}`;
  return `Gabim i brendshëm gjatë rifreskimit. ${KEPT_SQ}`;
}

/** Short English line for the operator log: never a stack trace, never a full error object. */
function failureLogLine(err: unknown): string {
  if (isSourceError(err)) return `${err.kind}${err.status ? ` ${err.status}` : ''} ${err.url}`;
  return err instanceof Error ? `${err.name}: ${err.message}` : 'unknown error';
}

async function writeLog(state: RunState, entry: FetchLogEntry): Promise<void> {
  try {
    await state.deps.store.addFetchLog(entry);
  } catch (err) {
    state.logger.error(`fetch log not written for ${entry.sourceId}/${entry.scope}: ${failureLogLine(err)}`);
  }
}

function push(state: RunState, result: RefreshResult): void {
  state.results.push(result);
  const line = `${result.sourceId} ${result.scope}: ${result.status} (${result.rows})`;
  if (result.status === 'gabim') state.logger.warn(line);
  else state.logger.info(line);
}

async function runScope(state: RunState, sourceId: string, scope: string, task: (retrievedAt: string) => Promise<ScopeOutcome>): Promise<void> {
  const { deps } = state;
  if ((state.failures.get(sourceId) ?? 0) >= CIRCUIT_BREAKER_THRESHOLD) {
    const at = state.clock().toISOString();
    await writeLog(state, { sourceId, scope, startedAt: at, finishedAt: at, status: 'anashkaluar', rows: 0, messageSq: CIRCUIT_OPEN_SQ });
    push(state, { sourceId, scope, status: 'anashkaluar', rows: 0, messageSq: CIRCUIT_OPEN_SQ });
    return;
  }
  if (!deps.force) {
    const skip = freshSkipMessage(sourceId, state.latestLogs.get(logKey(sourceId, scope)), deps.now);
    // No fetch log for a fresh skip: the last 'ok' entry must stay the latest one for this scope.
    if (skip) return push(state, { sourceId, scope, status: 'anashkaluar', rows: 0, messageSq: skip });
  }

  const startedAt = state.clock().toISOString();
  try {
    const outcome = await task(startedAt);
    const status = outcome.status ?? 'ok';
    await writeLog(state, { sourceId, scope, startedAt, finishedAt: state.clock().toISOString(), status, httpStatus: 200, rows: outcome.rows, messageSq: outcome.messageSq });
    if (status === 'ok') state.failures.set(sourceId, 0);
    push(state, { sourceId, scope, status, rows: outcome.rows, messageSq: outcome.messageSq });
  } catch (err) {
    const messageSq = failureMessageSq(err);
    state.logger.error(`${sourceId} ${scope} failed: ${failureLogLine(err)}`);
    await writeLog(state, {
      sourceId,
      scope,
      startedAt,
      finishedAt: state.clock().toISOString(),
      status: 'gabim',
      httpStatus: isSourceError(err) ? (err.status ?? null) : null,
      rows: 0,
      messageSq,
    });
    state.failures.set(sourceId, (state.failures.get(sourceId) ?? 0) + 1);
    push(state, { sourceId, scope, status: 'gabim', rows: 0, messageSq });
  }
}

function selectedIndicators(sourceId: string, codes?: string[]): IndicatorDefinition[] {
  const wanted = codes ? new Set(codes) : null;
  return INDICATORS.filter((d) => d.sourceId === sourceId && !d.discontinued && (!wanted || wanted.has(d.code)));
}

function realCountries(deps: RefreshDeps): Country[] {
  return (deps.countries ?? getCountries()).filter((c) => !c.isDemo && !DEMO_COUNTRY_CODES.has(c.code));
}

export async function refreshAll(deps: RefreshDeps): Promise<RefreshReport> {
  const clock = deps.clock ?? (() => deps.now);
  const state: RunState = {
    deps,
    clock,
    logger: deps.logger ?? SILENT_LOGGER,
    latestLogs: new Map(),
    failures: new Map(),
    results: [],
  };
  const startedAt = clock().toISOString();
  const wanted = new Set(deps.sources ?? REFRESHABLE_SOURCES);
  for (const id of wanted) {
    if (!(REFRESHABLE_SOURCES as readonly string[]).includes(id)) {
      push(state, { sourceId: id, scope: '*', status: 'anashkaluar', rows: 0, messageSq: 'Burim i panjohur ose pa përshtatës rifreskimi.' });
    }
  }

  for (const log of await deps.store.getLatestFetchLogs()) state.latestLogs.set(logKey(log.sourceId, log.scope), log);

  const countries = realCountries(deps);
  const knownCodes = new Set(countries.map((c) => c.code));
  const http: Omit<FetchJsonOptions, 'headers'> = {
    fetchImpl: deps.fetchImpl,
    sleep: deps.sleep,
    limiter: deps.limiter ?? new HostRateLimiter({ sleep: deps.sleep }),
    timeoutMs: deps.timeoutMs,
    retries: deps.retries,
  };
  const year = deps.now.getUTCFullYear();

  if (wanted.has(WB_COUNTRIES_SOURCE_ID)) {
    await runScope(state, WB_COUNTRIES_SOURCE_ID, COUNTRIES_SCOPE, async (retrievedAt) => {
      const { rows } = await fetchWbCountries({ ...http, retrievedAt });
      const real = rows.filter((r) => knownCodes.has(r.code));
      if (real.length === 0) {
        throw new SourceError({ kind: 'empty', url: 'https://api.worldbank.org/v2/country', messageSq: 'Banka Botërore nuk ktheu asnjë vend.' });
      }
      const n = await deps.store.upsertCountryMeta(real);
      return { rows: n, messageSq: `U përditësua klasifikimi i Bankës Botërore për ${n} vende.` };
    });
  }

  if (wanted.has(WB_SOURCE_ID)) {
    for (const def of selectedIndicators(WB_SOURCE_ID, deps.indicatorCodes)) {
      await runScope(state, WB_SOURCE_ID, indicatorScope(def.code), async (retrievedAt) => {
        const res = await fetchWbIndicator(def, { ...http, countries: 'all', from: year - WB_HISTORY_YEARS, to: year, retrievedAt, knownCodes });
        const obs = res.observations.filter((o) => !o.isDemo && knownCodes.has(o.countryCode));
        const n = obs.length > 0 ? await deps.store.upsertObservations(obs) : 0;
        const messageSq = obs.length > 0 ? `U ruajtën ${n} vlera (${res.pages} faqe).` : 'Burimi nuk ktheu asnjë vlerë për periudhën e kërkuar.';
        return { rows: n, messageSq };
      });
    }
  }

  if (wanted.has(IMF_SOURCE_ID)) {
    const imfCountries = countries.filter((c) => c.sourceCodes.imf).map((c) => c.code);
    for (const def of selectedIndicators(IMF_SOURCE_ID, deps.indicatorCodes)) {
      await runScope(state, IMF_SOURCE_ID, indicatorScope(def.code), async (retrievedAt) => {
        const res = await fetchImfIndicator(def, imfCountries, { ...http, now: deps.now, retrievedAt });
        const obs = res.observations.filter((o) => !o.isDemo && knownCodes.has(o.countryCode));
        const n = obs.length > 0 ? await deps.store.upsertObservations(obs) : 0;
        if (res.errors.length > 0) {
          return {
            rows: n,
            status: 'pjesshem',
            messageSq: `U ruajtën ${n} vlera; ${res.errors.length} nga ${res.urls.length} grupe vendesh dështuan (${res.errors[0].messageSq}). ${KEPT_SQ}`,
          };
        }
        return { rows: n, messageSq: obs.length > 0 ? `U ruajtën ${n} vlera.` : 'Burimi nuk ktheu asnjë vlerë.' };
      });
    }
  }

  if (wanted.has(FX_SOURCE_ID)) {
    await runScope(state, FX_SOURCE_ID, FX_SCOPE, async (retrievedAt) => {
      const { rates } = await fetchFrankfurterLatest({ ...http, baseUrl: deps.fxBaseUrl ?? resolveFxBaseUrl(), retrievedAt });
      const n = await deps.store.upsertFxRates(rates);
      return { rows: n, messageSq: `U ruajtën ${n} kurse referimi të datës ${rates[0]?.rateDate ?? '—'}.` };
    });
  }

  const results = state.results;
  return {
    startedAt,
    finishedAt: clock().toISOString(),
    results,
    okCount: results.filter((r) => r.status === 'ok' || r.status === 'pjesshem').length,
    errorCount: results.filter((r) => r.status === 'gabim').length,
    skippedCount: results.filter((r) => r.status === 'anashkaluar').length,
  };
}
