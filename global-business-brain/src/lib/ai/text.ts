/**
 * Normalizimi i tekstit dhe leximi i shumave, përqindjeve, ditëve dhe shteteve nga pyetjet në shqip.
 *
 * Used by the deterministic fallback (intent matching) and by the tools (country resolution).
 * Everything here is pure: no clock, no I/O. Country names are resolved only against the app's
 * own country catalogue, so a name that is not in the catalogue resolves to null instead of a guess.
 */
import type { Country } from '@/lib/domain/types';
import { getCountries, getCountry, normalizeSearchText, searchCountries } from '@/lib/data/countries';

/** Lower-case, diacritics removed (ë→e, ç→c), quotes dropped and whitespace collapsed. */
export function normalizeQuery(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[“”„"«»‘’`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const PERCENT_RE = /([+-]?\d+(?:[.,]\d+)?)\s*(?:%|perqind\b|per qind\b)/;

/** "rriten 15%" → 15; "me 12,5 përqind" → 12.5; no percentage → null. */
export function parsePercent(text: string): number | null {
  const match = PERCENT_RE.exec(normalizeQuery(text));
  if (!match) return null;
  const value = Number(match[1].replace(',', '.'));
  return Number.isFinite(value) ? value : null;
}

// A number with thousands separators ("5 000", "5.000", "5,000") or plain digits with an optional
// 1–2 digit decimal part, followed by an optional multiplier. Percentages and durations are skipped.
const AMOUNT_RE =
  /(\d{1,3}(?:[ ., ]\d{3})+|\d+)(?:[.,](\d{1,2}))?(?!\d)\s*(k\b|mije\b|mij\b|mln\b|milion\w*)?(\s*(?:%|perqind|per qind|dite|dit\b|muaj|jav))?/g;

/** Reads the first money-like amount: "me 3 000 euro" → 3000; "2,5k" → 2500; none → null. */
export function parseAmount(text: string): number | null {
  const normalized = normalizeQuery(text);
  for (const match of normalized.matchAll(AMOUNT_RE)) {
    if (match[4]) continue; // "20%", "30 ditë", "3 muaj" are not amounts
    const integer = Number(match[1].replace(/[ ., ]/g, ''));
    const decimals = match[2] ? Number(`0.${match[2]}`) : 0;
    let value = integer + decimals;
    const multiplier = match[3] ?? '';
    if (multiplier === 'k' || multiplier.startsWith('mij')) value *= 1_000;
    else if (multiplier === 'mln' || multiplier.startsWith('milion')) value *= 1_000_000;
    if (Number.isFinite(value) && value > 0) return value;
  }
  return null;
}

/** "për 3 ditë" → 3, "javën" → 7, "sot" → 1; nothing recognisable → null. */
export function parseDays(text: string): number | null {
  const normalized = normalizeQuery(text);
  const explicit = /(\d{1,3})\s*(dite|dit\b)/.exec(normalized);
  if (explicit) return Number(explicit[1]);
  const weeks = /(\d{1,2})\s*jav/.exec(normalized);
  if (weeks) return Number(weeks[1]) * 7;
  if (/\bjav(a|en|es|e)?\b/.test(normalized)) return 7;
  if (/\b(sot|tani|neser)\b/.test(normalized)) return 1;
  return null;
}

// Words that often surround a country name in a request but are never part of one. Short joining
// words such as "e"/"dhe" stay, because they occur inside names ("Maqedonia e Veriut").
const FILLER_WORDS = new Set([
  'me', 'nje', 'shtet', 'shtetin', 'shtete', 'vend', 'vendin', 'tjeter', 'tjetrin', 'p', 'sh', 'psh', 'per', 'shembull',
  'edhe', 'ose', 'kete', 'ate', 'iden', 'idene', 'projektin', 'krahaso', 'krahasoje', 'krahasoni', 'compare', 'with',
  'to', 'the', 'country', 'another', 'other', 'eg', 'please', 'ju', 'lutem',
]);

/** Drops one trailing "a"/"e" so "Kosova"/"Kosovë" share the stem "kosov" (as in country search). */
function stemWord(word: string): string {
  return word.length > 3 ? word.replace(/[ae]$/, '') : word;
}

/** Albanian case endings ("Kosovën", "Italisë") are at most three letters longer than the stem. */
function wordMatches(token: string, nameWord: string): boolean {
  if (token === nameWord) return true;
  const stem = stemWord(nameWord);
  return stem.length >= 4 && token.startsWith(stem) && token.length - stem.length <= 3;
}

function nameMatches(tokens: string[], name: string): boolean {
  const words = normalizeSearchText(name).split(' ').filter(Boolean);
  return words.length === tokens.length && words.every((w, i) => wordMatches(tokens[i], w));
}

function countryByTokens(tokens: string[], list: Country[]): Country | null {
  // Longest windows first, so "Maqedonia e Veriut" wins over a shorter accidental match.
  for (let size = Math.min(5, tokens.length); size >= 1; size--) {
    for (let start = 0; start + size <= tokens.length; start++) {
      const window = tokens.slice(start, start + size);
      const hit = list.find((c) => nameMatches(window, c.nameSq) || nameMatches(window, c.nameEn));
      if (hit) return hit;
    }
  }
  return null;
}

export interface ResolveCountryOptions {
  includeDemo?: boolean;
}

/**
 * Resolves a country code or an Albanian/English name (any grammatical case) to a catalogue entry.
 * Order: exact code → whole-word name match → catalogue search with a single unambiguous result.
 */
export function resolveCountry(query: string, opts: ResolveCountryOptions = {}): Country | null {
  const includeDemo = opts.includeDemo === true;
  const trimmed = query.trim();
  if (!trimmed) return null;
  if (/^[A-Za-z]{2,3}$/.test(trimmed)) {
    const byCode = getCountry(trimmed, { includeDemo });
    if (byCode) return byCode;
  }
  const list = getCountries({ includeDemo });
  const tokens = normalizeSearchText(trimmed)
    .split(' ')
    .filter((t) => t && !FILLER_WORDS.has(t));
  if (tokens.length === 0) return null;
  const byName = countryByTokens(tokens, list);
  if (byName) return byName;
  const cleaned = tokens.join(' ');
  if (cleaned.length < 4) return null;
  const found = searchCountries(list, { query: cleaned });
  return found.length === 1 ? found[0] : null;
}
