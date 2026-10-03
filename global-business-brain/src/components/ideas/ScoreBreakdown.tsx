'use client';

import { useMemo, useState } from 'react';
import type { DimensionScore, ScoreDimensionId, ScoreWeights } from '@/lib/domain/types';
import { DEFAULT_SCORE_WEIGHTS, SCORE_DIMENSION_LABELS } from '@/lib/domain/taxonomy';
import { formatNumber } from '@/lib/finance/format';
import { apiFetch } from '@/lib/client/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cx } from '@/components/ui/cx';

const BASIS_LABEL: Record<DimensionScore['basis'], string> = {
  te_dhena: 'nga të dhënat',
  profil: 'nga profili',
  supozim: 'nga supozimet',
  mungon: 'nuk vlerësohet',
};

/** Weighted mean over assessable dimensions only — a missing dimension is excluded, never scored 0. */
export function recomputeScore(dimensions: DimensionScore[], weights: ScoreWeights) {
  let sum = 0;
  let w = 0;
  for (const d of dimensions) {
    if (d.score === null) continue;
    sum += d.score * weights[d.id];
    w += weights[d.id];
  }
  return { total: w > 0 ? Math.round((sum / w) * 10) / 10 : null, assessedWeightPct: w };
}

/**
 * Pikëzimi me pesha të dukshme dhe të redaktueshme (visible, editable weights that must total 100).
 * When `projectId` is set, the weights can be saved to the project.
 */
export function ScoreBreakdown({
  dimensions,
  initialWeights,
  projectId,
  noteSq,
}: {
  dimensions: DimensionScore[];
  initialWeights?: ScoreWeights;
  projectId?: string;
  noteSq: string;
}) {
  const [weights, setWeights] = useState<ScoreWeights>(initialWeights ?? DEFAULT_SCORE_WEIGHTS);
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const sumW = Object.values(weights).reduce((a, b) => a + b, 0);
  const { total, assessedWeightPct } = useMemo(() => recomputeScore(dimensions, weights), [dimensions, weights]);

  async function save() {
    if (!projectId || sumW !== 100) return;
    const res = await apiFetch<unknown>(`/api/projects/${projectId}`, { method: 'PATCH', body: { scoreWeights: weights } });
    setMsg(res.ok ? 'Peshat u ruajtën.' : res.messageSq);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs text-muted">Pikëzimi i përshtatjes</p>
          <p className="text-3xl font-semibold tabular text-ink">
            {total === null ? '—' : formatNumber(total, 1)}
            <span className="text-base font-normal text-faint"> / 100</span>
          </p>
          <p className="text-xs text-faint">
            Vlerësuar mbi {assessedWeightPct}% të peshës{assessedWeightPct < 100 ? ' — disa dimensione nuk kanë të dhëna dhe janë përjashtuar (jo 0)' : ''}.
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={() => setEditing((v) => !v)} aria-expanded={editing}>
          {editing ? 'Mbyll peshat' : 'Ndrysho peshat'}
        </Button>
      </div>
      <p className="mt-2 text-xs text-warn">{noteSq}</p>
      <ul className="mt-3 space-y-2">
        {dimensions.map((d) => (
          <li key={d.id} className="rounded-xl border border-line bg-surface-2/60 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-ink">{SCORE_DIMENSION_LABELS[d.id]}</p>
              <div className="flex items-center gap-2">
                <Badge tone={d.score === null ? 'neutral' : 'accent'}>{BASIS_LABEL[d.basis]}</Badge>
                <span className="w-16 text-right text-sm font-semibold tabular text-ink">{d.score === null ? '—' : formatNumber(d.score, 0)}</span>
              </div>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-accent-soft" aria-hidden="true">
              <div className={cx('h-full rounded-full', d.score === null ? 'bg-transparent' : 'bg-accent')} style={{ width: `${d.score ?? 0}%` }} />
            </div>
            <p className="mt-1.5 text-xs text-muted">{d.reasonSq}</p>
            {editing ? (
              <div className="mt-2 flex items-center gap-2">
                <label htmlFor={`w-${d.id}`} className="text-xs text-muted">
                  Pesha
                </label>
                <input
                  id={`w-${d.id}`}
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={weights[d.id]}
                  onChange={(e) => setWeights({ ...weights, [d.id as ScoreDimensionId]: Math.max(0, Math.min(100, Math.round(Number(e.target.value) || 0))) })}
                  className="w-20 rounded-lg border border-line-strong bg-surface px-2 py-1.5 text-right text-base tabular text-ink sm:text-sm"
                />
                <span className="text-xs text-faint">%</span>
              </div>
            ) : (
              <p className="mt-1 text-[11px] text-faint">Pesha: {weights[d.id]}%</p>
            )}
          </li>
        ))}
      </ul>
      {editing ? (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p className={cx('text-sm', sumW === 100 ? 'text-ok' : 'text-bad')} role="status">
            Totali i peshave: {sumW}% {sumW === 100 ? '✓' : '— duhet të jetë saktësisht 100%'}
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={() => setWeights(DEFAULT_SCORE_WEIGHTS)}>
            Rikthe parazgjedhjen
          </Button>
          {projectId ? (
            <Button type="button" size="sm" disabled={sumW !== 100} onClick={save}>
              Ruaj peshat në projekt
            </Button>
          ) : null}
          {msg ? <p className="text-sm text-muted">{msg}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
