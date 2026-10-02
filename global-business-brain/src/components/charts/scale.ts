/** Small, dependency-free helpers for SVG charts. */
import { formatMoney, formatNumber, formatPercent } from '@/lib/finance/format';

export type ChartUnit =
  | { kind: 'money'; currency: string }
  | { kind: 'percent' }
  | { kind: 'number'; decimals?: number };

export function formatChartValue(value: number | null | undefined, unit: ChartUnit, compact = false): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  if (unit.kind === 'money') return formatMoney(value, unit.currency, { compact });
  if (unit.kind === 'percent') return formatPercent(value, 1);
  return formatNumber(value, unit.decimals ?? 0);
}

/** "Nice" axis ticks (1, 2, 2.5, 5 × 10^n steps) covering [min, max]. */
export function niceTicks(min: number, max: number, count = 4): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0];
  if (min === max) {
    const pad = Math.abs(min) || 1;
    min -= pad;
    max += pad;
  }
  const span = max - min;
  const raw = span / Math.max(1, count);
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) ticks.push(Math.abs(v) < step / 1e6 ? 0 : Number(v.toPrecision(12)));
  return ticks;
}

export function linear(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const k = d1 === d0 ? 0 : (r1 - r0) / (d1 - d0);
  return (v: number) => r0 + (v - d0) * k;
}
