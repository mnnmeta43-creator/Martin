'use client';

import { useEffect, useState } from 'react';
import { listSnapshots, type OfflineProjectSnapshot } from '@/lib/client/offline';
import { formatDateTime } from '@/lib/finance/format';

export function OfflineList() {
  const [items, setItems] = useState<OfflineProjectSnapshot[] | null>(null);
  useEffect(() => setItems(listSnapshots()), []);
  if (items === null) return null;
  if (items.length === 0) {
    return <p className="text-sm text-muted">Nuk ka projekte të ruajtura në këtë pajisje. Hapni një projekt kur jeni online që ta keni edhe offline.</p>;
  }
  return (
    <ul className="space-y-4">
      {items.map((s) => (
        <li key={s.id} className="rounded-2xl border border-line bg-surface p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-ink">{s.title}</h2>
            {s.isDemo ? <span className="rounded-full border border-demo/50 bg-demo-soft px-2 text-xs font-semibold text-demo">DEMO — fiktive</span> : null}
          </div>
          <p className="text-sm text-muted">
            {s.countryNameSq}
            {s.city ? ` · ${s.city}` : ''}
          </p>
          <p className="mt-1 text-xs text-warn">
            Kopje offline e ruajtur më {formatDateTime(s.savedAt)} · analiza e datës {formatDateTime(s.analysisDate)}. Jo analizë live.
          </p>
          <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {s.keyNumbers.map((k) => (
              <div key={k.labelSq} className="rounded-lg bg-surface-2 p-2">
                <dt className="text-xs text-muted">{k.labelSq}</dt>
                <dd className="tabular text-ink">{k.valueSq}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-sm text-ink">{s.progressLabelSq}</p>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {s.phases.map((p) => (
              <li key={p.rangeLabel}>
                {p.rangeLabel}: {p.titleSq} — {p.done}/{p.total} detyra
              </li>
            ))}
          </ul>
          {s.openTasks.length > 0 ? (
            <>
              <p className="mt-3 text-sm font-medium text-ink">Detyrat e radhës</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-muted">
                {s.openTasks.slice(0, 8).map((t) => (
                  <li key={t.titleSq}>
                    {t.titleSq} <span className="text-faint">({t.phaseRange})</span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
