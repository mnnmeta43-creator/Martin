/**
 * Njësitë dhe periudhat e të dhënave: parsing, renditja dhe shkallëzimi.
 *
 * Pure helpers shared by adapters, freshness/series logic and the UI. Period strings follow
 * the Observation contract ("2023", "2024-Q1", "2024-05", "2024-05-17"); the compact forms
 * used by some APIs ("2024Q1", "2024M05") are accepted too. Garbage returns null instead of
 * throwing, because source payloads are untrusted and a bad row must not abort a refresh.
 */
import type { IndicatorDefinition, UnitKind } from '@/lib/domain/types';

export type PeriodGranularity = 'vit' | 'tremujor' | 'muaj' | 'dite';

export interface ParsedPeriod {
  granularity: PeriodGranularity;
  year: number;
  quarter?: number;
  month?: number;
  day?: number;
}

const YEAR_RE = /^(\d{4})$/;
const QUARTER_RE = /^(\d{4})-?Q([1-4])$/i;
const MONTH_RE = /^(\d{4})(?:-|M)(\d{2})$/i;
const DAY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function parsePeriod(period: string): ParsedPeriod | null {
  if (typeof period !== 'string') return null;
  const p = period.trim();
  let m = YEAR_RE.exec(p);
  if (m) return { granularity: 'vit', year: Number(m[1]) };
  m = QUARTER_RE.exec(p);
  if (m) return { granularity: 'tremujor', year: Number(m[1]), quarter: Number(m[2]) };
  m = MONTH_RE.exec(p);
  if (m) {
    const month = Number(m[2]);
    return month >= 1 && month <= 12 ? { granularity: 'muaj', year: Number(m[1]), month } : null;
  }
  m = DAY_RE.exec(p);
  if (m) {
    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null;
    return { granularity: 'dite', year, month, day };
  }
  return null;
}

/** Position of a period on a single axis of its own granularity (years, quarters, months or days). */
function ordinal(p: ParsedPeriod): number {
  switch (p.granularity) {
    case 'vit':
      return p.year;
    case 'tremujor':
      return p.year * 4 + (p.quarter! - 1);
    case 'muaj':
      return p.year * 12 + (p.month! - 1);
    case 'dite':
      return Date.UTC(p.year, p.month! - 1, p.day!) / 86_400_000;
  }
}

function comparable(a: string, b: string): [ParsedPeriod, ParsedPeriod] | null {
  const pa = parsePeriod(a);
  const pb = parsePeriod(b);
  if (!pa || !pb || pa.granularity !== pb.granularity) return null;
  return [pa, pb];
}

/**
 * Sort comparator: negative when a is earlier than b. Periods of different granularity
 * (e.g. "2023" vs "2023-Q4") or unparseable strings are not comparable → NaN.
 */
export function comparePeriods(a: string, b: string): number {
  const pair = comparable(a, b);
  if (!pair) return NaN;
  return Math.sign(ordinal(pair[0]) - ordinal(pair[1]));
}

/** Number of periods from a to b (b − a); NaN when not comparable. */
export function periodGap(a: string, b: string): number {
  const pair = comparable(a, b);
  if (!pair) return NaN;
  return ordinal(pair[1]) - ordinal(pair[0]);
}

/** Percent-valued units, whose changes must be shown in percentage points, not relative %. */
export function unitIsPercent(unit: UnitKind): boolean {
  return unit === 'perqind';
}

export type ValueScale = 'njesi' | 'mije' | 'milion' | 'miliard';

export const SCALE_FACTORS: Record<ValueScale, number> = {
  njesi: 1,
  mije: 1e3,
  milion: 1e6,
  miliard: 1e9,
};

export const SCALE_LABELS_SQ: Record<ValueScale, string> = {
  njesi: '',
  mije: 'mijë',
  milion: 'milionë',
  miliard: 'miliardë',
};

/** Rescales a value (e.g. millions → units). Missing stays missing: null in, null out. */
export function scaleValue(value: number, from: ValueScale, to: ValueScale): number;
export function scaleValue(value: number | null, from: ValueScale, to: ValueScale): number | null;
export function scaleValue(value: number | null, from: ValueScale, to: ValueScale): number | null {
  if (value === null || !Number.isFinite(value)) return null;
  return (value * SCALE_FACTORS[from]) / SCALE_FACTORS[to];
}

/** Compact unit suffix for tight UI (chips, table cells); use `unitLabelSq` for full labels. */
export function unitShortSq(def: Pick<IndicatorDefinition, 'unit' | 'currency'>): string {
  switch (def.unit) {
    case 'perqind':
      return '%';
    case 'monedhe':
      if (def.currency === 'INTL$') return '$ ndërk.';
      return def.currency ?? '';
    case 'numer':
      return '';
    case 'per_100':
      return 'për 100';
    case 'per_1000':
      return 'për 1.000';
    case 'indeks':
      return 'indeks';
    case 'dite':
      return 'ditë';
    case 'raport':
      return '';
    case 'mv_per_usd':
      return 'MV/USD';
    case 'pike':
      return 'pikë';
  }
}
