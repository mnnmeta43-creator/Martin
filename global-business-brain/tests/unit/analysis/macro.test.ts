// SYNTHETIC — values are not real
// Macro analysis: cited facts, hedged interpretations, projections, limitations, demo handling.
import { describe, expect, it } from 'vitest';
import type { Claim, Observation } from '@/lib/domain/types';
import { ALWAYS_LIMITATIONS_SQ, buildMacroAnalysis, CATEGORY_ORDER, macroCitations, type MacroAnalysis } from '@/lib/analysis/macro';
import { annual, fetchLog, obs } from '../../fixtures/data/observations';
import { contextsFrom } from '../../fixtures/data/contexts';

function albRows(): Observation[] {
  return [
    ...annual('gdp_growth', 'ALB', [['2023', 2.22], ['2024', -1.11]]),
    ...annual('inflation_cpi', 'ALB', [['2023', 3.33], ['2024', 7.77]]),
    ...annual('lending_rate', 'ALB', [['2024', 11.1]]),
    ...annual('youth_unemployment', 'ALB', [['2024', 33.3]]),
    ...annual('remittances_gdp', 'ALB', [['2024', 11.1]]),
    ...annual('population', 'ALB', [['2023', 12345], ['2024', 12346]]),
    ...annual('internet_users_pct', 'ALB', [['2024', 55.5]]),
    obs({ code: 'imf_gdp_growth', country: 'ALB', period: '2025', value: 1.11 }),
    obs({ code: 'imf_gdp_growth', country: 'ALB', period: '2026', value: 2.22, isProjection: true }),
    obs({ code: 'imf_gdp_growth', country: 'ALB', period: '2027', value: 3.33, isProjection: true }),
  ];
}

async function albania(): Promise<{ analysis: MacroAnalysis; stored: Observation[] }> {
  const { store, contexts } = await contextsFrom(['ALB'], albRows());
  return { analysis: buildMacroAnalysis(contexts[0]), stored: store.observations };
}

function allText(a: MacroAnalysis): string[] {
  return [
    ...a.highlights.map((c) => c.textSq),
    ...a.limitationsSq,
    ...a.sections.flatMap((s) => [s.titleSq, ...s.items.flatMap((i) => [i.valueTextSq, i.changeTextSq, i.interpretationSq, i.businessImplicationsSq, i.extraEvidenceSq])]),
  ];
}

const byKind = (claims: Claim[], kind: Claim['kind']) => claims.filter((c) => c.kind === kind);

describe('buildMacroAnalysis — highlights', () => {
  it('every data-backed claim is a fact with a citation pointing at a stored observation', async () => {
    const { analysis, stored } = await albania();
    const supported = analysis.highlights.filter((c) => c.label === 'mbeshtetet_nga_te_dhenat');
    expect(supported.length).toBeGreaterThan(0);
    for (const claim of supported) {
      expect(claim.kind).toBe('fakt');
      expect(claim.citations.length).toBeGreaterThanOrEqual(1);
      for (const c of claim.citations) {
        expect(c.url).toMatch(/^https:\/\/api\.worldbank\.org\/v2\/country\/ALB\/indicator\//);
        expect(c.period).toBeTruthy();
        expect(c.retrievedAt).toBeTruthy();
        expect(c.sourceName).toBeTruthy();
        expect(c.unitLabelSq).toBeTruthy();
        expect(c).toMatchObject({ sourceId: 'worldbank-wdi', countryCode: 'ALB', isDemo: false, isProjection: false });
        const match = stored.find(
          (o) => o.indicatorCode === c.indicatorCode && o.countryCode === c.countryCode && o.period === c.period,
        );
        expect(match).toBeDefined();
        expect(match).toMatchObject({ value: c.value, sourceUrl: c.url, retrievedAt: c.retrievedAt });
      }
    }
  });

  it('states the latest measured value of headline indicators, never a missing one', async () => {
    const { analysis } = await albania();
    const facts = byKind(analysis.highlights, 'fakt');
    const codes = facts.map((c) => c.citations[0].indicatorCode);
    expect(codes).toEqual(expect.arrayContaining(['gdp_growth', 'inflation_cpi', 'lending_rate', 'population', 'internet_users_pct', 'remittances_gdp']));
    expect(codes).not.toContain('unemployment'); // no stored value
    const gdp = facts.find((c) => c.citations[0].indicatorCode === 'gdp_growth')!;
    expect(gdp.citations[0]).toMatchObject({ period: '2024', value: -1.11 });
    expect(gdp.textSq).toContain('2024');
  });

  it('interpretations are hypotheses, never data-backed facts', async () => {
    const { analysis } = await albania();
    const interpretations = byKind(analysis.highlights, 'interpretim');
    expect(interpretations.map((c) => c.id.split('-hipoteze-')[1])).toEqual(['tkurrje', 'inflacion', 'kredi', 'remitanca', 'te-rinj']);
    for (const claim of interpretations) {
      expect(claim.label).toBe('hipoteze');
      expect(claim.citations.length).toBeGreaterThan(0);
    }
    expect(interpretations.find((c) => c.id.endsWith('remitanca'))?.textSq).toContain('duhet testuar me klientë');
  });

  it('a very old value is still a dated fact, but no hypothesis about today is built on it', async () => {
    const { contexts } = await contextsFrom(['ALB'], annual('lending_rate', 'ALB', [['2018', 11.1]]));
    const analysis = buildMacroAnalysis(contexts[0]);
    expect(contexts[0].series.find((s) => s.definition.code === 'lending_rate')?.status).toBe('shume_i_vjeter');
    expect(byKind(analysis.highlights, 'fakt').map((c) => c.citations[0].period)).toEqual(['2018']);
    expect(byKind(analysis.highlights, 'interpretim')).toEqual([]);
  });

  it('projections are kind "parashikim", labelled as hypotheses and cited as projections', async () => {
    const { analysis } = await albania();
    const projections = byKind(analysis.highlights, 'parashikim');
    expect(projections).toHaveLength(1);
    expect(projections[0].label).toBe('hipoteze');
    expect(projections[0].citations[0]).toMatchObject({ indicatorCode: 'imf_gdp_growth', period: '2026', isProjection: true });
    expect(projections[0].citations[0].url).toBe('https://www.imf.org/external/datamapper/api/v1/NGDP_RPCH/ALB');
    expect(projections[0].textSq).toContain('nuk janë matje');
  });

  it('macroCitations lists each cited observation once', async () => {
    const { analysis } = await albania();
    const list = macroCitations(analysis);
    const keys = list.map((c) => `${c.indicatorCode}|${c.period}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toContain('gdp_growth|2024');
  });
});

describe('buildMacroAnalysis — sections and wording', () => {
  it('one item per tracked indicator, grouped in the fixed category order', async () => {
    const { analysis } = await albania();
    const categories = analysis.sections.map((s) => s.category);
    expect(categories).toEqual(CATEGORY_ORDER.filter((c) => categories.includes(c)));
    const codes = analysis.sections.flatMap((s) => s.items.map((i) => i.code));
    expect(new Set(codes).size).toBe(codes.length);
    expect(analysis.sections.every((s) => s.titleSq.length > 0 && s.items.every((i) => i.series.definition.category === s.category))).toBe(true);
  });

  it('describes values, change and missing data without inventing anything', async () => {
    const { analysis } = await albania();
    const items = new Map(analysis.sections.flatMap((s) => s.items).map((i) => [i.code, i]));
    expect(items.get('inflation_cpi')!.valueTextSq).toContain('2024');
    expect(items.get('inflation_cpi')!.changeTextSq).toContain('pikë përqindjeje');
    expect(items.get('unemployment')!.valueTextSq).toMatch(/^Mungojnë të dhënat\./);
    expect(items.get('unemployment')!.interpretationSq).toContain('nuk nxirret asnjë interpretim');
    expect(items.get('lending_rate')!.changeTextSq).toContain('vetëm një vlerë');
  });

  it('never turns a macro trend into a promise about a business', async () => {
    const { analysis } = await albania();
    for (const text of allText(analysis)) {
      expect(text).not.toMatch(/garant|do të fitoj|fitim i sigurt|sukses i sigurt|pa rrezik/i);
    }
  });
});

describe('buildMacroAnalysis — limitations', () => {
  it('always lists rents/energy/wages, national averages and the limits of macro context', async () => {
    const { analysis } = await albania();
    for (const line of ALWAYS_LIMITATIONS_SQ) expect(analysis.limitationsSq).toContain(line);
    const joined = analysis.limitationsSq.join(' ');
    expect(joined).toContain('Qiratë, çmimet e energjisë dhe pagat');
    expect(joined).toContain('Mesataret kombëtare');
    expect(joined).toContain('nuk e vërteton një biznes');
    expect(joined).toContain('parashikime');
  });

  it('a country without data gets no facts, only the limitations and the coverage note', async () => {
    const { contexts } = await contextsFrom(['XKX'], []);
    const analysis = buildMacroAnalysis(contexts[0]);
    expect(analysis.highlights).toEqual([]);
    for (const line of ALWAYS_LIMITATIONS_SQ) expect(analysis.limitationsSq).toContain(line);
    expect(analysis.limitationsSq).toContain(contexts[0].coverage.noteSq);
    expect(analysis.sections.flatMap((s) => s.items).every((i) => i.valueTextSq.startsWith('Mungojnë të dhënat.'))).toBe(true);
  });

  it('mentions failed refreshes when stored values are shown instead', async () => {
    const { contexts } = await contextsFrom(['ALB'], annual('gdp_growth', 'ALB', [['2024', 1.11]]), {
      logs: [fetchLog({ sourceId: 'worldbank-wdi', scope: 'indicator:gdp_growth', status: 'gabim', startedAt: '2026-10-01T06:00:00.000Z' })],
    });
    const analysis = buildMacroAnalysis(contexts[0]);
    expect(analysis.limitationsSq.some((l) => l.includes('dështoi'))).toBe(true);
    // A stored value shown during a source error is still a cited fact.
    expect(analysis.highlights[0]).toMatchObject({ kind: 'fakt', label: 'mbeshtetet_nga_te_dhenat' });
  });
});

describe('buildMacroAnalysis — demo economies', () => {
  it('flags every claim and citation as DEMO', async () => {
    const { contexts } = await contextsFrom(['ZZA'], [], { demoMode: true });
    const analysis = buildMacroAnalysis(contexts[0]);
    expect(analysis.isDemo).toBe(true);
    expect(analysis.highlights.length).toBeGreaterThan(0);
    expect(analysis.highlights.every((c) => c.textSq.startsWith('DEMO — '))).toBe(true);
    expect(analysis.highlights.flatMap((c) => c.citations).every((c) => c.isDemo === true)).toBe(true);
    expect(analysis.limitationsSq.some((l) => l.includes('fiktive (DEMO)'))).toBe(true);
  });
});
