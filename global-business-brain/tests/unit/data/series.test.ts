// SYNTHETIC — values are not real
// Series building and change calculation: ordering, latest, projections, pp vs %, warnings.
import { describe, expect, it } from 'vitest';
import { getIndicator } from '@/lib/data/indicators';
import { buildSeries, computeChange } from '@/lib/data/series';
import { annual, fetchLog, obs } from '../../fixtures/data/observations';

const NOW = new Date('2026-10-02T12:00:00.000Z');
const def = (code: string) => getIndicator(code)!;

describe('buildSeries', () => {
  it('sorts ascending and picks the latest non-null, non-projection value', () => {
    const rows = annual('gdp_growth', 'ALB', [
      ['2024', null],
      ['2021', 1.11],
      ['2023', 2.22],
      ['2022', 3.33],
    ]);
    const s = buildSeries(def('gdp_growth'), 'ALB', rows, NOW);
    expect(s.observations.map((o) => o.period)).toEqual(['2021', '2022', '2023', '2024']);
    expect(s.latest?.period).toBe('2023');
    expect(s.latest?.value).toBe(2.22);
    expect(s.status).toBe('i_vjeter');
    expect(s.countryCode).toBe('ALB');
  });

  it('keeps projections in the series, flagged, but never as latest', () => {
    const rows = [
      ...annual('imf_inflation', 'ALB', [
        ['2024', 1.11],
        ['2025', 2.22],
      ]),
      obs({ code: 'imf_inflation', country: 'ALB', period: '2026', value: 3.33, isProjection: true }),
      obs({ code: 'imf_inflation', country: 'ALB', period: '2027', value: 4.44, isProjection: true }),
    ];
    const s = buildSeries(def('imf_inflation'), 'ALB', rows, NOW);
    expect(s.observations).toHaveLength(4);
    expect(s.observations.filter((o) => o.isProjection).map((o) => o.period)).toEqual(['2026', '2027']);
    expect(s.latest?.period).toBe('2025');
    expect(s.status).toBe('i_fresket');
  });

  it('a projection-only series has no latest value and status parashikim', () => {
    const rows = [obs({ code: 'imf_unemployment', country: 'XKX', period: '2026', value: 11.1, isProjection: true })];
    const s = buildSeries(def('imf_unemployment'), 'XKX', rows, NOW);
    expect(s.latest).toBeNull();
    expect(s.status).toBe('parashikim');
    expect(s.change.comparable).toBe(false);
  });

  it('ignores other indicators/countries and de-duplicates periods', () => {
    const rows = [
      obs({ code: 'gdp_growth', country: 'ALB', period: '2024', value: 1.11, retrievedAt: '2026-01-01T00:00:00.000Z' }),
      obs({ code: 'gdp_growth', country: 'ALB', period: '2024', value: 1.22, retrievedAt: '2026-09-01T00:00:00.000Z' }),
      obs({ code: 'gdp_growth', country: 'XKX', period: '2024', value: 9.99 }),
      obs({ code: 'inflation_cpi', country: 'ALB', period: '2024', value: 8.88 }),
    ];
    const s = buildSeries(def('gdp_growth'), 'ALB', rows, NOW);
    expect(s.observations).toHaveLength(1);
    expect(s.latest?.value).toBe(1.22);
  });

  it('carries the last fetch and reflects a failed refresh', () => {
    const failed = fetchLog({ sourceId: 'worldbank-wdi', scope: 'indicator:gdp_growth', status: 'gabim', startedAt: '2026-10-01T06:00:00.000Z' });
    const s = buildSeries(def('gdp_growth'), 'ALB', annual('gdp_growth', 'ALB', [['2024', 1.11]]), NOW, failed);
    expect(s.status).toBe('gabim_burimi');
    expect(s.lastFetch).toEqual(failed);
    expect(s.latest?.value).toBe(1.11);
  });

  it('an empty series is missing, with no invented value', () => {
    const s = buildSeries(def('population'), 'ALB', [], NOW);
    expect(s.latest).toBeNull();
    expect(s.observations).toEqual([]);
    expect(s.status).toBe('mungon');
    expect(s.change.toValue).toBeNull();
  });
});

describe('computeChange', () => {
  it('percent series: consecutive years, delta in percentage points', () => {
    const c = computeChange(def('inflation_cpi'), annual('inflation_cpi', 'ALB', [['2023', 2.22], ['2024', 3.33]]));
    expect(c.comparable).toBe(true);
    expect(c.deltaKind).toBe('pike_perqindjeje');
    expect(c.delta).toBeCloseTo(1.11, 10);
    expect(c).toMatchObject({ fromPeriod: '2023', toPeriod: '2024', fromValue: 2.22, toValue: 3.33, warningsSq: [] });
  });

  it('warns when the compared years are not consecutive', () => {
    const c = computeChange(def('unemployment'), annual('unemployment', 'ALB', [['2019', 11.1], ['2023', 12.2]]));
    expect(c.comparable).toBe(true);
    expect(c.warningsSq).toContain('Krahasim mes 2019 dhe 2023 — jo vite të njëpasnjëshme.');
  });

  it('skips null years when looking for the previous value', () => {
    const c = computeChange(def('gdp_growth'), annual('gdp_growth', 'ALB', [['2021', 1.11], ['2022', null], ['2023', 2.22]]));
    expect(c.fromPeriod).toBe('2021');
    expect(c.warningsSq[0]).toContain('jo vite të njëpasnjëshme');
  });

  it('non-percent series: relative % change', () => {
    const c = computeChange(def('population'), annual('population', 'ALB', [['2023', 12345], ['2024', 13579.5]]));
    expect(c.deltaKind).toBe('ndryshim_perqindjeje');
    expect(c.delta).toBeCloseTo(10, 10);
  });

  it('nominal currency series warn that FX and inflation are included', () => {
    const usd = computeChange(def('gdp_per_capita_usd'), annual('gdp_per_capita_usd', 'ALB', [['2023', 1111], ['2024', 2222]]));
    expect(usd.warningsSq.some((w) => w.includes('kursit të këmbimit') && w.includes('jo rritje reale'))).toBe(true);
    const ppp = computeChange(def('gdp_per_capita_ppp'), annual('gdp_per_capita_ppp', 'ALB', [['2023', 1111], ['2024', 2222]]));
    expect(ppp.warningsSq.some((w) => w.includes('nominale'))).toBe(true);
    const real = computeChange(def('gdp_growth'), annual('gdp_growth', 'ALB', [['2023', 1.11], ['2024', 2.22]]));
    expect(real.warningsSq).toEqual([]);
  });

  it('never uses projections', () => {
    const rows = [
      ...annual('imf_gdp_growth', 'ALB', [['2024', 1.11], ['2025', 2.22]]),
      obs({ code: 'imf_gdp_growth', country: 'ALB', period: '2026', value: 9.99, isProjection: true }),
    ];
    const c = computeChange(def('imf_gdp_growth'), rows);
    expect(c.fromPeriod).toBe('2024');
    expect(c.toPeriod).toBe('2025');
    expect(c.delta).toBeCloseTo(1.11, 10);
  });

  it('is not comparable with fewer than two measured points or when units differ', () => {
    const one = computeChange(def('gdp_growth'), annual('gdp_growth', 'ALB', [['2024', 1.11]]));
    expect(one.comparable).toBe(false);
    expect(one.toPeriod).toBe('2024');
    expect(one.delta).toBeNull();
    const mixed = computeChange(def('gdp_per_capita_usd'), [
      obs({ code: 'gdp_per_capita_usd', country: 'ALB', period: '2023', value: 1111 }),
      obs({ code: 'gdp_per_capita_usd', country: 'ALB', period: '2024', value: 2222, currency: 'EUR' }),
    ]);
    expect(mixed.comparable).toBe(false);
    expect(mixed.warningsSq[0]).toContain('Njësitë ndryshojnë');
  });

  it('falls back to an absolute change when the previous value is zero or negative', () => {
    const c = computeChange(def('tourism_arrivals'), annual('tourism_arrivals', 'ALB', [['2023', 0], ['2024', 12345]]));
    expect(c.deltaKind).toBe('ndryshim_absolut');
    expect(c.delta).toBe(12345);
  });
});
