import { describe, expect, it } from 'vitest';
import type { MonthRow } from '@/lib/domain/types';
import { projectScenario } from '@/lib/finance/engine';
import { line, makeInputs } from './helpers';

/** receivables_m = Σrevenue − ΣcashIn and payables_m = Σvariable − Σsupplier payments, every month. */
function expectIdentities(rows: MonthRow[]) {
  let revenue = 0;
  let cashIn = 0;
  let variable = 0;
  let supplierPaid = 0;
  for (const row of rows) {
    revenue += row.revenue;
    cashIn += row.cashIn;
    variable += row.variableCosts;
    supplierPaid += row.cashOut - row.fixedCosts - row.ownerSalary - row.tax;
    expect(row.receivablesEnd).toBeCloseTo(revenue - cashIn, 9);
    expect(row.payablesEnd).toBeCloseTo(variable - supplierPaid, 9);
  }
}

// Base example: revenue 100 and variable costs 40 every month.
describe('collection delays (customers pay later)', () => {
  it('0 days: collected in the same month, nothing left to collect', () => {
    const r = projectScenario(makeInputs({ collectionDays: 0 }), 'baze');
    expect(r.rows.map((x) => x.cashIn)).toEqual(Array(12).fill(100));
    expect(r.rows[11].receivablesEnd).toBe(0);
    expectIdentities(r.rows);
  });

  it('30 days: each month is collected the next month; the last month stays receivable', () => {
    const r = projectScenario(makeInputs({ collectionDays: 30 }), 'baze');
    expect(r.rows.map((x) => x.cashIn)).toEqual([0, ...Array(11).fill(100)]);
    expect(r.rows.map((x) => x.receivablesEnd)).toEqual(Array(12).fill(100));
    // month 1: 100 opening + 0 in − 70 out = 30 → tightest point
    expect(r.minCashBalance).toBe(30);
    expect(r.minCashMonth).toBe(1);
    expectIdentities(r.rows);
  });

  it('45 days: half collected after 1 month, half after 2 months', () => {
    // L = 1.5 → month k: 50 in k+1, 50 in k+2. cash in: 0, 50, 100, 100, …
    // receivables end of month 12: all of month 12 (100) + second half of month 11 (50) = 150
    const r = projectScenario(makeInputs({ collectionDays: 45 }), 'baze');
    expect(r.rows.map((x) => x.cashIn)).toEqual([0, 50, ...Array(10).fill(100)]);
    expect(r.rows[0].receivablesEnd).toBe(100);
    expect(r.rows[11].receivablesEnd).toBe(150);
    expectIdentities(r.rows);
  });

  it('60 days: collected two months later', () => {
    const r = projectScenario(makeInputs({ collectionDays: 60 }), 'baze');
    expect(r.rows.map((x) => x.cashIn)).toEqual([0, 0, ...Array(10).fill(100)]);
    expect(r.rows[11].receivablesEnd).toBe(200);
    expectIdentities(r.rows);
  });

  it('scenario override wins over the base collection days, including an explicit 0', () => {
    const delayed = projectScenario(makeInputs({ collectionDays: 0 }, { collectionDaysOverride: 30 }), 'baze');
    expect(delayed.rows[0].cashIn).toBe(0);
    const immediate = projectScenario(makeInputs({ collectionDays: 30 }, { collectionDaysOverride: 0 }), 'baze');
    expect(immediate.rows[0].cashIn).toBe(100);
  });

  it('does not change accrual results (revenue, profit) — only the timing of cash', () => {
    const now = projectScenario(makeInputs({ collectionDays: 0 }), 'baze');
    const later = projectScenario(makeInputs({ collectionDays: 45 }), 'baze');
    expect(later.totals.revenue).toBe(now.totals.revenue);
    expect(later.totals.operatingResult).toBe(now.totals.operatingResult);
    expect(later.totals.netCashFlow).toBe(now.totals.netCashFlow - 150);
  });
});

describe('supplier payment days (we pay later)', () => {
  it('30 days: variable costs are paid the next month; the last month stays payable', () => {
    // month 1 pays only fixed 30; later months pay 40 (previous month) + 30 fixed
    const r = projectScenario(makeInputs({ supplierPaymentDays: 30 }), 'baze');
    expect(r.rows.map((x) => x.cashOut)).toEqual([30, ...Array(11).fill(70)]);
    expect(r.rows[11].payablesEnd).toBe(40);
    expectIdentities(r.rows);
  });

  it('15 days: half paid in the same month, half the next month', () => {
    // L = 0.5 → month k: 20 in k, 20 in k+1 → cash out 30 + 20 = 50 in month 1, then 70; payables 20
    const r = projectScenario(makeInputs({ supplierPaymentDays: 15 }), 'baze');
    expect(r.rows[0].cashOut).toBe(50);
    expect(r.rows[1].cashOut).toBe(70);
    expect(r.rows.every((x) => x.payablesEnd === 20)).toBe(true);
    expectIdentities(r.rows);
  });
});

describe('initial inventory is counted once', () => {
  // Startup: equipment 100 + initial stock 50 = 150 (paid at month 0). Ongoing purchases = variable costs only.
  const inputs = makeInputs({ startupCosts: [line('pajisje', 'pajisje', 100), line('stok', 'inventar', 50)] });
  const r = projectScenario(inputs, 'baze');

  it('puts the stock in the startup total and its own category', () => {
    expect(r.capital.startupTotal).toBe(150);
    expect(r.capital.byCategory).toEqual({ hapje: 0, pajisje: 100, depozita: 0, inventar: 50, tarifa: 0, testim_tregu: 0 });
  });

  it('does not add any inventory purchase to monthly cash out beyond variable costs', () => {
    const totalOut = r.rows.reduce((s, x) => s + x.cashOut, 0);
    expect(totalOut).toBe(r.totals.variableCosts + r.totals.fixedCosts); // 480 + 360
    expect(r.rows[11].cashBalance).toBe(200 - 150 + 1200 - 840);
  });

  it('counts the stock once in the capital requirement and says so', () => {
    // 150 startup + 0 deficit + 1 × 30 reserve
    expect(r.capital.totalRequired).toBe(180);
    expect(r.capital.explanationSq.join(' ')).toContain('vetëm këtu');
    expect(r.formulasSq.some((f) => f.includes('Inventari fillestar') && f.includes('nuk numërohet dy herë'))).toBe(true);
  });
});
