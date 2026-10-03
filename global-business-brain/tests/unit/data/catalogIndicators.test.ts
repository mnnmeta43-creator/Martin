// Indicator catalog: exact coverage of the code contract, complete Albanian explanations, sane units.
import { describe, expect, it } from 'vitest';
import { INDICATOR_CODES } from '@/lib/data/indicatorCodes';
import { INDICATORS, getIndicator, getIndicatorsBySource } from '@/lib/data/indicators';
import { getSource } from '@/lib/data/sources/registry';

const EXPLAIN_FIELDS = [
  'whatItMeasuresSq',
  'whyItMattersSq',
  'affectedBusinessesSq',
  'mechanismSq',
  'extraEvidenceSq',
  'analogySq',
  'cautionSq',
] as const;

describe('indicator catalog', () => {
  it('defines exactly one indicator per contract code', () => {
    const codes = INDICATORS.map((d) => d.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect([...codes].sort()).toEqual([...INDICATOR_CODES].sort());
  });

  it('getIndicator finds every code and returns undefined for unknown codes', () => {
    for (const code of INDICATOR_CODES) expect(getIndicator(code)?.code).toBe(code);
    expect(getIndicator('nuk_ekziston')).toBeUndefined();
  });

  it.each(INDICATORS.map((d) => [d.code, d] as const))('%s has every explanation field filled', (_code, def) => {
    for (const field of EXPLAIN_FIELDS) {
      expect(def.explain[field]?.trim().length ?? 0, `${def.code}.${field}`).toBeGreaterThan(20);
    }
    expect(def.nameSq.trim()).not.toBe('');
    expect(def.nameEn.trim()).not.toBe('');
    expect(def.unitLabelSq.trim()).not.toBe('');
  });

  it('every indicator points at a registered source with a source code', () => {
    for (const def of INDICATORS) {
      expect(getSource(def.sourceId), def.code).toBeDefined();
      expect(def.sourceCode.trim(), def.code).not.toBe('');
    }
  });

  it('never claims that macro data proves success', () => {
    const banned = /(garanton|garantuar|vërteton që biznesi|do të ketë sukses me siguri|provon që biznesi)/i;
    for (const def of INDICATORS) {
      for (const field of EXPLAIN_FIELDS) expect(def.explain[field] ?? '', `${def.code}.${field}`).not.toMatch(banned);
    }
  });

  it('uses the documented units and bases for key series', () => {
    expect(getIndicator('gdp_growth')).toMatchObject({ sourceCode: 'NY.GDP.MKTP.KD.ZG', unit: 'perqind', basis: 'real' });
    expect(getIndicator('gdp_per_capita_usd')).toMatchObject({ unit: 'monedhe', currency: 'USD', basis: 'nominal' });
    expect(getIndicator('gdp_per_capita_usd')?.explain.cautionSq).toMatch(/kurs/);
    expect(getIndicator('gdp_per_capita_ppp')).toMatchObject({ unit: 'monedhe', currency: 'INTL$' });
    expect(getIndicator('price_level_ratio')).toMatchObject({ unit: 'raport', basis: 'raport' });
    expect(getIndicator('price_level_ratio')?.explain.whatItMeasuresSq).toMatch(/rreth 1/);
    expect(getIndicator('exchange_rate_lcu_usd')).toMatchObject({ unit: 'mv_per_usd', sourceCode: 'PA.NUS.FCRF' });
    expect(getIndicator('remittances_gdp')?.unitLabelSq).toMatch(/PBB/);
    expect(getIndicator('tourism_arrivals')?.unit).toBe('numer');
    expect(getIndicator('mobile_subscriptions')?.unit).toBe('per_100');
    expect(getIndicator('new_business_density')).toMatchObject({ unit: 'per_1000', expectedLagYears: 3 });
    expect(getIndicator('account_ownership')).toMatchObject({ periodicity: 'e_parregullt', expectedLagYears: 3 });
  });

  it('labels IMF series as projection sources with a one-year lag', () => {
    const imf = getIndicatorsBySource('imf-datamapper');
    expect(imf.map((d) => d.code).sort()).toEqual(['imf_gdp_growth', 'imf_inflation', 'imf_unemployment']);
    for (const def of imf) {
      expect(def.isProjectionSource).toBe(true);
      expect(def.expectedLagYears).toBe(1);
      expect(def.explain.cautionSq).toMatch(/parashikim/);
    }
    expect(imf.map((d) => d.sourceCode).sort()).toEqual(['LUR', 'NGDP_RPCH', 'PCPIPCH']);
  });

  it('World Bank series default to an annual two-year lag', () => {
    const wb = getIndicatorsBySource('worldbank-wdi');
    expect(wb.length).toBe(INDICATOR_CODES.length - 3);
    for (const def of wb) {
      expect(def.isProjectionSource ?? false).toBe(false);
      expect([2, 3]).toContain(def.expectedLagYears);
    }
  });
});
