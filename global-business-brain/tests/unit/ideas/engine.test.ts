// SYNTHETIC — format mirrors the documented API; values are not real
import { beforeAll, describe, expect, it } from 'vitest';
import type { CountryDataContext, IdeaRecommendation } from '@/lib/domain/types';
import { ARCHETYPES } from '@/lib/ideas/archetypes';
import { compareRecommendations, evaluateIdea, evaluateIdeaDetailed, generateIdeas } from '@/lib/ideas/engine';
import { archetypeVariant, IDEAS_ARCHETYPE, testProfile } from '../../fixtures/ideasArchetype';
import { demoContext, emptyRealContext, NOW, SYNTHETIC_FX_RATES, syntheticContext } from '../../fixtures/contexts';

let synthetic: CountryDataContext;
let empty: CountryDataContext;
let demo: CountryDataContext;

beforeAll(async () => {
  [synthetic, empty, demo] = await Promise.all([syntheticContext(), emptyRealContext(), demoContext('ZZA')]);
});

function dim(rec: IdeaRecommendation, id: string) {
  return rec.score.dimensions.find((d) => d.id === id);
}

describe('evaluateIdea', () => {
  it('builds ranges in the profile currency from the deterministic model', () => {
    const rec = evaluateIdea(IDEAS_ARCHETYPE, testProfile(), synthetic, { now: NOW });
    expect(rec.archetypeId).toBe(IDEAS_ARCHETYPE.id);
    expect(rec.countryCode).toBe('ALB');
    expect(rec.capitalRange?.currency).toBe('EUR');
    expect(rec.capitalRange && rec.capitalRange.low <= rec.capitalRange.high).toBe(true);
    expect(rec.monthlyCostRange && rec.monthlyCostRange.low <= rec.monthlyCostRange.high).toBe(true);
    expect(rec.capitalRange?.basisSq).toContain('supozim');
    expect(rec.isDemoData).toBe(false);
    expect(rec.score.total).not.toBeNull();
  });

  it('applies the cited price level by default and can be switched off', () => {
    const withLevel = evaluateIdea(IDEAS_ARCHETYPE, testProfile(), synthetic, { now: NOW });
    expect(withLevel.priceLevelAdjustment?.factor).toBe(0.5);
    expect(withLevel.priceLevelAdjustment?.citation).toMatchObject({ indicatorCode: 'price_level_ratio', period: '2024', countryCode: 'ALB' });
    const without = evaluateIdea(IDEAS_ARCHETYPE, testProfile(), synthetic, { now: NOW, applyPriceLevel: false });
    expect(without.priceLevelAdjustment).toBeNull();
    // Locally priced lines (registration, market test) cost more without the 0.5 factor.
    expect((without.capitalRange?.high ?? 0) > (withLevel.capitalRange?.high ?? 0)).toBe(true);
  });

  it('assets that avoid a cost remove it from the capital range', () => {
    const withLaptop = evaluateIdea(IDEAS_ARCHETYPE, testProfile({ assets: ['kompjuter'] }), synthetic, { now: NOW });
    const withoutLaptop = evaluateIdea(IDEAS_ARCHETYPE, testProfile({ assets: [] }), synthetic, { now: NOW });
    expect((withoutLaptop.capitalRange?.low ?? 0) - (withLaptop.capitalRange?.low ?? 0)).toBeCloseTo(400 * 0.5);
  });

  it('without an FX rate the money parts are null, never 0, and the rest is still returned', () => {
    const rec = evaluateIdea(IDEAS_ARCHETYPE, testProfile(), empty, { now: NOW });
    expect(rec.capitalRange).toBeNull();
    expect(rec.monthlyCostRange).toBeNull();
    expect(rec.fit.capitalGap).toBeNull();
    expect(dim(rec, 'kapitali')?.score).toBeNull();
    expect(dim(rec, 'ekonomia')?.score).toBeNull();
    expect(dim(rec, 'kerkesa')?.score).toBeNull();
    expect(rec.warningsSq.some((w) => w.includes('nuk vlerësohen'))).toBe(true);
    expect(rec.claims.whyWork).toHaveLength(6);
    expect(rec.claims.whyFail.length).toBeGreaterThan(0);
    expect(rec.score.total).not.toBeNull();
    expect(rec.score.assessedWeightPct).toBeLessThan(100);
  });

  it('extra (manual) FX rates make the conversion possible', () => {
    const manual = SYNTHETIC_FX_RATES.map((r) => ({ ...r, sourceId: 'manual', kind: 'manuale' as const }));
    const rec = evaluateIdea(IDEAS_ARCHETYPE, testProfile(), empty, { now: NOW, extraFxRates: manual });
    expect(rec.capitalRange?.currency).toBe('EUR');
  });

  it('a USD profile needs no FX rate', () => {
    const rec = evaluateIdea(IDEAS_ARCHETYPE, testProfile({ capital: { amount: 5000, currency: 'USD' } }), empty, { now: NOW });
    expect(rec.capitalRange?.currency).toBe('USD');
  });

  it('demo data is flagged on the recommendation, its evidence, citations and warnings', () => {
    const rec = evaluateIdea(IDEAS_ARCHETYPE, testProfile(), demo, { now: NOW });
    expect(rec.isDemoData).toBe(true);
    expect(rec.evidence.isDemo).toBe(true);
    expect(['e_ulet', 'shume_e_ulet']).toContain(rec.evidence.level);
    expect(rec.warningsSq.some((w) => w.startsWith('[DEMO]'))).toBe(true);
    const citations = [...rec.claims.macro, ...rec.claims.whyWork, ...rec.claims.whyFail].flatMap((c) => c.citations);
    expect(citations.length).toBeGreaterThan(0);
    expect(citations.every((c) => c.isDemo === true)).toBe(true);
    expect(rec.priceLevelAdjustment?.citation.isDemo).toBe(true);
  });

  it('warns when the owner salary is excluded, not when it is included', () => {
    const excluded = evaluateIdea(IDEAS_ARCHETYPE, testProfile({ ownerIncomeNeedMonthly: null }), synthetic, { now: NOW });
    expect(excluded.warningsSq.some((w) => w.startsWith('Paga e pronarit nuk përfshihet'))).toBe(true);
    const included = evaluateIdea(IDEAS_ARCHETYPE, testProfile({ ownerIncomeNeedMonthly: 500 }), synthetic, { now: NOW });
    expect(included.warningsSq.some((w) => w.startsWith('Paga e pronarit nuk përfshihet'))).toBe(false);
  });

  it('customer evidence feeds the score', () => {
    const base = evaluateIdea(IDEAS_ARCHETYPE, testProfile(), synthetic, { now: NOW });
    const withPaid = evaluateIdea(IDEAS_ARCHETYPE, testProfile(), synthetic, {
      now: NOW,
      evidence: [{ id: 'e', projectId: 'p', type: 'pagese', summarySq: 't', quantity: 3, sourceSq: 't', collectedAt: '2026-09-01', createdAt: '2026-09-01T00:00:00.000Z' }],
    });
    expect((dim(withPaid, 'kerkesa')?.score ?? 0) > (dim(base, 'kerkesa')?.score ?? 0)).toBe(true);
  });

  it('is deterministic for the same inputs and passes the target city only to a target country', () => {
    const p = testProfile({ targetCity: 'Qytet testi', targetCountries: ['ALB'] });
    const a = evaluateIdea(IDEAS_ARCHETYPE, p, synthetic, { now: NOW });
    expect(evaluateIdea(IDEAS_ARCHETYPE, p, synthetic, { now: NOW })).toEqual(a);
    expect(a.city).toBe('Qytet testi');
    expect(evaluateIdea(IDEAS_ARCHETYPE, p, demo, { now: NOW }).city).toBeUndefined();
  });

  it('the detailed variant exposes the inputs and projection behind the numbers', () => {
    const d = evaluateIdeaDetailed(IDEAS_ARCHETYPE, testProfile(), synthetic, { now: NOW });
    expect(d.inputs?.currency).toBe('EUR');
    expect(d.projection?.scenario).toBe('baze');
    expect(d.inputs?.startMonth).toBe(10);
  });
});

describe('generateIdeas', () => {
  const solo = archetypeVariant('ide-solo', {});
  const soloNoSkills = archetypeVariant('ide-solo-pa-aftesi', { requiredSkills: ['programim'] });
  const team = archetypeVariant('ide-ekip', { minTeam: 'ekip' });
  const adult = archetypeVariant('ide-18', { adultOnly: true });
  const teamAdult = archetypeVariant('ide-ekip-18', { minTeam: 'ekip', adultOnly: true });
  const premises = archetypeVariant('ide-ambient', { canStartFromHome: false, nameSq: 'Ide testi me ambient' });
  const library = [team, adult, solo, teamAdult, premises, soloNoSkills];

  it('separates eligible, team-required and excluded ideas and never mixes them', () => {
    const profile = testProfile({ isAdult: false, startLocations: ['shtepi'] });
    const r = generateIdeas({ profile, ctx: synthetic, now: NOW, library });
    const ids = (list: IdeaRecommendation[]) => list.map((x) => x.archetypeId).sort();
    expect(ids(r.recommendations)).toEqual(['ide-solo', 'ide-solo-pa-aftesi']);
    expect(ids(r.teamRequired)).toEqual(['ide-ekip']);
    expect(ids(r.excluded)).toEqual(['ide-18', 'ide-ambient', 'ide-ekip-18']);
    expect(r.recommendations.every((x) => x.fit.eligible)).toBe(true);
    expect([...r.teamRequired, ...r.excluded].every((x) => !x.fit.eligible && x.fit.blockersSq.length > 0)).toBe(true);
    expect(r.noteSq).toContain('nuk është probabilitet fitimi');
  });

  it('sorts recommendations by score, best first', () => {
    const r = generateIdeas({ profile: testProfile(), ctx: synthetic, now: NOW, library });
    const totals = r.recommendations.map((x) => x.score.total ?? -1);
    expect(totals).toEqual([...totals].sort((a, b) => b - a));
    const score = (id: string) => r.recommendations.find((x) => x.archetypeId === id)?.score.total ?? -1;
    expect(score('ide-solo')).toBeGreaterThan(score('ide-solo-pa-aftesi'));
    expect(score('ide-solo')).toBeGreaterThan(score('ide-ambient'));
  });

  it('breaks score ties by evidence quality, then by name', () => {
    const twinA = archetypeVariant('ide-a', { nameSq: 'Ide testi B' });
    const twinB = archetypeVariant('ide-b', { nameSq: 'Ide testi A' });
    const r = generateIdeas({ profile: testProfile(), ctx: synthetic, now: NOW, library: [twinA, twinB] });
    expect(r.recommendations[0].score.total).toBe(r.recommendations[1].score.total);
    // Same score and evidence → alphabetical by name for a stable order.
    expect(r.recommendations.map((x) => x.archetypeId)).toEqual(['ide-b', 'ide-a']);
    const [first, second] = r.recommendations;
    const stronger = { ...second, evidence: { ...second.evidence, level: 'mesatare' as const } };
    const weaker = { ...first, evidence: { ...first.evidence, level: 'shume_e_ulet' as const } };
    expect([weaker, stronger].sort(compareRecommendations).map((x) => x.archetypeId)).toEqual(['ide-a', 'ide-b']);
    const unscored = { ...first, score: { ...first.score, total: null } };
    expect([unscored, second].sort(compareRecommendations)[1]).toBe(unscored);
  });

  it('applies sector, mode and scope filters before ranking', () => {
    const other = archetypeVariant('ide-tjeter', { sector: 'ushqim', modes: ['fizik'], marketScopes: ['nderkombetar'] });
    const lib = [solo, other];
    const ids = (f: Parameters<typeof generateIdeas>[0]['filters']) =>
      generateIdeas({ profile: testProfile(), ctx: synthetic, now: NOW, library: lib, filters: f }).recommendations.map((x) => x.archetypeId);
    expect(ids({ sector: 'ushqim' })).toEqual(['ide-tjeter']);
    expect(ids({ mode: 'online' })).toEqual(['ide-solo']);
    expect(ids({ scope: 'nderkombetar' })).toEqual(['ide-tjeter']);
  });

  it('the capital filter drops ideas above the maximum and keeps unknown ones with a warning', () => {
    const tooLow = generateIdeas({ profile: testProfile(), ctx: synthetic, now: NOW, library: [solo], filters: { maxCapital: 1 } });
    expect(tooLow.recommendations).toHaveLength(0);
    const high = generateIdeas({ profile: testProfile(), ctx: synthetic, now: NOW, library: [solo], filters: { maxCapital: 100000 } });
    expect(high.recommendations).toHaveLength(1);
    const unknown = generateIdeas({ profile: testProfile(), ctx: empty, now: NOW, library: [solo], filters: { maxCapital: 1 } });
    expect(unknown.recommendations).toHaveLength(1);
    expect(unknown.recommendations[0].warningsSq.some((w) => w.includes('Filtri i kapitalit'))).toBe(true);
  });

  it('uses the curated library by default and accounts for every archetype', () => {
    const r = generateIdeas({ profile: testProfile(), ctx: demo, now: NOW });
    expect(r.recommendations.length + r.teamRequired.length + r.excluded.length).toBe(ARCHETYPES.length);
    expect(r.noteSq).toContain('[DEMO]');
  });

  it('works with an empty library', () => {
    const r = generateIdeas({ profile: testProfile(), ctx: synthetic, now: NOW, library: [] });
    expect(r).toMatchObject({ recommendations: [], teamRequired: [], excluded: [] });
  });
});
