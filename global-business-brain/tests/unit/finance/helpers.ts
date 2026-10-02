/**
 * Ndihmës për testet e financës: inpute të vogla, të llogaritshme me dorë.
 * Values are synthetic round numbers (no real prices).
 */
import type { FinancialInputs, MoneyLine, ScenarioId, ScenarioParams } from '@/lib/domain/types';

export function line(id: string, category: MoneyLine['category'], amount: number, extra: Partial<MoneyLine> = {}): MoneyLine {
  return {
    id,
    labelSq: `Zë ${id}`,
    category,
    amount,
    sourceKind: 'perdoruesi',
    sourceNoteSq: 'Vlerë testi.',
    date: '2026-10-02',
    enabled: true,
    ...extra,
  };
}

export function scenario(params: Partial<ScenarioParams> = {}): ScenarioParams {
  return {
    startCustomers: 10,
    monthlyNewCustomers: 0,
    monthlyChurnPct: 0,
    priceMultiplier: 1,
    variableCostMultiplier: 1,
    fixedCostMultiplier: 1,
    collectionDaysOverride: null,
    ...params,
  };
}

/**
 * Base example (used across tests): price 10, variable cost 4, 10 customers × 1 unit, fixed 30/month,
 * startup 100, own capital 200, no delays, no tax, flat seasonality, 12 months, reserve 1 month.
 * → revenue 100, variable 40, operating result 30 every month.
 */
export function makeInputs(overrides: Partial<FinancialInputs> = {}, baze: Partial<ScenarioParams> = {}): FinancialInputs {
  const bazeParams = scenario(baze);
  const scenarios: Record<ScenarioId, ScenarioParams> = {
    konservator: { ...bazeParams },
    baze: bazeParams,
    optimist: { ...bazeParams },
  };
  return {
    currency: 'EUR',
    startupCosts: [line('pajisje', 'pajisje', 100)],
    monthlyFixedCosts: [line('qira', 'qira', 30)],
    includeOwnerSalary: false,
    ownerSalaryMonthly: 0,
    pricePerUnit: 10,
    variableCostPerUnit: 4,
    unitLabelSq: 'njësi',
    unitsPerCustomerPerMonth: 1,
    collectionDays: 0,
    supplierPaymentDays: 0,
    seasonality: Array.from({ length: 12 }, () => 1),
    startMonth: 1,
    ownCapital: 200,
    reserveMonths: 1,
    profitTaxPct: 0,
    horizonMonths: 12,
    scenarios,
    assumptionsNotesSq: [],
    ...overrides,
  };
}

/**
 * Growth example: 0 customers at start, +2 per month, no churn → customers_m = 2(m − 1).
 * Contribution per unit 6, fixed 50 → net cash flow_m = 12(m − 1) − 50.
 * Cumulative: −50, −88, −114, −128, −130 (minimum, month 5), −120, −98, −64, −18, +40, +110, +192.
 */
export function makeGrowthInputs(overrides: Partial<FinancialInputs> = {}): FinancialInputs {
  return makeInputs(
    {
      startupCosts: [line('pajisje', 'pajisje', 200)],
      monthlyFixedCosts: [line('qira', 'qira', 50)],
      ownCapital: 300,
      reserveMonths: 2,
      ...overrides,
    },
    { startCustomers: 0, monthlyNewCustomers: 2 },
  );
}

/** Deep-freezes an object so any mutation inside the code under test throws. */
export function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value as Record<string, unknown>).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

/** Replaces the non-breaking spaces Intl uses in sq-AL with plain spaces for readable assertions. */
export function plain(text: string): string {
  return text.replace(/[  ]/g, ' ');
}
