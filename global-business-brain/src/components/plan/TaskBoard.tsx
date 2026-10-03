'use client';

import { useMemo, useState } from 'react';
import type { PhaseId, PlanTask, TaskStatus } from '@/lib/domain/types';
import { PHASE_IDS, PHASE_TITLES, TASK_STATUS_LABELS } from '@/lib/domain/taxonomy';
import { computeProgress } from '@/lib/plan/progress';
import { apiFetch } from '@/lib/client/api';
import { Notice } from '@/components/ui/Notice';
import { cx } from '@/components/ui/cx';

const STATUS_ORDER: TaskStatus[] = ['per_tu_bere', 'ne_progres', 'perfunduar', 'anashkaluar'];
const STATUS_ICON: Record<TaskStatus, string> = { per_tu_bere: '○', ne_progres: '◐', perfunduar: '●', anashkaluar: '–' };

/**
 * Detyrat dhe progresi. Completion % measures how much of the plan is done — not the chance of success.
 */
export function TaskBoard({
  projectId,
  initialTasks,
  filterDays,
  readOnly,
}: {
  projectId: string;
  initialTasks: PlanTask[];
  filterDays?: number | null;
  readOnly?: boolean;
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const progress = useMemo(() => computeProgress(tasks), [tasks]);
  const visible = filterDays ? tasks.filter((t) => t.dayOffset < filterDays) : tasks;

  async function setStatus(task: PlanTask, status: TaskStatus) {
    setPending(task.id);
    setError(null);
    const prev = tasks;
    setTasks((ts) => ts.map((t) => (t.id === task.id ? { ...t, status } : t)));
    const res = await apiFetch<{ task: PlanTask }>(`/api/projects/${projectId}/tasks/${encodeURIComponent(task.id)}`, {
      method: 'PATCH',
      body: { status },
    });
    setPending(null);
    if (!res.ok) {
      setTasks(prev);
      setError(res.messageSq);
    } else setTasks((ts) => ts.map((t) => (t.id === task.id ? res.data.task : t)));
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs text-muted">Përfundimi i planit</p>
            <p className="text-3xl font-semibold tabular text-ink">{Math.round(progress.completionPct)}%</p>
          </div>
          <p className="text-sm text-muted">
            {progress.completedTasks} nga {progress.totalTasks} detyra
          </p>
        </div>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-accent-soft"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress.completionPct)}
          aria-label="Përfundimi i planit"
        >
          <div className="h-full rounded-full bg-accent" style={{ width: `${progress.completionPct}%` }} />
        </div>
        <p className="mt-2 text-xs text-faint">{progress.labelSq} Përqindja mat përfundimin e planit, jo probabilitetin e suksesit.</p>
      </div>
      {error ? <Notice tone="bad">{error}</Notice> : null}
      {PHASE_IDS.map((phase: PhaseId) => {
        const list = visible.filter((t) => t.phaseId === phase);
        if (list.length === 0) return null;
        const pp = progress.byPhase[phase];
        return (
          <section key={phase} className="rounded-2xl border border-line bg-surface p-4" aria-labelledby={`ph-${phase}`}>
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <h3 id={`ph-${phase}`} className="font-semibold text-ink">
                <span className="mr-2 font-mono text-sm text-accent-strong">{PHASE_TITLES[phase].range}</span>
                {PHASE_TITLES[phase].titleSq}
              </h3>
              {pp ? (
                <span className="text-xs text-muted">
                  {pp.done}/{pp.total} · {Math.round(pp.completionPct)}%
                </span>
              ) : null}
            </div>
            <ul className="space-y-2">
              {list.map((t) => (
                <li key={t.id} className={cx('rounded-xl border p-3', t.status === 'perfunduar' ? 'border-ok/30 bg-ok-soft/30' : 'border-line bg-surface-2/60')}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className={cx('text-sm font-medium', t.status === 'perfunduar' ? 'text-muted line-through decoration-faint' : 'text-ink')}>
                        <span aria-hidden="true" className="mr-1.5">
                          {STATUS_ICON[t.status]}
                        </span>
                        {t.titleSq}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">{t.descriptionSq}</p>
                      <p className="mt-1 text-[11px] text-faint">
                        Dita {t.dayOffset + 1}–{t.dayOffset + t.durationDays} · Prova e përfundimit: {t.proofSq}
                      </p>
                    </div>
                    <label className="sr-only" htmlFor={`st-${t.id}`}>
                      Statusi i detyrës {t.titleSq}
                    </label>
                    <select
                      id={`st-${t.id}`}
                      value={t.status}
                      disabled={readOnly || pending === t.id}
                      onChange={(e) => setStatus(t, e.target.value as TaskStatus)}
                      className="min-h-9 rounded-lg border border-line-strong bg-surface px-2 text-xs text-ink"
                    >
                      {STATUS_ORDER.map((s) => (
                        <option key={s} value={s}>
                          {TASK_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
