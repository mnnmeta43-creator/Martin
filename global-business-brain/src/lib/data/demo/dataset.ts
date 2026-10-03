/**
 * Të dhëna DEMO — FIKTIVE.
 *
 * Every value in this file is invented. The three economies ZZA, ZZB and ZZC do not exist,
 * and their numbers must NEVER be used for real recommendations, shown without the DEMO
 * badge, or mixed with real countries. They exist only so the UI and the analysis layers can
 * be exercised offline when DATA_MODE=demo.
 *
 * The values are generated deterministically from `now` (no randomness, no clock reads), use
 * repeated-digit anchors so they look plainly synthetic, and are only plausible in magnitude.
 * Deliberate gaps exercise the "missing" and "stale" UI states (see DEMO_MISSING_INDICATORS
 * and DEMO_STALE_SERIES).
 */
import type { Country, CountryCode, FxRate, IndicatorDefinition, Observation } from '@/lib/domain/types';
import { INDICATORS } from '@/lib/data/indicators';
import type { IndicatorCode } from '@/lib/data/indicatorCodes';
import { DEMO_SOURCE_URL } from '@/lib/data/sources/registry';

export const DEMO_SOURCE_ID = 'demo';
export { DEMO_SOURCE_URL };

export function isDemoMode(env: Record<string, string | undefined> = process.env): boolean {
  return env.DATA_MODE === 'demo';
}

const DEMO_KIND_NOTE_SQ = 'Ekonomi fiktive vetëm për demonstrim; asnjë nga të dhënat e saj nuk është reale.';

function demoCountry(code: CountryCode, iso2: string, letter: string, currency: string): Country {
  return {
    code,
    iso2,
    nameSq: `Demolandë ${letter} (fiktive)`,
    nameEn: `Demoland ${letter} (fictional)`,
    kind: 'demo',
    kindNoteSq: DEMO_KIND_NOTE_SQ,
    regionSq: 'DEMO',
    currencies: [currency],
    sourceCodes: { worldbank: null, imf: null },
    wb: null,
    isDemo: true,
  };
}

// iso2 uses the user-assigned QX–QZ range so it can never collide with a real country or a
// World Bank aggregate code.
export const DEMO_COUNTRIES: Country[] = [
  demoCountry('ZZA', 'QX', 'A', 'EUR'),
  demoCountry('ZZB', 'QY', 'B', 'USD'),
  demoCountry('ZZC', 'QZ', 'C', 'ALL'),
];

export const DEMO_COUNTRY_CODES: ReadonlySet<CountryCode> = new Set(DEMO_COUNTRIES.map((c) => c.code));

/** Indicators intentionally absent for a demo economy (exercises the "mungon" state). */
export const DEMO_MISSING_INDICATORS: Record<CountryCode, IndicatorCode[]> = {
  ZZC: ['new_business_density', 'tourism_receipts_usd', 'real_interest_rate'],
};

/** Series that intentionally stop early (exercises the stale-data state). */
export const DEMO_STALE_SERIES: { countryCode: CountryCode; indicatorCode: IndicatorCode; yearsAgo: number }[] = [
  { countryCode: 'ZZB', indicatorCode: 'lending_rate', yearsAgo: 6 },
];

/** A single null inside an otherwise complete series (exercises "latest non-null" logic). */
const DEMO_NULL_GAPS: { countryCode: CountryCode; indicatorCode: IndicatorCode; yearsAgo: number }[] = [
  { countryCode: 'ZZA', indicatorCode: 'youth_unemployment', yearsAgo: 5 },
];

/** Fictional FX anchors; the exchange-rate series below are derived from these so they agree. */
const DEMO_EUR_USD = 1.11;
const DEMO_USD_ALL = 111.1;

/**
 * Growth model for one series: `latest` is the value in the newest year; earlier years are
 * derived by undoing `trend` (absolute points per year, or % per year when `relative`).
 */
interface SeriesProfile {
  latest: number;
  trend: number;
  relative?: boolean;
  /** Deterministic wobble amplitude, in the series' own units (or share of value if relative). */
  wobble?: number;
  /** Rounding decimals; defaults by unit. */
  decimals?: number;
  min?: number;
  max?: number;
}

type WbIndicatorCode = Exclude<IndicatorCode, 'imf_gdp_growth' | 'imf_inflation' | 'imf_unemployment'>;
type ImfIndicatorCode = Extract<IndicatorCode, `imf_${string}`>;
type Profile = Partial<Record<WbIndicatorCode, SeriesProfile>> & Record<ImfIndicatorCode, SeriesProfile>;

/** Shares of a whole (0–100). Growth rates use `rate`, which may go negative. */
const pct = (latest: number, trend = 0, wobble = 0.4): SeriesProfile => ({ latest, trend, wobble, min: 0, max: 100 });
const rate = (latest: number, trend = 0, wobble = 0.6): SeriesProfile => ({ latest, trend, wobble });
const level = (latest: number, growthPct: number, wobble = 0.01, decimals = 0): SeriesProfile => ({
  latest,
  trend: growthPct,
  relative: true,
  wobble,
  decimals,
});

/** A: tourism- and remittance-heavy, middle income, uses EUR. */
const PROFILE_ZZA: Profile = {
  gdp_growth: rate(3.33, 0, 1.2),
  gdp_per_capita_usd: level(7777, 4),
  gdp_per_capita_ppp: level(18888, 4),
  household_consumption_growth: rate(3.11, 0, 1.0),
  inflation_cpi: rate(2.88, 0, 0.8),
  price_level_ratio: { latest: 0.44, trend: 0.005, wobble: 0.01, decimals: 3 },
  lending_rate: rate(5.55, -0.2, 0.3),
  real_interest_rate: rate(2.22, 0, 0.8),
  private_credit_gdp: pct(33.3, 0.4, 0.8),
  account_ownership: pct(66.6, 2, 0.5),
  unemployment: pct(11.1, -0.4, 0.3),
  youth_unemployment: pct(25.5, -0.8, 0.8),
  labor_participation: pct(55.5, 0.3, 0.3),
  population: level(2222222, -0.5, 0.001),
  population_growth: rate(-0.55, 0, 0.1),
  urban_population_pct: pct(62.2, 0.5, 0.05),
  urban_population_growth: rate(0.99, 0, 0.1),
  population_65_plus_pct: pct(16.6, 0.4, 0.05),
  population_0_14_pct: pct(15.5, -0.2, 0.05),
  exchange_rate_lcu_usd: { latest: round(1 / DEMO_EUR_USD, 4), trend: 0, wobble: 0.03, decimals: 4 },
  imports_gdp: pct(44.4, 0.3, 1.0),
  exports_gdp: pct(33.3, 0.5, 1.0),
  agriculture_va_gdp: pct(11.1, -0.3, 0.3),
  industry_va_gdp: pct(20.2, 0, 0.4),
  manufacturing_va_gdp: pct(6.66, -0.1, 0.2),
  services_va_gdp: pct(55.5, 0.4, 0.5),
  remittances_gdp: pct(11.1, -0.2, 0.4),
  tourism_arrivals: level(5555555, 6, 0.04),
  tourism_receipts_usd: level(2222000000, 7, 0.05),
  internet_users_pct: pct(77.7, 2.5, 0.5),
  mobile_subscriptions: { latest: 111.1, trend: 1, wobble: 1.5, decimals: 1 },
  electricity_access: pct(100, 0, 0),
  new_business_density: { latest: 2.22, trend: 0.08, wobble: 0.1, decimals: 2 },
  imf_gdp_growth: rate(3.33, 0, 1.0),
  imf_inflation: rate(2.88, 0, 0.7),
  imf_unemployment: pct(11.1, -0.4, 0.3),
};

/** B: digital/services-heavy, high income, uses USD. Its lending-rate series is stale. */
const PROFILE_ZZB: Profile = {
  gdp_growth: rate(2.22, 0, 0.8),
  gdp_per_capita_usd: level(55555, 3),
  gdp_per_capita_ppp: level(66666, 3),
  household_consumption_growth: rate(2.02, 0, 0.7),
  inflation_cpi: rate(2.22, 0, 0.6),
  price_level_ratio: { latest: 0.99, trend: 0, wobble: 0.01, decimals: 3 },
  lending_rate: rate(4.44, -0.1, 0.2),
  real_interest_rate: rate(1.88, 0, 0.5),
  // Credit can exceed 100% of GDP, so no percentage cap here.
  private_credit_gdp: { latest: 144.4, trend: 1, wobble: 2, decimals: 1, min: 0 },
  account_ownership: pct(99.0, 0.1, 0.2),
  unemployment: pct(4.44, -0.1, 0.2),
  youth_unemployment: pct(9.99, -0.2, 0.4),
  labor_participation: pct(63.3, 0.1, 0.2),
  population: level(8888888, 0.6, 0.001),
  population_growth: rate(0.66, 0, 0.05),
  urban_population_pct: pct(88.8, 0.2, 0.05),
  urban_population_growth: rate(0.88, 0, 0.05),
  population_65_plus_pct: pct(19.9, 0.3, 0.05),
  population_0_14_pct: pct(14.4, -0.1, 0.05),
  exchange_rate_lcu_usd: { latest: 1, trend: 0, wobble: 0, decimals: 4 },
  imports_gdp: pct(55.5, 0.2, 0.8),
  exports_gdp: pct(66.6, 0.4, 0.8),
  agriculture_va_gdp: pct(1.11, -0.02, 0.05),
  industry_va_gdp: pct(18.8, -0.1, 0.3),
  manufacturing_va_gdp: pct(11.1, -0.1, 0.2),
  services_va_gdp: pct(77.7, 0.2, 0.3),
  remittances_gdp: pct(0.33, 0, 0.03),
  tourism_arrivals: level(3333333, 3, 0.03),
  tourism_receipts_usd: level(6666000000, 4, 0.04),
  internet_users_pct: pct(97.7, 0.3, 0.2),
  mobile_subscriptions: { latest: 133.3, trend: 0.5, wobble: 1.5, decimals: 1 },
  electricity_access: pct(100, 0, 0),
  new_business_density: { latest: 8.88, trend: 0.15, wobble: 0.3, decimals: 2 },
  imf_gdp_growth: rate(2.22, 0, 0.6),
  imf_inflation: rate(2.22, 0, 0.5),
  imf_unemployment: pct(4.44, -0.1, 0.2),
};

/** C: agriculture-heavy, young population, lower income, uses ALL. Three series are missing. */
const PROFILE_ZZC: Profile = {
  gdp_growth: rate(4.44, 0, 1.5),
  gdp_per_capita_usd: level(2222, 5),
  gdp_per_capita_ppp: level(6666, 5),
  household_consumption_growth: rate(3.99, 0, 1.4),
  inflation_cpi: rate(6.66, 0, 1.5),
  price_level_ratio: { latest: 0.33, trend: 0.003, wobble: 0.01, decimals: 3 },
  lending_rate: rate(12.2, -0.3, 0.6),
  private_credit_gdp: pct(22.2, 0.6, 0.6),
  account_ownership: pct(44.4, 3, 0.8),
  unemployment: pct(7.77, -0.2, 0.3),
  youth_unemployment: pct(17.7, -0.3, 0.6),
  labor_participation: pct(66.6, 0.2, 0.3),
  population: level(22222222, 2.2, 0.001),
  population_growth: rate(2.22, -0.03, 0.05),
  urban_population_pct: pct(38.8, 0.6, 0.05),
  urban_population_growth: rate(3.33, 0, 0.1),
  population_65_plus_pct: pct(3.33, 0.05, 0.03),
  population_0_14_pct: pct(41.1, -0.3, 0.1),
  exchange_rate_lcu_usd: { latest: DEMO_USD_ALL, trend: 1.5, relative: true, wobble: 0.02, decimals: 2 },
  imports_gdp: pct(33.3, 0.3, 1.0),
  exports_gdp: pct(22.2, 0.3, 1.0),
  agriculture_va_gdp: pct(33.3, -0.4, 0.6),
  industry_va_gdp: pct(22.2, 0.2, 0.4),
  manufacturing_va_gdp: pct(8.88, 0.1, 0.2),
  services_va_gdp: pct(44.4, 0.3, 0.5),
  remittances_gdp: pct(6.66, 0.1, 0.3),
  tourism_arrivals: level(555555, 5, 0.05),
  internet_users_pct: pct(33.3, 3, 0.6),
  mobile_subscriptions: { latest: 88.8, trend: 3, wobble: 1.5, decimals: 1 },
  electricity_access: pct(66.6, 2, 0.4),
  imf_gdp_growth: rate(4.44, 0, 1.2),
  imf_inflation: rate(6.66, 0, 1.2),
  imf_unemployment: pct(7.77, -0.2, 0.3),
};

const PROFILES: Record<CountryCode, Profile> = { ZZA: PROFILE_ZZA, ZZB: PROFILE_ZZB, ZZC: PROFILE_ZZC };

/** Newest WB-style year is two years back, matching the expected publication lag. */
const WB_YEARS_BACK = 2;
const WB_YEAR_COUNT = 8;
/** Survey-style series (lag 3) end one year earlier; Findex-like series only every 3 years. */
const SURVEY_INDICATORS: ReadonlySet<string> = new Set(['account_ownership', 'new_business_density']);
const IRREGULAR_STEP = 3;
/** IMF: seven measured years, then the current year and two future years as projections. */
const IMF_ACTUAL_YEARS = 7;
const IMF_FUTURE_YEARS = 2;

function round(value: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

/** Deterministic value in [-1, 1] from a string key, so output never depends on a RNG. */
function wobbleUnit(key: string): number {
  // FNV-1a over the key…
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // …then the murmur3 finaliser: keys differing only in the last digit (consecutive years)
  // would otherwise share their high bits and produce visibly clustered values.
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return ((h >>> 0) / 0xffffffff) * 2 - 1;
}

function defaultDecimals(def: IndicatorDefinition): number {
  if (def.unit === 'numer' || def.unit === 'monedhe') return 0;
  return 2;
}

function valueFor(profile: SeriesProfile, def: IndicatorDefinition, key: string, yearsBeforeLatest: number): number {
  const base = profile.relative
    ? profile.latest / (1 + profile.trend / 100) ** yearsBeforeLatest
    : profile.latest - profile.trend * yearsBeforeLatest;
  // The newest point keeps the round synthetic anchor; older points wobble around the trend.
  const w = yearsBeforeLatest === 0 ? 0 : (profile.wobble ?? 0) * wobbleUnit(key);
  const raw = profile.relative ? base * (1 + w) : base + w;
  const clamped = Math.min(Math.max(raw, profile.min ?? -Infinity), profile.max ?? Infinity);
  return round(clamped, profile.decimals ?? defaultDecimals(def));
}

function observationCurrency(def: IndicatorDefinition, country: Country): string | null {
  if (def.unit === 'mv_per_usd' || def.currency === 'MV') return country.currencies[0] ?? null;
  return def.currency ?? null;
}

function makeObservation(
  def: IndicatorDefinition,
  country: Country,
  year: number,
  value: number | null,
  isProjection: boolean,
  retrievedAt: string,
): Observation {
  return {
    sourceId: DEMO_SOURCE_ID,
    indicatorCode: def.code,
    countryCode: country.code,
    period: String(year),
    value,
    unit: def.unit,
    currency: observationCurrency(def, country),
    isProjection,
    isDemo: true,
    obsStatus: null,
    sourceUrl: DEMO_SOURCE_URL,
    sourceLastUpdated: null,
    retrievedAt,
  };
}

/** Years (ascending) for one World Bank-style demo series, honouring survey cadence and stale cases. */
function wbYears(def: IndicatorDefinition, countryCode: CountryCode, currentYear: number): number[] {
  const isSurvey = SURVEY_INDICATORS.has(def.code);
  const stale = DEMO_STALE_SERIES.find((s) => s.countryCode === countryCode && s.indicatorCode === def.code);
  const newest = currentYear - (stale ? stale.yearsAgo : WB_YEARS_BACK + (isSurvey ? 1 : 0));
  const step = def.periodicity === 'e_parregullt' ? IRREGULAR_STEP : 1;
  const years: number[] = [];
  for (let i = WB_YEAR_COUNT - 1; i >= 0; i--) {
    const back = i * step;
    if (step > 1 && back >= WB_YEAR_COUNT) continue;
    years.push(newest - back);
  }
  return years;
}

function buildWbSeries(def: IndicatorDefinition, country: Country, currentYear: number, retrievedAt: string): Observation[] {
  const profile = PROFILES[country.code]?.[def.code as WbIndicatorCode];
  if (!profile) return [];
  const years = wbYears(def, country.code, currentYear);
  const newest = years[years.length - 1];
  return years.map((year) => {
    const isGap = DEMO_NULL_GAPS.some(
      (g) => g.countryCode === country.code && g.indicatorCode === def.code && currentYear - g.yearsAgo === year,
    );
    const value = isGap ? null : valueFor(profile, def, `${country.code}|${def.code}|${year}`, newest - year);
    return makeObservation(def, country, year, value, false, retrievedAt);
  });
}

function buildImfSeries(def: IndicatorDefinition, country: Country, currentYear: number, retrievedAt: string): Observation[] {
  const profile = PROFILES[country.code]?.[def.code as ImfIndicatorCode];
  if (!profile) return [];
  const lastActual = currentYear - 1;
  const out: Observation[] = [];
  for (let year = lastActual - IMF_ACTUAL_YEARS + 1; year <= currentYear + IMF_FUTURE_YEARS; year++) {
    // Negative "years before" extends the trend forward into the projection years.
    const value = valueFor(profile, def, `${country.code}|${def.code}|${year}`, lastActual - year);
    out.push(makeObservation(def, country, year, value, year >= currentYear, retrievedAt));
  }
  return out;
}

/**
 * Fictional observations for every World Bank- and IMF-sourced indicator of each demo economy.
 * Deterministic: the same `now` always yields the same array.
 */
export function buildDemoObservations(now: Date): Observation[] {
  const currentYear = now.getUTCFullYear();
  const retrievedAt = now.toISOString();
  const out: Observation[] = [];
  for (const country of DEMO_COUNTRIES) {
    const missing = new Set<string>(DEMO_MISSING_INDICATORS[country.code] ?? []);
    for (const def of INDICATORS) {
      if (missing.has(def.code)) continue;
      if (def.sourceId === 'worldbank-wdi') out.push(...buildWbSeries(def, country, currentYear, retrievedAt));
      else if (def.sourceId === 'imf-datamapper') out.push(...buildImfSeries(def, country, currentYear, retrievedAt));
    }
  }
  return out;
}

/** Fictional FX rates between EUR, USD and ALL (both directions), consistent with the demo series. */
export function buildDemoFxRates(now: Date): FxRate[] {
  const rateDate = now.toISOString().slice(0, 10);
  const retrievedAt = now.toISOString();
  const pairs: [string, string, number][] = [
    ['EUR', 'USD', DEMO_EUR_USD],
    ['USD', 'ALL', DEMO_USD_ALL],
    ['EUR', 'ALL', round(DEMO_EUR_USD * DEMO_USD_ALL, 4)],
  ];
  return pairs.flatMap(([base, quote, rate]) => [
    { base, quote, rate, rateDate, sourceId: DEMO_SOURCE_ID, kind: 'demo' as const, retrievedAt },
    { base: quote, quote: base, rate: round(1 / rate, 6), rateDate, sourceId: DEMO_SOURCE_ID, kind: 'demo' as const, retrievedAt },
  ]);
}
