// SYNTHETIC — format mirrors the documented API; values are not real
/**
 * Builders for CountryDataContext used by idea, scoring and comparison tests.
 *
 * - demoContext: the fictional demo dataset (ZZA/ZZB/ZZC) through getCountryDataContext.
 * - emptyRealContext: a real country with NO stored data and no FX rates (everything "mungon").
 * - syntheticContext: a real country code with a few stored observations whose values are
 *   obviously synthetic placeholders (11.11, 12345…). They describe no real economy.
 */
import type { CountryDataContext, FxRate, Observation } from '@/lib/domain/types';
import { getCountryDataContext } from '@/lib/data/context';
import { MemoryDataStore } from './data/memoryDataStore';
import { annual, obs } from './data/observations';

export const NOW = new Date('2026-10-02T12:00:00.000Z');

async function contextFrom(store: MemoryDataStore, code: string, now: Date, demoMode: boolean): Promise<CountryDataContext> {
  const ctx = await getCountryDataContext(store, code, now, { demoMode });
  if (!ctx) throw new Error(`no context for ${code}`);
  return ctx;
}

export function demoContext(code: 'ZZA' | 'ZZB' | 'ZZC' = 'ZZA', now: Date = NOW): Promise<CountryDataContext> {
  return contextFrom(new MemoryDataStore(), code, now, true);
}

export function emptyRealContext(code = 'ALB', now: Date = NOW): Promise<CountryDataContext> {
  return contextFrom(new MemoryDataStore(), code, now, false);
}

// SYNTHETIC — format mirrors the documented API; values are not real
export const SYNTHETIC_FX_RATES: FxRate[] = [
  {
    base: 'USD',
    quote: 'EUR',
    rate: 0.5,
    rateDate: '2026-10-01',
    sourceId: 'ecb-frankfurter',
    kind: 'reference_ditore',
    retrievedAt: '2026-10-01T16:00:00.000Z',
  },
];

// SYNTHETIC — format mirrors the documented API; values are not real
export function syntheticObservations(code = 'ALB'): Observation[] {
  return [
    ...annual('internet_users_pct', code, [
      ['2023', 55.55],
      ['2024', 66.66],
    ]),
    ...annual('services_va_gdp', code, [['2024', 44.44]]),
    ...annual('tourism_arrivals', code, [
      ['2023', 1111111],
      ['2024', 1234567],
    ]),
    ...annual('lending_rate', code, [['2024', 11.11]]),
    ...annual('inflation_cpi', code, [['2024', 12.34]]),
    ...annual('gdp_growth', code, [['2024', 1.11]]),
    ...annual('price_level_ratio', code, [['2024', 0.5]]),
    ...annual('gdp_per_capita_ppp', code, [['2023', 12345]]),
  ];
}

export interface SyntheticContextOptions {
  code?: string;
  observations?: Observation[];
  fxRates?: FxRate[];
  now?: Date;
}

export async function syntheticContext(opts: SyntheticContextOptions = {}): Promise<CountryDataContext> {
  const code = opts.code ?? 'ALB';
  const store = new MemoryDataStore();
  await store.upsertObservations(opts.observations ?? syntheticObservations(code));
  await store.upsertFxRates(opts.fxRates ?? SYNTHETIC_FX_RATES);
  return contextFrom(store, code, opts.now ?? NOW, false);
}

/** A projection-only series (IMF-style future years), for the "parashikim" claim path. */
export function projectionOnlyObservations(code = 'ALB'): Observation[] {
  return [
    obs({ code: 'imf_gdp_growth', country: code, period: '2027', value: 2.22, isProjection: true }),
    obs({ code: 'imf_gdp_growth', country: code, period: '2028', value: 3.33, isProjection: true }),
  ];
}
