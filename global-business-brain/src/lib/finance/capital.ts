/**
 * Sugjerime për të ulur kapitalin e nevojshëm (deterministic, greedy, explainable).
 *
 * Order of steps (each applied only while the target is still missed):
 *   1. disable optional startup lines, largest first;
 *   2. halve initial-inventory lines (start smaller, restock from real sales);
 *   3. reduce the safety reserve to 1 month;
 *   4. disable optional monthly lines, largest first.
 * A non-optional cost is never set to zero. When the target cannot be met the note says so plainly
 * instead of hiding costs — the business may simply not fit that capital.
 */
import type { FinancialInputs, MoneyLine, ScenarioId } from '@/lib/domain/types';
import { projectScenario } from '@/lib/finance/engine';
import { formatMoney } from '@/lib/finance/format';

export interface CapitalChange {
  lineId: string | null; // null for model-level settings (e.g. reserve months)
  labelSq: string;
  from: number;
  to: number;
  reasonSq: string;
}

export interface CapitalReductionResult {
  changes: CapitalChange[];
  inputs: FinancialInputs; // a new object; the caller's inputs are untouched
  resultingTotal: number;
  reachesTarget: boolean;
  noteSq: string;
}

type Step = (draft: FinancialInputs) => CapitalChange | null;

const REASON_OPTIONAL_STARTUP =
  'Zë opsional: mund të shmanget ose të shtyhet (p.sh. duke përdorur mjete që keni ose duke e blerë pasi të vijnë klientët e parë).';
const REASON_INVENTORY = 'Nisni me gjysmën e inventarit fillestar dhe rimbusheni sipas shitjeve reale — rrezik mungese malli në javët e para.';
const REASON_RESERVE = 'Rezervë më e vogël do të thotë më pak mbrojtje nga vonesat e pagesave dhe muajt e dobët — rrezik më i lartë.';
const REASON_OPTIONAL_MONTHLY = 'Kosto mujore opsionale: në fillim mund ta bëni vetë, por kjo kërkon kohën tuaj.';
const DISABLED_NOTE = 'Çaktivizuar si sugjerim për të ulur kapitalin e nevojshëm.';
const HALVED_NOTE = 'Përgjysmuar si sugjerim për të ulur kapitalin e nevojshëm.';

function byAmountDesc(lines: readonly MoneyLine[], keep: (line: MoneyLine) => boolean): number[] {
  return lines
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => line.enabled && line.amount > 0 && keep(line))
    .sort((a, b) => b.line.amount - a.line.amount || a.line.id.localeCompare(b.line.id) || a.index - b.index)
    .map(({ index }) => index);
}

function appendNote(line: MoneyLine, note: string): string {
  return `${line.sourceNoteSq} ${note}`.trim();
}

function disableLineStep(list: 'startupCosts' | 'monthlyFixedCosts', index: number, reasonSq: string): Step {
  return (draft) => {
    const line = draft[list][index];
    if (!line?.enabled) return null;
    draft[list][index] = { ...line, enabled: false, sourceNoteSq: appendNote(line, DISABLED_NOTE) };
    return { lineId: line.id, labelSq: line.labelSq, from: line.amount, to: 0, reasonSq };
  };
}

function halveInventoryStep(index: number): Step {
  return (draft) => {
    const line = draft.startupCosts[index];
    if (!line?.enabled) return null;
    const to = line.amount / 2;
    draft.startupCosts[index] = { ...line, amount: to, sourceNoteSq: appendNote(line, HALVED_NOTE) };
    return { lineId: line.id, labelSq: line.labelSq, from: line.amount, to, reasonSq: REASON_INVENTORY };
  };
}

const reserveStep: Step = (draft) => {
  if (!(draft.reserveMonths > 1)) return null;
  const from = draft.reserveMonths;
  draft.reserveMonths = 1;
  return { lineId: null, labelSq: 'Rezerva e sigurisë (muaj kosto fikse)', from, to: 1, reasonSq: REASON_RESERVE };
};

/** The full, deterministic step list computed once from the starting inputs. */
function plannedSteps(inputs: FinancialInputs): Step[] {
  const optionalStartup = byAmountDesc(inputs.startupCosts, (l) => l.optional === true);
  const inventory = byAmountDesc(inputs.startupCosts, (l) => l.category === 'inventar' && l.optional !== true);
  const optionalMonthly = byAmountDesc(inputs.monthlyFixedCosts, (l) => l.optional === true);
  return [
    ...optionalStartup.map((i) => disableLineStep('startupCosts', i, REASON_OPTIONAL_STARTUP)),
    ...inventory.map((i) => halveInventoryStep(i)),
    reserveStep,
    ...optionalMonthly.map((i) => disableLineStep('monthlyFixedCosts', i, REASON_OPTIONAL_MONTHLY)),
  ];
}

/** Proposes the smallest ordered set of reductions that brings the capital need to the target. */
export function suggestCapitalReductions(
  inputs: FinancialInputs,
  targetTotalRequired: number,
  scenario: ScenarioId = 'baze',
): CapitalReductionResult {
  const target = Number.isFinite(targetTotalRequired) ? Math.max(0, targetTotalRequired) : 0;
  const money = (v: number) => formatMoney(v, inputs.currency);
  const draft = structuredClone(inputs);
  const totalOf = () => projectScenario(draft, scenario).capital.totalRequired;
  const tolerance = 1e-9 * Math.max(1, target);
  const initialTotal = totalOf();
  let total = initialTotal;
  const changes: CapitalChange[] = [];

  for (const step of plannedSteps(draft)) {
    if (total <= target + tolerance) break;
    const change = step(draft);
    if (!change) continue;
    changes.push(change);
    total = totalOf();
  }

  const reachesTarget = total <= target + tolerance;
  let noteSq: string;
  if (changes.length === 0 && reachesTarget) {
    noteSq = `Kapitali i nevojshëm (${money(total)}) është tashmë brenda objektivit (${money(target)}); nuk nevojitet asnjë ulje.`;
  } else if (reachesTarget) {
    noteSq = `Me ${changes.length} ndryshime kapitali i nevojshëm bie nga ${money(initialTotal)} në ${money(total)}, brenda objektivit ${money(target)}. Çdo ulje ka një çmim (më shumë punë vetjake, më pak rezervë ose më pak mall) — shqyrtoni arsyet para se t’i pranoni.`;
  } else {
    noteSq = `Edhe pas të gjitha uljeve të mundshme, kapitali i nevojshëm mbetet ${money(total)}, mbi objektivin ${money(target)}. Disa kosto nuk mund të hiqen pa ndryshuar vetë biznesin — me këtë kapital ky biznes mund të mos jetë i realizueshëm në këtë formë. Mund të provoni një version më të vogël ose të grumbulloni më shumë kapital para nisjes.`;
  }

  return { changes, inputs: draft, resultingTotal: total, reachesTarget, noteSq };
}
