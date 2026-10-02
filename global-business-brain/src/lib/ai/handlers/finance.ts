/**
 * Mjetet financiare të asistentit: skenarë "çfarë ndodh nëse" dhe përshtatja me kapital më të vogël.
 *
 * These are the only places the assistant gets financial numbers from. Both run the deterministic
 * engine (`applyShock` + `projectScenario`, `suggestCapitalReductions`) on the project's saved
 * inputs and never modify the project: results are proposals the user may apply in the calculator.
 */
import type { FinancialInputs, ProjectionResult, ScenarioId } from '@/lib/domain/types';
import { SCENARIO_LABELS } from '@/lib/domain/taxonomy';
import { applyShock, projectScenario, type FinancialShock } from '@/lib/finance/engine';
import { suggestCapitalReductions } from '@/lib/finance/capital';
import { formatNumber } from '@/lib/finance/format';
import {
  moneySq,
  requireArchetype,
  requireProject,
  signedMoneySq,
  signedNumberSq,
  ToolError,
  type ToolEnv,
} from '@/lib/ai/handlers/shared';

type MetricKind = 'money' | 'units' | 'month';

interface MetricDef {
  key: string;
  labelSq: string;
  kind: MetricKind;
  get: (p: ProjectionResult) => number | null;
}

/** The before/after figures every scenario answer reports, in a fixed order. */
export const SCENARIO_METRICS: readonly MetricDef[] = [
  { key: 'totalRevenue', labelSq: 'Të ardhurat totale', kind: 'money', get: (p) => p.totals.revenue },
  { key: 'operatingResult', labelSq: 'Rezultati operativ total', kind: 'money', get: (p) => p.totals.operatingResult },
  { key: 'minCash', labelSq: 'Arka më e ulët', kind: 'money', get: (p) => p.minCashBalance },
  { key: 'capitalRequired', labelSq: 'Kapitali i nevojshëm', kind: 'money', get: (p) => p.capital.totalRequired },
  { key: 'breakEvenUnits', labelSq: 'Pika e barazimit (njësi në muaj)', kind: 'units', get: (p) => p.unitEconomics.breakEvenUnitsPerMonth },
  { key: 'paybackMonth', labelSq: 'Muaji kur rikuperohet investimi fillestar', kind: 'month', get: (p) => p.payback.recoveredInMonth },
];

function metricSq(kind: MetricKind, value: number | null, currency: string): string {
  if (kind === 'money') return moneySq(value, currency);
  if (kind === 'units') return value === null ? 'nuk arrihet (kontributi për njësi ≤ 0)' : formatNumber(value, 1);
  return value === null ? 'nuk rikuperohet brenda horizontit të modelit' : `muaji ${value}`;
}

function changeSq(kind: MetricKind, before: number | null, after: number | null, currency: string): string {
  if (before === null || after === null) return '—';
  if (kind === 'money') return signedMoneySq(after - before, currency);
  if (kind === 'units') return signedNumberSq(after - before, 1);
  return signedNumberSq(after - before, 0) + ' muaj';
}

export interface MetricComparison {
  key: string;
  labelSq: string;
  before: number | null;
  after: number | null;
  beforeSq: string;
  afterSq: string;
  changeSq: string;
}

export function compareProjections(before: ProjectionResult, after: ProjectionResult, currency: string): MetricComparison[] {
  return SCENARIO_METRICS.map((m) => {
    const b = m.get(before);
    const a = m.get(after);
    return {
      key: m.key,
      labelSq: m.labelSq,
      before: b,
      after: a,
      beforeSq: metricSq(m.kind, b, currency),
      afterSq: metricSq(m.kind, a, currency),
      changeSq: changeSq(m.kind, b, a, currency),
    };
  });
}

function addMoneyCalculations(env: ToolEnv, rows: MetricComparison[], scenario: ScenarioId, currency: string): void {
  for (const row of rows) {
    const def = SCENARIO_METRICS.find((m) => m.key === row.key);
    if (def?.kind !== 'money' || row.before === null || row.after === null) continue;
    env.addCalculation({ labelSq: row.labelSq, scenario, before: row.before, after: row.after, currency });
  }
}

const SHOCK_LABELS: Record<keyof FinancialShock, { labelSq: string; unit: 'pct' | 'days' | 'points' }> = {
  fixedCostPct: { labelSq: 'kostot fikse mujore', unit: 'pct' },
  variableCostPct: { labelSq: 'kostoja variabël për njësi', unit: 'pct' },
  pricePct: { labelSq: 'çmimi për njësi', unit: 'pct' },
  startupCostPct: { labelSq: 'investimi fillestar', unit: 'pct' },
  collectionDaysDelta: { labelSq: 'vonesa e arkëtimit nga klientët', unit: 'days' },
  newCustomersPct: { labelSq: 'klientët e rinj në muaj', unit: 'pct' },
  churnPctPoints: { labelSq: 'largimi mujor i klientëve', unit: 'points' },
};

/** "kostot fikse mujore +20%, vonesa e arkëtimit nga klientët +30 ditë". */
export function describeShockSq(shock: FinancialShock): string {
  const parts = (Object.keys(SHOCK_LABELS) as (keyof FinancialShock)[])
    .filter((key) => typeof shock[key] === 'number' && shock[key] !== 0)
    .map((key) => {
      const value = shock[key] as number;
      const { labelSq, unit } = SHOCK_LABELS[key];
      const suffix = unit === 'pct' ? '%' : unit === 'days' ? ' ditë' : ' pikë përqindjeje';
      return `${labelSq} ${signedNumberSq(value)}${suffix}`;
    });
  return parts.length > 0 ? parts.join(', ') : 'asnjë ndryshim';
}

export interface ScenarioInput {
  scenario?: ScenarioId;
  shock: FinancialShock;
}

export function runFinancialScenario(input: ScenarioInput, env: ToolEnv) {
  const project = requireProject(env.ctx);
  const scenario = input.scenario ?? 'baze';
  const inputs = project.financialInputs;
  const before = projectScenario(inputs, scenario);
  const after = projectScenario(applyShock(inputs, input.shock), scenario);
  const metrics = compareProjections(before, after, inputs.currency);
  addMoneyCalculations(env, metrics, scenario, inputs.currency);
  return {
    currency: inputs.currency,
    scenario,
    scenarioSq: SCENARIO_LABELS[scenario],
    horizonMonths: before.rows.length,
    shock: input.shock,
    shockSq: describeShockSq(input.shock),
    metrics,
    minCashMonth: { before: before.minCashMonth, after: after.minCashMonth },
    monthsWithNegativeCash: { before: before.monthsWithNegativeCash, after: after.monthsWithNegativeCash },
    paybackStatementSq: { before: before.payback.statementSq, after: after.payback.statementSq },
    warningsSq: [...new Set([...before.warningsSq, ...after.warningsSq])],
    noteSq:
      'Llogaritje deterministe e motorit financiar mbi supozimet e ruajtura të projektit (supozim, jo fakt). Projekti nuk ndryshohet; nuk është garanci rezultati.',
  };
}

export function adaptToCapital(input: { targetCapital: number }, env: ToolEnv) {
  const project = requireProject(env.ctx);
  const archetype = requireArchetype(env.ctx);
  const inputs: FinancialInputs = project.financialInputs;
  const currency = inputs.currency;
  if (!(input.targetCapital > 0)) throw new ToolError('Kapitali i synuar duhet të jetë më i madh se zero.');
  const before = env.ctx.baseProjection ?? projectScenario(inputs, 'baze');
  const reduction = suggestCapitalReductions(inputs, input.targetCapital, 'baze');
  const after = projectScenario(reduction.inputs, 'baze');
  const metrics = compareProjections(before, after, currency);
  addMoneyCalculations(env, metrics.filter((m) => m.key === 'capitalRequired' || m.key === 'minCash'), 'baze', currency);
  return {
    currency,
    scenario: 'baze' as const,
    currentRequired: before.capital.totalRequired,
    currentRequiredSq: moneySq(before.capital.totalRequired, currency),
    targetCapital: input.targetCapital,
    targetCapitalSq: moneySq(input.targetCapital, currency),
    resultingTotal: reduction.resultingTotal,
    resultingTotalSq: moneySq(reduction.resultingTotal, currency),
    reachesTarget: reduction.reachesTarget,
    changes: reduction.changes.map((c) => ({
      labelSq: c.labelSq,
      from: c.from,
      to: c.to,
      fromSq: c.lineId === null ? formatNumber(c.from) : moneySq(c.from, currency),
      toSq: c.lineId === null ? formatNumber(c.to) : moneySq(c.to, currency),
      reasonSq: c.reasonSq,
    })),
    metrics,
    noteSq: reduction.noteSq,
    lowCapitalTest: {
      kind: 'supozim',
      zeroCapitalTestSq: archetype.zeroCapitalTestSq,
      cheapestTestSq: archetype.cheapestTestSq,
    },
    disclaimerSq: 'Sugjerime të motorit financiar; asgjë nuk ndryshohet në projekt pa i pranuar ju në kalkulator.',
  };
}
