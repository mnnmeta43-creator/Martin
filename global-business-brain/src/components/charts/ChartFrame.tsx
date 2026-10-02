'use client';

import { useState } from 'react';

/** Title + optional legend + chart/table toggle. Every chart has a table alternative. */
export function ChartFrame({
  title,
  subtitle,
  legend,
  chart,
  table,
  footnote,
}: {
  title: string;
  subtitle?: string;
  legend?: { label: string; color: string; dashed?: boolean }[];
  chart: React.ReactNode;
  table: React.ReactNode;
  footnote?: React.ReactNode;
}) {
  const [asTable, setAsTable] = useState(false);
  return (
    <figure className="rounded-2xl border border-line bg-surface p-3 sm:p-4">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <figcaption className="min-w-0">
          <p className="font-semibold text-ink">{title}</p>
          {subtitle ? <p className="text-xs text-muted">{subtitle}</p> : null}
        </figcaption>
        <button
          type="button"
          onClick={() => setAsTable((v) => !v)}
          className="min-h-9 rounded-lg border border-line-strong px-3 text-xs font-medium text-muted hover:text-ink"
          aria-pressed={asTable}
        >
          {asTable ? 'Shiko grafikun' : 'Shiko si tabelë'}
        </button>
      </div>
      {legend && legend.length > 1 && !asTable ? (
        <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted" aria-label="Legjenda">
          {legend.map((l) => (
            <li key={l.label} className="flex items-center gap-1.5">
              <svg width="18" height="8" aria-hidden="true">
                <line x1="1" y1="4" x2="17" y2="4" stroke={l.color} strokeWidth="2.5" strokeDasharray={l.dashed ? '4 3' : undefined} strokeLinecap="round" />
              </svg>
              {l.label}
            </li>
          ))}
        </ul>
      ) : null}
      {asTable ? table : chart}
      {footnote ? <p className="mt-2 text-xs text-faint">{footnote}</p> : null}
    </figure>
  );
}
