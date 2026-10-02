/**
 * Përshtatësi i FMN-së (DataMapper API v1, bazuar në World Economic Outlook).
 *
 * Response shape: {"values": {CODE: {IMF_COUNTRY: {"2023": 1.1, …}}}}. IMF country codes are
 * mapped to canonical codes through Country.sourceCodes.imf (Kosovo: UVK ↔ XKX); aggregates and
 * unknown codes are skipped, and null values stay missing.
 *
 * Projection rule (conservative and deterministic): every year ≥ the calendar year of `now` is
 * flagged `isProjection`. WEO itself marks estimates/projections from each country's latest
 * actual year, which can be earlier; DataMapper does not expose that boundary, so values for
 * recent past years may still be IMF estimates rather than final measurements.
 */
import type { Country, CountryCode, IndicatorDefinition, Observation } from '@/lib/domain/types';
import { getCountries } from '@/lib/data/countries';
import { fetchJson, SourceError, isSourceError, type FetchJsonOptions } from '@/lib/data/http';

export const IMF_API_BASE = 'https://www.imf.org/external/datamapper/api/v1';
export const IMF_SOURCE_ID = 'imf-datamapper';
export const IMF_BATCH_SIZE = 40;

let defaultIndex: Map<string, CountryCode> | null = null;

/** IMF code → canonical code, from Country.sourceCodes.imf. */
export function buildImfCountryIndex(countries: Country[]): Map<string, CountryCode> {
  const index = new Map<string, CountryCode>();
  for (const c of countries) {
    const imf = c.sourceCodes.imf;
    if (imf && !c.isDemo) index.set(imf.toUpperCase(), c.code);
  }
  return index;
}

function imfIndex(override?: Map<string, CountryCode>): Map<string, CountryCode> {
  if (override) return override;
  defaultIndex ??= buildImfCountryIndex(getCountries());
  return defaultIndex;
}

/** `{base}/{CODE}/{C1}/{C2}…`; without countries the API returns every economy. */
export function buildImfUrl(imfCode: string, imfCountryCodes: string[] = []): string {
  const path = [imfCode, ...imfCountryCodes.map((c) => c.toUpperCase())].map(encodeURIComponent).join('/');
  return `${IMF_API_BASE}/${path}`;
}

export interface ImfParseContext {
  retrievedAt: string;
  url: string;
  now: Date;
  countryIndex?: Map<string, CountryCode>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Parses a DataMapper response for one indicator. A missing indicator/country key means no data. */
export function parseImfResponse(json: unknown, def: IndicatorDefinition, ctx: ImfParseContext): Observation[] {
  if (!isRecord(json)) {
    throw new SourceError({ kind: 'parse', url: ctx.url, messageSq: 'Përgjigjja e FMN-së nuk ka formatin e pritur (mungon objekti).' });
  }
  const values = json.values;
  if (values === undefined) return [];
  if (!isRecord(values)) {
    throw new SourceError({ kind: 'parse', url: ctx.url, messageSq: 'Fusha “values” e FMN-së nuk ka formatin e pritur.' });
  }
  const byCountry = values[def.sourceCode];
  if (!isRecord(byCountry)) return [];

  const index = imfIndex(ctx.countryIndex);
  const currentYear = ctx.now.getUTCFullYear();
  const out: Observation[] = [];
  for (const [imfCode, years] of Object.entries(byCountry)) {
    const code = index.get(imfCode.toUpperCase());
    if (!code || !isRecord(years)) continue;
    for (const [year, raw] of Object.entries(years)) {
      if (!/^\d{4}$/.test(year)) continue;
      if (typeof raw !== 'number' || !Number.isFinite(raw)) continue;
      out.push({
        sourceId: def.sourceId,
        indicatorCode: def.code,
        countryCode: code,
        period: year,
        value: raw,
        unit: def.unit,
        currency: def.currency ?? null,
        isProjection: Number(year) >= currentYear,
        isDemo: false,
        obsStatus: null,
        sourceUrl: buildImfUrl(def.sourceCode, [imfCode]),
        sourceLastUpdated: null,
        retrievedAt: ctx.retrievedAt,
      });
    }
  }
  return out;
}

export interface ImfFetchOptions extends Omit<FetchJsonOptions, 'headers'> {
  now: Date;
  retrievedAt: string;
  countryIndex?: Map<string, CountryCode>;
  batchSize?: number;
}

export interface ImfIndicatorResult {
  observations: Observation[];
  urls: string[];
  /** Failed batches; their countries keep whatever was stored before. */
  errors: SourceError[];
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/**
 * Fetches one indicator for the given canonical country codes in batches (≤ 40 per request).
 * Partial failure is reported in `errors`; if every batch fails the first error is thrown.
 */
export async function fetchImfIndicator(def: IndicatorDefinition, countries: CountryCode[], opts: ImfFetchOptions): Promise<ImfIndicatorResult> {
  const index = imfIndex(opts.countryIndex);
  const reverse = new Map([...index.entries()].map(([imf, code]) => [code, imf]));
  const imfCodes = [...new Set(countries.map((c) => reverse.get(c.toUpperCase())).filter((c): c is string => Boolean(c)))];
  const batches = chunk(imfCodes, Math.min(Math.max(1, opts.batchSize ?? IMF_BATCH_SIZE), IMF_BATCH_SIZE));
  const result: ImfIndicatorResult = { observations: [], urls: [], errors: [] };
  for (const batch of batches) {
    const url = buildImfUrl(def.sourceCode, batch);
    result.urls.push(url);
    try {
      const json = await fetchJson<unknown>(url, opts);
      result.observations.push(...parseImfResponse(json, def, { retrievedAt: opts.retrievedAt, url, now: opts.now, countryIndex: index }));
    } catch (err) {
      // A policy block applies to the whole host, so the remaining batches would fail the same way.
      if (!isSourceError(err) || err.kind === 'blocked') throw err;
      result.errors.push(err);
    }
  }
  if (batches.length > 0 && result.errors.length === batches.length) throw result.errors[0];
  return result;
}
