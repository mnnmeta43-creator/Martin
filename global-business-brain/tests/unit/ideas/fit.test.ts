import { describe, expect, it } from 'vitest';
import type { MoneyRange } from '@/lib/domain/types';
import { validateArchetype } from '@/lib/ideas/archetypes/validate';
import { assessProfileFit, assessProfileFitDetailed, TEAM_BLOCKER_PREFIX_SQ } from '@/lib/ideas/fit';
import { archetypeVariant, IDEAS_ARCHETYPE, testProfile } from '../../fixtures/ideasArchetype';

// SYNTHETIC — round test amounts, not real costs.
const RANGE: MoneyRange = { low: 1000, high: 2000, currency: 'EUR', basisSq: 'test' };
const ENOUGH = { capitalRange: RANGE, ownCapital: 5000 };

describe('test fixture', () => {
  it('is a complete archetype that passes the library quality gate', () => {
    expect(validateArchetype(IDEAS_ARCHETYPE)).toEqual([]);
  });
});

describe('assessProfileFit — hard blockers', () => {
  it('a team archetype is blocked for a solo profile, with a typed team blocker', () => {
    const team = archetypeVariant('ide-ekip', { minTeam: 'ekip' });
    const { fit, blockers } = assessProfileFitDetailed(team, testProfile({ teamMode: 'vetem' }), ENOUGH);
    expect(fit.eligible).toBe(false);
    expect(fit.blockersSq).toHaveLength(1);
    expect(fit.blockersSq[0]).toContain(TEAM_BLOCKER_PREFIX_SQ);
    expect(blockers.map((b) => b.kind)).toEqual(['ekipi']);
  });

  it('a partner archetype is also blocked for a solo profile', () => {
    const partner = archetypeVariant('ide-partner', { minTeam: 'partner' });
    expect(assessProfileFit(partner, testProfile(), ENOUGH).blockersSq[0]).toContain('Kërkon ekip/partner; profili juaj: vetëm');
  });

  it('a profile with a partner facing a team archetype gets a mismatch, not a blocker', () => {
    const team = archetypeVariant('ide-ekip', { minTeam: 'ekip' });
    const fit = assessProfileFit(team, testProfile({ teamMode: 'partner' }), ENOUGH);
    expect(fit.eligible).toBe(true);
    expect(fit.mismatchesSq.some((m) => m.includes('kërkon një ekip'))).toBe(true);
  });

  it('adult-only ideas are blocked for minors', () => {
    const adult = archetypeVariant('ide-18', { adultOnly: true });
    const { fit, blockers } = assessProfileFitDetailed(adult, testProfile({ isAdult: false }), ENOUGH);
    expect(fit.eligible).toBe(false);
    expect(blockers.map((b) => b.kind)).toEqual(['mosha']);
    expect(assessProfileFit(adult, testProfile({ isAdult: true }), ENOUGH).eligible).toBe(true);
  });

  it('home-only profiles are blocked from ideas that need premises', () => {
    const premises = archetypeVariant('ide-ambient', { canStartFromHome: false });
    const homeOnly = testProfile({ startLocations: ['shtepi'] });
    const { fit, blockers } = assessProfileFitDetailed(premises, homeOnly, ENOUGH);
    expect(fit.eligible).toBe(false);
    expect(blockers.map((b) => b.kind)).toEqual(['vendndodhja']);
    expect(assessProfileFit(premises, testProfile({ startLocations: ['shtepi', 'ambient'] }), ENOUGH).eligible).toBe(true);
    expect(assessProfileFit(IDEAS_ARCHETYPE, homeOnly, ENOUGH).matchesSq.some((m) => m.includes('nga shtëpia'))).toBe(true);
  });

  it('collects several blockers at once', () => {
    const hard = archetypeVariant('ide-veshtire', { minTeam: 'ekip', adultOnly: true, canStartFromHome: false });
    const fit = assessProfileFit(hard, testProfile({ isAdult: false, startLocations: ['shtepi'] }), ENOUGH);
    expect(fit.blockersSq).toHaveLength(3);
    expect(fit.eligible).toBe(false);
  });
});

describe('assessProfileFit — mismatches and matches', () => {
  it('reports disjoint business modes and market scopes as mismatches', () => {
    const fit = assessProfileFit(IDEAS_ARCHETYPE, testProfile({ businessModes: ['fizik'], marketScopes: ['nderkombetar'] }), ENOUGH);
    expect(fit.eligible).toBe(true);
    expect(fit.mismatchesSq.filter((m) => m.startsWith('Nuk përputhet: ideja'))).toHaveLength(2);
  });

  it('lists each missing required skill and suggests compensation when all are missing', () => {
    const fit = assessProfileFit(IDEAS_ARCHETYPE, testProfile({ skills: [] }), ENOUGH);
    expect(fit.mismatchesSq.filter((m) => m.startsWith('Mungon aftësia e kërkuar'))).toHaveLength(2);
    expect(fit.mismatchesSq.some((m) => m.includes('mund ta kompensoni me partner ose trajnim'))).toBe(true);
  });

  it('does not suggest compensation when only some skills are missing', () => {
    const fit = assessProfileFit(IDEAS_ARCHETYPE, testProfile({ skills: ['shitje'] }), ENOUGH);
    expect(fit.mismatchesSq.filter((m) => m.startsWith('Mungon aftësia e kërkuar'))).toHaveLength(1);
    expect(fit.mismatchesSq.some((m) => m.includes('kompensoni'))).toBe(false);
    expect(fit.matchesSq.some((m) => m.startsWith('Keni aftësinë e kërkuar'))).toBe(true);
  });

  it('credits helpful skills, cost-avoiding assets and sector experience', () => {
    const fit = assessProfileFit(
      IDEAS_ARCHETYPE,
      testProfile({ skills: ['administrim', 'shitje', 'kontabilitet'], assets: ['kompjuter', 'telefon_smart'] }),
      ENOUGH,
    );
    expect(fit.matchesSq.some((m) => m.startsWith('Aftësi të dobishme'))).toBe(true);
    expect(fit.matchesSq.some((m) => m.includes('ul kapitalin e hapjes') && m.includes('Laptop pune'))).toBe(true);
    expect(fit.matchesSq.some((m) => m.startsWith('Aset i dobishëm'))).toBe(true);
    expect(fit.matchesSq.some((m) => m.includes('përvojë në sektorin'))).toBe(true);
  });

  it('flags too few hours per week', () => {
    const fit = assessProfileFit(IDEAS_ARCHETYPE, testProfile({ hoursPerWeek: 5 }), ENOUGH);
    expect(fit.mismatchesSq.some((m) => m.includes('15 orë'))).toBe(true);
  });
});

describe('assessProfileFit — capital', () => {
  it('computes the gap against the low end of the startup range', () => {
    const fit = assessProfileFit(IDEAS_ARCHETYPE, testProfile({ capital: { amount: 400, currency: 'EUR' } }), {
      capitalRange: RANGE,
      ownCapital: 400,
    });
    expect(fit.capitalGap).toBe(600);
    expect(fit.mismatchesSq.some((m) => m.startsWith('Kapitali:') && m.includes('mungojnë'))).toBe(true);
  });

  it('gap is 0 when own capital covers the low end', () => {
    expect(assessProfileFit(IDEAS_ARCHETYPE, testProfile(), ENOUGH).capitalGap).toBe(0);
  });

  it('missing FX leaves the gap unknown (null), never 0', () => {
    const fit = assessProfileFit(IDEAS_ARCHETYPE, testProfile(), { capitalRange: null, ownCapital: 5000 });
    expect(fit.capitalGap).toBeNull();
    expect(fit.mismatchesSq.some((m) => m.includes('mungon kursi i këmbimit'))).toBe(true);
  });

  it('a range in another currency is not compared', () => {
    const fit = assessProfileFit(IDEAS_ARCHETYPE, testProfile(), { capitalRange: { ...RANGE, currency: 'USD' }, ownCapital: 5000 });
    expect(fit.capitalGap).toBeNull();
  });

  it('zero own capital points to the zero-capital demand test', () => {
    const fit = assessProfileFit(IDEAS_ARCHETYPE, testProfile({ capital: { amount: 0, currency: 'EUR' } }), {
      capitalRange: RANGE,
      ownCapital: 0,
    });
    expect(fit.capitalGap).toBe(1000);
    expect(fit.mismatchesSq.some((m) => m.includes(IDEAS_ARCHETYPE.zeroCapitalTestSq))).toBe(true);
  });
});

describe('assessProfileFit — regulation and risk tolerance', () => {
  const regulated = archetypeVariant('ide-rregulluar', {
    regulated: true,
    licensedProfessionalsSq: ['profesionist i licencuar (test)'],
    regulationNotesSq: ['Leja: Kërkon verifikim lokal (test).'],
  });

  it('regulated ideas name the licensed professionals and require local verification', () => {
    const fit = assessProfileFit(regulated, testProfile(), ENOUGH);
    const note = fit.mismatchesSq.find((m) => m.startsWith('Veprimtari e rregulluar'));
    expect(note).toContain('Kërkon verifikim lokal');
    expect(note).toContain('profesionist i licencuar (test)');
    expect(fit.eligible).toBe(true);
  });

  it('low risk tolerance conflicts with regulated or capital-heavy ideas only', () => {
    const low = testProfile({ riskTolerance: 'e_ulet' });
    expect(assessProfileFit(regulated, low, ENOUGH).mismatchesSq.some((m) => m.startsWith('Toleranca juaj'))).toBe(true);
    const heavy = { capitalRange: RANGE, ownCapital: 3000 };
    expect(assessProfileFit(IDEAS_ARCHETYPE, low, heavy).mismatchesSq.some((m) => m.includes('gjysmën e kapitalit'))).toBe(true);
    const light = { capitalRange: RANGE, ownCapital: 10000 };
    expect(assessProfileFit(IDEAS_ARCHETYPE, low, light).mismatchesSq.some((m) => m.startsWith('Toleranca juaj'))).toBe(false);
    expect(assessProfileFit(regulated, testProfile({ riskTolerance: 'e_larte' }), ENOUGH).mismatchesSq.some((m) => m.startsWith('Toleranca'))).toBe(false);
  });
});
