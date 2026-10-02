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

/** Parses the calendar part of "YYYY-MM-DD" (optionally followed by a time) without time-zone shifts. */
export function parseIsoDateParts(iso: string): DateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
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
