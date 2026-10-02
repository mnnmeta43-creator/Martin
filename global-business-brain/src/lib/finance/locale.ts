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

const formatterCache = new Map<string, Intl.NumberFormat>();

/** Cached sq-AL number formatter; Intl construction is comparatively expensive. */
export function numberFormat(options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = JSON.stringify(options);
  let formatter = formatterCache.get(key);
  if (!formatter) {
    // signDisplay 'negative' avoids rendering "-0" for tiny negative values rounded to zero.
    formatter = new Intl.NumberFormat(LOCALE, { signDisplay: 'negative', ...options });
    formatterCache.set(key, formatter);
  }
  return formatter;
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
