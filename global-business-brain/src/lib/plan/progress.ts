/**
 * Progresi i planit: weighted completion of plan tasks, overall and per phase.
 *
 * Completion measures how many plan steps are done — never the chance that the business
 * succeeds; the label says so explicitly at 100%. Skipped tasks ('anashkaluar') leave both the
 * numerator and the denominator. Only 'perfunduar' counts as done ('ne_progres' counts as 0).
 * Pure and client-safe: imported by the task board in the browser.
 */
import type { PhaseId, PlanProgress, PlanTask } from '@/lib/domain/types';
import { PHASE_IDS } from '@/lib/domain/taxonomy';

export const COMPLETE_LABEL_SQ = 'Të gjithë hapat e planit janë kryer — kjo nuk garanton suksesin e biznesit.';
export const EMPTY_LABEL_SQ = 'Plani nuk ka ende detyra për t’u ndjekur.';
export const ALL_SKIPPED_LABEL_SQ = 'Të gjitha detyrat janë shënuar si të anashkaluara; nuk ka hapa për të matur.';

/** Highest value shown while at least one counted task is still open (avoids rounding up to 100). */
const MAX_INCOMPLETE_PCT = 99.9;

interface Tally {
  doneWeight: number;
  totalWeight: number;
  done: number;
  total: number;
}

/** Missing or invalid weights fall back to 1; an explicit 0 keeps the task out of the percentage. */
function weightOf(task: PlanTask): number {
  return typeof task.weight === 'number' && Number.isFinite(task.weight) && task.weight >= 0 ? task.weight : 1;
}

function tally(tasks: readonly PlanTask[]): Tally {
  const t: Tally = { doneWeight: 0, totalWeight: 0, done: 0, total: 0 };
  for (const task of tasks) {
    if (task.status === 'anashkaluar') continue;
    const w = weightOf(task);
    t.total += 1;
    t.totalWeight += w;
    if (task.status === 'perfunduar') {
      t.done += 1;
      t.doneWeight += w;
    }
  }
  return t;
}

function percent(t: Tally): number {
  if (t.totalWeight <= 0) return t.total > 0 && t.done === t.total ? 100 : 0;
  if (t.doneWeight >= t.totalWeight) return 100;
  const pct = Math.round((t.doneWeight / t.totalWeight) * 1000) / 10;
  return Math.min(pct, MAX_INCOMPLETE_PCT);
}

function labelOf(t: Tally, pct: number, taskCount: number): string {
  if (t.total === 0) return taskCount > 0 ? ALL_SKIPPED_LABEL_SQ : EMPTY_LABEL_SQ;
  if (pct >= 100) return COMPLETE_LABEL_SQ;
  return `Plani: ${Math.floor(pct)}% i përfunduar`;
}

/** Weighted plan completion, overall and for every one of the ten phases. */
export function computeProgress(tasks: readonly PlanTask[]): PlanProgress {
  const overall = tally(tasks);
  const completionPct = percent(overall);
  const byPhase = Object.fromEntries(
    PHASE_IDS.map((id) => {
      const t = tally(tasks.filter((task) => task.phaseId === id));
      return [id, { completionPct: percent(t), done: t.done, total: t.total }];
    }),
  ) as Record<PhaseId, PlanProgress['byPhase'][PhaseId]>;
  return {
    completionPct,
    completedTasks: overall.done,
    totalTasks: overall.total,
    byPhase,
    labelSq: labelOf(overall, completionPct, tasks.length),
  };
}

/** Tasks that start within the first `days` days of the project, in start order (stable). */
export function tasksForHorizon(tasks: readonly PlanTask[], days: number): PlanTask[] {
  return tasks
    .map((task, index) => ({ task, index }))
    .filter(({ task }) => task.dayOffset < days)
    .sort((x, y) => x.task.dayOffset - y.task.dayOffset || x.index - y.index)
    .map(({ task }) => task);
}
