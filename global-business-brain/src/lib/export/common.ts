/**
 * Pjesët e përbashkëta të eksporteve (Excel + PDF): kontrata e hyrjes, tekstet e paralajmërimeve
 * dhe ndihmës të vegjël për etiketat shqip.
 *
 * Both exporters render the same project snapshot, so the wording of the DEMO warning, the plan
 * disclaimer and the owner-salary / tax statements lives here once. Every number comes from the
 * deterministic finance engine output passed in `projections`; nothing is recomputed differently.
 */
import type {
  BusinessArchetype,
  Citation,
  CostSourceKind,
  FinancialInputs,
  IsoTimestamp,
  MoneyLine,
  MonthlyCategory,
  PhaseId,
  Plan,
  PlanProgress,
  PlanTask,
  Project,
  ProjectionResult,
  ScenarioId,
  StartupCategory,
  UnitEconomics,
} from '@/lib/domain/types';
import { MONTHLY_CATEGORY_LABELS, PHASE_TITLES, STARTUP_CATEGORY_LABELS } from '@/lib/domain/taxonomy';
import { getIndicator } from '@/lib/data/indicators';
import { formatNumber } from '@/lib/finance/format';
import { MONTHS_SQ } from '@/lib/finance/locale';

/** Everything an export needs; assembled server-side from the stored project (see export API route). */
export interface ExportInput {
  project: Project;
  archetype: BusinessArchetype;
  projections: Record<ScenarioId, ProjectionResult>;
  plan: Plan;
  progress: PlanProgress;
  tasks: PlanTask[]; // current task statuses (may differ from plan.tasks defaults)
  citations: Citation[];
  countryNameSq: string;
  generatedAt: IsoTimestamp;
}

export const EXPORT_CREATOR = 'Global Business Brain';

/** Order in which scenarios are shown everywhere: the base case first, then the two alternatives. */
export const EXPORT_SCENARIOS: readonly ScenarioId[] = ['baze', 'konservator', 'optimist'];

export const DEMO_BANNER_SQ = 'DEMO — TË DHËNA FIKTIVE';
export const DEMO_WARNING_SQ =
  'Ky projekt përdor të dhëna DEMO (fiktive). Shifrat shërbejnë vetëm për të provuar aplikacionin dhe nuk janë për vendime reale.';

export const PLAN_DISCLAIMER_SQ =
  'Ky plan bazohet në supozime dhe të dhënat e burimeve me datat përkatëse; nuk garanton fitim. Përqindja mat përfundimin e planit, jo probabilitetin e suksesit.';

export const ASSUMPTIONS_NOT_GUARANTEES_SQ =
  'Të gjitha shifrat financiare janë supozime dhe parashikime të motorit deterministik të aplikacionit, jo garanci fitimi apo datë e garantuar rikuperimi.';

export const NO_FINANCING_SQ =
  'Nuk supozohet asnjë kredi, grant apo financim tjetër: paraja vjen vetëm nga kapitali vetjak dhe nga arkëtimet nga klientët.';

export const COST_SOURCE_LABELS_SQ: Record<CostSourceKind, string> = {
  supozim: 'Supozim',
  oferte: 'Ofertë e marrë',
  verifikuar: 'E verifikuar',
  perdoruesi: 'Vendosur nga ju',
};

export function isDemoProject(input: ExportInput): boolean {
  return input.project.dataSnapshot.isDemo === true;
}

export function ownerSalaryStatementSq(inputs: FinancialInputs, money: (value: number) => string): string {
  if (inputs.includeOwnerSalary) {
    return `Paga e pronarit përfshihet në kosto: ${money(inputs.ownerSalaryMonthly)} në muaj.`;
  }
  return 'Paga e pronarit NUK përfshihet në kosto — rezultati operativ e mbivlerëson atë që ju mbetet.';
}

export function taxStatementSq(inputs: FinancialInputs): string {
  const rate = `${formatNumber(inputs.profitTaxPct, 2)}%`;
  if (inputs.profitTaxPct > 0) return `Tatimi mbi fitimin i vendosur në model: ${rate} (thjeshtim; norma reale kërkon verifikim lokal).`;
  return `Tatimi mbi fitimin: ${rate} — Kërkon verifikim lokal.`;
}

export function categoryLabelSq(category: StartupCategory | MonthlyCategory): string {
  return (
    (STARTUP_CATEGORY_LABELS as Record<string, string>)[category] ??
    (MONTHLY_CATEGORY_LABELS as Record<string, string>)[category] ??
    category
  );
}

/** Amount the engine actually uses (it clamps invalid / negative money values to 0). */
export function engineAmount(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function engineLineAmount(line: MoneyLine): number {
  return engineAmount(line.amount);
}

export function sumEnabledLines(lines: readonly MoneyLine[]): number {
  return lines.reduce((sum, line) => (line.enabled ? sum + engineLineAmount(line) : sum), 0);
}

export function monthNameSq(calendarMonth: number): string {
  return MONTHS_SQ[calendarMonth - 1] ?? String(calendarMonth);
}

export function cityLabelSq(city: string | null | undefined): string {
  return city && city.trim() ? city.trim() : 'Pa specifikuar';
}

export function phaseRangeSq(id: PhaseId): string {
  return PHASE_TITLES[id]?.range ?? id;
}

export function dependenciesSq(ids: readonly PhaseId[]): string {
  return ids.length > 0 ? ids.map(phaseRangeSq).join(', ') : 'Asnjë';
}

export function indicatorNameSq(code: string | undefined): string {
  if (!code) return '—';
  return getIndicator(code)?.nameSq ?? code;
}

/** Unit of a cited value: the citation's own label, else the indicator catalogue's. */
export function citationUnitSq(citation: Citation): string {
  return citation.unitLabelSq ?? (citation.indicatorCode ? getIndicator(citation.indicatorCode)?.unitLabelSq : undefined) ?? '';
}

/** Tasks of a 7/30/90-day horizon, with current statuses taken from `input.tasks`. */
export function horizonTasks(input: ExportInput, key: keyof Plan['horizons']): PlanTask[] {
  const current = new Map(input.tasks.map((t) => [t.id, t]));
  const planned = new Map(input.plan.tasks.map((t) => [t.id, t]));
  return (input.plan.horizons[key] ?? [])
    .map((id) => current.get(id) ?? planned.get(id))
    .filter((t): t is PlanTask => Boolean(t));
}

/** One sentence for the monthly break-even, or the engine's explanation when it cannot exist. */
export function breakEvenSq(ue: UnitEconomics, unitLabelSq: string): string {
  if (ue.status !== 'ok' || ue.breakEvenUnitsPerMonth === null) return ue.explanationSq;
  const customers =
    ue.breakEvenCustomersPerMonth === null ? '' : ` (rreth ${formatNumber(ue.breakEvenCustomersPerMonth, 1)} klientë)`;
  return `${formatNumber(ue.breakEvenUnitsPerMonth, 1)} ${unitLabelSq} në muaj${customers}.`;
}

/** Completion is floored, like the plan module's own label, so progress is never overstated. */
export function completionPctSq(pct: number | null | undefined): string {
  return typeof pct === 'number' && Number.isFinite(pct) ? `${Math.floor(pct)}%` : '—';
}

/** "0 = para nisjes" — month 0 is the opening balance after the startup spend. */
export function minCashMonthSq(month: number | null): string {
  if (month === null) return '—';
  return month === 0 ? 'muaji 0 (para nisjes, pas investimit fillestar)' : `muaji ${month}`;
}
