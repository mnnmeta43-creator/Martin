/**
 * Primitivat e lokalizimit shqip (sq-AL) për modulin e financës.
 *
 * Kept in their own file so that `format.ts` and `currency.ts` can both use them without
 * importing each other. Month names are a static list (not Intl) so dates render the same in
 * every runtime, including browsers that ship reduced ICU data.
 */

export const LOCALE = 'sq-AL';

export const MONTHS_SQ: readonly string[] = [
  'janar',
  'shkurt',
  'mars',
  'prill',
  'maj',
  'qershor',
  'korrik',
  'gusht',
  'shtator',
  'tetor',
  'nëntor',
  'dhjetor',
];

/** Placeholder shown for missing / non-numeric values (never "0"). */
export const MISSING_SQ = '—';

export interface SqNumberFormatOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  maximumSignificantDigits?: number;
  notation?: 'standard' | 'compact';
  style?: 'decimal' | 'currency';
  currency?: string;
}

export interface SqNumberFormatter {
  format(value: number): string;
}

const NBSP = '\u00a0';

/**
 * Albanian currency symbols as CLDR renders them in sq-AL (others show their ISO code).
 * Kept static so server and browser render the same text.
 */
const CURRENCY_SYMBOLS_SQ: Record<string, string> = { EUR: '€', USD: 'US$', GBP: '£', JPY: 'JP¥', ALL: 'Lekë' };

/** ISO 4217 / CLDR display digits that differ from 2 (CLDR shows ALL without decimals). */
const ZERO_DECIMAL_CURRENCIES = new Set(['ALL', 'JPY', 'KRW', 'ISK', 'CLP', 'VND', 'UGX', 'PYG', 'RSD', 'HUF', 'XAF', 'XOF', 'IDR', 'IQD', 'LAK', 'MMK', 'SOS', 'TZS']);
const THREE_DECIMAL_CURRENCIES = new Set(['BHD', 'JOD', 'KWD', 'LYD', 'OMR', 'TND']);

export function currencyDisplayDigits(code: string): number {
  const c = code.toUpperCase();
  if (ZERO_DECIMAL_CURRENCIES.has(c)) return 0;
  if (THREE_DECIMAL_CURRENCIES.has(c)) return 3;
  return 2;
}

export function currencySymbolSq(code: string): string {
  const c = code.toUpperCase();
  return CURRENCY_SYMBOLS_SQ[c] ?? c;
}

/** "1234567,891" with sq-AL rules: decimal comma, NBSP groups only from 5 integer digits up. */
function plainDigits(abs: number, minFrac: number, maxFrac: number): string {
  let fixed = abs.toFixed(maxFrac);
  if (maxFrac > minFrac && fixed.includes('.')) {
    fixed = fixed.replace(/0+$/, '');
    const decimals = fixed.split('.')[1] ?? '';
    if (decimals.length < minFrac) fixed = fixed.split('.')[0] + '.' + decimals.padEnd(minFrac, '0');
    fixed = fixed.replace(/\.$/, '');
  }
  const [intPart, fracPart] = fixed.split('.');
  const grouped = intPart.length >= 5 ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP) : intPart;
  return fracPart ? `${grouped},${fracPart}` : grouped;
}

function significantMaxFrac(abs: number, sig: number): number {
  if (abs === 0) return 0;
  const intDigits = Math.max(1, Math.floor(Math.log10(abs)) + 1);
  return Math.max(0, sig - intDigits);
}

const COMPACT_STEPS: [number, string][] = [
  [1e12, 'bln'],
  [1e9, 'mld'],
  [1e6, 'mln'],
  [1e3, 'mijë'],
];

/**
 * Deterministic sq-AL number formatter (a small subset of Intl.NumberFormat).
 * Browsers ship reduced ICU data and many lack Albanian, so relying on Intl made the server
 * render "1 234,50 €" and the browser "€1,234.50" — a hydration mismatch and wrong separators.
 */
export function numberFormat(options: SqNumberFormatOptions): SqNumberFormatter {
  return {
    format(value: number): string {
      if (!Number.isFinite(value)) return MISSING_SQ;
      const currency = options.style === 'currency' && options.currency ? options.currency.toUpperCase() : null;
      const currencyDigits = currency ? currencyDisplayDigits(currency) : 0;
      let abs = Math.abs(value);
      let unit = '';
      if (options.notation === 'compact') {
        const step = COMPACT_STEPS.find(([size]) => abs >= size);
        if (step) {
          abs = abs / step[0];
          unit = step[1];
        }
      }
      let maxFrac: number;
      let minFrac: number;
      if (options.maximumSignificantDigits !== undefined) {
        maxFrac = significantMaxFrac(abs, options.maximumSignificantDigits);
        minFrac = 0;
      } else if (options.notation === 'compact') {
        maxFrac = options.maximumFractionDigits ?? (unit ? 1 : 0);
        minFrac = Math.min(maxFrac, options.minimumFractionDigits ?? 0);
      } else {
        const defaultMax = currency ? currencyDigits : 3;
        const defaultMin = currency ? currencyDigits : 0;
        maxFrac = options.maximumFractionDigits ?? Math.max(defaultMax, options.minimumFractionDigits ?? 0);
        minFrac = Math.min(maxFrac, options.minimumFractionDigits ?? defaultMin);
      }
      maxFrac = Math.min(20, Math.max(0, maxFrac));
      minFrac = Math.min(maxFrac, Math.max(0, minFrac));
      const digits = plainDigits(abs, minFrac, maxFrac);
      const isZero = /^[0,\u00a0]+$/.test(digits);
      const sign = value < 0 && !isZero ? '-' : '';
      const withUnit = unit ? `${digits}${NBSP}${unit}` : digits;
      return currency ? `${sign}${withUnit}${NBSP}${currencySymbolSq(currency)}` : `${sign}${withUnit}`;
    },
  };
}

export interface DateParts {
  year: number;
  month: number; // 1–12
  day: number;
}

const ISO_DATE_PREFIX = /^(\d{4})-(\d{2})-(\d{2})/;

function daysInMonth(year: number, month: number): number {
  if (month === 2) return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function validParts(match: RegExpExecArray): DateParts | null {
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

/**
 * Parses a date-only "YYYY-MM-DD" string without time-zone shifts. Strings with a time part return
 * null on purpose: which calendar day a timestamp falls on depends on the zone (see `formatDate`).
 * Impossible dates such as 2026-02-31 return null instead of rolling over into the next month.
 */
export function parseIsoDateParts(iso: string): DateParts | null {
  const trimmed = iso.trim();
  const match = ISO_DATE_PREFIX.exec(trimmed);
  return match && match[0].length === trimmed.length ? validParts(match) : null;
}

/** True when the string starts with a YYYY-MM-DD that is not a real calendar date (e.g. "2026-02-31T10:00Z"). */
export function hasImpossibleDatePrefix(iso: string): boolean {
  const match = ISO_DATE_PREFIX.exec(iso.trim());
  return match !== null && validParts(match) === null;
}

/** "2026-10-02" → "2 tetor 2026". */
export function formatDatePartsSq(parts: DateParts): string {
  return `${parts.day} ${MONTHS_SQ[parts.month - 1]} ${parts.year}`;
}

/** Formats a calendar date string; returns the placeholder for anything unparseable. */
export function formatIsoDateSq(iso: string | null | undefined): string {
  if (!iso) return MISSING_SQ;
  const parts = parseIsoDateParts(iso);
  return parts ? formatDatePartsSq(parts) : MISSING_SQ;
}

const SOURCE_NAMES_SQ: Record<string, string> = {
  'ecb-frankfurter': 'kurset referuese të BQE-së',
  'worldbank-wdi': 'mesatarja vjetore e Bankës Botërore',
  manual: 'vendosur nga ju',
  demo: 'kurs DEMO, fiktiv',
  'e-njejta-monedhe': 'e njëjta monedhë',
};

/** Human-readable name of an FX source id (triangulated ids are joined with "+"). */
export function sourceNameSq(id: string): string {
  return id
    .split('+')
    .map((part) => SOURCE_NAMES_SQ[part] ?? part)
    .join(' + ');
}
