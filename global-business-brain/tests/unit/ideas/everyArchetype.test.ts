/**
 * Invariants of evaluateIdea over the WHOLE curated library (whatever size it has right now),
 * for every demo economy, plus the synthetic test archetype so the suite never runs empty.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import type { BusinessArchetype, Claim, CountryDataContext, IdeaRecommendation, MoneyRange } from '@/lib/domain/types';
import { ARCHETYPES } from '@/lib/ideas/archetypes';
import { isTraceableCitation } from '@/lib/ideas/claims';
import { evaluateIdea, generateIdeas } from '@/lib/ideas/engine';
import { IDEAS_ARCHETYPE, testProfile } from '../../fixtures/ideasArchetype';
import { demoContext, emptyRealContext, NOW } from '../../fixtures/contexts';

const LIBRARY: BusinessArchetype[] = [IDEAS_ARCHETYPE, ...ARCHETYPES];
const DEMO_CODES = ['ZZA', 'ZZB', 'ZZC'] as const;
const contexts: Record<string, CountryDataContext> = {};

beforeAll(async () => {
  for (const code of DEMO_CODES) contexts[code] = await demoContext(code);
  contexts.ALB = await emptyRealContext('ALB');
});

/** Every number anywhere in the object must be finite (no NaN / Infinity leaks to the UI). */
function nonFiniteNumbers(value: unknown, path = 'rec', out: string[] = []): string[] {
  if (typeof value === 'number' && !Number.isFinite(value)) out.push(path);
  else if (Array.isArray(value)) value.forEach((v, i) => nonFiniteNumbers(v, `${path}[${i}]`, out));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) nonFiniteNumbers(v, `${path}.${k}`, out);
  return out;
}

function expectRange(range: MoneyRange | null, currency: string): void {
  if (!range) return;
  expect(range.low).toBeGreaterThanOrEqual(0);
  expect(range.low).toBeLessThanOrEqual(range.high);
  expect(range.currency).toBe(currency);
  expect(range.basisSq.length).toBeGreaterThan(20);
}

function allClaims(rec: IdeaRecommendation): Claim[] {
  return [...rec.claims.macro, ...rec.claims.whyWork, ...rec.claims.whyFail];
}

function expectInvariants(a: BusinessArchetype, rec: IdeaRecommendation, ctx: CountryDataContext): void {
  expect(nonFiniteNumbers(rec)).toEqual([]);
  expectRange(rec.capitalRange, 'EUR');
  expectRange(rec.monthlyCostRange, 'EUR');
  expect(rec.archetypeId).toBe(a.id);
  expect(rec.isDemoData).toBe(ctx.isDemo);

  for (const d of rec.score.dimensions) {
    if (d.score !== null) {
      expect(d.score).toBeGreaterThanOrEqual(0);
      expect(d.score).toBeLessThanOrEqual(100);
    } else {
      expect(d.basis).toBe('mungon');
    }
    expect(d.reasonSq.trim().length).toBeGreaterThan(0);
  }
  if (rec.score.total !== null) {
    expect(rec.score.total).toBeGreaterThanOrEqual(0);
    expect(rec.score.total).toBeLessThanOrEqual(100);
  }
  expect(Object.values(rec.score.weights).reduce((s, v) => s + v, 0)).toBe(100);
  expect(rec.score.noteSq).toContain('jo probabilitet');

  const claims = allClaims(rec);
  expect(new Set(claims.map((c) => c.id)).size).toBe(claims.length);
  expect(rec.claims.whyWork).toHaveLength(6);
  expect(rec.claims.whyFail.filter((c) => c.textSq.startsWith('Ideja rrëzohet nëse:'))).toHaveLength(a.falsifiersSq.length);
  for (const c of claims) {
    expect(c.textSq.trim().length).toBeGreaterThan(0);
    if (c.label === 'mbeshtetet_nga_te_dhenat') {
      expect(c.citations.length).toBeGreaterThan(0);
      expect(c.citations.every(isTraceableCitation)).toBe(true);
    }
    if (c.id.endsWith(':mungon')) expect(c.citations).toEqual([]);
    for (const cit of c.citations) if (ctx.isDemo) expect(cit.isDemo).toBe(true);
    expect(c.textSq).not.toMatch(/fitim(i)? (i |të )?garantuar|sukses(i)? i garantuar/i);
  }
  expect(rec.claims.macro.length).toBeGreaterThanOrEqual(a.macroLinks.length);

  if (ctx.isDemo) {
    expect(rec.warningsSq.some((w) => w.startsWith('[DEMO]'))).toBe(true);
    expect(rec.evidence.isDemo).toBe(true);
    expect(['e_ulet', 'shume_e_ulet']).toContain(rec.evidence.level);
  }
  expect(rec.fit.eligible).toBe(rec.fit.blockersSq.length === 0);
}

describe(`evaluateIdea over every archetype (${LIBRARY.length} incl. the test fixture)`, () => {
  for (const code of DEMO_CODES) {
    it(`demo economy ${code}: all invariants hold`, () => {
      const ctx = contexts[code];
      for (const a of LIBRARY) expectInvariants(a, evaluateIdea(a, testProfile(), ctx, { now: NOW }), ctx);
    });
  }

  it('a real country without data: no money numbers, no data-backed claims, still valid', () => {
    const ctx = contexts.ALB;
    for (const a of LIBRARY) {
      const rec = evaluateIdea(a, testProfile(), ctx, { now: NOW });
      expectInvariants(a, rec, ctx);
      expect(rec.capitalRange).toBeNull();
      expect(allClaims(rec).some((c) => c.label === 'mbeshtetet_nga_te_dhenat')).toBe(false);
    }
  });

  it('a minimal profile (no capital, no skills, minor, home-only) never crashes and keeps lists separate', () => {
    const profile = testProfile({ capital: { amount: 0, currency: 'EUR' }, skills: [], assets: [], isAdult: false, startLocations: ['shtepi'], hoursPerWeek: 1 });
    const r = generateIdeas({ profile, ctx: contexts.ZZA, now: NOW, library: LIBRARY });
    expect(r.recommendations.length + r.teamRequired.length + r.excluded.length).toBe(LIBRARY.length);
    const ids = [...r.recommendations, ...r.teamRequired, ...r.excluded].map((x) => x.archetypeId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const rec of r.recommendations) expect(rec.fit.eligible).toBe(true);
  });
});
