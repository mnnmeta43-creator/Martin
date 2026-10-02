import { describe, expect, it } from 'vitest';
import type { SixSteps } from '@/lib/domain/types';
import { ARCHETYPES } from '@/lib/ideas/archetypes';
import { explainInSixSteps } from '@/lib/ideas/explain';
import { baseProjection, buildPlanInputs, makeRecommendation, PLAN_ARCHETYPE } from '../../fixtures/planFixtures';

const KEYS: (keyof SixSteps)[] = ['whatItIsSq', 'whoItServesSq', 'whyItCouldWorkSq', 'whatItRequiresSq', 'howToStartSq', 'howToMeasureSq'];

function plain(text: string): string {
  return text.replace(/[  ]/g, ' ');
}

describe('explainInSixSteps', () => {
  it('fills all six steps with concrete archetype content even without a recommendation', () => {
    const steps = explainInSixSteps(PLAN_ARCHETYPE, null);
    for (const k of KEYS) expect(steps[k].trim().length).toBeGreaterThan(40);
    expect(steps.whatItIsSq).toContain(PLAN_ARCHETYPE.offerSq);
    expect(steps.whoItServesSq).toContain(PLAN_ARCHETYPE.payingCustomerSq);
    expect(steps.whyItCouldWorkSq).toContain(PLAN_ARCHETYPE.whyItCouldWork.changeSq);
    expect(steps.whyItCouldWorkSq).toContain('hipotezë');
    expect(steps.howToStartSq).toContain(PLAN_ARCHETYPE.zeroCapitalTestSq);
    expect(steps.howToMeasureSq).toContain(PLAN_ARCHETYPE.firstCustomers.metricsSq[0]);
    expect(steps.whatItRequiresSq).not.toMatch(/\d+,\d{2}\s?€/); // no money without a recommendation
  });

  it('uses only numbers from the recommendation, labelled as assumptions', () => {
    const rec = makeRecommendation();
    const steps = explainInSixSteps(PLAN_ARCHETYPE, rec);
    const requires = plain(steps.whatItRequiresSq);
    expect(requires).toContain('22,22 €');
    expect(requires).toContain('444,44 €');
    expect(requires).toContain('supozim');
  });

  it('quotes data-backed facts and flags demo data', () => {
    const steps = explainInSixSteps(PLAN_ARCHETYPE, makeRecommendation());
    expect(steps.whyItCouldWorkSq).toContain('[DEMO]');
    expect(steps.whyItCouldWorkSq).toContain('Përdoruesit e internetit');
    expect(steps.whyItCouldWorkSq).toContain('Cilësia e provave: e ulët');
    expect(steps.whyItCouldWorkSq).toContain('Asnjë tregues makro nuk e mbështet');
  });

  it('says honestly when capital cannot be estimated (missing FX)', () => {
    const rec = makeRecommendation({ capitalRange: null, monthlyCostRange: null, fit: { matchesSq: [], mismatchesSq: [], blockersSq: [], capitalGap: null, eligible: true } });
    const steps = explainInSixSteps(PLAN_ARCHETYPE, rec);
    expect(steps.whatItRequiresSq).toContain('mungon kursi i këmbimit');
    expect(steps.whatItRequiresSq).not.toMatch(/ 0[,.]00/);
  });

  it('mentions the capital gap and blockers from the fit', () => {
    const rec = makeRecommendation({
      fit: { matchesSq: [], mismatchesSq: [], blockersSq: ['Kërkon ekip/partner; profili juaj: vetëm'], capitalGap: 12.5, eligible: false },
    });
    const steps = explainInSixSteps(PLAN_ARCHETYPE, rec);
    expect(plain(steps.whatItRequiresSq)).toContain('12,50 €');
    expect(steps.whatItRequiresSq).toContain('Kërkon ekip/partner');
  });

  it('adds the break-even figure from a projection as an assumption, never a guarantee', () => {
    const projection = baseProjection(buildPlanInputs());
    const steps = explainInSixSteps(PLAN_ARCHETYPE, makeRecommendation(), projection);
    expect(steps.howToMeasureSq).toMatch(/pika e barazimit është rreth \d+ klientë në muaj \(supozim, jo garanci\)/);
  });

  it('works for every archetype in the library without placeholders', () => {
    for (const a of ARCHETYPES) {
      const steps = explainInSixSteps(a, makeRecommendation({ archetypeId: a.id, nameSq: a.nameSq }));
      const json = JSON.stringify(steps);
      expect(json).not.toMatch(/undefined|NaN|null/);
      expect(json).not.toMatch(/fitim(i)? (i )?garantuar|sukses(i)? (i )?garantuar/i);
    }
  });
});
