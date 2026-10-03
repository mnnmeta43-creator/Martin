/**
 * Përshtatësi i Bankës Botërore (API v2): URL, parsimi i faqeve të treguesve dhe i vendeve.
 *
 * Written against the documented JSON format (meta object + rows array). Rows are untrusted:
 * aggregates (regions, income groups) and codes outside the country catalogue are skipped,
 * null values are skipped (absence = missing, never 0), and an error payload becomes a
 * `SourceError` instead of an empty result, so a broken request is never mistaken for "no data".
 */
import type { Country, CountryCode, IndicatorDefinition, Observation } from '@/lib/domain/types';
import { getCountries } from '@/lib/data/countries';
import { fetchJson, SourceError, type FetchJsonOptions } from '@/lib/data/http';
import { parsePeriod } from '@/lib/data/units';

export const WB_API_BASE = 'https://api.worldbank.org/v2';
export const WB_SOURCE_ID = 'worldbank-wdi';
export const WB_COUNTRIES_SOURCE_ID = 'worldbank-countries';

/** Hard stop against a malformed `pages` value making the fetcher loop for ever. */
const MAX_PAGES = 100;

// ─────────────────────────────────────────────────────────────────────────────
// Country code mapping
// ─────────────────────────────────────────────────────────────────────────────

export interface WbCountryRef {
  code: CountryCode; // canonical code
  currency: string | null; // first official currency, for MV (local-currency) series
}

let defaultIndex: Map<string, WbCountryRef> | null = null;

/** World Bank code → canonical country, built from Country.sourceCodes.worldbank. */
export function buildWbCountryIndex(countries: Country[]): Map<string, WbCountryRef> {
  const index = new Map<string, WbCountryRef>();
  for (const c of countries) {
    const wb = c.sourceCodes.worldbank;
    if (!wb || c.isDemo) continue;
    index.set(wb.toUpperCase(), { code: c.code, currency: c.currencies[0] ?? null });
  }
  return index;
}

function wbIndex(override?: Map<string, WbCountryRef>): Map<string, WbCountryRef> {
  if (override) return override;
  defaultIndex ??= buildWbCountryIndex(getCountries());
  return defaultIndex;
}

// ─────────────────────────────────────────────────────────────────────────────
// URLs
// ─────────────────────────────────────────────────────────────────────────────

export interface WbRangeOptions {
  from: number;
  to: number;
  perPage?: number;
  page?: number;
}

export function buildWbIndicatorUrl(sourceCode: string, countries: string[] | 'all', opts: WbRangeOptions): string {
  const codes = countries === 'all' ? 'all' : countries.map((c) => encodeURIComponent(c.toUpperCase())).join(';');
  const perPage = opts.perPage ?? 1000;
  const page = opts.page ?? 1;
  return `${WB_API_BASE}/country/${codes}/indicator/${encodeURIComponent(sourceCode)}?format=json&per_page=${perPage}&page=${page}&date=${opts.from}:${opts.to}`;
}

export function buildWbCountriesUrl(perPage = 400): string {
  return `${WB_API_BASE}/country?format=json&per_page=${perPage}`;
}

/**
 * Single-country version of a (possibly multi-country, paged) request URL. Citations point at
 * this URL so a user who opens it sees exactly the series the value came from.
 */
export function wbCountryUrlFrom(requestUrl: string, wbCode: string): string {
  try {
    const u = new URL(requestUrl);
    u.pathname = u.pathname.replace(/\/country\/[^/]+\//, `/country/${encodeURIComponent(wbCode)}/`);
    u.searchParams.delete('page');
    u.searchParams.delete('per_page');
    // URLSearchParams would percent-encode the ':' in date ranges; keep the documented form.
    return u.toString().replace(/%3A/gi, ':');
  } catch {
    return requestUrl;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Parsing
// ─────────────────────────────────────────────────────────────────────────────

interface WbMeta {
  page?: number | string;
  pages?: number | string;
  per_page?: number | string;
  total?: number | string;
  lastupdated?: string;
  message?: unknown[]; // error payload entries: {id, key, value}, untrusted
}

interface WbIndicatorRow {
  indicator?: { id?: string; value?: string };
  country?: { id?: string; value?: string };
  countryiso3code?: string;
  date?: string;
  value?: number | string | null;
  obs_status?: string;
}

export interface WbParseContext {
  retrievedAt: string;
  url: string;
  /** Canonical codes accepted; rows mapping to anything else (aggregates, unknown) are skipped. */
  knownCodes: Set<string>;
  /** Optional override of the WB → canonical mapping (defaults to the country catalogue). */
  countryIndex?: Map<string, WbCountryRef>;
}

export interface WbIndicatorPage {
  observations: Observation[];
  page: number;
  pages: number;
  lastUpdated: string | null;
}

function toInt(value: unknown): number {
  const n = typeof value === 'string' ? Number(value) : value;
  return typeof n === 'number' && Number.isFinite(n) ? Math.trunc(n) : 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Remote text ends up in the fetch log and the UI; keep it short and single-line. */
const MAX_REMOTE_DETAIL = 200;

function remoteDetail(parts: unknown[]): string {
  const text = parts
    .filter((p): p is string => typeof p === 'string' && p.trim() !== '')
    .join(' — ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > MAX_REMOTE_DETAIL ? `${text.slice(0, MAX_REMOTE_DETAIL - 1)}…` : text;
}

/** WB returns `[{"message":[…]}]` for invalid requests, often with HTTP 200. */
function assertNoErrorPayload(json: unknown, url: string): void {
  if (!Array.isArray(json) || !isRecord(json[0])) return;
  const messages = (json[0] as WbMeta).message;
  if (!Array.isArray(messages) || messages.length === 0) return;
  const m = isRecord(messages[0]) ? messages[0] : {};
  const detail = remoteDetail([m.key, m.value]);
  const id = remoteDetail([m.id]).slice(0, 20);
  throw new SourceError({
    kind: 'parse',
    url,
    message: `World Bank error ${id}: ${detail}`,
    messageSq: `Banka Botërore e refuzoi kërkesën${id ? ` (kodi ${id})` : ''}: ${detail || 'pa përshkrim'}. Kontrolloni kodin e treguesit dhe parametrat.`,
  });
}

function splitPayload(json: unknown, url: string): { meta: WbMeta; rows: unknown[] | null } {
  assertNoErrorPayload(json, url);
  if (!Array.isArray(json)) {
    throw new SourceError({ kind: 'parse', url, messageSq: 'Përgjigjja e Bankës Botërore nuk ka formatin e pritur (mungon lista).' });
  }
  if (json.length === 0) {
    throw new SourceError({ kind: 'empty', url, messageSq: 'Banka Botërore ktheu një përgjigje bosh.' });
  }
  if (!isRecord(json[0])) {
    throw new SourceError({ kind: 'parse', url, messageSq: 'Përgjigjja e Bankës Botërore nuk ka metadatat e pritura.' });
  }
  const rows = json[1];
  if (rows !== null && rows !== undefined && !Array.isArray(rows)) {
    throw new SourceError({ kind: 'parse', url, messageSq: 'Rreshtat e Bankës Botërore nuk kanë formatin e pritur.' });
  }
  return { meta: json[0] as WbMeta, rows: (rows as unknown[] | null | undefined) ?? null };
}

/** "2023" stays; "2023M01" → "2023-01"; "2023Q1" → "2023-Q1" (the Observation contract forms). */
export function canonicalPeriod(raw: string): string | null {
  const p = parsePeriod(raw);
  if (!p) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  switch (p.granularity) {
    case 'vit':
      return String(p.year);
    case 'tremujor':
      return `${p.year}-Q${p.quarter}`;
    case 'muaj':
      return `${p.year}-${pad(p.month!)}`;
    case 'dite':
      return `${p.year}-${pad(p.month!)}-${pad(p.day!)}`;
  }
}

function numericValue(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function isoDateOrNull(value: unknown): string | null {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function observationCurrency(def: IndicatorDefinition, ref: WbCountryRef): string | null {
  // "MV" = the country's own currency; store the concrete ISO code when the catalogue knows it.
  if (def.currency === 'MV' || def.unit === 'mv_per_usd') return ref.currency ?? 'MV';
  return def.currency ?? null;
}

function rowToObservation(row: WbIndicatorRow, def: IndicatorDefinition, ctx: WbParseContext, lastUpdated: string | null): Observation | null {
  const iso3 = typeof row.countryiso3code === 'string' ? row.countryiso3code.trim().toUpperCase() : '';
  if (!iso3) return null; // aggregates often have an empty iso3 code
  const ref = wbIndex(ctx.countryIndex).get(iso3);
  if (!ref || !ctx.knownCodes.has(ref.code)) return null;
  const value = numericValue(row.value);
  if (value === null) return null;
  const period = typeof row.date === 'string' ? canonicalPeriod(row.date) : null;
  if (!period) return null;
  return {
    sourceId: def.sourceId,
    indicatorCode: def.code,
    countryCode: ref.code,
    period,
    value,
    unit: def.unit,
    currency: observationCurrency(def, ref),
    isProjection: false,
    isDemo: false,
    obsStatus: typeof row.obs_status === 'string' && row.obs_status.trim() !== '' ? row.obs_status.trim() : null,
    sourceUrl: wbCountryUrlFrom(ctx.url, iso3),
    sourceLastUpdated: lastUpdated,
    retrievedAt: ctx.retrievedAt,
  };
}

/** Parses one page of `/country/{codes}/indicator/{code}`. */
export function parseWbIndicatorPage(json: unknown, def: IndicatorDefinition, ctx: WbParseContext): WbIndicatorPage {
  const { meta, rows } = splitPayload(json, ctx.url);
  const lastUpdated = isoDateOrNull(meta.lastupdated);
  const observations: Observation[] = [];
  for (const row of rows ?? []) {
    if (!isRecord(row)) continue;
    const obs = rowToObservation(row as WbIndicatorRow, def, ctx, lastUpdated);
    if (obs) observations.push(obs);
  }
  return { observations, page: toInt(meta.page), pages: toInt(meta.pages), lastUpdated };
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetching
// ─────────────────────────────────────────────────────────────────────────────

export interface WbFetchOptions extends Omit<FetchJsonOptions, 'headers'> {
  countries?: string[] | 'all';
  from: number;
  to: number;
  perPage?: number;
  /** Timestamp recorded as `retrievedAt` on every observation. */
  retrievedAt: string;
  knownCodes?: Set<string>;
  countryIndex?: Map<string, WbCountryRef>;
}

export interface WbIndicatorResult {
  observations: Observation[];
  lastUpdated: string | null;
  pages: number;
  urls: string[];
}

function defaultKnownCodes(index: Map<string, WbCountryRef>): Set<string> {
  return new Set([...index.values()].map((r) => r.code));
}

/** Fetches every page of one indicator; any failed page fails the whole call (no partial writes). */
export async function fetchWbIndicator(def: IndicatorDefinition, opts: WbFetchOptions): Promise<WbIndicatorResult> {
  const index = wbIndex(opts.countryIndex);
  const knownCodes = opts.knownCodes ?? defaultKnownCodes(index);
  const countries = opts.countries ?? 'all';
  const urls: string[] = [];
  const observations: Observation[] = [];
  let lastUpdated: string | null = null;
  let pages = 1;
  for (let page = 1; page <= Math.min(pages, MAX_PAGES); page++) {
    const url = buildWbIndicatorUrl(def.sourceCode, countries, { from: opts.from, to: opts.to, perPage: opts.perPage, page });
    urls.push(url);
    const json = await fetchJson<unknown>(url, opts);
    const parsed = parseWbIndicatorPage(json, def, { retrievedAt: opts.retrievedAt, url, knownCodes, countryIndex: index });
    observations.push(...parsed.observations);
    lastUpdated ??= parsed.lastUpdated;
    pages = parsed.pages;
  }
  return { observations, lastUpdated, pages, urls };
}

// ─────────────────────────────────────────────────────────────────────────────
// Country classification
// ─────────────────────────────────────────────────────────────────────────────

/** Income groups by World Bank id; unknown ids keep the English label. */
const INCOME_LEVEL_SQ: Record<string, string> = {
  HIC: 'Të ardhura të larta',
  UMC: 'Të ardhura mesatare të larta',
  LMC: 'Të ardhura mesatare të ulëta',
  LIC: 'Të ardhura të ulëta',
  INX: 'Pa klasifikim',
};

/** Regions by World Bank id. MEA is matched by id because its English name has changed over time. */
const REGION_SQ: Record<string, string> = {
  EAS: 'Azia Lindore dhe Paqësori',
  ECS: 'Evropa dhe Azia Qendrore',
  LCN: 'Amerika Latine dhe Karaibet',
  MEA: 'Lindja e Mesme dhe Afrika e Veriut',
  NAC: 'Amerika e Veriut',
  SAS: 'Azia Jugore',
  SSF: 'Afrika Subsahariane',
};

const LENDING_TYPE_SQ: Record<string, string> = {
  IBD: 'IBRD',
  IDX: 'IDA',
  IDB: 'E përzier (IBRD dhe IDA)',
  LNX: 'Pa klasifikim',
};

interface WbLabel {
  id?: string;
  value?: string;
}

interface WbCountryRow {
  id?: string;
  iso2Code?: string;
  name?: string;
  region?: WbLabel;
  incomeLevel?: WbLabel;
  lendingType?: WbLabel;
}

export interface WbCountryMetaRow {
  code: CountryCode;
  wb: NonNullable<Country['wb']>;
}

function label(map: Record<string, string>, l: WbLabel | undefined): string | null {
  if (!l) return null;
  const id = (l.id ?? '').trim().toUpperCase();
  if (map[id]) return map[id];
  const value = (l.value ?? '').trim();
  return value === '' ? null : value;
}

function isAggregate(row: WbCountryRow): boolean {
  const regionId = (row.region?.id ?? '').trim().toUpperCase();
  return regionId === 'NA' || row.region?.value?.trim() === 'Aggregates';
}

/** Parses `/country?format=json`, skipping aggregates and codes outside the catalogue. */
export function parseWbCountries(
  json: unknown,
  ctx: { retrievedAt: string; url?: string; countryIndex?: Map<string, WbCountryRef> },
): WbCountryMetaRow[] {
  const url = ctx.url ?? buildWbCountriesUrl();
  const { rows } = splitPayload(json, url);
  const index = wbIndex(ctx.countryIndex);
  const out: WbCountryMetaRow[] = [];
  for (const raw of rows ?? []) {
    if (!isRecord(raw)) continue;
    const row = raw as WbCountryRow;
    if (isAggregate(row)) continue;
    const ref = index.get((row.id ?? '').trim().toUpperCase());
    if (!ref) continue;
    const regionSq = label(REGION_SQ, row.region);
    out.push({
      code: ref.code,
      wb: {
        ...(regionSq ? { regionSq } : {}),
        incomeLevel: label(INCOME_LEVEL_SQ, row.incomeLevel),
        lendingType: label(LENDING_TYPE_SQ, row.lendingType),
        retrievedAt: ctx.retrievedAt,
      },
    });
  }
  return out;
}

export async function fetchWbCountries(
  opts: Omit<FetchJsonOptions, 'headers'> & { retrievedAt: string; countryIndex?: Map<string, WbCountryRef> },
): Promise<{ rows: WbCountryMetaRow[]; url: string }> {
  const url = buildWbCountriesUrl();
  const json = await fetchJson<unknown>(url, opts);
  return { rows: parseWbCountries(json, { retrievedAt: opts.retrievedAt, url, countryIndex: opts.countryIndex }), url };
}
