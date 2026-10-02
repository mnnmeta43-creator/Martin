/**
 * Përshtatja e idesë me një kapital më të ulët (adapt an idea's model to a lower capital target).
 *
 * Archetype-aware steps run first — assets the user already owns, starting from home when the
 * idea allows it and the profile accepts it, used or simpler equipment at the low end of the
 * library range — then the generic, explainable reductions of `finance/capital`. Every change is
 * listed in Albanian with its cost. When the target cannot be met (or is zero), the note says
 * honestly which costs remain and that with no capital only demand can be tested.
 */
import type { BusinessArchetype, CostItemTemplate, FinancialInputs, MoneyLine, UserProfile } from '@/lib/domain/types';
import { assetLabel } from '@/lib/domain/taxonomy';
import { suggestCapitalReductions } from '@/lib/finance/capital';
import { projectScenario } from '@/lib/finance/engine';
import { formatMoney, formatNumber } from '@/lib/finance/format';

export interface AdaptResult {
  inputs: FinancialInputs; // a new object; the caller's inputs are untouched
  changesSq: string[];
  reachesTarget: boolean;
  noteSq: string;
  initialTotal: number; // capital required before any change (base scenario)
  resultingTotal: number; // capital required after the applied changes
}

type LineList = 'startupCosts' | 'monthlyFixedCosts';

const RENT_DEPOSIT_PATTERN = /qira|lokal|ambient/i;
const MAX_LISTED_COSTS = 5;
const SUGGESTION_PREFIX = 'Sugjerim (pa u aplikuar):';

interface Draft {
  inputs: FinancialInputs;
  changesSq: string[];
  applied: number;
  money: (v: number) => string;
  total: () => number;
}

function appendNote(line: MoneyLine, note: string): string {
  return `${line.sourceNoteSq} ${note}`.trim();
}

function disableLine(draft: Draft, list: LineList, index: number, reasonSq: string): void {
  const line = draft.inputs[list][index];
  draft.inputs[list][index] = { ...line, enabled: false, sourceNoteSq: appendNote(line, reasonSq) };
  draft.changesSq.push(`«${line.labelSq}»: ${draft.money(line.amount)} → ${draft.money(0)} — ${reasonSq}`);
  draft.applied += 1;
}

function templatesById(a: BusinessArchetype): Map<string, CostItemTemplate> {
  return new Map([...a.startupCosts, ...a.monthlyFixedCosts].map((t) => [t.id, t]));
}

/** Lines the user does not need to buy because they already own a listed asset (no downside). */
function applyOwnedAssets(draft: Draft, a: BusinessArchetype, profile: UserProfile): void {
  const owned = new Set(profile.assets);
  const templates = templatesById(a);
  for (const list of ['startupCosts', 'monthlyFixedCosts'] as const) {
    draft.inputs[list].forEach((line, index) => {
      const avoidedBy = (templates.get(line.id)?.avoidedByAssets ?? []).filter((id) => owned.has(id));
      if (!line.enabled || line.amount <= 0 || avoidedBy.length === 0) return;
      disableLine(draft, list, index, `e keni tashmë: ${avoidedBy.map(assetLabel).join(', ')}.`);
    });
  }
}

function rentIndexes(inputs: FinancialInputs): { list: LineList; index: number }[] {
  const monthly = inputs.monthlyFixedCosts
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => line.enabled && line.amount > 0 && line.category === 'qira')
    .map(({ index }) => ({ list: 'monthlyFixedCosts' as const, index }));
  // A deposit is treated as a rent deposit only when its label says so; other deposits stay.
  const deposits = inputs.startupCosts
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => line.enabled && line.amount > 0 && line.category === 'depozita' && RENT_DEPOSIT_PATTERN.test(line.labelSq))
    .map(({ index }) => ({ list: 'startupCosts' as const, index }));
  return [...monthly, ...deposits];
}

function applyHomeStart(draft: Draft, a: BusinessArchetype, profile: UserProfile): void {
  if (!a.canStartFromHome) return;
  const targets = rentIndexes(draft.inputs);
  if (targets.length === 0) return;
  if (!profile.startLocations.includes('shtepi')) {
    const labels = targets.map(({ list, index }) => `«${draft.inputs[list][index].labelSq}»`).join(', ');
    draft.changesSq.push(
      `${SUGGESTION_PREFIX} ideja mund të niset nga shtëpia, por profili juaj nuk e pranon këtë mundësi. Nëse e rishqyrtoni, në fillim mund të shmangen: ${labels}.`,
    );
    return;
  }
  for (const { list, index } of targets) {
    disableLine(
      draft,
      list,
      index,
      'nisje nga shtëpia: ideja mund të niset pa lokal. Kjo kërkon hapësirë të përshtatshme në banesë dhe mund të kërkojë leje për punë nga shtëpia (Kërkon verifikim lokal).',
    );
  }
}

/** Equipment at the low end of the library range (used or simpler), largest saving first. */
function applyUsedEquipment(draft: Draft, target: number, tolerance: number): void {
  const candidates = draft.inputs.startupCosts
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => line.enabled && line.category === 'pajisje' && typeof line.low === 'number' && line.low >= 0 && line.low < line.amount)
    .sort((x, y) => y.line.amount - (y.line.low ?? 0) - (x.line.amount - (x.line.low ?? 0)) || x.line.id.localeCompare(y.line.id));
  for (const { index } of candidates) {
    if (draft.total() <= target + tolerance) return;
    const line = draft.inputs.startupCosts[index];
    const to = line.low ?? line.amount;
    const reasonSq =
      'pajisje e përdorur ose më e thjeshtë, në skajin e ulët të supozimit të bibliotekës. Kontrolloni gjendjen dhe sigurinë, dhe zëvendësojeni me një ofertë reale.';
    draft.inputs.startupCosts[index] = { ...line, amount: to, sourceNoteSq: appendNote(line, reasonSq) };
    draft.changesSq.push(`«${line.labelSq}»: ${draft.money(line.amount)} → ${draft.money(to)} — ${reasonSq}`);
    draft.applied += 1;
  }
}

function applyGenericReductions(draft: Draft, target: number): void {
  const result = suggestCapitalReductions(draft.inputs, target, 'baze');
  draft.inputs = result.inputs;
  for (const c of result.changes) {
    const range = c.lineId === null ? `${formatNumber(c.from)} → ${formatNumber(c.to)} muaj` : `${draft.money(c.from)} → ${draft.money(c.to)}`;
    draft.changesSq.push(`«${c.labelSq}»: ${range} — ${c.reasonSq}`);
    draft.applied += 1;
  }
}

/** What still has to be paid in the smallest version of the business, largest first. */
function remainingCostsSq(draft: Draft): string {
  const projection = projectScenario(draft.inputs, 'baze');
  const lines = draft.inputs.startupCosts
    .filter((l) => l.enabled && l.amount > 0)
    .sort((x, y) => y.amount - x.amount || x.id.localeCompare(y.id))
    .slice(0, MAX_LISTED_COSTS)
    .map((l) => `«${l.labelSq}» (${draft.money(l.amount)})`);
  const listSq = lines.length > 0 ? `Kostot e nisjes që mbeten: ${lines.join(', ')}. ` : '';
  const { startupTotal, maxOperatingDeficit, reserve } = projection.capital;
  return `${listSq}Kapitali i nevojshëm përbëhet nga investimi fillestar ${draft.money(startupTotal)}, deficiti i operimit derisa arkëtimet të mbulojnë kostot ${draft.money(maxOperatingDeficit)} dhe rezerva ${draft.money(reserve)}.`;
}

function noteSq(a: BusinessArchetype, draft: Draft, initial: number, total: number, target: number, reaches: boolean, zeroTarget: boolean): string {
  const m = draft.money;
  if (reaches && draft.applied === 0) {
    return `Kapitali i nevojshëm (${m(total)}) është tashmë brenda objektivit (${m(target)}); nuk nevojitet asnjë ulje.`;
  }
  if (reaches) {
    return `Me ${draft.applied} ndryshime, kapitali i nevojshëm sipas skenarit bazë bie nga ${m(initial)} në ${m(total)}, brenda objektivit ${m(target)}. Çdo ulje ka një çmim (më shumë punë vetjake, pajisje më të thjeshta, më pak rezervë ose më pak mall) — shqyrtojini para se t’i pranoni. Shifrat janë supozime, jo oferta.`;
  }
  const remaining = remainingCostsSq(draft);
  if (zeroTarget) {
    return `Me kapital zero ky biznes nuk mund të niset në këtë formë: edhe versioni më i vogël kërkon rreth ${m(total)} sipas supozimeve. ${remaining} Me zero kapital mund të testoni vetëm kërkesën, pa nisur biznesin: ${a.zeroCapitalTestSq}`;
  }
  return `Edhe pas të gjitha uljeve të mundshme, kapitali i nevojshëm mbetet ${m(total)}, mbi objektivin ${m(target)}. ${remaining} Këto kosto nuk hiqen pa ndryshuar vetë biznesin. Ndërkohë mund të testoni kërkesën pa para: ${a.zeroCapitalTestSq}`;
}

/**
 * Brings the base-scenario capital requirement towards `targetCapital` (in `inputs.currency`).
 * A target ≤ 0 still produces the smallest possible version, so the note can name what remains.
 */
export function adaptToLowerCapital(
  a: BusinessArchetype,
  profile: UserProfile,
  inputs: FinancialInputs,
  targetCapital: number,
): AdaptResult {
  const target = Number.isFinite(targetCapital) ? Math.max(0, targetCapital) : 0;
  const zeroTarget = target <= 0;
  const tolerance = 1e-9 * Math.max(1, target);
  const draft: Draft = {
    inputs: structuredClone(inputs),
    changesSq: [],
    applied: 0,
    money: (v) => formatMoney(v, inputs.currency),
    total: () => projectScenario(draft.inputs, 'baze').capital.totalRequired,
  };
  const initialTotal = draft.total();

  applyOwnedAssets(draft, a, profile);
  if (draft.total() > target + tolerance) applyHomeStart(draft, a, profile);
  applyUsedEquipment(draft, target, tolerance);
  if (draft.total() > target + tolerance) applyGenericReductions(draft, target);

  const resultingTotal = draft.total();
  const reachesTarget = resultingTotal <= target + tolerance;
  return {
    inputs: draft.inputs,
    changesSq: draft.changesSq,
    reachesTarget,
    noteSq: noteSq(a, draft, initialTotal, resultingTotal, target, reachesTarget, zeroTarget),
    initialTotal,
    resultingTotal,
  };
}
