import { describe, expect, it } from 'vitest';
import { buildFinancialInputs } from '@/lib/finance/build';
import { applyShock, projectAllScenarios, sensitivityAnalysis } from '@/lib/finance/engine';
import { FINANCE_ARCHETYPE, FIXTURE_FX_RATES } from '../../fixtures/financeArchetype';
import { deepFreeze, line, makeInputs } from './helpers';

function fixtureInputs() {
  const built = buildFinancialInputs(FINANCE_ARCHETYPE, {
    currency: 'EUR',
    fxRates: FIXTURE_FX_RATES,
    ownCapital: 1000,
    assets: [],
    startMonth: 3,
    today: '2026-10-02',
  });
  if (!built.ok) throw new Error(built.reasonSq);
  return built.inputs;
}

describe('projectAllScenarios', () => {
  it('orders revenue konservator ≤ bazë ≤ optimist for a typical archetype', () => {
    const all = projectAllScenarios(fixtureInputs());
    expect(Object.keys(all).sort()).toEqual(['baze', 'konservator', 'optimist']);
    expect(all.konservator.totals.revenue).toBeLessThanOrEqual(all.baze.totals.revenue);
    expect(all.baze.totals.revenue).toBeLessThanOrEqual(all.optimist.totals.revenue);
    expect(all.konservator.totals.netResult).toBeLessThanOrEqual(all.baze.totals.netResult);
    expect(all.baze.totals.netResult).toBeLessThanOrEqual(all.optimist.totals.netResult);
    expect(all.konservator.capital.totalRequired).toBeGreaterThanOrEqual(all.optimist.capital.totalRequired);
    expect(all.konservator.scenario).toBe('konservator');
  });
});

describe('applyShock', () => {
  const base = deepFreeze(
    makeInputs(
      {
        startupCosts: [line('pajisje', 'pajisje', 100, { low: 80, high: 120 })],
        monthlyFixedCosts: [line('qira', 'qira', 30, { low: 20, high: 40 }), line('soft', 'software', 10)],
        collectionDays: 10,
      },
      { monthlyNewCustomers: 5, monthlyChurnPct: 4, collectionDaysOverride: 25 },
    ),
  );

  it('returns a new object and never mutates the (frozen) input', () => {
    const before = JSON.stringify(base);
    const shocked = applyShock(base, { fixedCostPct: 20, pricePct: -10, collectionDaysDelta: 30, newCustomersPct: 50 });
    expect(shocked).not.toBe(base);
    expect(shocked.monthlyFixedCosts).not.toBe(base.monthlyFixedCosts);
    expect(JSON.stringify(base)).toBe(before);
  });

  it('scales base amounts by (1 + pct/100)', () => {
    const s = applyShock(base, { fixedCostPct: 20, variableCostPct: 25, pricePct: -10, startupCostPct: 50 });
    expect(s.monthlyFixedCosts.map((l) => l.amount)).toEqual([36, 12]);
    expect(s.monthlyFixedCosts[0].low).toBe(24);
    expect(s.monthlyFixedCosts[0].high).toBe(48);
    expect(s.startupCosts[0].amount).toBe(150);
    expect(s.variableCostPerUnit).toBe(5);
    expect(s.pricePerUnit).toBe(9);
  });

  it('shifts collection days (base and scenario overrides) and new customers in every scenario', () => {
    const s = applyShock(base, { collectionDaysDelta: 30, newCustomersPct: -20, churnPctPoints: 5 });
    expect(s.collectionDays).toBe(40);
    for (const id of ['konservator', 'baze', 'optimist'] as const) {
      expect(s.scenarios[id].collectionDaysOverride).toBe(55);
      expect(s.scenarios[id].monthlyNewCustomers).toBe(4);
      expect(s.scenarios[id].monthlyChurnPct).toBe(9);
    }
  });

  it('never produces negative amounts or churn above 100', () => {
    const s = applyShock(base, { pricePct: -150, collectionDaysDelta: -100, churnPctPoints: 500 });
    expect(s.pricePerUnit).toBe(0);
    expect(s.collectionDays).toBe(0);
    expect(s.scenarios.baze.collectionDaysOverride).toBe(0);
    expect(s.scenarios.baze.monthlyChurnPct).toBe(100);
  });

  it('an empty shock yields an equal copy', () => {
    expect(applyShock(base, {})).toEqual(base);
  });
});

describe('sensitivityAnalysis', () => {
  // Base example: min cash 100 at month 0, total net 360.
  //  arkëtimi +30 days → month 1 balance 100 − 70 = 30 → impact on min cash −70
  //  investimi +20% → opening 80 → −20
  //  all others leave the month-0 minimum unchanged, so they are ordered by |impact on net|:
  //  çmimi −20% → net 120 (−240); largimi +5 pts → 6·Σ10·0.95^(m−1) − 360 ≈ −168.4;
  //  kosto variabël +20% → 264 (−96); kosto fikse +20% → 288 (−72); klientë të rinj −20% of 0 → 0.
  const items = sensitivityAnalysis(makeInputs());

  it('covers every driver once', () => {
    expect(items).toHaveLength(7);
    expect(new Set(items.map((i) => i.driver)).size).toBe(7);
  });

  it('sorts by |impact on min cash| then |impact on total net|', () => {
    expect(items.map((i) => i.driver)).toEqual([
      'arketimi',
      'investimi_fillestar',
      'cmimi',
      'largimi',
      'kosto_variabel',
      'kosto_fikse',
      'klientet_e_rinj',
    ]);
  });

  it('reports base, shocked and impact values', () => {
    const byDriver = Object.fromEntries(items.map((i) => [i.driver, i]));
    expect(byDriver.arketimi).toMatchObject({ baseMinCash: 100, shockedMinCash: 30, impactMinCash: -70, impactTotalNet: 0 });
    expect(byDriver.investimi_fillestar.impactMinCash).toBeCloseTo(-20, 10);
    expect(byDriver.cmimi.impactTotalNet).toBeCloseTo(-240, 9);
    expect(byDriver.largimi.impactTotalNet).toBeCloseTo(6 * 200 * (1 - 0.95 ** 12) - 360 - 360, 6);
    expect(byDriver.kosto_variabel.impactTotalNet).toBeCloseTo(-96, 9);
    expect(byDriver.kosto_fikse.impactTotalNet).toBeCloseTo(-72, 9);
    expect(byDriver.klientet_e_rinj.impactTotalNet).toBe(0);
    expect(byDriver.cmimi.baseTotalNet).toBe(360);
  });

  it('labels each change in Albanian', () => {
    const byDriver = Object.fromEntries(items.map((i) => [i.driver, i]));
    expect(byDriver.cmimi.changeSq).toBe('−20%');
    expect(byDriver.kosto_fikse.changeSq).toBe('+20%');
    expect(byDriver.largimi.changeSq).toBe('+5 pikë përqindjeje');
    expect(byDriver.arketimi.changeSq).toBe('+30 ditë');
    expect(byDriver.cmimi.labelSq).toBe('Çmimi për njësi');
  });

  it('accepts another delta and scenario', () => {
    const ten = sensitivityAnalysis(fixtureInputs(), 'optimist', 10);
    expect(ten.find((i) => i.driver === 'cmimi')?.changeSq).toBe('−10%');
    for (let i = 1; i < ten.length; i++) {
      expect(Math.abs(ten[i - 1].impactMinCash)).toBeGreaterThanOrEqual(Math.abs(ten[i].impactMinCash) - 1e-9);
    }
  });
});

describe('sensitivityAnalysis — labels match the change actually applied', () => {
  it('caps price and new-customer drops at −100% (a price cannot fall below 0)', () => {
    const byDriver = (delta: number) => Object.fromEntries(sensitivityAnalysis(makeInputs(), 'baze', delta).map((i) => [i.driver, i]));
    const big = byDriver(150);
    expect(big.cmimi.changeSq).toBe('−100%');
    expect(big.klientet_e_rinj.changeSq).toBe('−100%');
    expect(big.kosto_fikse.changeSq).toBe('+150%');
    expect(big.cmimi.shockedTotalNet).toBe(byDriver(100).cmimi.shockedTotalNet);
    expect(byDriver(1000).largimi.changeSq).toBe('+100 pikë përqindjeje');
  });
});
