// Demo dataset: fictional, flagged, deterministic, with deliberate missing/stale/projection cases.
import { describe, expect, it } from 'vitest';
import {
  DEMO_COUNTRIES,
  DEMO_MISSING_INDICATORS,
  DEMO_SOURCE_URL,
  DEMO_STALE_SERIES,
  buildDemoFxRates,
  buildDemoObservations,
  isDemoMode,
} from '@/lib/data/demo/dataset';
import { INDICATORS, getIndicatorsBySource } from '@/lib/data/indicators';
import { getCountries } from '@/lib/data/countries';

const NOW = new Date('2026-10-02T12:00:00.000Z');
const YEAR = 2026;
const obs = buildDemoObservations(NOW);
const series = (country: string, code: string) => obs.filter((o) => o.countryCode === country && o.indicatorCode === code);

describe('isDemoMode', () => {
  it('is enabled only by DATA_MODE=demo', () => {
    expect(isDemoMode({ DATA_MODE: 'demo' })).toBe(true);
    expect(isDemoMode({ DATA_MODE: 'live' })).toBe(false);
    expect(isDemoMode({})).toBe(false);
  });
});

describe('DEMO_COUNTRIES', () => {
  it('are three clearly fictional economies that never collide with real codes', () => {
    expect(DEMO_COUNTRIES.map((c) => c.code)).toEqual(['ZZA', 'ZZB', 'ZZC']);
    expect(DEMO_COUNTRIES.map((c) => c.currencies[0])).toEqual(['EUR', 'USD', 'ALL']);
    const real = getCountries();
    for (const c of DEMO_COUNTRIES) {
      expect(c).toMatchObject({ kind: 'demo', isDemo: true, regionSq: 'DEMO' });
      expect(c.nameSq).toMatch(/fiktive/);
      expect(real.some((r) => r.code === c.code || r.iso2 === c.iso2)).toBe(false);
    }
  });
});

describe('buildDemoObservations', () => {
  it('flags every observation as demo from the demo source, with retrievedAt = now', () => {
    expect(obs.length).toBeGreaterThan(500);
    for (const o of obs) {
      expect(o.isDemo).toBe(true);
      expect(o.sourceId).toBe('demo');
      expect(o.sourceUrl).toBe(DEMO_SOURCE_URL);
      expect(o.retrievedAt).toBe(NOW.toISOString());
      expect(['ZZA', 'ZZB', 'ZZC']).toContain(o.countryCode);
    }
  });

  it('is deterministic for the same now', () => {
    expect(buildDemoObservations(new Date(NOW))).toEqual(obs);
    expect(buildDemoFxRates(new Date(NOW))).toEqual(buildDemoFxRates(NOW));
  });

  it('covers every World Bank indicator for each economy except the deliberate gaps', () => {
    for (const country of ['ZZA', 'ZZB', 'ZZC']) {
      const missing = DEMO_MISSING_INDICATORS[country] ?? [];
      for (const def of getIndicatorsBySource('worldbank-wdi')) {
        const s = series(country, def.code);
        if (missing.includes(def.code as never)) expect(s, `${country} ${def.code}`).toEqual([]);
        else expect(s.length, `${country} ${def.code}`).toBeGreaterThanOrEqual(3);
      }
    }
    expect(DEMO_MISSING_INDICATORS.ZZC).toHaveLength(3);
  });

  it('spans about eight annual periods ending at the expected publication lag', () => {
    const gdp = series('ZZA', 'gdp_growth');
    expect(gdp.map((o) => o.period)).toEqual(Array.from({ length: 8 }, (_, i) => String(YEAR - 9 + i)));
    expect(gdp.every((o) => o.isProjection === false && typeof o.value === 'number')).toBe(true);
  });

  it('contains a ZZB series that ends six years ago', () => {
    const stale = DEMO_STALE_SERIES[0];
    const s = series(stale.countryCode, stale.indicatorCode);
    expect(stale).toMatchObject({ countryCode: 'ZZB', yearsAgo: 6 });
    expect(s[s.length - 1].period).toBe(String(YEAR - 6));
  });

  it('keeps a missing year as null, never 0', () => {
    const youth = series('ZZA', 'youth_unemployment');
    expect(youth.some((o) => o.value === null)).toBe(true);
    expect(obs.filter((o) => o.value === 0)).toEqual([]);
  });

  it('includes IMF series with the current year and two future years flagged as projections', () => {
    for (const country of ['ZZA', 'ZZB', 'ZZC']) {
      for (const def of getIndicatorsBySource('imf-datamapper')) {
        const s = series(country, def.code);
        const future = s.filter((o) => Number(o.period) > YEAR);
        expect(future.map((o) => o.period)).toEqual([String(YEAR + 1), String(YEAR + 2)]);
        expect(s.filter((o) => o.isProjection).map((o) => o.period)).toEqual([String(YEAR), String(YEAR + 1), String(YEAR + 2)]);
        expect(s.filter((o) => !o.isProjection).at(-1)?.period).toBe(String(YEAR - 1));
      }
    }
  });

  it('gives each economy a distinct profile', () => {
    const latest = (c: string, code: string) => series(c, code).filter((o) => o.value !== null).at(-1)!.value!;
    expect(latest('ZZA', 'remittances_gdp')).toBeGreaterThan(latest('ZZB', 'remittances_gdp'));
    expect(latest('ZZA', 'tourism_arrivals')).toBeGreaterThan(latest('ZZC', 'tourism_arrivals'));
    expect(latest('ZZB', 'gdp_per_capita_usd')).toBeGreaterThan(latest('ZZA', 'gdp_per_capita_usd'));
    expect(latest('ZZB', 'services_va_gdp')).toBeGreaterThan(latest('ZZC', 'services_va_gdp'));
    expect(latest('ZZC', 'agriculture_va_gdp')).toBeGreaterThan(latest('ZZA', 'agriculture_va_gdp'));
    expect(latest('ZZC', 'population_0_14_pct')).toBeGreaterThan(latest('ZZB', 'population_0_14_pct'));
  });

  it('keeps shares within 0–100 and units/currencies consistent with the definitions', () => {
    for (const o of obs) {
      const def = INDICATORS.find((d) => d.code === o.indicatorCode)!;
      expect(o.unit).toBe(def.unit);
      if (def.basis === 'raport' && def.unit === 'perqind' && o.value !== null && def.code !== 'private_credit_gdp') {
        expect(o.value).toBeGreaterThanOrEqual(0);
        expect(o.value).toBeLessThanOrEqual(100);
      }
    }
    expect(series('ZZC', 'exchange_rate_lcu_usd')[0].currency).toBe('ALL');
    expect(series('ZZB', 'exchange_rate_lcu_usd').every((o) => o.value === 1)).toBe(true);
    expect(series('ZZA', 'gdp_per_capita_usd')[0].currency).toBe('USD');
  });
});

describe('buildDemoFxRates', () => {
  it('returns demo-kind rates for every EUR/USD/ALL direction, consistent with each other', () => {
    const rates = buildDemoFxRates(NOW);
    expect(rates).toHaveLength(6);
    for (const r of rates) {
      expect(r).toMatchObject({ kind: 'demo', sourceId: 'demo', rateDate: '2026-10-02', retrievedAt: NOW.toISOString() });
      expect(r.rate).toBeGreaterThan(0);
    }
    const get = (b: string, q: string) => rates.find((r) => r.base === b && r.quote === q)!.rate;
    expect(get('EUR', 'USD') * get('USD', 'ALL')).toBeCloseTo(get('EUR', 'ALL'), 2);
    expect(get('EUR', 'USD') * get('USD', 'EUR')).toBeCloseTo(1, 4);
  });
});
