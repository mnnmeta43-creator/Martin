import { describe, expect, it } from 'vitest';
import type { PhaseId, PlanTask, TaskStatus } from '@/lib/domain/types';
import { PHASE_IDS } from '@/lib/domain/taxonomy';
import { ALL_SKIPPED_LABEL_SQ, COMPLETE_LABEL_SQ, computeProgress, EMPTY_LABEL_SQ, tasksForHorizon } from '@/lib/plan/progress';

function task(id: string, phaseId: PhaseId, status: TaskStatus = 'per_tu_bere', extra: Partial<PlanTask> = {}): PlanTask {
  return {
    id,
    phaseId,
    titleSq: `Detyrë ${id}`,
    descriptionSq: 'Përshkrim testi.',
    dayOffset: 0,
    durationDays: 1,
    weight: 1,
    status,
    proofSq: 'Provë testi.',
    ...extra,
  };
}

describe('computeProgress', () => {
  it('weights completion and counts only "perfunduar" as done', () => {
    const p = computeProgress([
      task('a', 'p00_10', 'perfunduar', { weight: 3 }),
      task('b', 'p00_10', 'ne_progres', { weight: 1 }),
      task('c', 'p10_20', 'per_tu_bere', { weight: 1 }),
      task('d', 'p10_20', 'per_tu_bere', { weight: 1 }),
    ]);
    expect(p.completionPct).toBe(50); // 3 of 6
    expect(p.completedTasks).toBe(1);
    expect(p.totalTasks).toBe(4);
    expect(p.labelSq).toBe('Plani: 50% i përfunduar');
  });

  it('excludes skipped tasks from both numerator and denominator', () => {
    const p = computeProgress([
      task('a', 'p00_10', 'perfunduar'),
      task('b', 'p00_10', 'anashkaluar', { weight: 10 }),
      task('c', 'p00_10', 'per_tu_bere'),
    ]);
    expect(p.completionPct).toBe(50);
    expect(p.totalTasks).toBe(2);
    expect(p.byPhase.p00_10).toEqual({ completionPct: 50, done: 1, total: 2 });
  });

  it('returns byPhase for all 10 phases, including empty ones', () => {
    const p = computeProgress([task('a', 'p20_30', 'perfunduar'), task('b', 'p20_30')]);
    expect(Object.keys(p.byPhase).sort()).toEqual([...PHASE_IDS].sort());
    expect(p.byPhase.p20_30).toEqual({ completionPct: 50, done: 1, total: 2 });
    expect(p.byPhase.p90_100).toEqual({ completionPct: 0, done: 0, total: 0 });
  });

  it('at 100% says the steps are done and that success is not guaranteed', () => {
    const p = computeProgress([task('a', 'p00_10', 'perfunduar'), task('b', 'p90_100', 'perfunduar'), task('c', 'p50_60', 'anashkaluar')]);
    expect(p.completionPct).toBe(100);
    expect(p.labelSq).toBe(COMPLETE_LABEL_SQ);
    expect(p.labelSq).toContain('nuk garanton suksesin');
  });

  it('never rounds an unfinished plan up to 100%', () => {
    const tasks = [task('big', 'p00_10', 'perfunduar', { weight: 9999 }), task('tiny', 'p00_10', 'per_tu_bere', { weight: 1 })];
    const p = computeProgress(tasks);
    expect(p.completionPct).toBeLessThan(100);
    expect(p.labelSq).not.toBe(COMPLETE_LABEL_SQ);
    expect(p.labelSq).toBe('Plani: 99% i përfunduar');
  });

  it('treats invalid weights as 1 and handles empty / all-skipped plans', () => {
    const p = computeProgress([task('a', 'p00_10', 'perfunduar', { weight: Number.NaN }), task('b', 'p00_10', 'per_tu_bere', { weight: -2 })]);
    expect(p.completionPct).toBe(50);
    expect(computeProgress([])).toMatchObject({ completionPct: 0, totalTasks: 0, labelSq: EMPTY_LABEL_SQ });
    expect(computeProgress([task('a', 'p00_10', 'anashkaluar')])).toMatchObject({ completionPct: 0, totalTasks: 0, labelSq: ALL_SKIPPED_LABEL_SQ });
  });

  it('labels never present completion as probability or guaranteed success', () => {
    const statuses: TaskStatus[] = ['per_tu_bere', 'ne_progres', 'perfunduar', 'anashkaluar'];
    for (const s1 of statuses) {
      for (const s2 of statuses) {
        const label = computeProgress([task('a', 'p00_10', s1), task('b', 'p10_20', s2)]).labelSq;
        expect(label).not.toMatch(/probabilitet|garantuar|i sigurt/i);
      }
    }
  });
});

describe('tasksForHorizon', () => {
  const tasks = [
    task('late', 'p90_100', 'per_tu_bere', { dayOffset: 100 }),
    task('d3', 'p10_20', 'per_tu_bere', { dayOffset: 3 }),
    task('d0a', 'p00_10', 'per_tu_bere', { dayOffset: 0 }),
    task('d0b', 'p00_10', 'per_tu_bere', { dayOffset: 0 }),
    task('d29', 'p30_40', 'per_tu_bere', { dayOffset: 29 }),
    task('d30', 'p30_40', 'per_tu_bere', { dayOffset: 30 }),
  ];

  it('keeps tasks that start before the horizon, sorted by start (ties keep input order)', () => {
    expect(tasksForHorizon(tasks, 7).map((t) => t.id)).toEqual(['d0a', 'd0b', 'd3']);
    expect(tasksForHorizon(tasks, 30).map((t) => t.id)).toEqual(['d0a', 'd0b', 'd3', 'd29']);
    expect(tasksForHorizon(tasks, 0)).toEqual([]);
  });

  it('does not mutate the input', () => {
    const before = tasks.map((t) => t.id);
    tasksForHorizon(tasks, 200);
    expect(tasks.map((t) => t.id)).toEqual(before);
  });
});
