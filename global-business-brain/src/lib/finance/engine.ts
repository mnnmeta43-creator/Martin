/**
 * Motori financiar deterministik: ekonomia për njësi, projeksioni mujor, kapitali i nevojshëm,
 * rikuperimi, goditjet (what-if) dhe ndjeshmëria.
 *
 * Every financial number shown in the app comes from here (never from the AI). The engine is a
 * pure function of `FinancialInputs`: no clock, no I/O, no randomness, and it never throws for
 * numeric problems — invalid values are clamped and reported in `warningsSq`. Exact floats are
 * kept; rounding is a display concern (`format.ts`). The formulas are listed in Albanian in
 * `FORMULAS_SQ` and returned with every projection so the user can audit each number.
 */
import type {
  CapitalRequirement,
  CurrencyCode,
  FinancialInputs,
  MoneyLine,
  MonthRow,
  PaybackResult,
  ProjectionResult,
  ScenarioId,
  ScenarioParams,
  StartupCategory,
  UnitEconomics,
} from '@/lib/domain/types';
import { SCENARIO_LABELS, STARTUP_CATEGORY_LABELS } from '@/lib/domain/taxonomy';
import { formatMoney, formatNumber, formatPercent } from '@/lib/finance/format';

export const SCENARIO_IDS: readonly ScenarioId[] = ['konservator', 'baze', 'optimist'];
export const STARTUP_CATEGORIES: readonly StartupCategory[] = ['hapje', 'pajisje', 'depozita', 'inventar', 'tarifa', 'testim_tregu'];

/** Payment delays are entered in days and converted with a 30-day month. */
export const DAYS_PER_MONTH = 30;
export const MAX_HORIZON_MONTHS = 120;
const DEFAULT_HORIZON_MONTHS = 12;
const LONG_COLLECTION_DAYS = 60;
// Relative tolerance so float noise (e.g. 1e-14) is not reported as debt or negative cash.
const RELATIVE_TOLERANCE = 1e-9;

export const FORMULAS_SQ: readonly string[] = [
  'Klientët: muaji 1 = klientët fillestarë; muaji m = klientët e muajit m−1 × (1 − largimi mujor % ÷ 100) + klientët e rinj në muaj. Vlerat janë mesatare të pritshme, prandaj mund të kenë presje dhjetore.',
  'Muaji kalendarik i muajit m = ((muaji i nisjes − 1 + m − 1) mod 12) + 1.',
  'Sasia e shitur = klientët × njësi për klient në muaj × koeficienti sezonal i muajit kalendarik.',
  'Koeficientët sezonalë normalizohen që mesatarja e tyre të jetë 1; nëse nuk janë 12 vlera pozitive, përdoret sezonalitet i sheshtë (të gjithë = 1).',
  'Çmimi i skenarit = çmimi për njësi × shumëzuesi i çmimit; kostoja variabël e skenarit = kostoja variabël për njësi × shumëzuesi i kostos variabël.',
  'Të ardhurat = sasia e shitur × çmimi',
  'Kostot variabël = sasia e shitur × kostoja variabël për njësi',
  'Kontributi = të ardhurat − kostot variabël',
  'Kontributi për njësi = çmimi − kostoja variabël për njësi',
  'Marzhi i kontributit (%) = kontributi për njësi ÷ çmimi × 100',
  'Pika e barazimit në njësi = kostot fikse ÷ kontributi për njësi (kostot fikse mujore, përfshirë pagën e pronarit kur përfshihet)',
  'Pika e barazimit në klientë = pika e barazimit në njësi ÷ njësi për klient në muaj',
  'Kostot fikse = shuma e kostove fikse mujore të aktivizuara × shumëzuesi i kostove fikse. Paga e pronarit shtohet veçmas dhe nuk shumëzohet.',
  'Rezultati operativ = të ardhurat − kostot variabël − kostot fikse − paga e pronarit',
  'Tatimi i muajit = max(0, max(0, rezultati operativ kumulativ) × norma e tatimit − tatimi i llogaritur deri tani). Humbjet e muajve të parë zbriten përmes rezultatit kumulativ. Thjeshtim: tatimi paguhet në të njëjtin muaj.',
  'Rezultati neto = rezultati operativ − tatimi',
  'Vonesa e arkëtimit në muaj L = ditët e arkëtimit ÷ 30. Të ardhurat e muajit k arkëtohen: pjesa (1 − f) në muajin k + ⌊L⌋ dhe pjesa f në muajin k + ⌊L⌋ + 1, ku f = L − ⌊L⌋.',
  'Pagesat te furnitorët për kostot variabël ndjekin të njëjtin rregull me ditët e pagesës së furnitorëve.',
  'Kostot fikse, paga e pronarit dhe tatimi paguhen në të njëjtin muaj. Shumat që bien pas horizontit mbeten të arkëtueshme ose të pagueshme në fund të periudhës.',
  'Investimi fillestar (zërat e aktivizuar) paguhet në muajin 0, para muajit 1. Paraja fillestare = kapitali vetjak − investimi fillestar.',
  'Inventari fillestar (kategoria “Inventar fillestar”) është aset që blihet një herë në muajin 0, jo shpenzim mujor. Blerjet e mëvonshme të mallit janë të barabarta me kostot variabël (rimbushje), prandaj inventari nuk numërohet dy herë.',
  'Hyrjet e parasë = arkëtimet nga klientët; daljet e parasë = pagesat te furnitorët + kostot fikse + paga e pronarit + tatimi.',
  'Fluksi neto i parasë = hyrjet e parasë − daljet e parasë',
  'Paraja në fund të muajit = paraja në fund të muajit të kaluar + fluksi neto i parasë (muaji 0 = paraja fillestare).',
  'Të arkëtueshmet në fund = të ardhurat kumulative − arkëtimet kumulative; të pagueshmet në fund = kostot variabël kumulative − pagesat kumulative te furnitorët.',
  'Deficiti maksimal i parasë nga operimi = max(0, −(minimumi i fluksit neto kumulativ të parasë)). Nuk përfshin investimin fillestar, që të mos numërohet dy herë.',
  'Rezerva = muajt e rezervës × (kostot fikse mujore + paga e pronarit)',
  'Kapitali i nevojshëm = investimi fillestar + deficiti maksimal i parasë nga operimi + rezerva',
  'Mungesa e kapitalit = max(0, kapitali i nevojshëm − kapitali vetjak). Nuk supozohet asnjë kredi, grant apo financim tjetër.',
  'Rikuperimi i investimit = muaji i parë kur fluksi neto kumulativ i parasë nga operimi ≥ investimi fillestar. Është vlerësim, jo datë e garantuar.',
];

// ─────────────────────────────────────────────────────────────────────────────
// Unit economics
// ─────────────────────────────────────────────────────────────────────────────

export interface UnitEconomicsInput {
  pricePerUnit: number;
  variableCostPerUnit: number;
  fixedCostsMonthly: number; // include owner salary when it is part of the model
  unitsPerCustomerPerMonth: number;
}

function nonNegative(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function noContributionSq(price: number, variable: number, contribution: number): string {
  const tail = ' Duhet ndryshuar çmimi, kostoja ose modeli i biznesit.';
  if (contribution < 0) {
    return (
      `Çdo njësi e shitur humbet para: çmimi (${formatNumber(price)}) është më i ulët se kostoja variabël për njësi (${formatNumber(variable)}), ` +
      `pra humbni ${formatNumber(-contribution)} për çdo njësi. Sa më shumë të shisni, aq më e madhe bëhet humbja — më shumë shitje e përkeqësojnë situatën.${tail}`
    );
  }
  return (
    `Çdo njësi e shitur nuk mbulon asgjë: çmimi (${formatNumber(price)}) është i barabartë me koston variabël për njësi, pra kontributi është 0 ` +
    `dhe kostot fikse nuk mbulohen kurrë. Më shumë shitje nuk e përmirësojnë rezultatin — e përkeqësojnë, sepse rrisin punën dhe rrezikun pa sjellë asgjë.${tail}`
  );
}

function breakEvenSq(fixed: number, contribution: number, units: number, customers: number | null): string {
  if (fixed === 0) return ' Nuk ka kosto fikse, prandaj pika e barazimit është 0 njësi: çdo njësi e shitur sjell kontribut pozitiv.';
  const customersSq =
    customers === null
      ? '; numri i klientëve nuk llogaritet sepse sasia për klient në muaj është 0.'
      : `, rreth ${formatNumber(customers)} klientë në muaj.`;
  return ` Pika e barazimit në njësi = kostot fikse ÷ kontributi për njësi = ${formatNumber(fixed)} ÷ ${formatNumber(contribution)} ≈ ${formatNumber(units)} njësi në muaj${customersSq}`;
}

/** Contribution, margin and monthly break-even for one price/cost combination. */
export function computeUnitEconomics(i: UnitEconomicsInput): UnitEconomics {
  const price = nonNegative(i.pricePerUnit);
  const variable = nonNegative(i.variableCostPerUnit);
  const fixed = nonNegative(i.fixedCostsMonthly);
  const unitsPerCustomer = nonNegative(i.unitsPerCustomerPerMonth);
  const contribution = price - variable;
  const marginPct = price > 0 ? (contribution / price) * 100 : null;
  const common = { pricePerUnit: price, variableCostPerUnit: variable, contributionPerUnit: contribution, contributionMarginPct: marginPct, fixedCostsMonthly: fixed };

  if (contribution <= 0) {
    return {
      ...common,
      breakEvenUnitsPerMonth: null,
      breakEvenCustomersPerMonth: null,
      status: 'kontribut_zero_ose_negativ',
      explanationSq: noContributionSq(price, variable, contribution),
    };
  }

  const breakEvenUnits = fixed / contribution;
  const breakEvenCustomers = unitsPerCustomer > 0 ? breakEvenUnits / unitsPerCustomer : null;
  const explanationSq =
    `Kontributi për njësi = çmimi − kostoja variabël për njësi = ${formatNumber(price)} − ${formatNumber(variable)} = ${formatNumber(contribution)} ` +
    `(marzhi i kontributit ${formatPercent(marginPct)}).` +
    breakEvenSq(fixed, contribution, breakEvenUnits, breakEvenCustomers);
  return { ...common, breakEvenUnitsPerMonth: breakEvenUnits, breakEvenCustomersPerMonth: breakEvenCustomers, status: 'ok', explanationSq };
}

// ─────────────────────────────────────────────────────────────────────────────
// Input sanitising (never throw; clamp and explain)
// ─────────────────────────────────────────────────────────────────────────────

export interface SanitizedInputs {
  inputs: FinancialInputs;
  warningsSq: string[];
}

const NEUTRAL_SCENARIO: ScenarioParams = {
  startCustomers: 0,
  monthlyNewCustomers: 0,
  monthlyChurnPct: 0,
  priceMultiplier: 1,
  variableCostMultiplier: 1,
  fixedCostMultiplier: 1,
  collectionDaysOverride: null,
};

function describeValue(value: unknown): string {
  return typeof value === 'number' && Number.isFinite(value) ? formatNumber(value) : 'vlerë jo numerike';
}

function cleanAmount(value: number, labelSq: string, warnings: string[], max = Infinity): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    warnings.push(`Vlera e pavlefshme për «${labelSq}» (${describeValue(value)}) u zëvendësua me 0.`);
    return 0;
  }
  if (value > max) {
    warnings.push(`Vlera për «${labelSq}» (${formatNumber(value)}) u kufizua në ${formatNumber(max)}.`);
    return max;
  }
  return value;
}

function cleanLines(lines: MoneyLine[] | undefined, warnings: string[]): MoneyLine[] {
  return (lines ?? []).map((line) => ({ ...line, amount: cleanAmount(line.amount, line.labelSq, warnings) }));
}

function cleanHorizon(value: number, warnings: string[]): number {
  if (!Number.isFinite(value) || value < 1) {
    warnings.push(`Horizonti (${describeValue(value)}) nuk është i vlefshëm; u përdorën ${DEFAULT_HORIZON_MONTHS} muaj.`);
    return DEFAULT_HORIZON_MONTHS;
  }
  const rounded = Math.round(value);
  if (rounded > MAX_HORIZON_MONTHS) {
    warnings.push(`Horizonti u kufizua në ${MAX_HORIZON_MONTHS} muaj.`);
    return MAX_HORIZON_MONTHS;
  }
  return rounded;
}

function cleanStartMonth(value: number, warnings: string[]): number {
  if (Number.isInteger(value) && value >= 1 && value <= 12) return value;
  warnings.push(`Muaji i nisjes (${describeValue(value)}) duhet të jetë nga 1 deri në 12; u përdor janari (1).`);
  return 1;
}

function cleanScenario(id: ScenarioId, raw: ScenarioParams | undefined, warnings: string[]): ScenarioParams {
  const label = SCENARIO_LABELS[id];
  if (!raw) {
    warnings.push(`Skenari «${label}» mungon; u përdorën vlera neutrale (0 klientë, shumëzues 1).`);
    return { ...NEUTRAL_SCENARIO };
  }
  const field = (nameSq: string) => `${label}: ${nameSq}`;
  return {
    startCustomers: cleanAmount(raw.startCustomers, field('klientët fillestarë'), warnings),
    monthlyNewCustomers: cleanAmount(raw.monthlyNewCustomers, field('klientë të rinj në muaj'), warnings),
    monthlyChurnPct: cleanAmount(raw.monthlyChurnPct, field('largimi mujor i klientëve (%)'), warnings, 100),
    priceMultiplier: cleanAmount(raw.priceMultiplier, field('shumëzuesi i çmimit'), warnings),
    variableCostMultiplier: cleanAmount(raw.variableCostMultiplier, field('shumëzuesi i kostos variabël'), warnings),
    fixedCostMultiplier: cleanAmount(raw.fixedCostMultiplier, field('shumëzuesi i kostove fikse'), warnings),
    collectionDaysOverride:
      raw.collectionDaysOverride === null || raw.collectionDaysOverride === undefined
        ? null
        : cleanAmount(raw.collectionDaysOverride, field('ditët e arkëtimit'), warnings),
  };
}

/** Everything except the scenarios; seasonality is normalised separately by the projection. */
function sanitizeBase(raw: FinancialInputs, warnings: string[]): FinancialInputs {
  return {
    ...raw,
    startupCosts: cleanLines(raw.startupCosts, warnings),
    monthlyFixedCosts: cleanLines(raw.monthlyFixedCosts, warnings),
    includeOwnerSalary: raw.includeOwnerSalary === true,
    ownerSalaryMonthly: cleanAmount(raw.ownerSalaryMonthly, 'paga mujore e pronarit', warnings),
    pricePerUnit: cleanAmount(raw.pricePerUnit, 'çmimi për njësi', warnings),
    variableCostPerUnit: cleanAmount(raw.variableCostPerUnit, 'kostoja variabël për njësi', warnings),
    unitsPerCustomerPerMonth: cleanAmount(raw.unitsPerCustomerPerMonth, 'njësi për klient në muaj', warnings),
    collectionDays: cleanAmount(raw.collectionDays, 'ditët e arkëtimit nga klientët', warnings),
    supplierPaymentDays: cleanAmount(raw.supplierPaymentDays, 'ditët e pagesës te furnitorët', warnings),
    startMonth: cleanStartMonth(raw.startMonth, warnings),
    ownCapital: cleanAmount(raw.ownCapital, 'kapitali vetjak', warnings),
    reserveMonths: cleanAmount(raw.reserveMonths, 'muajt e rezervës', warnings),
    profitTaxPct: cleanAmount(raw.profitTaxPct, 'tatimi mbi fitimin (%)', warnings, 100),
    horizonMonths: cleanHorizon(raw.horizonMonths, warnings),
    assumptionsNotesSq: raw.assumptionsNotesSq ?? [],
  };
}

/** Clamps every numeric field (negative / NaN → 0) and explains each correction in Albanian. */
export function sanitizeFinancialInputs(raw: FinancialInputs): SanitizedInputs {
  const warningsSq: string[] = [];
  const base = sanitizeBase(raw, warningsSq);
  const scenarios = Object.fromEntries(
    SCENARIO_IDS.map((id) => [id, cleanScenario(id, raw.scenarios?.[id], warningsSq)]),
  ) as Record<ScenarioId, ScenarioParams>;
  return { inputs: { ...base, scenarios }, warningsSq };
}

/** Validates 12 positive multipliers and rescales them to mean 1 (so they shift, not inflate, sales). */
export function normalizeSeasonality(raw: readonly number[] | null | undefined): { values: number[]; warningsSq: string[] } {
  const flat = Array.from({ length: 12 }, () => 1);
  if (!Array.isArray(raw) || raw.length !== 12) {
    return {
      values: flat,
      warningsSq: ['Sezonaliteti duhet të ketë 12 vlera (janar–dhjetor); u përdor sezonalitet i sheshtë (të gjithë muajt = 1).'],
    };
  }
  if (raw.some((v) => typeof v !== 'number' || !Number.isFinite(v) || v <= 0)) {
    return {
      values: flat,
      warningsSq: ['Sezonaliteti përmban vlera zero, negative ose jo numerike; u përdor sezonalitet i sheshtë (të gjithë muajt = 1).'],
    };
  }
  const mean = raw.reduce((sum, v) => sum + v, 0) / 12;
  if (Math.abs(mean - 1) <= 1e-6) return { values: [...raw], warningsSq: [] };
  return {
    values: raw.map((v) => v / mean),
    warningsSq: [
      `Koeficientët sezonalë kishin mesatare ${formatNumber(mean, 3)} dhe u normalizuan në mesatare 1, që sezonaliteti të zhvendosë shitjet mes muajve pa ndryshuar totalin vjetor.`,
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Projection
// ─────────────────────────────────────────────────────────────────────────────

/** Calendar month (1–12) of projection month m (1-based). */
export function calendarMonthOf(startMonth: number, month: number): number {
  return ((startMonth - 1 + month - 1) % 12) + 1;
}

function sumEnabled(lines: readonly MoneyLine[]): number {
  return lines.reduce((sum, line) => (line.enabled ? sum + line.amount : sum), 0);
}

function sum(values: readonly number[]): number {
  return values.reduce((total, v) => total + v, 0);
}

interface MonthlyTerms {
  price: number;
  variableCostPerUnit: number;
  fixedCosts: number;
  ownerSalary: number;
  collectionDays: number;
  supplierDays: number;
  taxRate: number;
}

function monthlyTerms(inputs: FinancialInputs, params: ScenarioParams): MonthlyTerms {
  return {
    price: inputs.pricePerUnit * params.priceMultiplier,
    variableCostPerUnit: inputs.variableCostPerUnit * params.variableCostMultiplier,
    fixedCosts: sumEnabled(inputs.monthlyFixedCosts) * params.fixedCostMultiplier,
    ownerSalary: inputs.includeOwnerSalary ? inputs.ownerSalaryMonthly : 0,
    collectionDays: params.collectionDaysOverride ?? inputs.collectionDays,
    supplierDays: inputs.supplierPaymentDays,
    taxRate: inputs.profitTaxPct / 100,
  };
}

function customersPath(params: ScenarioParams, horizon: number): number[] {
  const path: number[] = [];
  let current = params.startCustomers;
  for (let month = 1; month <= horizon; month++) {
    if (month > 1) current = current * (1 - params.monthlyChurnPct / 100) + params.monthlyNewCustomers;
    path.push(current);
  }
  return path;
}

type AccrualRow = Omit<MonthRow, 'cashIn' | 'cashOut' | 'netCashFlow' | 'cashBalance' | 'receivablesEnd' | 'payablesEnd'>;

function accrualRows(inputs: FinancialInputs, params: ScenarioParams, seasonality: number[], terms: MonthlyTerms): AccrualRow[] {
  let cumulativeOperating = 0;
  let taxAccrued = 0;
  return customersPath(params, inputs.horizonMonths).map((customers, index) => {
    const month = index + 1;
    const calendarMonth = calendarMonthOf(inputs.startMonth, month);
    const units = customers * inputs.unitsPerCustomerPerMonth * seasonality[calendarMonth - 1];
    const revenue = units * terms.price;
    const variableCosts = units * terms.variableCostPerUnit;
    const operatingResult = revenue - variableCosts - terms.fixedCosts - terms.ownerSalary;
    cumulativeOperating += operatingResult;
    // Tax on cumulative profit: early losses are offset before any tax is due.
    const tax = Math.max(0, Math.max(0, cumulativeOperating) * terms.taxRate - taxAccrued);
    taxAccrued += tax;
    return {
      month,
      calendarMonth,
      customers,
      units,
      revenue,
      variableCosts,
      contribution: revenue - variableCosts,
      fixedCosts: terms.fixedCosts,
      ownerSalary: terms.ownerSalary,
      operatingResult,
      tax,
      netResult: operatingResult - tax,
    };
  });
}

/**
 * Shifts each month's amount by a fractional lag (in months): share (1 − f) lands ⌊L⌋ months later,
 * share f one month after that. Amounts landing after the horizon are dropped here and therefore
 * remain as receivables / payables.
 */
export function spreadByLag(amounts: readonly number[], lagMonths: number): number[] {
  const whole = Math.floor(lagMonths);
  const fraction = lagMonths - whole;
  const out = amounts.map(() => 0);
  const addAt = (index: number, value: number) => {
    if (index < out.length && value !== 0) out[index] += value;
  };
  amounts.forEach((amount, k) => {
    addAt(k + whole, amount * (1 - fraction));
    addAt(k + whole + 1, amount * fraction);
  });
  return out;
}

function snap(value: number, tolerance: number): number {
  return Math.abs(value) <= tolerance ? 0 : value;
}

function cashRows(accrual: AccrualRow[], terms: MonthlyTerms, openingCash: number, tolerance: number): MonthRow[] {
  const collected = spreadByLag(accrual.map((r) => r.revenue), terms.collectionDays / DAYS_PER_MONTH);
  const supplierPaid = spreadByLag(accrual.map((r) => r.variableCosts), terms.supplierDays / DAYS_PER_MONTH);
  let balance = openingCash;
  let cumulativeRevenue = 0;
  let cumulativeCollected = 0;
  let cumulativeVariable = 0;
  let cumulativePaid = 0;
  return accrual.map((row, i) => {
    const cashIn = collected[i];
    const cashOut = supplierPaid[i] + row.fixedCosts + row.ownerSalary + row.tax;
    const netCashFlow = cashIn - cashOut;
    balance += netCashFlow;
    cumulativeRevenue += row.revenue;
    cumulativeCollected += cashIn;
    cumulativeVariable += row.variableCosts;
    cumulativePaid += supplierPaid[i];
    return {
      ...row,
      cashIn,
      cashOut,
      netCashFlow,
      cashBalance: balance,
      receivablesEnd: snap(cumulativeRevenue - cumulativeCollected, tolerance),
      payablesEnd: snap(cumulativeVariable - cumulativePaid, tolerance),
    };
  });
}

function isStartupCategory(category: string): category is StartupCategory {
  return (STARTUP_CATEGORIES as readonly string[]).includes(category);
}

function startupByCategory(lines: readonly MoneyLine[], warnings: string[]): Record<StartupCategory, number> {
  const byCategory = Object.fromEntries(STARTUP_CATEGORIES.map((c) => [c, 0])) as Record<StartupCategory, number>;
  for (const line of lines) {
    if (!line.enabled) continue;
    if (isStartupCategory(line.category)) {
      byCategory[line.category] += line.amount;
    } else {
      byCategory.hapje += line.amount;
      warnings.push(`Zëri «${line.labelSq}» i investimit fillestar ka kategori mujore; u numërua te «${STARTUP_CATEGORY_LABELS.hapje}».`);
    }
  }
  return byCategory;
}

function cumulative(values: readonly number[]): number[] {
  let running = 0;
  return values.map((v) => (running += v));
}

interface CapitalArgs {
  rows: MonthRow[];
  byCategory: Record<StartupCategory, number>;
  inputs: FinancialInputs;
  terms: MonthlyTerms;
  tolerance: number;
}

function capitalRequirement({ rows, byCategory, inputs, terms, tolerance }: CapitalArgs): CapitalRequirement {
  const money = (v: number) => formatMoney(v, inputs.currency);
  const startupTotal = sum(Object.values(byCategory));
  const cumulativeCash = cumulative(rows.map((r) => r.netCashFlow));
  const maxOperatingDeficit = snap(Math.max(0, -Math.min(0, ...cumulativeCash)), tolerance);
  const monthlyBase = terms.fixedCosts + terms.ownerSalary;
  const reserve = inputs.reserveMonths * monthlyBase;
  const totalRequired = startupTotal + maxOperatingDeficit + reserve;
  const gap = snap(Math.max(0, totalRequired - inputs.ownCapital), tolerance);

  const deficitSq =
    maxOperatingDeficit > 0
      ? `Deficiti maksimal i parasë nga operimi: ${money(maxOperatingDeficit)} — shuma më e madhe kumulative që operimi konsumon para se arkëtimet ta mbulojnë (pa investimin fillestar).`
      : 'Me këto supozime operimi nuk krijon deficit kumulativ parash brenda horizontit (deficiti maksimal = 0).';
  const explanationSq = [
    `Investimi fillestar: ${money(startupTotal)}, i paguar në muajin 0, para nisjes (inventari fillestar përfshihet këtu dhe vetëm këtu).`,
    deficitSq,
    `Rezerva e sigurisë: ${formatNumber(inputs.reserveMonths)} muaj × ${money(monthlyBase)} (kosto fikse + paga e pronarit) = ${money(reserve)}.`,
    `Kapitali i nevojshëm = ${money(startupTotal)} + ${money(maxOperatingDeficit)} + ${money(reserve)} = ${money(totalRequired)}. Asgjë nuk numërohet dy herë: investimi fillestar nuk përfshihet te deficiti i operimit, dhe blerjet e mallit gjatë operimit janë vetëm kosto variabël.`,
    gap > 0
      ? `Kapitali juaj: ${money(inputs.ownCapital)}. Mungojnë ${money(gap)} për të mbuluar kapitalin e nevojshëm.`
      : `Kapitali juaj (${money(inputs.ownCapital)}) e mbulon kapitalin e nevojshëm me këto supozime.`,
    'Nuk supozohet asnjë kredi, grant apo financim tjetër: paraja vjen vetëm nga kapitali juaj dhe nga arkëtimet nga klientët.',
  ];
  return { startupTotal, byCategory, maxOperatingDeficit, reserve, totalRequired, ownCapital: inputs.ownCapital, gap, explanationSq };
}

function paybackOf(rows: MonthRow[], startupTotal: number, horizon: number, currency: CurrencyCode, tolerance: number): PaybackResult {
  if (startupTotal <= 0) return { recoveredInMonth: null, statementSq: 'Nuk ka investim fillestar për t’u rikuperuar.' };
  let recovered = 0;
  for (const row of rows) {
    recovered += row.netCashFlow;
    if (recovered >= startupTotal - tolerance) {
      return {
        recoveredInMonth: row.month,
        statementSq: `Me këto supozime, fluksi neto i parasë nga operimi e mbulon investimin fillestar (${formatMoney(startupTotal, currency)}) në muajin ${row.month}. Kjo NUK është datë e garantuar: shitjet, çmimet, kostot dhe vonesat reale të pagesave mund ta ndryshojnë.`,
      };
    }
  }
  return {
    recoveredInMonth: null,
    statementSq: `Me këto supozime, investimi fillestar nuk rikuperohet brenda horizontit prej ${horizon} muajsh.`,
  };
}

interface CashLow {
  minCashBalance: number;
  minCashMonth: number | null;
  monthsWithNegativeCash: number;
  firstNegativeMonth: number | null;
}

/** Month 0 (opening cash after startup spend) is included: being short before opening matters. */
function cashLow(rows: MonthRow[], openingCash: number, tolerance: number): CashLow {
  let minCashBalance = openingCash;
  let minCashMonth = 0;
  for (const row of rows) {
    if (row.cashBalance < minCashBalance) {
      minCashBalance = row.cashBalance;
      minCashMonth = row.month;
    }
  }
  const negative = rows.filter((r) => r.cashBalance < -tolerance);
  const firstNegativeMonth = openingCash < -tolerance ? 0 : (negative[0]?.month ?? null);
  return { minCashBalance, minCashMonth, monthsWithNegativeCash: negative.length, firstNegativeMonth };
}

interface WarningArgs {
  inputs: FinancialInputs;
  rows: MonthRow[];
  terms: MonthlyTerms;
  unitEconomics: UnitEconomics;
  low: CashLow;
  startupTotal: number;
  tolerance: number;
}

function negativeCashSq({ inputs, rows, low, startupTotal }: WarningArgs): string | null {
  const money = (v: number) => formatMoney(v, inputs.currency);
  if (low.firstNegativeMonth === 0) {
    return `Kapitali vetjak (${money(inputs.ownCapital)}) nuk mbulon investimin fillestar (${money(startupTotal)}): paraja është nën zero që para muajit të parë. Ju duhet kapital shtesë ose ndryshim i planit.`;
  }
  if (low.firstNegativeMonth === null) return null;
  const balance = rows[low.firstNegativeMonth - 1].cashBalance;
  return `Paraja bie nën zero në muajin ${low.firstNegativeMonth} (${money(balance)}). Me këto supozime ju duhet kapital shtesë ose ndryshim i planit (më pak kosto, çmim tjetër, nisje më e vogël).`;
}

function projectionWarnings(args: WarningArgs): string[] {
  const { inputs, rows, terms, unitEconomics, tolerance } = args;
  const warnings: string[] = [];
  if (unitEconomics.status === 'kontribut_zero_ose_negativ') {
    warnings.push(
      'Kontributi për njësi është zero ose negativ: çdo shitje humbet para ose nuk mbulon asgjë, dhe më shumë shitje e përkeqësojnë situatën. Ndryshoni çmimin, koston ose modelin.',
    );
  }
  if (rows.every((r) => r.customers === 0)) {
    warnings.push('Skenari nuk ka asnjë klient (klientë fillestarë = 0 dhe klientë të rinj = 0), prandaj nuk ka të ardhura.');
  } else if (inputs.unitsPerCustomerPerMonth === 0) {
    warnings.push('Sasia për klient në muaj është 0, prandaj nuk ka shitje edhe pse ka klientë.');
  }
  if (terms.collectionDays > LONG_COLLECTION_DAYS) {
    warnings.push(
      `Klientët paguajnë pas ${formatNumber(terms.collectionDays)} ditësh — më shumë se ${LONG_COLLECTION_DAYS} ditë. Kjo bllokon para për kohë të gjatë dhe rrit nevojën për kapital qarkullues.`,
    );
  }
  const negative = negativeCashSq(args);
  if (negative) warnings.push(negative);
  const profitableButShort = rows.find((r) => r.operatingResult > tolerance && r.cashBalance < -tolerance);
  if (profitableButShort) {
    warnings.push(
      `Në muajin ${profitableButShort.month} rezultati operativ është pozitiv, por paraja është negative: fitimi nuk është i njëjtë me paratë e disponueshme (investimi fillestar dhe vonesat e arkëtimit ndikojnë te paraja).`,
    );
  }
  if (!inputs.includeOwnerSalary) {
    warnings.push('Paga e pronarit nuk përfshihet në kosto — rezultati operativ e mbivlerëson atë që ju mbetet.');
  }
  return warnings;
}

function totalsOf(rows: MonthRow[]): ProjectionResult['totals'] {
  const total = (pick: (r: MonthRow) => number) => sum(rows.map(pick));
  return {
    revenue: total((r) => r.revenue),
    variableCosts: total((r) => r.variableCosts),
    fixedCosts: total((r) => r.fixedCosts),
    ownerSalary: total((r) => r.ownerSalary),
    operatingResult: total((r) => r.operatingResult),
    tax: total((r) => r.tax),
    netResult: total((r) => r.netResult),
    netCashFlow: total((r) => r.netCashFlow),
  };
}

/** Projects one scenario month by month (accrual and cash), plus capital need and payback. */
export function projectScenario(rawInputs: FinancialInputs, scenario: ScenarioId): ProjectionResult {
  const inputWarnings: string[] = [];
  const base = sanitizeBase(rawInputs, inputWarnings);
  const params = cleanScenario(scenario, rawInputs.scenarios?.[scenario], inputWarnings);
  const inputs: FinancialInputs = { ...base, scenarios: { ...rawInputs.scenarios, [scenario]: params } };
  const season = normalizeSeasonality(inputs.seasonality);
  const terms = monthlyTerms(inputs, params);

  const byCategory = startupByCategory(inputs.startupCosts, inputWarnings);
  const startupTotal = sum(Object.values(byCategory));
  const openingCash = inputs.ownCapital - startupTotal;
  const accrual = accrualRows(inputs, params, season.values, terms);
  const scale = Math.max(1, inputs.ownCapital, startupTotal, sum(accrual.map((r) => r.revenue + r.variableCosts)));
  const tolerance = scale * RELATIVE_TOLERANCE;
  const rows = cashRows(accrual, terms, openingCash, tolerance);

  const unitEconomics = computeUnitEconomics({
    pricePerUnit: terms.price,
    variableCostPerUnit: terms.variableCostPerUnit,
    fixedCostsMonthly: terms.fixedCosts + terms.ownerSalary,
    unitsPerCustomerPerMonth: inputs.unitsPerCustomerPerMonth,
  });
  const capital = capitalRequirement({ rows, byCategory, inputs, terms, tolerance });
  const payback = paybackOf(rows, startupTotal, inputs.horizonMonths, inputs.currency, tolerance);
  const low = cashLow(rows, openingCash, tolerance);
  const warningsSq = [
    ...new Set([
      ...inputWarnings,
      ...season.warningsSq,
      ...projectionWarnings({ inputs, rows, terms, unitEconomics, low, startupTotal, tolerance }),
    ]),
  ];

  return {
    scenario,
    params,
    rows,
    totals: totalsOf(rows),
    unitEconomics,
    capital,
    payback,
    minCashBalance: low.minCashBalance,
    minCashMonth: low.minCashMonth,
    monthsWithNegativeCash: low.monthsWithNegativeCash,
    warningsSq,
    formulasSq: [...FORMULAS_SQ],
  };
}

export function projectAllScenarios(inputs: FinancialInputs): Record<ScenarioId, ProjectionResult> {
  return Object.fromEntries(SCENARIO_IDS.map((id) => [id, projectScenario(inputs, id)])) as Record<ScenarioId, ProjectionResult>;
}

// ─────────────────────────────────────────────────────────────────────────────
// What-if shocks and sensitivity
// ─────────────────────────────────────────────────────────────────────────────

export interface FinancialShock {
  fixedCostPct?: number; // +20 → every monthly fixed line × 1.2
  variableCostPct?: number;
  pricePct?: number;
  startupCostPct?: number;
  collectionDaysDelta?: number; // added to base collection days and to every scenario override
  newCustomersPct?: number; // applied to every scenario's monthlyNewCustomers
  churnPctPoints?: number; // absolute percentage points added to every scenario's churn (0–100)
}

function factorOf(pct: number | undefined): number {
  return Number.isFinite(pct) ? Math.max(0, 1 + (pct as number) / 100) : 1;
}

function scaleLine(line: MoneyLine, factor: number): MoneyLine {
  return {
    ...line,
    amount: line.amount * factor,
    low: typeof line.low === 'number' ? line.low * factor : line.low,
    high: typeof line.high === 'number' ? line.high * factor : line.high,
  };
}

function shiftScenario(params: ScenarioParams, shock: FinancialShock): ScenarioParams {
  const delta = Number.isFinite(shock.collectionDaysDelta) ? (shock.collectionDaysDelta as number) : 0;
  const churnDelta = Number.isFinite(shock.churnPctPoints) ? (shock.churnPctPoints as number) : 0;
  const override = params.collectionDaysOverride;
  return {
    ...params,
    monthlyNewCustomers: params.monthlyNewCustomers * factorOf(shock.newCustomersPct),
    monthlyChurnPct: Math.min(100, Math.max(0, params.monthlyChurnPct + churnDelta)),
    collectionDaysOverride: override === null || override === undefined ? override : Math.max(0, override + delta),
  };
}

/** Returns a NEW inputs object with the shock applied to the base amounts (the input is untouched). */
export function applyShock(inputs: FinancialInputs, shock: FinancialShock): FinancialInputs {
  const next = structuredClone(inputs);
  const collectionDelta = Number.isFinite(shock.collectionDaysDelta) ? (shock.collectionDaysDelta as number) : 0;
  const scenarios = Object.fromEntries(
    Object.entries(next.scenarios ?? {}).map(([id, params]) => [id, shiftScenario(params, shock)]),
  ) as Record<ScenarioId, ScenarioParams>;
  return {
    ...next,
    monthlyFixedCosts: (next.monthlyFixedCosts ?? []).map((line) => scaleLine(line, factorOf(shock.fixedCostPct))),
    startupCosts: (next.startupCosts ?? []).map((line) => scaleLine(line, factorOf(shock.startupCostPct))),
    variableCostPerUnit: next.variableCostPerUnit * factorOf(shock.variableCostPct),
    pricePerUnit: next.pricePerUnit * factorOf(shock.pricePct),
    collectionDays: Math.max(0, next.collectionDays + collectionDelta),
    scenarios,
  };
}

export type SensitivityDriver =
  | 'cmimi'
  | 'kosto_variabel'
  | 'klientet_e_rinj'
  | 'largimi'
  | 'kosto_fikse'
  | 'arketimi'
  | 'investimi_fillestar';

export interface SensitivityItem {
  driver: SensitivityDriver;
  labelSq: string;
  changeSq: string;
  baseMinCash: number;
  shockedMinCash: number;
  impactMinCash: number; // shocked − base (negative = less cash at the tightest point)
  baseTotalNet: number;
  shockedTotalNet: number;
  impactTotalNet: number;
}

/** Extra collection delay used in the sensitivity table. */
export const SENSITIVITY_COLLECTION_DAYS = 30;

/**
 * One unfavourable shock per driver, each applied alone. Churn moves by delta/4 percentage points
 * (20% → +5 points), because a relative change of a small churn rate would hardly register.
 * Sorted by |impact on minimum cash| desc, then |impact on total net result| desc.
 */
export function sensitivityAnalysis(inputs: FinancialInputs, scenario: ScenarioId = 'baze', deltaPct = 20): SensitivityItem[] {
  const delta = Number.isFinite(deltaPct) ? Math.abs(deltaPct) : 20;
  const pct = formatNumber(delta);
  const drivers: { driver: SensitivityDriver; labelSq: string; changeSq: string; shock: FinancialShock }[] = [
    { driver: 'cmimi', labelSq: 'Çmimi për njësi', changeSq: `−${pct}%`, shock: { pricePct: -delta } },
    { driver: 'kosto_variabel', labelSq: 'Kostoja variabël për njësi', changeSq: `+${pct}%`, shock: { variableCostPct: delta } },
    { driver: 'klientet_e_rinj', labelSq: 'Klientët e rinj në muaj', changeSq: `−${pct}%`, shock: { newCustomersPct: -delta } },
    {
      driver: 'largimi',
      labelSq: 'Largimi mujor i klientëve',
      changeSq: `+${formatNumber(delta / 4)} pikë përqindjeje`,
      shock: { churnPctPoints: delta / 4 },
    },
    { driver: 'kosto_fikse', labelSq: 'Kostot fikse mujore', changeSq: `+${pct}%`, shock: { fixedCostPct: delta } },
    {
      driver: 'arketimi',
      labelSq: 'Vonesa e arkëtimit nga klientët',
      changeSq: `+${SENSITIVITY_COLLECTION_DAYS} ditë`,
      shock: { collectionDaysDelta: SENSITIVITY_COLLECTION_DAYS },
    },
    { driver: 'investimi_fillestar', labelSq: 'Investimi fillestar', changeSq: `+${pct}%`, shock: { startupCostPct: delta } },
  ];

  const base = projectScenario(inputs, scenario);
  const items = drivers.map(({ driver, labelSq, changeSq, shock }): SensitivityItem => {
    const shocked = projectScenario(applyShock(inputs, shock), scenario);
    return {
      driver,
      labelSq,
      changeSq,
      baseMinCash: base.minCashBalance,
      shockedMinCash: shocked.minCashBalance,
      impactMinCash: shocked.minCashBalance - base.minCashBalance,
      baseTotalNet: base.totals.netResult,
      shockedTotalNet: shocked.totals.netResult,
      impactTotalNet: shocked.totals.netResult - base.totals.netResult,
    };
  });
  // Array.prototype.sort is stable, so equal impacts keep the declaration order above.
  return items.sort((a, b) => byMagnitudeDesc(a.impactMinCash, b.impactMinCash) || byMagnitudeDesc(a.impactTotalNet, b.impactTotalNet));
}

/** Descending by absolute value; float noise between nominally equal impacts counts as a tie. */
function byMagnitudeDesc(a: number, b: number): number {
  const difference = Math.abs(b) - Math.abs(a);
  return Math.abs(difference) <= RELATIVE_TOLERANCE * Math.max(1, Math.abs(a), Math.abs(b)) ? 0 : difference;
}
