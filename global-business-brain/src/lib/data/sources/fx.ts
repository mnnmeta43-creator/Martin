/**
 * Kurset e këmbimit: kurset ditore të referencës së BQE-së (Frankfurter) dhe kurset vjetore
 * të Bankës Botërore si rezervë për monedhat që BQE nuk i mbulon (p.sh. ALL, MKD, RSD).
 *
 * Frankfurter response: {"amount":1.0,"base":"EUR","date":"2025-01-10","rates":{"USD":1.03,…}}.
 * Rates are informational reference rates; a bank applies its own buy/sell rate.
 */
import type { Country, FxRate, Observation } from '@/lib/domain/types';
import { fetchJson, SourceError, type FetchJsonOptions } from '@/lib/data/http';

export const FX_DEFAULT_BASE_URL = 'https://api.frankfurter.dev/v1';
export const FX_SOURCE_ID = 'ecb-frankfurter';
export const WB_FX_SOURCE_ID = 'worldbank-wdi';
const WB_FX_INDICATOR = 'exchange_rate_lcu_usd';

/** Base URL from FX_API_BASE_URL (no trailing slash) or the public default. */
export function resolveFxBaseUrl(env: Record<string, string | undefined> = process.env): string {
  const fromEnv = env.FX_API_BASE_URL?.trim();
  return (fromEnv && /^https?:\/\//.test(fromEnv) ? fromEnv : FX_DEFAULT_BASE_URL).replace(/\/+$/, '');
}

export function buildFrankfurterLatestUrl(baseUrl: string = FX_DEFAULT_BASE_URL, base = 'EUR'): string {
  return `${baseUrl.replace(/\/+$/, '')}/latest?base=${encodeURIComponent(base.toUpperCase())}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const CURRENCY_RE = /^[A-Z]{3}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Parses a Frankfurter `/latest` payload into daily reference rates (1 base = rate quote). */
export function parseFrankfurterLatest(json: unknown, ctx: { retrievedAt: string; url: string }): FxRate[] {
  if (!isRecord(json) || typeof json.base !== 'string' || typeof json.date !== 'string' || !isRecord(json.rates)) {
    throw new SourceError({ kind: 'parse', url: ctx.url, messageSq: 'Përgjigjja e kurseve të këmbimit nuk ka formatin e pritur (base, date, rates).' });
  }
  const base = json.base.toUpperCase();
  if (!CURRENCY_RE.test(base) || !DATE_RE.test(json.date)) {
    throw new SourceError({ kind: 'parse', url: ctx.url, messageSq: 'Monedha bazë ose data e kurseve nuk janë të vlefshme.' });
  }
  const rateDate = json.date;
  const rates: FxRate[] = [];
  for (const [quote, value] of Object.entries(json.rates)) {
    const q = quote.toUpperCase();
    if (!CURRENCY_RE.test(q) || q === base) continue;
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) continue;
    rates.push({ base, quote: q, rate: value, rateDate, sourceId: FX_SOURCE_ID, kind: 'reference_ditore', retrievedAt: ctx.retrievedAt });
  }
  if (rates.length === 0) {
    throw new SourceError({ kind: 'empty', url: ctx.url, messageSq: 'Burimi i kurseve të këmbimit nuk ktheu asnjë kurs.' });
  }
  return rates;
}

export interface FxFetchOptions extends Omit<FetchJsonOptions, 'headers'> {
  baseUrl?: string;
  base?: string;
  retrievedAt: string;
}

export async function fetchFrankfurterLatest(opts: FxFetchOptions): Promise<{ rates: FxRate[]; url: string }> {
  const url = buildFrankfurterLatestUrl(opts.baseUrl ?? resolveFxBaseUrl(), opts.base ?? 'EUR');
  const json = await fetchJson<unknown>(url, opts);
  return { rates: parseFrankfurterLatest(json, { retrievedAt: opts.retrievedAt, url }), url };
}

interface Candidate {
  year: number;
  value: number;
  countryCode: string;
  retrievedAt: string;
}

/** Median by value (ties broken by country code) so one odd reporter cannot set a shared rate. */
function pickMedian(candidates: Candidate[]): Candidate {
  const sorted = [...candidates].sort((a, b) => a.value - b.value || a.countryCode.localeCompare(b.countryCode));
  return sorted[Math.floor((sorted.length - 1) / 2)];
}

/**
 * Annual-average USD rates derived from the WB official exchange rate (PA.NUS.FCRF), one per
 * currency. Countries sharing a currency (euro area, CFA franc, …) collapse into a single rate:
 * the latest year wins, and among reporters of that year the median value is used — this guards
 * against a member whose older figures are still in a legacy currency.
 */
export function fxRatesFromWbAnnual(observations: Observation[], countries: Country[]): FxRate[] {
  const currencyOf = new Map(countries.map((c) => [c.code, c.currencies[0] ?? null]));
  const byCurrency = new Map<string, Candidate[]>();
  for (const o of observations) {
    if (o.indicatorCode !== WB_FX_INDICATOR || o.isDemo || o.isProjection) continue;
    if (typeof o.value !== 'number' || !Number.isFinite(o.value) || o.value <= 0) continue;
    if (!/^\d{4}$/.test(o.period)) continue;
    const currency = currencyOf.get(o.countryCode);
    if (!currency || currency === 'USD') continue;
    const list = byCurrency.get(currency) ?? [];
    list.push({ year: Number(o.period), value: o.value, countryCode: o.countryCode, retrievedAt: o.retrievedAt });
    byCurrency.set(currency, list);
  }
  const rates: FxRate[] = [];
  for (const [currency, candidates] of [...byCurrency.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const latestYear = Math.max(...candidates.map((c) => c.year));
    const chosen = pickMedian(candidates.filter((c) => c.year === latestYear));
    rates.push({
      base: 'USD',
      quote: currency,
      rate: chosen.value,
      rateDate: `${latestYear}-12-31`,
      sourceId: WB_FX_SOURCE_ID,
      kind: 'mesatare_vjetore',
      retrievedAt: chosen.retrievedAt,
    });
  }
  return rates;
}
