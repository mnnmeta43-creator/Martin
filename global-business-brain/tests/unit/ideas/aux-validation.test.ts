import { describe, expect, it } from 'vitest';
import { ARCHETYPES } from '@/lib/ideas/archetypes';
import { buildValidationKit } from '@/lib/ideas/validation';
import { makeRecommendation, PLAN_ARCHETYPE, physicalRegulatedArchetype } from '../../fixtures/planFixtures';

/** Same spirit as the archetype quality gate: hypothetical "would you buy" questions are banned. */
const LEADING = [/^a do (të|ta|t'i|ti)\b/i, /do të (blini|paguanit|përdornit)/i, /do ta (blini|blinit|përdornit)/i, /a ju pëlqen ideja/i, /a mendoni se është ide e mirë/i];

describe('buildValidationKit', () => {
  const kit = buildValidationKit(PLAN_ARCHETYPE);

  it('includes the archetype questions plus general past-behaviour questions, none of them leading', () => {
    for (const q of PLAN_ARCHETYPE.interviewQuestionsSq) expect(kit.interviewQuestionsSq).toContain(q);
    expect(kit.interviewQuestionsSq.length).toBeGreaterThan(PLAN_ARCHETYPE.interviewQuestionsSq.length);
    expect(new Set(kit.interviewQuestionsSq).size).toBe(kit.interviewQuestionsSq.length);
    for (const q of kit.interviewQuestionsSq) for (const re of LEADING) expect(re.test(q.trim())).toBe(false);
  });

  it('lists leading questions to avoid, each with the reason', () => {
    expect(kit.avoidQuestionsSq.some((q) => q.includes('A do ta blinit?'))).toBe(true);
    for (const q of kit.avoidQuestionsSq) expect(q).toContain('—');
    expect(kit.avoidQuestionsSq.join(' ')).toContain('sjellshme');
  });

  it('offers behaviour-based interest tests (paid pilot, refundable deposit, LOI for B2B, waiting list with price)', () => {
    const all = kit.interestTestsSq.join('\n');
    expect(all).toContain('Pilot me pagesë');
    expect(all).toContain('Depozitë e rimbursueshme');
    expect(all).toContain('lejohet ligjërisht');
    expect(all).toContain('Letër qëllimi'); // reference archetype is B2B
    expect(all).toContain('Listë pritjeje me çmimin');
    expect(all).toContain(PLAN_ARCHETYPE.cheapestTestSq);
  });

  it('omits the letter of intent for a consumer-only idea', () => {
    const b2c = buildValidationKit(physicalRegulatedArchetype());
    expect(b2c.interestTestsSq.join('\n')).not.toContain('Letër qëllimi');
  });

  it('has decision criteria with explicit numeric thresholds labelled as assumptions and unique metrics', () => {
    const thresholds = kit.decisionCriteriaSq.map((c) => c.thresholdSq).join('\n');
    expect(thresholds).toContain('≥ 10 nga 15');
    expect(thresholds).toContain('≥ 3 pilotë me pagesë nga 20 oferta');
    for (const c of kit.decisionCriteriaSq) {
      expect(c.metricSq.length).toBeGreaterThan(5);
      expect(c.meaningSq.length).toBeGreaterThan(5);
    }
    expect(kit.decisionCriteriaSq.filter((c) => /\d/.test(c.thresholdSq)).every((c) => /supozim|kusht minimal/.test(c.thresholdSq))).toBe(true);
    expect(new Set(kit.decisionCriteriaSq.map((c) => c.metricSq)).size).toBe(kit.decisionCriteriaSq.length);
    for (const g of PLAN_ARCHETYPE.goCriteriaSq) expect(thresholds).toContain(g);
    for (const k of PLAN_ARCHETYPE.killCriteriaSq) expect(thresholds).toContain(k);
  });

  it('separates verbal interest from behaviour and carries the archetype templates', () => {
    expect(kit.verbalVsBehaviourSq).toContain('nuk është blerje');
    expect(kit.firstCustomers).toEqual(PLAN_ARCHETYPE.firstCustomers);
    expect(kit.pitchTemplateSq).toBe(PLAN_ARCHETYPE.pitchTemplateSq);
    expect(kit.offerTemplateSq).toBe(PLAN_ARCHETYPE.offerTemplateSq);
    expect(kit.feedbackQuestionsSq).toEqual(PLAN_ARCHETYPE.feedbackQuestionsSq);
    expect(kit.trialOfferSq).toContain(PLAN_ARCHETYPE.firstCustomers.offerSq);
  });

  it('lists what not to do: spam, fake testimonials, misleading claims, big ad spend, consent', () => {
    const all = kit.doNotSq.join('\n');
    for (const needle of ['spam', 'rremë', 'mashtruese', 'reklama', 'pëlqimin']) expect(all).toContain(needle);
  });

  it('adds the licensed-professional rule for regulated ideas', () => {
    const a = physicalRegulatedArchetype();
    expect(buildValidationKit(a).doNotSq.join('\n')).toContain(a.licensedProfessionalsSq[0]);
  });

  it('adds the current evidence level and the demo warning when a recommendation is given', () => {
    const withRec = buildValidationKit(PLAN_ARCHETYPE, makeRecommendation());
    expect(withRec.verbalVsBehaviourSq).toContain('e ulët');
    expect(withRec.verbalVsBehaviourSq).toContain('[DEMO]');
  });

  it('returns copies, not the archetype arrays', () => {
    kit.firstCustomers.whereSq.push('x');
    expect(PLAN_ARCHETYPE.firstCustomers.whereSq).not.toContain('x');
  });

  it('works for every archetype in the library', () => {
    for (const a of ARCHETYPES) {
      const k = buildValidationKit(a);
      expect(JSON.stringify(k)).not.toMatch(/undefined|NaN/);
      for (const q of k.interviewQuestionsSq) for (const re of LEADING) expect(re.test(q.trim())).toBe(false);
    }
  });
});
