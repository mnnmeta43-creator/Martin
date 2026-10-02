import { describe, expect, it } from 'vitest';
import { computeUnitEconomics } from '@/lib/finance/engine';

describe('computeUnitEconomics', () => {
  it('computes contribution, margin and break-even for a simple case', () => {
    // contribution = 10 − 4 = 6; margin = 6/10 = 60%; break-even = 30 / 6 = 5 units = 5 customers
    const ue = computeUnitEconomics({ pricePerUnit: 10, variableCostPerUnit: 4, fixedCostsMonthly: 30, unitsPerCustomerPerMonth: 1 });
    expect(ue.status).toBe('ok');
    expect(ue.contributionPerUnit).toBe(6);
    expect(ue.contributionMarginPct).toBeCloseTo(60, 10);
    expect(ue.breakEvenUnitsPerMonth).toBe(5);
    expect(ue.breakEvenCustomersPerMonth).toBe(5);
    expect(ue.fixedCostsMonthly).toBe(30);
    expect(ue.explanationSq).toContain('Kontributi për njësi = çmimi − kostoja variabël për njësi');
    expect(ue.explanationSq).toContain('Pika e barazimit në njësi = kostot fikse ÷ kontributi për njësi');
  });

  it('keeps the exact (unrounded) break-even and divides by units per customer', () => {
    // 100 / (10 − 3) = 14.2857… units; 2 units per customer → 7.1428… customers
    const ue = computeUnitEconomics({ pricePerUnit: 10, variableCostPerUnit: 3, fixedCostsMonthly: 100, unitsPerCustomerPerMonth: 2 });
    expect(ue.breakEvenUnitsPerMonth).toBeCloseTo(100 / 7, 12);
    expect(ue.breakEvenCustomersPerMonth).toBeCloseTo(50 / 7, 12);
  });

  it('returns 0 break-even when there are no fixed costs', () => {
    const ue = computeUnitEconomics({ pricePerUnit: 10, variableCostPerUnit: 4, fixedCostsMonthly: 0, unitsPerCustomerPerMonth: 3 });
    expect(ue.breakEvenUnitsPerMonth).toBe(0);
    expect(ue.breakEvenCustomersPerMonth).toBe(0);
    expect(ue.explanationSq).toContain('Nuk ka kosto fikse');
  });

  it('flags negative contribution: each unit loses money, volume makes it worse', () => {
    // 3 − 5 = −2 per unit; margin = −2/3 = −66.67%
    const ue = computeUnitEconomics({ pricePerUnit: 3, variableCostPerUnit: 5, fixedCostsMonthly: 30, unitsPerCustomerPerMonth: 1 });
    expect(ue.status).toBe('kontribut_zero_ose_negativ');
    expect(ue.contributionPerUnit).toBe(-2);
    expect(ue.contributionMarginPct).toBeCloseTo(-66.6667, 3);
    expect(ue.breakEvenUnitsPerMonth).toBeNull();
    expect(ue.breakEvenCustomersPerMonth).toBeNull();
    expect(ue.explanationSq).toContain('Çdo njësi e shitur humbet para');
    expect(ue.explanationSq).toContain('më shumë shitje e përkeqësojnë situatën');
    expect(ue.explanationSq).toContain('çmimi, kostoja ose modeli');
  });

  it('flags zero contribution: each unit covers nothing', () => {
    const ue = computeUnitEconomics({ pricePerUnit: 5, variableCostPerUnit: 5, fixedCostsMonthly: 30, unitsPerCustomerPerMonth: 1 });
    expect(ue.status).toBe('kontribut_zero_ose_negativ');
    expect(ue.contributionPerUnit).toBe(0);
    expect(ue.breakEvenUnitsPerMonth).toBeNull();
    expect(ue.explanationSq).toContain('nuk mbulon asgjë');
    expect(ue.explanationSq).toContain('e përkeqësojnë');
  });

  it('returns a null margin when the price is 0', () => {
    const ue = computeUnitEconomics({ pricePerUnit: 0, variableCostPerUnit: 4, fixedCostsMonthly: 30, unitsPerCustomerPerMonth: 1 });
    expect(ue.contributionMarginPct).toBeNull();
    expect(ue.status).toBe('kontribut_zero_ose_negativ');
  });

  it('leaves customers null when units per customer is 0', () => {
    const ue = computeUnitEconomics({ pricePerUnit: 10, variableCostPerUnit: 4, fixedCostsMonthly: 30, unitsPerCustomerPerMonth: 0 });
    expect(ue.breakEvenUnitsPerMonth).toBe(5);
    expect(ue.breakEvenCustomersPerMonth).toBeNull();
  });

  it('never throws on NaN / negative inputs (they count as 0)', () => {
    const ue = computeUnitEconomics({ pricePerUnit: Number.NaN, variableCostPerUnit: -3, fixedCostsMonthly: -10, unitsPerCustomerPerMonth: 1 });
    expect(ue.pricePerUnit).toBe(0);
    expect(ue.variableCostPerUnit).toBe(0);
    expect(ue.fixedCostsMonthly).toBe(0);
    expect(ue.status).toBe('kontribut_zero_ose_negativ');
  });
});
