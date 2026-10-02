'use client';

import { useState } from 'react';
import { ChartFrame } from './ChartFrame';
import { formatChartValue, linear, niceTicks, type ChartUnit } from './scale';
import { useWidth } from './useWidth';

export interface BarDatum {
  label: string;
  value: number | null; // null = missing: no bar, marked "mungon" (never drawn as 0)
  note?: string; // shown in the tooltip/table (e.g. period, "DEMO")
}

const HEIGHT = 220;
const PAD = { top: 16, right: 12, bottom: 30, left: 64 };
const MAX_BAR = 24;

/**
 * Single-series column chart from one baseline. Negative values use the warm pole so polarity is
 * visible; the tooltip/table state the sign in words as well.
 */
export function BarChart({
  title,
  subtitle,
  data,
  unit,
  footnote,
  polarity = false,
}: {
  title: string;
  subtitle?: string;
  data: BarDatum[];
  unit: ChartUnit;
  footnote?: React.ReactNode;
  polarity?: boolean;
}) {
  const hasData = data.some((d) => d.value !== null && Number.isFinite(d.value));
  const table = (
    <div className="table-scroll">
      <table className="w-full text-sm">
        <caption className="sr-only">{title}</caption>
        <thead className="text-left text-xs text-faint">
          <tr>
            <th scope="col" className="px-2 py-1.5">
              Kategoria
            </th>
            <th scope="col" className="px-2 py-1.5 text-right">
              Vlera
            </th>
            <th scope="col" className="px-2 py-1.5">
              Shënim
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label} className="border-t border-line">
              <th scope="row" className="px-2 py-1.5 text-left font-normal text-muted">
                {d.label}
              </th>
              <td className="px-2 py-1.5 text-right tabular text-ink">{d.value === null ? 'mungon' : formatChartValue(d.value, unit)}</td>
              <td className="px-2 py-1.5 text-xs text-faint">{d.note ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  return (
    <ChartFrame
      title={title}
      subtitle={subtitle}
      chart={
        hasData ? (
          <Plot data={data} unit={unit} polarity={polarity} title={title} />
        ) : (
          <p className="rounded-xl border border-dashed border-line-strong p-6 text-center text-sm text-muted">Nuk ka të dhëna për t’u shfaqur.</p>
        )
      }
      table={table}
      footnote={footnote}
    />
  );
}

function Plot({ data, unit, polarity, title }: { data: BarDatum[]; unit: ChartUnit; polarity: boolean; title: string }) {
  const { ref, width } = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const vals = data.map((d) => d.value).filter((v): v is number => v !== null && Number.isFinite(v));
  const ticks = niceTicks(Math.min(0, ...vals), Math.max(0, ...vals), 4);
  const y = linear([ticks[0], ticks[ticks.length - 1]], [HEIGHT - PAD.bottom, PAD.top]);
  const innerW = width - PAD.left - PAD.right;
  const band = innerW / Math.max(1, data.length);
  const barW = Math.max(4, Math.min(MAX_BAR, band - 6));
  const zeroY = y(0);
  const labelEvery = Math.max(1, Math.ceil(data.length / Math.max(2, Math.floor(innerW / 56))));

  return (
    <div ref={ref} className="relative w-full">
      <svg width={width} height={HEIGHT} role="img" aria-label={title} className="block">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--color-chart-grid)" strokeWidth={1} />
            <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} fill="var(--color-faint)">
              {formatChartValue(t, unit, true)}
            </text>
          </g>
        ))}
        <line x1={PAD.left} x2={width - PAD.right} y1={zeroY} y2={zeroY} stroke="var(--color-line-strong)" strokeWidth={1} />
        {data.map((d, i) => {
          const cx = PAD.left + band * i + band / 2;
          const label =
            i % labelEvery === 0 || i === data.length - 1 ? (
              <text key={`l-${d.label}`} x={cx} y={HEIGHT - 10} textAnchor="middle" fontSize={11} fill="var(--color-faint)">
                {d.label.length > 10 ? `${d.label.slice(0, 9)}…` : d.label}
              </text>
            ) : null;
          if (d.value === null || !Number.isFinite(d.value)) {
            return (
              <g key={d.label}>
                {label}
                <text x={cx} y={zeroY - 6} textAnchor="middle" fontSize={10} fill="var(--color-faint)">
                  ∅
                </text>
              </g>
            );
          }
          const h = Math.max(1, Math.abs(y(d.value) - zeroY));
          const negative = d.value < 0;
          const r = Math.min(4, h / 2, barW / 2);
          // Rounded data-end, square at the baseline.
          const x0 = cx - barW / 2;
          const path = negative
            ? `M${x0},${zeroY} h${barW} v${h - r} q0,${r} ${-r},${r} h${-(barW - 2 * r)} q${-r},0 ${-r},${-r} Z`
            : `M${x0},${zeroY} v${-(h - r)} q0,${-r} ${r},${-r} h${barW - 2 * r} q${r},0 ${r},${r} v${h - r} Z`;
          return (
            <g key={d.label}>
              <path
                d={path}
                fill={polarity && negative ? 'var(--color-chart-neg)' : 'var(--color-chart-1)'}
                opacity={hover === null || hover === i ? 1 : 0.55}
              />
              <rect
                x={PAD.left + band * i}
                y={PAD.top}
                width={band}
                height={HEIGHT - PAD.top - PAD.bottom}
                fill="transparent"
                onPointerEnter={() => setHover(i)}
                onPointerDown={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
              />
              {label}
            </g>
          );
        })}
      </svg>
      {hover !== null ? (
        <div
          role="status"
          className="pointer-events-none absolute top-1 z-10 w-44 rounded-lg border border-line-strong bg-surface-3 p-2 text-xs shadow-lg"
          style={{ left: Math.min(Math.max(PAD.left + band * hover + band / 2 - 88, 0), width - 180) }}
        >
          <p className="font-semibold text-ink">{data[hover].label}</p>
          <p className="tabular text-ink">
            {data[hover].value === null ? 'mungon' : formatChartValue(data[hover].value, unit)}
            {data[hover].value !== null && (data[hover].value as number) < 0 ? ' (negative)' : ''}
          </p>
          {data[hover].note ? <p className="text-faint">{data[hover].note}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
