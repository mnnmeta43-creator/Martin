import { describe, expect, it } from 'vitest';
import { calendarMonthOf, FORMULAS_SQ, normalizeSeasonality, projectScenario, spreadByLag } from '@/lib/finance/engine';
import { line, makeGrowthInputs, makeInputs } from './helpers';

describe('projectScenario — 12-month hand-checkable example', () => {
  // Every month: 10 customers × 1 unit → revenue 100, variable 40, contribution 60, fixed 30,
  // operating 30, cash in 100, cash out 70, net cash +30. Opening cash = 200 − 100 = 100.
  const result = projectScenario(makeInputs(), 'baze');

  it('produces 12 rows with the expected values in every month', () => {
    expect(result.rows).toHaveLength(12);
    result.rows.forEach((row, index) => {
      const m = index + 1;
      expect(row).toEqual({
        month: m,
        calendarMonth: m,
        customers: 10,
        units: 10,
        revenue: 100,
        variableCosts: 40,
        contribution: 60,
        fixedCosts: 30,
        ownerSalary: 0,
        operatingResult: 30,
        tax: 0,
        netResult: 30,
        cashIn: 100,
        cashOut: 70,
        netCashFlow: 30,
        cashBalance: 100 + 30 * m,
        receivablesEnd: 0,
        payablesEnd: 0,
      });
    });
  });

  it('sums totals over the horizon', () => {
    expect(result.totals).toEqual({
      revenue: 1200,
      variableCosts: 480,
      fixedCosts: 360,
      ownerSalary: 0,
      operatingResult: 360,
      tax: 0,
      netResult: 360,
      netCashFlow: 360,
    });
  });

  it('reports the tightest cash point including month 0 (after startup spend)', () => {
    expect(result.minCashBalance).toBe(100);
    expect(result.minCashMonth).toBe(0);
    expect(result.monthsWithNegativeCash).toBe(0);
  });

  it('finds payback in month 4 (cumulative net cash 30, 60, 90, 120 ≥ 100) and never guarantees it', () => {
    expect(result.payback.recoveredInMonth).toBe(4);
    expect(result.payback.statementSq).toContain('muajin 4');
    expect(result.payback.statementSq).toContain('Me këto supozime');
    expect(result.payback.statementSq).toContain('NUK është datë e garantuar');
  });

  it('uses scenario multipliers for unit economics (fixed costs incl. owner salary)', () => {
    expect(result.unitEconomics.contributionPerUnit).toBe(6);
    expect(result.unitEconomics.breakEvenUnitsPerMonth).toBe(5);
  });

  it('warns that the owner salary is not included', () => {
    expect(result.warningsSq).toContain('Paga e pronarit nuk përfshihet në kosto — rezultati operativ e mbivlerëson atë që ju mbetet.');
  });

  it('lists every formula used, in Albanian', () => {
    expect(result.formulasSq).toEqual([...FORMULAS_SQ]);
    expect(result.formulasSq).toContain('Të ardhurat = sasia e shitur × çmimi');
    expect(result.formulasSq).toContain('Kontributi për njësi = çmimi − kostoja variabël për njësi');
    expect(result.formulasSq.some((f) => f.startsWith('Pika e barazimit në njësi = kostot fikse ÷ kontributi për njësi'))).toBe(true);
    expect(result.formulasSq).toContain('Kapitali i nevojshëm = investimi fillestar + deficiti maksimal i parasë nga operimi + rezerva');
    expect(result.formulasSq.some((f) => f.includes('tatimi paguhet në të njëjtin muaj'))).toBe(true);
    expect(result.formulasSq.some((f) => f.includes('inventari nuk numërohet dy herë'))).toBe(true);
  });
});

describe('projectScenario — customers, churn and new customers', () => {
  it('applies c_m = c_(m−1)·(1 − churn) + new, keeping fractional expected values', () => {
    // c1 = 10; c2 = 10·0.9 + 5 = 14; c3 = 14·0.9 + 5 = 17.6; c4 = 17.6·0.9 + 5 = 20.84
    // closed form: c_m = 50 − 40·0.9^(m−1) → c12 = 50 − 40·0.9^11
    const result = projectScenario(makeInputs({}, { startCustomers: 10, monthlyNewCustomers: 5, monthlyChurnPct: 10 }), 'baze');
    expect(result.rows.slice(0, 4).map((r) => r.customers)).toEqual([10, 14, expect.closeTo(17.6, 10), expect.closeTo(20.84, 10)]);
    expect(result.rows[11].customers).toBeCloseTo(50 - 40 * 0.9 ** 11, 10);
    expect(result.rows[2].revenue).toBeCloseTo(176, 10); // 17.6 units × 10
  });

  it('uses the owner salary unmultiplied and the fixed-cost multiplier on fixed lines only', () => {
    // fixed 30 × 2 = 60; owner 20 (not multiplied) → operating = 100 − 40 − 60 − 20 = −20
    const result = projectScenario(
      makeInputs({ includeOwnerSalary: true, ownerSalaryMonthly: 20 }, { fixedCostMultiplier: 2 }),
      'baze',
    );
    expect(result.rows[0].fixedCosts).toBe(60);
    expect(result.rows[0].ownerSalary).toBe(20);
    expect(result.rows[0].operatingResult).toBe(-20);
    expect(result.unitEconomics.fixedCostsMonthly).toBe(80);
    expect(result.warningsSq.some((w) => w.startsWith('Paga e pronarit nuk përfshihet'))).toBe(false);
  });

  it('ignores disabled fixed-cost lines', () => {
    const inputs = makeInputs({ monthlyFixedCosts: [line('qira', 'qira', 30), line('extra', 'marketing', 500, { enabled: false })] });
    expect(projectScenario(inputs, 'baze').rows[0].fixedCosts).toBe(30);
  });

  it('applies price and variable-cost multipliers', () => {
    // price 10 × 1.1 = 11; vcu 4 × 0.5 = 2 → revenue 110, variable 20
    const result = projectScenario(makeInputs({}, { priceMultiplier: 1.1, variableCostMultiplier: 0.5 }), 'baze');
    expect(result.rows[0].revenue).toBeCloseTo(110, 10);
    expect(result.rows[0].variableCosts).toBeCloseTo(20, 10);
  });
});

describe('seasonality', () => {
  it('normalises multipliers whose mean is not 1 and warns', () => {
    const { values, warningsSq } = normalizeSeasonality(Array.from({ length: 12 }, () => 2));
    expect(values).toEqual(Array.from({ length: 12 }, () => 1));
    expect(warningsSq[0]).toContain('u normalizuan në mesatare 1');
  });

  it('accepts a mean of 1 within float noise without warning', () => {
    const seasonality = [0.9, 0.9, 1, 1.05, 1.1, 1.1, 1.05, 0.9, 1, 1.05, 1, 0.95];
    expect(normalizeSeasonality(seasonality)).toEqual({ values: seasonality, warningsSq: [] });
  });

  it('falls back to flat seasonality when length ≠ 12 or a value ≤ 0', () => {
    const short = normalizeSeasonality([1, 1, 1]);
    expect(short.values).toEqual(Array.from({ length: 12 }, () => 1));
    expect(short.warningsSq[0]).toContain('12 vlera');
    const zero = normalizeSeasonality([0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
    expect(zero.values).toEqual(Array.from({ length: 12 }, () => 1));
    expect(zero.warningsSq[0]).toContain('zero, negative');
  });

  it('maps projection months to calendar months from startMonth', () => {
    expect(calendarMonthOf(1, 1)).toBe(1);
    expect(calendarMonthOf(12, 1)).toBe(12);
    expect(calendarMonthOf(12, 2)).toBe(1);
    expect(calendarMonthOf(11, 14)).toBe(12); // 11 + 13 months → December of the next year
  });

  it('aligns the seasonal multiplier with the calendar month (start in December)', () => {
    // Jan 1.2, Feb 0.8, others 1 (mean 1). Start in December: m1 = Dec (10 units), m2 = Jan (12), m3 = Feb (8).
    const seasonality = [1.2, 0.8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    const result = projectScenario(makeInputs({ seasonality, startMonth: 12 }), 'baze');
    expect(result.rows.map((r) => r.calendarMonth)).toEqual([12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(result.rows.slice(0, 3).map((r) => r.units)).toEqual([10, 12, 8]);
    expect(result.warningsSq.some((w) => w.includes('sezonal'))).toBe(false);
  });

  it('normalises inside the projection and reports it', () => {
    // Same shape doubled (mean 2) → identical units after normalisation, plus a warning.
    const seasonality = [2.4, 1.6, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2];
    const result = projectScenario(makeInputs({ seasonality, startMonth: 12 }), 'baze');
    expect(result.rows.slice(0, 3).map((r) => r.units)).toEqual([10, 12, 8]);
    expect(result.warningsSq.some((w) => w.includes('u normalizuan në mesatare 1'))).toBe(true);
  });
});

describe('tax on cumulative profit (losses first, then profits)', () => {
  // Growth example: operating_m = 12(m − 1) − 50 → cumulative: −50 … −18 (m9), 40 (m10), 110 (m11), 192 (m12).
  // At 10%: tax10 = 4.0; tax11 = 11.0 − 4.0 = 7.0; tax12 = 19.2 − 11.0 = 8.2. Total 19.2 = 10% × 192.
  const result = projectScenario(makeGrowthInputs({ profitTaxPct: 10 }), 'baze');

  it('charges nothing while the cumulative result is negative', () => {
    expect(result.rows.slice(0, 9).every((r) => r.tax === 0)).toBe(true);
  });

  it('charges only on the cumulative positive result', () => {
    expect(result.rows[9].tax).toBeCloseTo(4, 10);
    expect(result.rows[10].tax).toBeCloseTo(7, 10);
    expect(result.rows[11].tax).toBeCloseTo(8.2, 10);
    expect(result.totals.tax).toBeCloseTo(19.2, 10);
    expect(result.totals.netResult).toBeCloseTo(192 - 19.2, 10);
  });

  it('pays tax in cash the same month', () => {
    // month 10: 18 units → variable 72; cash out = 72 + 50 fixed + 4 tax = 126
    expect(result.rows[9].cashOut).toBeCloseTo(126, 10);
    expect(result.rows[9].netResult).toBeCloseTo(58 - 4, 10);
  });

  it('never refunds tax when a later month makes a loss', () => {
    const inputs = makeInputs({ profitTaxPct: 50, horizonMonths: 3 }, { startCustomers: 10 });
    // Make month 3 a loss by switching off customers via churn 100% and no new customers.
    inputs.scenarios.baze = { ...inputs.scenarios.baze, monthlyChurnPct: 100, monthlyNewCustomers: 0 };
    const r = projectScenario(inputs, 'baze');
    // m1: op 30 → tax 15; m2: customers 0 → op −30, cumulative 0 → no tax, no refund
    expect(r.rows.map((x) => x.tax)).toEqual([15, 0, 0]);
  });
});

describe('cash identity', () => {
  it('cashBalance_H = ownCapital − startup + ΣcashIn − ΣcashOut on a complex case', () => {
    const inputs = makeInputs(
      {
        startupCosts: [line('pajisje', 'pajisje', 340), line('inventar', 'inventar', 75), line('off', 'tarifa', 999, { enabled: false })],
        monthlyFixedCosts: [line('qira', 'qira', 45), line('marketing', 'marketing', 12.5)],
        includeOwnerSalary: true,
        ownerSalaryMonthly: 25,
        collectionDays: 45,
        supplierPaymentDays: 20,
        profitTaxPct: 15,
        seasonality: [0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.2, 1.1, 1, 0.9, 0.8],
        startMonth: 7,
        horizonMonths: 24,
        ownCapital: 900,
      },
      { startCustomers: 3, monthlyNewCustomers: 4, monthlyChurnPct: 7 },
    );
    const r = projectScenario(inputs, 'baze');
    const sumOf = (pick: (row: (typeof r.rows)[number]) => number) => r.rows.reduce((s, row) => s + pick(row), 0);
    const cashIn = sumOf((row) => row.cashIn);
    const cashOut = sumOf((row) => row.cashOut);
    const last = r.rows[r.rows.length - 1];
    expect(last.cashBalance).toBeCloseTo(900 - 415 + cashIn - cashOut, 8);
    // Receivables / payables identities at the horizon
    expect(last.receivablesEnd).toBeCloseTo(r.totals.revenue - cashIn, 8);
    const supplierPaid = cashOut - r.totals.fixedCosts - r.totals.ownerSalary - r.totals.tax;
    expect(last.payablesEnd).toBeCloseTo(r.totals.variableCosts - supplierPaid, 8);
    expect(r.totals.netCashFlow).toBeCloseTo(cashIn - cashOut, 8);
  });
});

describe('warnings', () => {
  it('warns when cash first goes below zero and when profit ≠ cash', () => {
    // Growth example: opening 100; balances 50, 12, −14 (m3), −28, −30, −20 (m6, operating +10), 2 …
    const r = projectScenario(makeGrowthInputs(), 'baze');
    expect(r.monthsWithNegativeCash).toBe(4);
    expect(r.minCashBalance).toBeCloseTo(-30, 10);
    expect(r.minCashMonth).toBe(5);
    expect(r.warningsSq.some((w) => w.startsWith('Paraja bie nën zero në muajin 3') && w.includes('kapital shtesë ose ndryshim i planit'))).toBe(true);
    expect(r.warningsSq.some((w) => w.includes('muajin 6') && w.includes('fitimi nuk është i njëjtë me paratë e disponueshme'))).toBe(true);
  });

  it('warns when own capital does not even cover the startup costs', () => {
    const r = projectScenario(makeInputs({ ownCapital: 50 }), 'baze');
    expect(r.minCashBalance).toBe(-50);
    expect(r.minCashMonth).toBe(0);
    expect(r.warningsSq.some((w) => w.includes('para muajit të parë'))).toBe(true);
  });

  it('warns about non-positive contribution', () => {
    const r = projectScenario(makeInputs({ pricePerUnit: 4 }), 'baze');
    expect(r.unitEconomics.status).toBe('kontribut_zero_ose_negativ');
    expect(r.warningsSq.some((w) => w.startsWith('Kontributi për njësi është zero ose negativ'))).toBe(true);
  });

  it('warns about zero customers', () => {
    const r = projectScenario(makeInputs({}, { startCustomers: 0, monthlyNewCustomers: 0 }), 'baze');
    expect(r.totals.revenue).toBe(0);
    expect(r.warningsSq.some((w) => w.includes('nuk ka asnjë klient'))).toBe(true);
  });

  it('warns about collection delays above 60 days', () => {
    expect(projectScenario(makeInputs({ collectionDays: 61 }), 'baze').warningsSq.some((w) => w.includes('më shumë se 60 ditë'))).toBe(true);
    expect(projectScenario(makeInputs({ collectionDays: 60 }), 'baze').warningsSq.some((w) => w.includes('më shumë se 60 ditë'))).toBe(false);
  });
});

describe('robustness', () => {
  it('clamps negative / NaN inputs to 0 with warnings instead of throwing', () => {
    const inputs = makeInputs(
      {
        pricePerUnit: Number.NaN,
        ownCapital: -500,
        monthlyFixedCosts: [line('qira', 'qira', -30)],
        horizonMonths: Number.NaN,
        startMonth: 15,
      },
      { monthlyChurnPct: 150, startCustomers: -3 },
    );
    const r = projectScenario(inputs, 'baze');
    expect(r.rows).toHaveLength(12);
    expect(r.rows[0].revenue).toBe(0);
    expect(r.rows[0].fixedCosts).toBe(0);
    expect(r.capital.ownCapital).toBe(0);
    expect(r.params.monthlyChurnPct).toBe(100);
    expect(r.params.startCustomers).toBe(0);
    expect(r.rows[0].calendarMonth).toBe(1);
    const joined = r.warningsSq.join('\n');
    expect(joined).toContain('«çmimi për njësi» (vlerë jo numerike) u zëvendësua me 0');
    expect(joined).toContain('«kapitali vetjak»');
    expect(joined).toContain('u kufizua në 100');
    expect(joined).toContain('Horizonti');
    expect(joined).toContain('Muaji i nisjes');
  });

  it('does not mutate its input', () => {
    const inputs = makeGrowthInputs({ collectionDays: 45 });
    const before = JSON.stringify(inputs);
    projectScenario(inputs, 'baze');
    expect(JSON.stringify(inputs)).toBe(before);
  });
});

describe('spreadByLag', () => {
  it('splits by the fractional part and drops what falls after the horizon', () => {
    // lag 1.5: each amount → 50% one month later, 50% two months later
    expect(spreadByLag([100, 100, 100], 1.5)).toEqual([0, 50, 100]);
    expect(spreadByLag([100, 100, 100], 0)).toEqual([100, 100, 100]);
  });
});
