/**
 * Konteksti i të dhënave për një ose më shumë vende: seritë, mbulimi, kurset dhe gabimet e burimeve.
 *
 * Real economies read only stored, non-demo observations. Demo economies (ZZA/ZZB/ZZC) exist
 * only when `demoMode` is on and are generated in memory — demo data is never read from or
 * written to the real tables. Every tracked indicator gets a series; an absent one has status
 * 'mungon' and no value, never 0. The batch variant uses a fixed number of batched store reads
 * (observations, latest fetch logs, FX rates, country metadata) whatever the number of codes, so
 * the country catalogue can show coverage for every economy without one query per country.
 */
import type {
  Country,
  CountryCode,
  CountryDataContext,
  FetchLogEntry,
  FxRate,
  IndicatorSeries,
  IsoTimestamp,
  Observation,
} from '@/lib/domain/types';
import type { DataStore } from '@/lib/server/store/types';
import { computeCoverage } from '@/lib/data/coverage';
import { getCountries, getCountry, withWbMeta } from '@/lib/data/countries';
import { buildDemoFxRates, buildDemoObservations, DEMO_COUNTRY_CODES } from '@/lib/data/demo/dataset';
import { INDICATORS } from '@/lib/data/indicators';
import { indicatorScope } from '@/lib/data/refresh';
import { buildSeries } from '@/lib/data/series';
import { fxRatesFromWbAnnual } from '@/lib/data/sources/fx';

export interface ContextOptions {
  demoMode?: boolean;
}

const FX_INDICATOR = 'exchange_rate_lcu_usd';

type ObsIndex = Map<CountryCode, Map<string, Observation[]>>;

function indexObservations(observations: Observation[]): ObsIndex {
  const index: ObsIndex = new Map();
  for (const o of observations) {
    let byIndicator = index.get(o.countryCode);
    if (!byIndicator) index.set(o.countryCode, (byIndicator = new Map()));
    const list = byIndicator.get(o.indicatorCode);
    if (list) list.push(o);
    else byIndicator.set(o.indicatorCode, [o]);
  }
  return index;
}

function logKey(sourceId: string, scope: string): string {
  return `${sourceId}|${scope}`;
}

function logTime(log: FetchLogEntry): string {
  return log.finishedAt ?? log.startedAt;
}

/** Newest successful fetch among the given logs. */
function lastSuccessfulFetch(logs: FetchLogEntry[]): IsoTimestamp | null {
  let best: string | null = null;
  for (const log of logs) {
    if (log.status !== 'ok' && log.status !== 'pjesshem') continue;
    const t = logTime(log);
    if (!best || t > best) best = t;
  }
  return best;
}

function buildAllSeries(
  country: Country,
  byIndicator: Map<string, Observation[]> | undefined,
  now: Date,
  latestLogs: Map<string, FetchLogEntry>,
): IndicatorSeries[] {
  return INDICATORS.map((def) => {
    const obs = byIndicator?.get(def.code) ?? [];
    const lastFetch = country.isDemo ? null : (latestLogs.get(logKey(def.sourceId, indicatorScope(def.code))) ?? null);
    return buildSeries(def, country.code, obs, now, lastFetch, { isDemo: country.isDemo });
  });
}

function assemble(
  country: Country,
  series: IndicatorSeries[],
  fxRates: FxRate[],
  now: Date,
  lastRefreshAt: IsoTimestamp | null,
  sourceErrors: FetchLogEntry[],
): CountryDataContext {
  return {
    country,
    series,
    coverage: computeCoverage(country.code, series, now),
    fxRates,
    isDemo: country.isDemo,
    lastRefreshAt,
    sourceErrors,
    generatedAt: now.toISOString(),
  };
}

interface RealData {
  index: ObsIndex;
  latestLogs: Map<string, FetchLogEntry>;
  fxRates: FxRate[];
  meta: Record<CountryCode, NonNullable<Country['wb']>>;
  lastRefreshAt: IsoTimestamp | null;
  sourceErrors: FetchLogEntry[];
}

/**
 * From this many economies on (e.g. the catalogue, ~250 codes) one unfiltered read replaces the
 * country-filtered read plus the FX read: the filtered read would return almost every row anyway,
 * and the FX rows would otherwise be transferred twice.
 */
export const FULL_READ_MIN_COUNTRIES = 25;

interface ObservationReads {
  own: Observation[]; // rows of the requested economies
  fx: Observation[]; // WB exchange-rate rows of every economy
}

/** Batched reads only: one or two queries in total, never one per country. */
async function readObservations(store: DataStore, codes: CountryCode[]): Promise<ObservationReads> {
  if (codes.length >= FULL_READ_MIN_COUNTRIES) {
    const all = await store.getObservations({ includeDemo: false });
    const wanted = new Set(codes);
    return { own: all.filter((o) => wanted.has(o.countryCode)), fx: all.filter((o) => o.indicatorCode === FX_INDICATOR) };
  }
  const [own, fx] = await Promise.all([
    store.getObservations({ countryCodes: codes, includeDemo: false }),
    // Rates for every currency, not just these countries: conversions may need any of them.
    store.getObservations({ indicatorCodes: [FX_INDICATOR], includeDemo: false }),
  ]);
  return { own, fx };
}

async function loadRealData(store: DataStore, codes: CountryCode[]): Promise<RealData> {
  const [reads, latestLogList, storedFx, meta] = await Promise.all([
    readObservations(store, codes),
    store.getLatestFetchLogs(),
    store.getFxRates(),
    store.getCountryMeta(),
  ]);
  // Defence in depth: a demo row must never leak into a real economy, whatever the store does.
  const real = reads.own.filter((o) => !o.isDemo && !DEMO_COUNTRY_CODES.has(o.countryCode));
  const latestLogs = new Map(latestLogList.map((l) => [logKey(l.sourceId, l.scope), l]));
  const derived = fxRatesFromWbAnnual(
    reads.fx.filter((o) => !o.isDemo && !DEMO_COUNTRY_CODES.has(o.countryCode)),
    getCountries(),
  );
  const fxRates = [...storedFx.filter((r) => r.kind !== 'demo' && r.sourceId !== 'demo'), ...derived];
  // Only scopes whose latest attempt failed: an error that a later refresh fixed is history.
  const sourceErrors = latestLogList.filter((l) => l.status === 'gabim').sort((a, b) => logTime(b).localeCompare(logTime(a)));
  return { index: indexObservations(real), latestLogs, fxRates, meta, lastRefreshAt: lastSuccessfulFetch(latestLogList), sourceErrors };
}

/**
 * Contexts for several economies, aligned with `codes` (null for unknown codes, and for demo
 * codes when demo mode is off). Reads the store at most once per call.
 */
export async function getCountryDataContexts(
  store: DataStore,
  codes: CountryCode[],
  now: Date,
  opts: ContextOptions = {},
): Promise<(CountryDataContext | null)[]> {
  const demoMode = opts.demoMode === true;
  const resolved = codes.map((code) => getCountry(code, { includeDemo: demoMode }) ?? null);
  const realCountries = [...new Map(resolved.filter((c): c is Country => c !== null && !c.isDemo).map((c) => [c.code, c])).values()];
  const hasDemo = resolved.some((c) => c?.isDemo);

  const realData = realCountries.length > 0 ? await loadRealData(store, realCountries.map((c) => c.code)) : null;
  const demoIndex = hasDemo ? indexObservations(buildDemoObservations(now)) : null;
  const demoFx = hasDemo ? buildDemoFxRates(now) : [];
  const withMeta = new Map<CountryCode, Country>(
    realData ? withWbMeta(realCountries, realData.meta).map((c) => [c.code, c]) : [],
  );

  return resolved.map((country) => {
    if (!country) return null;
    if (country.isDemo) {
      const series = buildAllSeries(country, demoIndex?.get(country.code), now, new Map());
      return assemble(country, series, demoFx, now, null, []);
    }
    if (!realData) return null;
    const merged: Country = withMeta.get(country.code) ?? country;
    const series = buildAllSeries(merged, realData.index.get(country.code), now, realData.latestLogs);
    return assemble(merged, series, realData.fxRates, now, realData.lastRefreshAt, realData.sourceErrors);
  });
}

/** Context for one economy, or null when the code is unknown (or demo while demo mode is off). */
export async function getCountryDataContext(
  store: DataStore,
  countryCode: CountryCode,
  now: Date,
  opts: ContextOptions = {},
): Promise<CountryDataContext | null> {
  const [ctx] = await getCountryDataContexts(store, [countryCode], now, opts);
  return ctx ?? null;
}
