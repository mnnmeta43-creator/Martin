import { beforeAll, describe, expect, it } from 'vitest';
import type { CountryDataContext, DimensionScore, EvidenceEntry, ProjectionResult, ScoreWeights } from '@/lib/domain/types';
import { DEFAULT_SCORE_WEIGHTS } from '@/lib/domain/taxonomy';
import { buildFinancialInputs } from '@/lib/finance/build';
import { projectScenario } from '@/lib/finance/engine';
import { buildMacroClaims } from '@/lib/ideas/claims';
import { assessProfileFit } from '@/lib/ideas/fit';
import { combineScore, normalizeWeights, SCORE_NOTE_SQ, scoreIdea, validateWeights, type ScoreInput } from '@/lib/scoring/score';
import { archetypeVariant, IDEAS_ARCHETYPE, testProfile } from '../../fixtures/ideasArchetype';
import { emptyRealContext, SYNTHETIC_FX_RATES, syntheticContext } from '../../fixtures/contexts';

let synthetic: CountryDataContext;
let empty: CountryDataContext;

beforeAll(async () => {
  [synthetic, empty] = await Promise.all([syntheticContext(), emptyRealContext()]);
});

function projectionFor(archetype = IDEAS_ARCHETYPE, ownCapital = 5000): ProjectionResult {
  const built = buildFinancialInputs(archetype, { currency: 'EUR', fxRates: SYNTHETIC_FX_RATES, ownCapital, assets: [], startMonth: 10, today: '2026-10-02' });
  if (!built.ok) throw new Error(built.reasonSq);
  return projectScenario(built.inputs, 'baze');
}

function input(overrides: Partial<ScoreInput> = {}): ScoreInput {
  const ctx = overrides.ctx ?? synthetic;
  const archetype = overrides.archetype ?? IDEAS_ARCHETYPE;
  const profile = overrides.profile ?? testProfile();
  return {
    archetype,
    profile,
    fit: assessProfileFit(archetype, profile, { capitalRange: null, ownCapital: profile.capital.amount }),
    projection: projectionFor(archetype),
    macroClaims: buildMacroClaims(archetype, ctx),
    ctx,
    weights: DEFAULT_SCORE_WEIGHTS,
    ...overrides,
  };
}

function dimension(dims: DimensionScore[], id: DimensionScore['id']): DimensionScore {
  const d = dims.find((x) => x.id === id);
  if (!d) throw new Error(id);
  return d;
}

function evidence(type: EvidenceEntry['type'], quantity: number): EvidenceEntry {
  return { id: `e-${type}`, projectId: 'p', type, summarySq: 'test', quantity, sourceSq: 'test', collectedAt: '2026-09-01', createdAt: '2026-09-01T00:00:00.000Z' };
}

describe('validateWeights', () => {
  it('accepts the defaults', () => {
    expect(validateWeights(DEFAULT_SCORE_WEIGHTS)).toEqual({ ok: true, errorsSq: [] });
  });

  it.each([
    ['sum ≠ 100', { ...DEFAULT_SCORE_WEIGHTS, rreziku: 9 }, 'saktësisht 100'],
    ['non-integer', { ...DEFAULT_SCORE_WEIGHTS, rreziku: 9.5, kerkesa: 20.5 }, 'numër i plotë'],
    ['negative', { ...DEFAULT_SCORE_WEIGHTS, rreziku: -10, kerkesa: 40 }, 'numër i plotë'],
    ['above 100', { kerkesa: 120, kapitali: 0, aftesite: 0, veshtiresia: 0, ekonomia: 0, rreziku: -20 }, 'numër i plotë'],
    ['missing key', { kerkesa: 30, kapitali: 20, aftesite: 20, veshtiresia: 15, ekonomia: 15 }, 'Mungojnë'],
    ['extra key', { ...DEFAULT_SCORE_WEIGHTS, tjeter: 0 }, 'panjohura'],
    ['string value', { ...DEFAULT_SCORE_WEIGHTS, rreziku: '10' }, 'numër i plotë'],
  ])('rejects %s', (_name, weights, fragment) => {
    const r = validateWeights(weights);
    expect(r.ok).toBe(false);
    expect(r.errorsSq.join(' ')).toContain(fragment);
  });

  it('rejects non-objects', () => {
    expect(validateWeights(null).ok).toBe(false);
    expect(validateWeights([1, 2, 3]).ok).toBe(false);
  });
});

describe('normalizeWeights', () => {
  const sum = (w: ScoreWeights) => Object.values(w).reduce((s, v) => s + v, 0);

  it.each([
    [{ kerkesa: 1, kapitali: 1, aftesite: 1 }],
    [{ kerkesa: 1, kapitali: 1, aftesite: 1, veshtiresia: 1, ekonomia: 1, rreziku: 1 }],
    [{ kerkesa: 0.3, kapitali: 7, ekonomia: 13.33 }],
    [{ kerkesa: 50, kapitali: 50, aftesite: 50, veshtiresia: 50, ekonomia: 50, rreziku: 50 }],
    [{ rreziku: 3 }],
  ])('sums to exactly 100 with integers (%o)', (partial) => {
    const w = normalizeWeights(partial);
    expect(sum(w)).toBe(100);
    expect(Object.values(w).every(Number.isInteger)).toBe(true);
    expect(validateWeights(w).ok).toBe(true);
  });

  it('uses largest remainders, ties to the earlier dimension', () => {
    expect(normalizeWeights({ kerkesa: 1, kapitali: 1, aftesite: 1 })).toEqual({ kerkesa: 34, kapitali: 33, aftesite: 33, veshtiresia: 0, ekonomia: 0, rreziku: 0 });
  });

  it('keeps valid weights unchanged', () => {
    expect(normalizeWeights(DEFAULT_SCORE_WEIGHTS)).toEqual(DEFAULT_SCORE_WEIGHTS);
  });

  it('falls back to the defaults when everything is zero or invalid', () => {
    expect(normalizeWeights({})).toEqual(DEFAULT_SCORE_WEIGHTS);
    expect(normalizeWeights({ kerkesa: -5, kapitali: Number.NaN })).toEqual(DEFAULT_SCORE_WEIGHTS);
  });
});

describe('scoreIdea', () => {
  it('scores every dimension 0–100 with a basis and an Albanian reason, plus the orientation note', () => {
    const r = scoreIdea(input());
    expect(r.dimensions.map((d) => d.id)).toEqual(['kerkesa', 'kapitali', 'aftesite', 'veshtiresia', 'ekonomia', 'rreziku']);
    for (const d of r.dimensions) {
      expect(d.score).not.toBeNull();
      expect(d.score as number).toBeGreaterThanOrEqual(0);
      expect(d.score as number).toBeLessThanOrEqual(100);
      expect(d.reasonSq.length).toBeGreaterThan(10);
    }
    expect(r.noteSq).toContain(SCORE_NOTE_SQ);
    expect(r.assessedWeightPct).toBe(100);
    expect(r.total).not.toBeNull();
  });

  it('excludes null dimensions from the total instead of treating them as 0', () => {
    const r = scoreIdea(input({ projection: null }));
    expect(dimension(r.dimensions, 'kapitali').score).toBeNull();
    expect(dimension(r.dimensions, 'ekonomia').score).toBeNull();
    expect(dimension(r.dimensions, 'ekonomia').basis).toBe('mungon');
    const assessed = r.dimensions.filter((d) => d.score !== null);
    const w = assessed.reduce((s, d) => s + r.weights[d.id], 0);
    const expected = Math.round((assessed.reduce((s, d) => s + (d.score as number) * r.weights[d.id], 0) / w) * 10) / 10;
    expect(r.total).toBe(expected);
    expect(r.assessedWeightPct).toBe(65);
    const asZero = Math.round(assessed.reduce((s, d) => s + (d.score as number) * r.weights[d.id], 0) / 100 * 10) / 10;
    expect(r.total as number).toBeGreaterThan(asZero);
    expect(r.noteSq).toContain('nuk u trajtuan si 0');
  });

  it('demand is null ("mungon") without linked data and without customer evidence', () => {
    const r = scoreIdea(input({ ctx: empty, macroClaims: buildMacroClaims(IDEAS_ARCHETYPE, empty) }));
    const demand = dimension(r.dimensions, 'kerkesa');
    expect(demand.score).toBeNull();
    expect(demand.basis).toBe('mungon');
  });

  it('paid pre-orders and payments raise demand; they also make it assessable without macro data', () => {
    const before = dimension(scoreIdea(input()).dimensions, 'kerkesa').score as number;
    const after = dimension(scoreIdea(input({ evidence: [evidence('parapagim', 2), evidence('pagese', 1)] })).dimensions, 'kerkesa').score as number;
    expect(after).toBeGreaterThan(before);
    const noMacro = scoreIdea(input({ ctx: empty, macroClaims: buildMacroClaims(IDEAS_ARCHETYPE, empty), evidence: [evidence('pagese', 3)] }));
    expect(dimension(noMacro.dimensions, 'kerkesa').score).not.toBeNull();
    const quotesOnly = scoreIdea(input({ ctx: empty, macroClaims: buildMacroClaims(IDEAS_ARCHETYPE, empty), evidence: [evidence('oferte_cmimi', 3)] }));
    expect(dimension(quotesOnly.dimensions, 'kerkesa').score).toBeNull();
  });

  it('allows a real computed 0 for the economics when the contribution is not positive, with the reason', () => {
    const losing = archetypeVariant('ide-humbje', { pricing: { ...IDEAS_ARCHETYPE.pricing, priceUSD: { low: 1, base: 2, high: 3 } } });
    const eco = dimension(scoreIdea(input({ archetype: losing, projection: projectionFor(losing) })).dimensions, 'ekonomia');
    expect(eco.score).toBe(0);
    expect(eco.reasonSq).toContain('e llogaritur');
  });

  it('caps the capital dimension at 100 and lowers it when capital is short', () => {
    const rich = dimension(scoreIdea(input({ profile: testProfile({ capital: { amount: 1_000_000, currency: 'EUR' } }) })).dimensions, 'kapitali');
    expect(rich.score).toBe(100);
    const poor = dimension(scoreIdea(input({ profile: testProfile({ capital: { amount: 100, currency: 'EUR' } }) })).dimensions, 'kapitali');
    expect(poor.score as number).toBeLessThan(10);
  });

  it('skills weigh required 60%, helpful 25%, sector experience 15%', () => {
    const none = scoreIdea(input({ profile: testProfile({ skills: [], experienceSectors: [] }) }));
    expect(dimension(none.dimensions, 'aftesite').score).toBe(0);
    const all = scoreIdea(input({ profile: testProfile({ skills: ['administrim', 'shitje', 'kontabilitet', 'sherbim_klienti'] }) }));
    expect(dimension(all.dimensions, 'aftesite').score).toBe(100);
    const requiredOnly = scoreIdea(input({ profile: testProfile({ experienceSectors: [] }) }));
    expect(dimension(requiredOnly.dimensions, 'aftesite').score).toBe(60);
  });

  it('ease of start drops for regulated, team, premises and hours', () => {
    const easy = dimension(scoreIdea(input()).dimensions, 'veshtiresia').score as number;
    const hard = archetypeVariant('ide-veshtire', { regulated: true, minTeam: 'ekip', canStartFromHome: false, minHoursPerWeek: 40 });
    const hardScore = dimension(scoreIdea(input({ archetype: hard })).dimensions, 'veshtiresia').score as number;
    expect(hardScore).toBeLessThan(easy);
  });

  it('risk uses inflation/lending data when present and says so', () => {
    const withData = dimension(scoreIdea(input()).dimensions, 'rreziku');
    expect(withData.basis).toBe('te_dhena');
    const noData = dimension(scoreIdea(input({ ctx: empty, macroClaims: [] })).dimensions, 'rreziku');
    expect(noData.basis).toBe('supozim');
    expect(withData.score as number).toBeLessThan(noData.score as number);
  });

  it('is deterministic and changing the weights changes the total predictably', () => {
    const a = scoreIdea(input());
    expect(scoreIdea(input())).toEqual(a);
    const skillsOnly = scoreIdea(input({ weights: { kerkesa: 0, kapitali: 0, aftesite: 100, veshtiresia: 0, ekonomia: 0, rreziku: 0 } }));
    expect(skillsOnly.total).toBe(dimension(a.dimensions, 'aftesite').score);
    const shifted = scoreIdea(input({ weights: { ...DEFAULT_SCORE_WEIGHTS, veshtiresia: 35, aftesite: 0 } }));
    expect(shifted.total).not.toBe(a.total);
    expect(combineScore(a.dimensions, shifted.weights).total).toBe(shifted.total);
  });

  it('normalizes invalid weights instead of failing', () => {
    const r = scoreIdea(input({ weights: { kerkesa: 1, kapitali: 1, aftesite: 1, veshtiresia: 1, ekonomia: 1, rreziku: 1 } }));
    expect(Object.values(r.weights).reduce((s, v) => s + v, 0)).toBe(100);
  });
});
