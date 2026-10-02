import { describe, expect, it } from 'vitest';
import type { FinancialInputs } from '@/lib/domain/types';
import { projectScenario } from '@/lib/finance/engine';
import { ARCHETYPES } from '@/lib/ideas/archetypes';
import { adaptToLowerCapital } from '@/lib/ideas/adapt';
import { FINANCE_ARCHETYPE, FIXTURE_FX_RATES } from '../../fixtures/financeArchetype';
import { buildPlanInputs, makeProfile, PLAN_ARCHETYPE } from '../../fixtures/planFixtures';

const totalOf = (inputs: FinancialInputs) => projectScenario(inputs, 'baze').capital.totalRequired;
const financeInputs = () => buildPlanInputs(FINANCE_ARCHETYPE, { fxRates: FIXTURE_FX_RATES });

describe('adaptToLowerCapital', () => {
  it('does nothing when the capital need is already within the target', () => {
    const inputs = financeInputs();
    const res = adaptToLowerCapital(FINANCE_ARCHETYPE, makeProfile(), inputs, totalOf(inputs) + 1);
    expect(res.reachesTarget).toBe(true);
    expect(res.changesSq).toEqual([]);
    expect(res.noteSq).toContain('nuk nevojitet asnjë ulje');
  });

  it('never mutates the caller inputs', () => {
    const inputs = financeInputs();
    const before = structuredClone(inputs);
    adaptToLowerCapital(FINANCE_ARCHETYPE, makeProfile({ assets: ['kompjuter'] }), inputs, 1);
    expect(inputs).toEqual(before);
  });

  it('removes lines covered by assets the user owns, first and at no cost', () => {
    const inputs = financeInputs(); // built without assets, so the laptop line is enabled
    const res = adaptToLowerCapital(FINANCE_ARCHETYPE, makeProfile({ assets: ['kompjuter'] }), inputs, totalOf(inputs) - 1);
    expect(res.inputs.startupCosts.find((l) => l.id === 'laptop')?.enabled).toBe(false);
    expect(res.changesSq[0]).toContain('Laptop pune');
    expect(res.changesSq[0]).toContain('e keni tashmë');
    expect(res.reachesTarget).toBe(true);
  });

  it('starts from home (drops rent) when the idea allows it and the profile accepts it', () => {
    const inputs = financeInputs();
    const target = totalOf(inputs) - 1;
    const home = adaptToLowerCapital(FINANCE_ARCHETYPE, makeProfile({ startLocations: ['shtepi'] }), inputs, target);
    expect(home.inputs.monthlyFixedCosts.find((l) => l.id === 'qira')?.enabled).toBe(false);
    expect(home.changesSq.join(' ')).toContain('nisje nga shtëpia');
    expect(home.changesSq.join(' ')).toContain('Kërkon verifikim lokal');

    const noHome = adaptToLowerCapital(FINANCE_ARCHETYPE, makeProfile({ startLocations: ['ambient'] }), inputs, target);
    expect(noHome.inputs.monthlyFixedCosts.find((l) => l.id === 'qira')?.enabled).toBe(true);
    expect(noHome.changesSq.some((c) => c.startsWith('Sugjerim (pa u aplikuar)'))).toBe(true);
  });

  it('suggests used/simpler equipment at the low end of the library range', () => {
    const inputs = financeInputs();
    const res = adaptToLowerCapital(FINANCE_ARCHETYPE, makeProfile({ startLocations: ['ambient'] }), inputs, totalOf(inputs) - 1);
    const reduced = res.inputs.startupCosts.filter((l) => l.category === 'pajisje' && l.enabled && l.amount === l.low);
    expect(reduced.length).toBeGreaterThan(0);
    expect(res.changesSq.join(' ')).toContain('pajisje e përdorur');
    expect(res.reachesTarget).toBe(true);
    expect(res.resultingTotal).toBeLessThanOrEqual(totalOf(inputs) - 1);
  });

  it('is honest when the target is unreachable: names remaining costs and the zero-capital demand test', () => {
    const inputs = financeInputs();
    const res = adaptToLowerCapital(FINANCE_ARCHETYPE, makeProfile(), inputs, 1);
    expect(res.reachesTarget).toBe(false);
    expect(res.resultingTotal).toBeGreaterThan(1);
    expect(res.resultingTotal).toBeLessThan(res.initialTotal);
    expect(res.noteSq).toContain('mbi objektivin');
    expect(res.noteSq).toContain('Kostot e nisjes që mbeten');
    expect(res.noteSq).toContain(FINANCE_ARCHETYPE.zeroCapitalTestSq);
    // Non-optional lines are never zeroed by the generic reductions.
    expect(res.inputs.startupCosts.find((l) => l.id === 'regjistrim')?.enabled).toBe(true);
  });

  it('with zero capital says only demand can be tested', () => {
    const inputs = financeInputs();
    for (const target of [0, -5, Number.NaN]) {
      const res = adaptToLowerCapital(FINANCE_ARCHETYPE, makeProfile(), inputs, target);
      expect(res.reachesTarget).toBe(false);
      expect(res.noteSq).toContain('Me kapital zero');
      expect(res.noteSq).toContain('mund të testoni vetëm kërkesën');
      expect(res.noteSq).toContain(FINANCE_ARCHETYPE.zeroCapitalTestSq);
    }
  });

  it('works for every archetype; the capital need never increases', () => {
    for (const a of ARCHETYPES) {
      const inputs = buildPlanInputs(a);
      const res = adaptToLowerCapital(a, makeProfile(), inputs, totalOf(inputs) / 2);
      expect(res.resultingTotal).toBeLessThanOrEqual(res.initialTotal + 1e-9);
      expect(JSON.stringify(res)).not.toMatch(/NaN|undefined/);
    }
    expect(ARCHETYPES.length).toBeGreaterThan(0);
    expect(PLAN_ARCHETYPE.id).toBe(ARCHETYPES[0].id);
  });
});
