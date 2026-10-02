// SYNTHETIC — values are not real
// Freshness: every branch of assessStatus, with annual and sub-annual cadences.
import { describe, expect, it } from 'vitest';
import type { IndicatorDefinition } from '@/lib/domain/types';
import { assessAge, assessStatus } from '@/lib/data/freshness';
import { getIndicator } from '@/lib/data/indicators';
import { fetchLog, obs } from '../../fixtures/data/observations';

const NOW = new Date('2026-10-02T12:00:00.000Z');
const GDP = getIndicator('gdp_growth')!; // annual, lag 2
const IMF = getIndicator('imf_gdp_growth')!; // annual, lag 1
const FINDEX = getIndicator('account_ownership')!; // irregular, lag 3
const scope = 'indicator:gdp_growth';

const okLog = fetchLog({ sourceId: 'worldbank-wdi', scope, status: 'ok', startedAt: '2026-09-20T10:00:00.000Z' });
const failedLog = fetchLog({ sourceId: 'worldbank-wdi', scope, status: 'gabim', startedAt: '2026-10-01T06:00:00.000Z' });

function monthly(): IndicatorDefinition {
  return { ...GDP, code: 'test_monthly', periodicity: 'mujore', expectedLagYears: undefined };
}

describe('assessStatus — no stored value', () => {
  it('source failed and nothing stored → gabim_burimi', () => {
    const r = assessStatus(GDP, null, NOW, failedLog);
    expect(r.status).toBe('gabim_burimi');
    expect(r.reasonSq).toBe('Burimi nuk u përgjigj më 1 tetor 2026; nuk ka të dhëna të ruajtura.');
  });

  it('never fetched → mungon', () => {
    expect(assessStatus(GDP, null, NOW)).toEqual({ status: 'mungon', reasonSq: 'Burimi nuk është sinkronizuar ende.' });
    expect(assessStatus(GDP, null, NOW, null).status).toBe('mungon');
  });

  it('fetched fine but the source has no value for the country → mungon', () => {
    expect(assessStatus(GDP, null, NOW, okLog)).toEqual({ status: 'mungon', reasonSq: 'Burimi nuk publikon vlerë për këtë vend.' });
  });

  it('a stored null value counts as missing, never as zero', () => {
    const r = assessStatus(GDP, obs({ code: 'gdp_growth', country: 'ALB', period: '2024', value: null }), NOW, okLog);
    expect(r.status).toBe('mungon');
  });

  it('demo economy without a value → mungon with a demo explanation', () => {
    const r = assessStatus(GDP, null, NOW, null, { isDemo: true });
    expect(r.status).toBe('mungon');
    expect(r.reasonSq).toContain('DEMO');
  });
});

describe('assessStatus — annual series', () => {
  const at = (period: string) => obs({ code: 'gdp_growth', country: 'ALB', period, value: 1.11 });

  it('within the expected lag → i_fresket, phrased as the latest available data', () => {
    expect(assessStatus(GDP, at('2024'), NOW, okLog)).toEqual({ status: 'i_fresket', reasonSq: 'Të dhënat më të fundit të disponueshme: 2024.' });
    expect(assessStatus(GDP, at('2025'), NOW).status).toBe('i_fresket');
  });

  it('up to two years beyond the lag → i_vjeter; older → shume_i_vjeter', () => {
    expect(assessStatus(GDP, at('2023'), NOW).status).toBe('i_vjeter');
    const r = assessStatus(GDP, at('2022'), NOW);
    expect(r.status).toBe('i_vjeter');
    expect(r.reasonSq).toContain('2 vjet');
    expect(assessStatus(GDP, at('2021'), NOW).status).toBe('shume_i_vjeter');
  });

  it('uses each definition’s own lag', () => {
    const imf = (period: string) => obs({ code: 'imf_gdp_growth', country: 'ALB', period, value: 1.11 });
    expect(assessStatus(IMF, imf('2025'), NOW).status).toBe('i_fresket');
    expect(assessStatus(IMF, imf('2024'), NOW).status).toBe('i_vjeter');
    const findex = (period: string) => obs({ code: 'account_ownership', country: 'ALB', period, value: 11.1 });
    expect(assessStatus(FINDEX, findex('2023'), NOW).status).toBe('i_fresket');
    expect(assessStatus(FINDEX, findex('2022'), NOW).status).toBe('i_vjeter');
  });

  it('a failed refresh with stored values → gabim_burimi naming both dates', () => {
    const r = assessStatus(GDP, at('2024'), NOW, failedLog);
    expect(r.status).toBe('gabim_burimi');
    expect(r.reasonSq).toBe(
      'Burimi nuk u përgjigj më 1 tetor 2026; po shfaqen të dhënat e ruajtura më 1 shtator 2026 (periudha e fundit: 2024).',
    );
  });

  it('projection-only series → parashikim (also when the last refresh failed)', () => {
    const projection = obs({ code: 'imf_gdp_growth', country: 'ALB', period: '2026', value: 2.22, isProjection: true });
    expect(assessStatus(IMF, projection, NOW).status).toBe('parashikim');
    const r = assessStatus(IMF, projection, NOW, failedLog);
    expect(r.status).toBe('parashikim');
    expect(r.reasonSq).toContain('dështoi');
  });

  it('demo values → demo', () => {
    const r = assessStatus(GDP, obs({ code: 'gdp_growth', country: 'ZZA', period: '2024', value: 3.33, isDemo: true }), NOW);
    expect(r.status).toBe('demo');
    expect(r.reasonSq).toContain('fiktive');
  });

  it('skipped last refresh keeps the age-based status', () => {
    const skipped = fetchLog({ sourceId: 'worldbank-wdi', scope, status: 'anashkaluar' });
    expect(assessStatus(GDP, at('2024'), NOW, skipped).status).toBe('i_fresket');
    expect(assessStatus(GDP, null, NOW, skipped).status).toBe('mungon');
  });
});

describe('assessStatus — sub-annual cadences scale proportionally', () => {
  const def = monthly();
  const m = (period: string) => ({ ...obs({ code: 'gdp_growth', country: 'ALB', period, value: 1.11 }), indicatorCode: def.code });

  it('monthly: 2 months behind is fresh, up to 6 is old, beyond is very old', () => {
    expect(assessStatus(def, m('2026-08'), NOW).status).toBe('i_fresket');
    expect(assessStatus(def, m('2026-05'), NOW).status).toBe('i_vjeter');
    expect(assessStatus(def, m('2025-12'), NOW).status).toBe('shume_i_vjeter');
  });

  it('quarterly and daily periods use their own units', () => {
    expect(assessAge(def, '2026-Q2', NOW)).toBe('i_fresket');
    expect(assessAge(def, '2025-Q4', NOW)).toBe('i_vjeter');
    expect(assessAge(def, '2026-09-28', NOW)).toBe('i_fresket');
    expect(assessAge(def, '2026-09-10', NOW)).toBe('i_vjeter');
    expect(assessAge(def, '2026-07-01', NOW)).toBe('shume_i_vjeter');
  });

  it('an unreadable period is treated with caution', () => {
    expect(assessStatus(GDP, { ...obs({ code: 'gdp_growth', country: 'ALB', period: '2024', value: 1 }), period: 'FY24' }, NOW).status).toBe('i_vjeter');
  });
});
