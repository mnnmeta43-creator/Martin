'use client';

import { useMemo, useState } from 'react';
import { ChartFrame } from './ChartFrame';
import { formatChartValue, linear, niceTicks, type ChartUnit } from './scale';
import { useWidth } from './useWidth';

export interface LinePoint {
  x: string; // category label (period / month)
  y: number | null; // null = missing (gap in the line, never drawn as 0)
  projected?: boolean; // drawn dashed and labelled "parashikim"
}

export interface LineSeries {
  id: string;
  label: string;
  points: LinePoint[];
}

const COLORS = ['var(--color-chart-1)', 'var(--color-chart-2)', 'var(--color-chart-3)'];
const HEIGHT = 220;
const PAD = { top: 12, right: 16, bottom: 28, left: 64 };

/** Line chart for ≤3 series sharing one x-axis and ONE y-axis, with crosshair tooltip and table view. */
export function LineChart({
  title,
  subtitle,
  series,
  unit,
  footnote,
  zeroLine = true,
}: {
  title: string;
  subtitle?: string;
  series: LineSeries[];
  unit: ChartUnit;
  footnote?: React.ReactNode;
  zeroLine?: boolean;
}) {
  const shown = series.slice(0, 3);
  const xs = useMemo(() => {
    const seen: string[] = [];
    for (const s of shown) for (const p of s.points) if (!seen.includes(p.x)) seen.push(p.x);
    return seen;
  }, [shown]);
  const values = shown.flatMap((s) => s.points.map((p) => p.y)).filter((v): v is number => v !== null && Number.isFinite(v));
  const hasData = values.length > 0;
  const anyProjected = shown.some((s) => s.points.some((p) => p.projected));

  const table = (
    <div className="table-scroll">
      <table className="w-full text-sm">
        <caption className="sr-only">{title}</caption>
        <thead className="text-left text-xs text-faint">
          <tr>
            <th scope="col" className="px-2 py-1.5">
              Periudha
            </th>
            {shown.map((s) => (
              <th key={s.id} scope="col" className="px-2 py-1.5 text-right">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {xs.map((x) => (
            <tr key={x} className="border-t border-line">
              <th scope="row" className="px-2 py-1.5 text-left font-normal text-muted">
                {x}
              </th>
              {shown.map((s) => {
                const p = s.points.find((q) => q.x === x);
                return (
                  <td key={s.id} className="px-2 py-1.5 text-right tabular text-ink">
                    {p ? formatChartValue(p.y, unit) : '—'}
                    {p?.projected ? <span className="ml-1 text-xs text-accent-strong">(parashikim)</span> : null}
                  </td>
                );
              })}
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
      legend={shown.map((s, i) => ({ label: s.label, color: COLORS[i] }))}
      chart={hasData ? <Plot series={shown} xs={xs} unit={unit} zeroLine={zeroLine} title={title} /> : <NoData />}
      table={table}
      footnote={
        <>
          {anyProjected ? <span>Vija me ndërprerje = parashikim, jo matje. </span> : null}
          {footnote}
        </>
      }
    />
  );
}

function NoData() {
  return <p className="rounded-xl border border-dashed border-line-strong p-6 text-center text-sm text-muted">Nuk ka të dhëna për t’u shfaqur.</p>;
}

function Plot({ series, xs, unit, zeroLine, title }: { series: LineSeries[]; xs: string[]; unit: ChartUnit; zeroLine: boolean; title: string }) {
  const { ref, width } = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const values = series.flatMap((s) => s.points.map((p) => p.y)).filter((v): v is number => v !== null && Number.isFinite(v));
  let lo = Math.min(...values);
  let hi = Math.max(...values);
  if (zeroLine) {
    lo = Math.min(lo, 0);
    hi = Math.max(hi, 0);
  }
  const ticks = niceTicks(lo, hi, 4);
  const yDomain: [number, number] = [ticks[0], ticks[ticks.length - 1]];
  const innerW = width - PAD.left - PAD.right;
  const x = (i: number) => PAD.left + (xs.length <= 1 ? innerW / 2 : (i / (xs.length - 1)) * innerW);
  const y = linear(yDomain, [HEIGHT - PAD.bottom, PAD.top]);
  const labelEvery = Math.max(1, Math.ceil(xs.length / Math.max(2, Math.floor(innerW / 70))));

  function segments(s: LineSeries) {
    // Split into runs of consecutive non-null points; projected runs are drawn dashed.
    const runs: { d: string; projected: boolean }[] = [];
    let current: { pts: [number, number][]; projected: boolean } | null = null;
    xs.forEach((xLabel, i) => {
      const p = s.points.find((q) => q.x === xLabel);
      if (!p || p.y === null || !Number.isFinite(p.y)) {
        if (current && current.pts.length) runs.push(toRun(current));
        current = null;
        return;
      }
      const pt: [number, number] = [x(i), y(p.y)];
      const projected = Boolean(p.projected);
      if (!current) current = { pts: [pt], projected };
      else if (current.projected !== projected) {
        current.pts.push(pt);
        runs.push(toRun(current));
        current = { pts: [pt], projected };
      } else current.pts.push(pt);
    });
    if (current && (current as { pts: [number, number][] }).pts.length) runs.push(toRun(current));
    return runs;
  }

  function toRun(r: { pts: [number, number][]; projected: boolean }) {
    return { d: r.pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(''), projected: r.projected };
  }

  function onMove(e: React.PointerEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const i = xs.length <= 1 ? 0 : Math.round((px / rect.width) * (xs.length - 1));
    setHover(Math.min(xs.length - 1, Math.max(0, i)));
  }

  const tooltipLeft = hover !== null ? Math.min(Math.max(x(hover) - 80, 0), width - 170) : 0;

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
        {zeroLine && yDomain[0] < 0 && yDomain[1] > 0 ? (
          <line x1={PAD.left} x2={width - PAD.right} y1={y(0)} y2={y(0)} stroke="var(--color-line-strong)" strokeWidth={1} />
        ) : null}
        {xs.map((label, i) =>
          i % labelEvery === 0 || i === xs.length - 1 ? (
            <text key={label} x={x(i)} y={HEIGHT - 8} textAnchor="middle" fontSize={11} fill="var(--color-faint)">
              {label}
            </text>
          ) : null,
        )}
        {series.map((s, si) =>
          segments(s).map((r, ri) => (
            <path
              key={`${s.id}-${ri}`}
              d={r.d}
              fill="none"
              stroke={COLORS[si]}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray={r.projected ? '5 4' : undefined}
            />
          )),
        )}
        {series.map((s, si) => {
          // End-dot on the last non-null point of each series.
          for (let i = xs.length - 1; i >= 0; i--) {
            const p = s.points.find((q) => q.x === xs[i]);
            if (p && p.y !== null && Number.isFinite(p.y)) {
              return <circle key={s.id} cx={x(i)} cy={y(p.y)} r={4} fill={COLORS[si]} stroke="var(--color-surface)" strokeWidth={2} />;
            }
          }
          return null;
        })}
        {hover !== null ? (
          <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={HEIGHT - PAD.bottom} stroke="var(--color-muted)" strokeWidth={1} />
        ) : null}
        <rect
          x={PAD.left}
          y={PAD.top}
          width={Math.max(1, innerW)}
          height={HEIGHT - PAD.top - PAD.bottom}
          fill="transparent"
          onPointerMove={onMove}
          onPointerDown={onMove}
          onPointerLeave={() => setHover(null)}
        />
      </svg>
      {hover !== null ? (
        <div
          className="pointer-events-none absolute top-1 z-10 w-40 rounded-lg border border-line-strong bg-surface-3 p-2 text-xs shadow-lg"
          style={{ left: tooltipLeft }}
          role="status"
        >
          <p className="mb-1 font-semibold text-ink">{xs[hover]}</p>
          {series.map((s, si) => {
            const p = s.points.find((q) => q.x === xs[hover]);
            return (
              <p key={s.id} className="flex items-center justify-between gap-2 text-muted">
                <span className="flex items-center gap-1">
                  <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full" style={{ background: COLORS[si] }} />
                  {s.label}
                </span>
                <span className="tabular text-ink">
                  {formatChartValue(p?.y ?? null, unit)}
                  {p?.projected ? '*' : ''}
                </span>
              </p>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
