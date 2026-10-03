// SYNTHETIC — format mirrors the documented API; values are not real
import { beforeAll, describe, expect, it } from 'vitest';
import type { Claim, CountryDataContext, EvidenceEntry } from '@/lib/domain/types';
import { buildMacroClaims } from '@/lib/ideas/claims';
import { assessEvidenceQuality } from '@/lib/scoring/score';
import { IDEAS_ARCHETYPE } from '../../fixtures/ideasArchetype';
import { demoContext, emptyRealContext, syntheticContext } from '../../fixtures/contexts';

let synthetic: CountryDataContext;
let empty: CountryDataContext;
let demo: CountryDataContext;

beforeAll(async () => {
  [synthetic, empty, demo] = await Promise.all([syntheticContext(), emptyRealContext(), demoContext('ZZA')]);
});

function paid(quantity: number): EvidenceEntry {
  return { id: 'e1', projectId: 'p', type: 'pagese', summarySq: 'test', quantity, sourceSq: 'test', collectedAt: '2026-09-01', createdAt: '2026-09-01T00:00:00.000Z' };
}

function hypotheses(n: number): Claim[] {
  return Array.from({ length: n }, (_, i) => ({ id: `h${i}`, textSq: 'hipotezë testi', kind: 'supozim' as const, label: 'hipoteze' as const, citations: [] }));
}

/** Same data, but pretending coverage is complete (to reach the upper levels). */
function fullCoverage(ctx: CountryDataContext): CountryDataContext {
  return { ...ctx, coverage: { ...ctx.coverage, level: 'e_plote', staleIndicators: [] } };
}

describe('assessEvidenceQuality', () => {
  it('counts claims by label', () => {
    const claims = [...buildMacroClaims(IDEAS_ARCHETYPE, synthetic), ...hypotheses(2)];
    const q = assessEvidenceQuality(claims, synthetic);
    expect(q.dataBackedClaims).toBe(claims.filter((c) => c.label === 'mbeshtetet_nga_te_dhenat').length);
    expect(q.hypothesisClaims).toBe(claims.filter((c) => c.label === 'hipoteze').length);
    expect(q.toTestClaims).toBe(0);
    expect(q.coverage).toBe(synthetic.coverage.level);
    expect(q.isDemo).toBe(false);
  });

  it('no data → very low evidence and the coverage note', () => {
    const q = assessEvidenceQuality(buildMacroClaims(IDEAS_ARCHETYPE, empty), empty);
    expect(q.level).toBe('shume_e_ulet');
    expect(q.dataBackedClaims).toBe(0);
    expect(q.coverage).toBe('e_pamjaftueshme');
    expect(q.notesSq).toContain(empty.coverage.noteSq);
  });

  it('macro data alone never reaches "e_larte"; paid customers are required', () => {
    const claims = buildMacroClaims(IDEAS_ARCHETYPE, synthetic);
    const ctx = fullCoverage(synthetic);
    expect(assessEvidenceQuality(claims, ctx).level).toBe('mesatare');
    expect(assessEvidenceQuality(claims, ctx, [paid(3)]).level).toBe('e_larte');
    expect(assessEvidenceQuality(claims, ctx, [paid(2)]).level).toBe('mesatare');
  });

  it('insufficient coverage caps the level at "e_ulet"', () => {
    const claims = buildMacroClaims(IDEAS_ARCHETYPE, synthetic);
    expect(synthetic.coverage.level).toBe('e_pamjaftueshme');
    expect(assessEvidenceQuality(claims, synthetic, [paid(10)]).level).toBe('e_ulet');
  });

  it('stale cited indicators are listed and lower the level', () => {
    const claims = buildMacroClaims(IDEAS_ARCHETYPE, synthetic);
    const cited = ['internet_users_pct', 'services_va_gdp', 'tourism_arrivals', 'lending_rate'];
    const staleCtx: CountryDataContext = { ...synthetic, coverage: { ...synthetic.coverage, level: 'e_plote', staleIndicators: [...cited, 'population'] } };
    const q = assessEvidenceQuality(claims, staleCtx);
    expect(q.staleIndicators).toEqual(cited);
    expect(q.level).toBe('e_ulet');
  });

  it('demo evidence is flagged, explained as fictional and never above "e_ulet"', () => {
    const claims = buildMacroClaims(IDEAS_ARCHETYPE, demo);
    const q = assessEvidenceQuality(claims, demo, [paid(10)]);
    expect(q.isDemo).toBe(true);
    expect(['e_ulet', 'shume_e_ulet']).toContain(q.level);
    expect(q.notesSq.some((n) => n.includes('DEMO') && n.includes('fiktive'))).toBe(true);
  });

  it('handles an empty claim list', () => {
    const q = assessEvidenceQuality([], synthetic);
    expect(q.level).toBe('shume_e_ulet');
    expect(q.dataBackedClaims + q.hypothesisClaims + q.toTestClaims).toBe(0);
  });
});
