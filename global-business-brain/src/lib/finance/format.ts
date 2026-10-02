/**
 * Formatimi për shfaqje në shqip (sq-AL): para, numra, përqindje, tregues, periudha, data.
 *
 * Display-only: the engine keeps exact floats and rounding happens here. Missing or non-numeric
 * values always render as "—", never as 0, so the UI cannot silently turn "no data" into a number.
 */
import type { CurrencyCode, IndicatorDefinition } from '@/lib/domain/types';
import { currencyMinorUnits } from '@/lib/finance/currency';
import { formatDatePartsSq, formatIsoDateSq, MISSING_SQ, MONTHS_SQ, numberFormat } from '@/lib/finance/locale';

export interface FormatMoneyOptions {
  decimals?: number; // default: the currency's minor units (EUR 2, JPY 0)
  compact?: boolean; // "1,2 mln €"
}

/** Values at or above this magnitude are shown compactly ("2,8 mln") in indicator cards. */
const COMPACT_THRESHOLD = 1_000_000;

// Same separator Intl uses in sq-AL; keeps a number and its unit on one line on narrow screens.
const NBSP = '\u00a0';

const ROMAN_QUARTERS = ['I', 'II', 'III', 'IV'];

function isNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function clampDecimals(decimals: number): number {
  return Math.min(20, Math.max(0, Math.round(decimals)));
}

/** Plain number; without `decimals` it shows up to 2 decimals and drops trailing zeros. */
export function formatNumber(value: number | null | undefined, decimals?: number): string {
  if (!isNumber(value)) return MISSING_SQ;
  const options: Intl.NumberFormatOptions =
    decimals === undefined
      ? { maximumFractionDigits: 2 }
      : { minimumFractionDigits: clampDecimals(decimals), maximumFractionDigits: clampDecimals(decimals) };
  return numberFormat(options).format(value);
}

function formatCompactNumber(value: number): string {
  return numberFormat({ notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

/** Money in the given ISO currency; unknown codes fall back to "number CODE". */
export function formatMoney(value: number | null | undefined, currency: CurrencyCode, opts: FormatMoneyOptions = {}): string {
  if (!isNumber(value)) return MISSING_SQ;
  const decimals = opts.decimals === undefined ? undefined : clampDecimals(opts.decimals);
  try {
    const options: Intl.NumberFormatOptions = opts.compact
      ? { style: 'currency', currency, notation: 'compact', maximumFractionDigits: decimals ?? 1 }
      : decimals === undefined
        ? { style: 'currency', currency }
        : { style: 'currency', currency, minimumFractionDigits: decimals, maximumFractionDigits: decimals };
    return numberFormat(options).format(value);
  } catch {
    const fallback = opts.compact ? formatCompactNumber(value) : formatNumber(value, decimals ?? currencyMinorUnits(currency));
    return `${fallback}${NBSP}${currency}`;
  }
}

/** `value` is already in percent units: 12.345 → "12,3%". */
export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (!isNumber(value)) return MISSING_SQ;
  return `${formatNumber(value, decimals)}%`;
}

function largeOrPlain(value: number): string {
  if (Math.abs(value) >= COMPACT_THRESHOLD) return formatCompactNumber(value);
  return formatNumber(value, Number.isInteger(value) || Math.abs(value) >= 1000 ? 0 : 2);
}

function formatCurrencyIndicator(value: number, currency: IndicatorDefinition['currency']): string {
  if (currency === 'INTL$') return `${largeOrPlain(value)}${NBSP}$ ndërkomb.`;
  if (currency === 'MV') return `${largeOrPlain(value)}${NBSP}njësi të monedhës vendase`;
  if (!currency) return largeOrPlain(value);
  if (Math.abs(value) >= COMPACT_THRESHOLD) return formatMoney(value, currency, { compact: true });
  return formatMoney(value, currency, { decimals: Math.abs(value) >= 1000 ? 0 : 2 });
}

/** Formats an indicator value according to its unit kind (every `UnitKind` is handled). */
export function formatIndicatorValue(
  value: number | null | undefined,
  def: Pick<IndicatorDefinition, 'unit' | 'currency'>,
): string {
  if (!isNumber(value)) return MISSING_SQ;
  switch (def.unit) {
    case 'perqind':
      return formatPercent(value, 1);
    case 'monedhe':
      return formatCurrencyIndicator(value, def.currency);
    case 'numer':
      return largeOrPlain(value);
    case 'per_100':
      return `${formatNumber(value, 1)}${NBSP}për 100`;
    case 'per_1000':
      return `${formatNumber(value, 2)}${NBSP}për 1000`;
    case 'indeks':
      return formatNumber(value, 1);
    case 'dite':
      return `${formatNumber(value, Number.isInteger(value) ? 0 : 1)}${NBSP}ditë`;
    case 'raport':
      return formatNumber(value, 2);
    case 'mv_per_usd':
      return `${formatNumber(value, Math.abs(value) < 10 ? 4 : 2)}${NBSP}njësi të monedhës vendase për 1 USD`;
    case 'pike':
      return `${formatNumber(value, 1)}${NBSP}pikë`;
    default:
      // Defensive for data coming from storage with a unit this build does not know yet.
      return formatNumber(value);
  }
}

/** "2023" → "2023"; "2024-Q1" → "tremujori I 2024"; "2024-05" → "maj 2024"; "2024-05-17" → "17 maj 2024". */
export function formatPeriod(period: string | null | undefined): string {
  if (!period) return MISSING_SQ;
  const trimmed = period.trim();
  if (/^\d{4}$/.test(trimmed)) return trimmed;
  const quarter = /^(\d{4})-Q([1-4])$/i.exec(trimmed);
  if (quarter) return `tremujori ${ROMAN_QUARTERS[Number(quarter[2]) - 1]} ${quarter[1]}`;
  const month = /^(\d{4})-(\d{2})$/.exec(trimmed);
  if (month && Number(month[2]) >= 1 && Number(month[2]) <= 12) return `${MONTHS_SQ[Number(month[2]) - 1]} ${month[1]}`;
  const day = formatIsoDateSq(trimmed);
  return day === MISSING_SQ ? trimmed : day;
}

interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: string;
  minute: string;
}

function zonedParts(date: Date, timeZone: string): ZonedParts {
  // en-GB with numeric parts is only used to extract numbers; the Albanian wording is ours.
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? '';
  return { year: Number(get('year')), month: Number(get('month')), day: Number(get('day')), hour: get('hour'), minute: get('minute') };
}

function parseInstant(iso: string): Date | null {
  const time = Date.parse(iso);
  return Number.isFinite(time) ? new Date(time) : null;
}

/** "2026-10-02" or a full timestamp → "2 tetor 2026" (timestamps are read in UTC by default). */
export function formatDate(iso: string | null | undefined, opts: { timeZone?: string } = {}): string {
  if (!iso) return MISSING_SQ;
  const calendar = formatIsoDateSq(iso);
  if (calendar !== MISSING_SQ) return calendar;
  const instant = parseInstant(iso);
  if (!instant) return MISSING_SQ;
  const parts = safeZonedParts(instant, opts.timeZone);
  return formatDatePartsSq(parts);
}

function safeZonedParts(instant: Date, timeZone = 'UTC'): ZonedParts & { timeZone: string } {
  try {
    return { ...zonedParts(instant, timeZone), timeZone };
  } catch {
    return { ...zonedParts(instant, 'UTC'), timeZone: 'UTC' };
  }
}

/** "2026-10-02T09:04:00Z" → "2 tetor 2026, 09:04 UTC". The zone is always named to avoid ambiguity. */
export function formatDateTime(iso: string | null | undefined, opts: { timeZone?: string } = {}): string {
  if (!iso) return MISSING_SQ;
  const instant = parseInstant(iso);
  if (!instant) return MISSING_SQ;
  const parts = safeZonedParts(instant, opts.timeZone);
  return `${formatDatePartsSq(parts)}, ${parts.hour}:${parts.minute} ${parts.timeZone}`;
}
