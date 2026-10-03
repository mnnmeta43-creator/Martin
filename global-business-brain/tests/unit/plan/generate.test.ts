import { describe, expect, it } from 'vitest';
import type { BusinessArchetype, PhaseId } from '@/lib/domain/types';
import { PHASE_IDS, PHASE_TITLES } from '@/lib/domain/taxonomy';
import { ARCHETYPES } from '@/lib/ideas/archetypes';
import { generatePlan, PLAN_NOTE_SQ } from '@/lib/plan/generate';
import {
  baseProjection,
  buildPlanInputs,
  PLAN_ARCHETYPE,
  physicalRegulatedArchetype,
} from '../../fixtures/planFixtures';
import { FINANCE_ARCHETYPE, FIXTURE_FX_RATES } from '../../fixtures/financeArchetype';

function planFor(archetype: BusinessArchetype = PLAN_ARCHETYPE, city: string | null = 'Qyteti Test') {
  const inputs = buildPlanInputs(archetype);
  const projection = baseProjection(inputs);
  return { plan: generatePlan({ archetype, countryCode: 'ALB', city, inputs, projection }), inputs, projection };
}

const sum = (values: number[]) => values.reduce((s, v) => s + v, 0);

describe('generatePlan — phases', () => {
  const { plan, inputs, projection } = planFor();

  it('has the 10 phases in order with their official titles and ranges', () => {
    expect(plan.phases.map((p) => p.id)).toEqual(PHASE_IDS);
    for (const phase of plan.phases) {
      expect(phase.titleSq).toBe(PHASE_TITLES[phase.id].titleSq);
      expect(phase.rangeLabel).toBe(PHASE_TITLES[phase.id].range);
      expect(phase.actionsSq.length).toBeGreaterThanOrEqual(3);
      for (const text of [phase.outputSq, phase.proofOfCompletionSq, phase.continueCriterionSq, phase.stopCriterionSq]) {
        expect(text.trim().length).toBeGreaterThan(10);
      }
    }
  });

  it('keeps actions unique inside each phase (they are rendered as React keys)', () => {
    for (const phase of plan.phases) expect(new Set(phase.actionsSq).size).toBe(phase.actionsSq.length);
  });

  it('phase budgets sum exactly to the enabled startup total and use the inputs currency', () => {
    const enabledTotal = sum(inputs.startupCosts.filter((l) => l.enabled).map((l) => l.amount));
    expect(sum(plan.phases.map((p) => p.budget.amount))).toBeCloseTo(enabledTotal, 9);
    expect(sum(plan.phases.map((p) => p.budget.amount))).toBeCloseTo(projection.capital.startupTotal, 9);
    for (const p of plan.phases) expect(p.budget.currency).toBe(inputs.currency);
  });

  it('maps startup categories to phases: tarifa→40–50, equipment/inventory/deposits/opening→50–60, market test→60–70', () => {
    const byId = Object.fromEntries(plan.phases.map((p) => [p.id, p])) as Record<PhaseId, (typeof plan.phases)[number]>;
    const c = projection.capital.byCategory;
    expect(byId.p40_50.budget.amount).toBeCloseTo(c.tarifa, 9);
    expect(byId.p50_60.budget.amount).toBeCloseTo(c.pajisje + c.inventar + c.depozita + c.hapje, 9);
    expect(byId.p60_70.budget.amount).toBeCloseTo(c.testim_tregu, 9);
    for (const id of ['p00_10', 'p10_20', 'p20_30', 'p30_40', 'p70_80', 'p80_90', 'p90_100'] as PhaseId[]) {
      expect(byId[id].budget.amount).toBe(0);
      expect(byId[id].budget.basisSq.toLowerCase()).toContain('kryesisht kohë');
    }
  });

  it('budgets still add up when a startup line is disabled (owned asset)', () => {
    const inputs2 = buildPlanInputs(FINANCE_ARCHETYPE, { fxRates: FIXTURE_FX_RATES, assets: ['kompjuter'] });
    expect(inputs2.startupCosts.some((l) => !l.enabled)).toBe(true);
    const plan2 = generatePlan({ archetype: FINANCE_ARCHETYPE, countryCode: 'ALB', inputs: inputs2, projection: baseProjection(inputs2) });
    const enabled = sum(inputs2.startupCosts.filter((l) => l.enabled).map((l) => l.amount));
    expect(sum(plan2.phases.map((p) => p.budget.amount))).toBeCloseTo(enabled, 9);
  });

  it('each phase depends on the previous one; the legal checks follow pricing and precede the trial', () => {
    expect(plan.phases[0].dependencies).toEqual([]);
    plan.phases.slice(1).forEach((p, i) => expect(p.dependencies).toContain(PHASE_IDS[i]));
    const byId = Object.fromEntries(plan.phases.map((p) => [p.id, p]));
    expect(byId.p40_50.dependencies).toContain('p30_40');
    expect(byId.p60_70.dependencies).toContain('p40_50');
    for (const p of plan.phases) for (const d of p.dependencies) expect(PHASE_IDS.indexOf(d)).toBeLessThan(PHASE_IDS.indexOf(p.id));
  });

  it('uses archetype fields in the right phases', () => {
    const byId = Object.fromEntries(plan.phases.map((p) => [p.id, p]));
    const a = PLAN_ARCHETYPE;
    expect(byId.p10_20.actionsSq.join(' ')).toContain('15 intervista');
    expect(byId.p10_20.actionsSq.join(' ')).toContain(a.interviewQuestionsSq[0]);
    expect(byId.p20_30.actionsSq.join(' ')).toContain(a.competitorTypesSq[0]);
    expect(byId.p20_30.actionsSq.join(' ')).toContain(a.differentiationSq[0]);
    expect(byId.p40_50.actionsSq.join(' ')).toContain('Kërkon verifikim lokal');
    for (const note of a.regulationNotesSq) expect(byId.p40_50.actionsSq).toContain(note);
    expect(byId.p60_70.actionsSq.join(' ')).toContain(a.cheapestTestSq);
    expect(byId.p70_80.actionsSq.join(' ')).toContain(a.firstCustomers.offerSq);
    expect(byId.p80_90.actionsSq.join(' ')).toContain(a.firstCustomers.metricsSq[0]);
    expect(byId.p90_100.actionsSq.join(' ')).toContain(a.goCriteriaSq[0]);
    expect(byId.p90_100.stopCriterionSq).toContain(a.killCriteriaSq[0]);
    expect(byId.p60_70.continueCriterionSq).toBe(a.goCriteriaSq[0]);
    for (const [phaseId, notes] of Object.entries(a.phaseNotesSq)) {
      for (const n of notes ?? []) expect(byId[phaseId].actionsSq).toContain(n);
    }
  });

  it('quotes pricing and break-even numbers from the projection in 30–40, labelled as assumptions', () => {
    const p30 = plan.phases.find((p) => p.id === 'p30_40')!;
    const text = p30.actionsSq.join(' ');
    expect(text).toContain('supozim');
    expect(text).toMatch(/Pika e barazimit sipas supozimeve: rreth \d+ klientë/);
    expect(text).toContain('€');
  });

  it('lists licensed professionals for regulated activities', () => {
    const a = physicalRegulatedArchetype();
    const { plan: regulated } = planFor(a);
    const p40 = regulated.phases.find((p) => p.id === 'p40_50')!;
    expect(p40.actionsSq.join(' ')).toContain(a.licensedProfessionalsSq[0]);
  });

  it('carries the plan-completion note and never promises success', () => {
    expect(plan.noteSq).toBe(PLAN_NOTE_SQ);
    expect(plan.noteSq).toContain('jo probabilitetin e suksesit');
    const all = JSON.stringify(plan);
    expect(all).not.toMatch(/fitim(i)? (i )?garantuar|sukses(i)? (i )?garantuar|pa rrezik/i);
  });
});

describe('generatePlan — tasks and horizons', () => {
  const { plan } = planFor();

  it('has 3–6 tasks per phase with stable ids "<phaseId>-t<n>"', () => {
    for (const id of PHASE_IDS) {
      const tasks = plan.tasks.filter((t) => t.phaseId === id);
      expect(tasks.length).toBeGreaterThanOrEqual(3);
      expect(tasks.length).toBeLessThanOrEqual(6);
      tasks.forEach((t, i) => expect(t.id).toBe(`${id}-t${i + 1}`));
    }
    expect(new Set(plan.tasks.map((t) => t.id)).size).toBe(plan.tasks.length);
  });

  it('tasks start in phase order across roughly 120 days, with defaults', () => {
    const offsets = plan.tasks.map((t) => t.dayOffset);
    expect([...offsets].sort((x, y) => x - y)).toEqual(offsets);
    expect(offsets[0]).toBe(0);
    const end = Math.max(...plan.tasks.map((t) => t.dayOffset + t.durationDays));
    expect(end).toBeGreaterThanOrEqual(110);
    expect(end).toBeLessThanOrEqual(130);
    for (const t of plan.tasks) {
      expect(t.status).toBe('per_tu_bere');
      expect(t.weight).toBe(1);
      expect(t.durationDays).toBeGreaterThanOrEqual(1);
      expect(t.proofSq.length).toBeGreaterThan(5);
      expect(t.titleSq.length).toBeGreaterThan(5);
    }
  });

  it('horizons are nested subsets selected by dayOffset', () => {
    const { d7, d30, d90 } = plan.horizons;
    const offsetOf = new Map(plan.tasks.map((t) => [t.id, t.dayOffset]));
    expect(d7.length).toBeGreaterThan(0);
    expect(d7.every((id) => d30.includes(id))).toBe(true);
    expect(d30.every((id) => d90.includes(id))).toBe(true);
    expect(d90.length).toBeLessThan(plan.tasks.length);
    expect(d7.every((id) => offsetOf.get(id)! < 7)).toBe(true);
    expect(plan.tasks.filter((t) => t.dayOffset < 30).map((t) => t.id)).toEqual(d30);
    expect(plan.tasks.filter((t) => t.dayOffset < 90).map((t) => t.id)).toEqual(d90);
  });

  it('is deterministic: same inputs → identical plan; changing inputs keeps the task ids', () => {
    const again = planFor().plan;
    expect(again).toEqual(plan);
    const inputs = buildPlanInputs(PLAN_ARCHETYPE, { ownCapital: 1, startMonth: 2 });
    const other = generatePlan({ archetype: PLAN_ARCHETYPE, countryCode: 'XKX', inputs, projection: baseProjection(inputs) });
    expect(other.tasks.map((t) => t.id)).toEqual(plan.tasks.map((t) => t.id));
  });
});

describe('generatePlan — every archetype in the library', () => {
  it.each(ARCHETYPES.map((a) => [a.id, a] as const))('%s: valid plan, budgets add up, no NaN', (_id, archetype) => {
    const inputs = buildPlanInputs(archetype);
    const projection = baseProjection(inputs);
    const plan = generatePlan({ archetype, countryCode: 'ZZA', inputs, projection });
    expect(plan.phases).toHaveLength(10);
    expect(sum(plan.phases.map((p) => p.budget.amount))).toBeCloseTo(projection.capital.startupTotal, 6);
    const json = JSON.stringify(plan);
    expect(json).not.toContain('NaN');
    expect(json).not.toContain('undefined');
    for (const p of plan.phases) {
      expect(Number.isFinite(p.budget.amount)).toBe(true);
      expect(p.budget.amount).toBeGreaterThanOrEqual(0);
    }
  });
});
