/**
 * Katalogu global i vendeve dhe ekonomive.
 *
 * Built from two versioned npm datasets (see the source registry): `world-countries` for codes,
 * UN membership, region, currencies and capital, and `i18n-iso-countries` for Albanian names.
 * Political status is described neutrally and factually (EconomyKind + kindNoteSq).
 *
 * This module pulls in a ~1.4 MB JSON dataset: import it from server code only and pass the
 * resulting plain objects to client components as props.
 */
import worldCountries, { type Country as WorldCountry } from 'world-countries';
import isoCountries from 'i18n-iso-countries';
import sqLocale from 'i18n-iso-countries/langs/sq.json';
import type { Country, CountryCode, EconomyKind } from '@/lib/domain/types';
import { DEMO_COUNTRIES } from '@/lib/data/demo/dataset';

isoCountries.registerLocale(sqLocale);

// ─────────────────────────────────────────────────────────────────────────────
// Albanian labels
// ─────────────────────────────────────────────────────────────────────────────

/** Package region (English) → Albanian. */
export const REGION_LABELS_SQ: Record<string, string> = {
  Africa: 'Afrikë',
  Americas: 'Amerikat',
  Antarctic: 'Antarktidë',
  Asia: 'Azi',
  Europe: 'Evropë',
  Oceania: 'Oqeani',
};

/** Package subregion (English) → Albanian. An empty subregion stays undefined. */
export const SUBREGION_LABELS_SQ: Record<string, string> = {
  'Australia and New Zealand': 'Australia dhe Zelanda e Re',
  Caribbean: 'Karaibet',
  'Central America': 'Amerika Qendrore',
  'Central Asia': 'Azia Qendrore',
  'Central Europe': 'Evropa Qendrore',
  'Eastern Africa': 'Afrika Lindore',
  'Eastern Asia': 'Azia Lindore',
  'Eastern Europe': 'Evropa Lindore',
  Melanesia: 'Melanezia',
  Micronesia: 'Mikronezia',
  'Middle Africa': 'Afrika Qendrore',
  'North America': 'Amerika e Veriut',
  'Northern Africa': 'Afrika Veriore',
  'Northern Europe': 'Evropa Veriore',
  Polynesia: 'Polinezia',
  'South America': 'Amerika e Jugut',
  'South-Eastern Asia': 'Azia Juglindore',
  'Southeast Europe': 'Evropa Juglindore',
  'Southern Africa': 'Afrika Jugore',
  'Southern Asia': 'Azia Jugore',
  'Southern Europe': 'Evropa Jugore',
  'Western Africa': 'Afrika Perëndimore',
  'Western Asia': 'Azia Perëndimore',
  'Western Europe': 'Evropa Perëndimore',
};

/**
 * Albanian names that replace the i18n package value: required forms ("Kosova"), official
 * renamings the package has not caught up with, a typo, and two entries the package gives the
 * same name (Saint-Martin / Sint Maarten), which would be indistinguishable in a picker.
 */
const NAME_SQ_OVERRIDES: Record<string, string> = {
  XK: 'Kosova',
  MK: 'Maqedonia e Veriut',
  PS: 'Palestina',
  SZ: 'Esvatini',
  BI: 'Burundi',
  HK: 'Hong Kong',
  MO: 'Makao',
  MF: 'Shën Martin (pjesa franceze)',
  SX: 'Shën Martin (pjesa holandeze)',
};

const DEFAULT_TERRITORY_NOTE_SQ =
  'Nuk është shtet anëtar i OKB-së; të dhënat makroekonomike shpesh mungojnë ose përfshihen te shteti me të cilin lidhet.';

const KIND_NOTES_SQ: Record<CountryCode, string> = {
  XKX: 'Kosova nuk është anëtare e OKB-së; njihet nga shumë shtete. Banka Botërore (kodi XKX) dhe FMN-ja e trajtojnë si ekonomi më vete.',
  TWN: 'Tajvani nuk është anëtar i OKB-së. Banka Botërore në përgjithësi nuk publikon të dhëna për Tajvanin, ndaj shumë tregues do të mungojnë.',
  VAT: 'Selia e Shenjtë ka statusin e shtetit vëzhgues jo-anëtar në OKB.',
  PSE: 'Shteti i Palestinës ka statusin e shtetit vëzhgues jo-anëtar në OKB. Banka Botërore e publikon me emrin “West Bank and Gaza” (PSE).',
  ESH: 'Statusi i Saharasë Perëndimore është i kontestuar; shumica e burimeve nuk publikojnë të dhëna makroekonomike të veçanta për të.',
  HKG: 'Rajon i Veçantë Administrativ i Kinës.',
  MAC: 'Rajon i Veçantë Administrativ i Kinës.',
  ATA: 'Nuk është shtet; rregullohet nga Traktati i Antarktidës dhe nuk ka të dhëna makroekonomike.',
};

const OBSERVER_STATES: ReadonlySet<CountryCode> = new Set(['VAT', 'PSE']);
const PARTIALLY_RECOGNISED: ReadonlySet<CountryCode> = new Set(['XKX', 'TWN']);

// ─────────────────────────────────────────────────────────────────────────────
// Catalog construction
// ─────────────────────────────────────────────────────────────────────────────

/** world-countries uses the user-assigned "UNK" for Kosovo; the app uses the World Bank's "XKX". */
function canonicalCode(c: WorldCountry): CountryCode {
  return c.cca2 === 'XK' ? 'XKX' : c.cca3;
}

/**
 * The package reports 194 UN members, but the UN has 193: it flags the Holy See (VAT) as a
 * member, while the Holy See is a non-member observer state. Correct it here.
 */
function isUnMember(c: WorldCountry, code: CountryCode): boolean {
  if (code === 'VAT') return false;
  return c.unMember === true;
}

function economyKind(c: WorldCountry, code: CountryCode): EconomyKind {
  if (OBSERVER_STATES.has(code)) return 'shtet_vezhgues_okb';
  if (PARTIALLY_RECOGNISED.has(code)) return 'njohje_e_pjesshme';
  if (isUnMember(c, code)) return 'shtet_anetar_okb';
  return 'territor';
}

function kindNote(kind: EconomyKind, code: CountryCode): string | undefined {
  if (KIND_NOTES_SQ[code]) return KIND_NOTES_SQ[code];
  return kind === 'territor' ? DEFAULT_TERRITORY_NOTE_SQ : undefined;
}

function nameSq(c: WorldCountry): string {
  return (
    NAME_SQ_OVERRIDES[c.cca2] ??
    isoCountries.getName(c.cca2, 'sq', { select: 'official' }) ??
    c.name.native?.sqi?.common ??
    c.name.common
  );
}

function sourceCodes(code: CountryCode): Country['sourceCodes'] {
  return {
    // The World Bank does not publish data for Taiwan, so there is nothing to query.
    worldbank: code === 'TWN' ? null : code,
    imf: code === 'XKX' ? 'UVK' : code,
  };
}

function toCountry(c: WorldCountry): Country {
  const code = canonicalCode(c);
  const kind = economyKind(c, code);
  const country: Country = {
    code,
    iso2: c.cca2,
    nameSq: nameSq(c),
    nameEn: c.name.common,
    kind,
    regionSq: REGION_LABELS_SQ[c.region] ?? c.region,
    currencies: Object.keys(c.currencies ?? {}),
    sourceCodes: sourceCodes(code),
    wb: null,
    isDemo: false,
  };
  const note = kindNote(kind, code);
  if (note) country.kindNoteSq = note;
  if (c.subregion) country.subregionSq = SUBREGION_LABELS_SQ[c.subregion] ?? c.subregion;
  if (c.capital?.[0]) country.capital = c.capital[0];
  return Object.freeze(country);
}

const collator = new Intl.Collator('sq', { sensitivity: 'base' });

let catalog: readonly Country[] | null = null;
let byCode: Map<CountryCode, Country> | null = null;
/** Extra search terms per code (package name variants, official names, alt spellings). */
let aliases: Map<CountryCode, string> | null = null;

function buildCatalog(): readonly Country[] {
  if (catalog) return catalog;
  const list = worldCountries.map(toCountry).sort((a, b) => collator.compare(a.nameSq, b.nameSq));
  catalog = Object.freeze(list);
  byCode = new Map(list.map((c) => [c.code, c]));
  aliases = new Map(
    worldCountries.map((c) => {
      const terms = [
        isoCountries.getName(c.cca2, 'sq') ?? '',
        c.name.official,
        c.name.native?.sqi?.common ?? '',
        c.name.native?.sqi?.official ?? '',
        c.cca3,
        ...(c.altSpellings ?? []),
      ];
      return [canonicalCode(c), normalizeSearchText(terms.join(' '))];
    }),
  );
  return catalog;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export interface CountryListOptions {
  /** Include the fictional demo economies ZZA/ZZB/ZZC (only when DATA_MODE=demo). */
  includeDemo?: boolean;
}

/** All economies sorted by Albanian name; demo economies are appended only on request. */
export function getCountries(opts: CountryListOptions = {}): Country[] {
  const list = [...buildCatalog()];
  return opts.includeDemo ? [...list, ...DEMO_COUNTRIES] : list;
}

/** Lookup by canonical code (case-insensitive); also accepts ISO alpha-2 and the package's "UNK". */
export function getCountry(code: string, opts: CountryListOptions = {}): Country | undefined {
  buildCatalog();
  const c = code.trim().toUpperCase();
  const wanted = c === 'UNK' ? 'XKX' : c;
  const demo = opts.includeDemo ? DEMO_COUNTRIES : [];
  const exact = byCode?.get(wanted) ?? demo.find((x) => x.code === wanted);
  if (exact || wanted.length !== 2) return exact;
  return getCountries(opts).find((x) => x.iso2 === wanted);
}

/** Lower-case, strip diacritics (ë→e, ç→c) and collapse whitespace, for accent-insensitive search. */
export function normalizeSearchText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/**
 * Drops one trailing "a"/"e" from each word so Albanian definite/indefinite forms meet:
 * "Kosova"/"Kosovë" → "kosov", "Shqipëria"/"Shqipëri" → "shqiperi".
 */
function stem(normalized: string): string {
  return normalized
    .split(' ')
    .map((w) => (w.length > 3 ? w.replace(/[ae]$/, '') : w))
    .join(' ');
}

export interface CountrySearchOptions {
  query?: string;
  regionSq?: string;
  subregionSq?: string;
  kind?: EconomyKind | EconomyKind[];
  /**
   * Keep only economies with macro data. Uses `economyCodes` when given (e.g. codes that have
   * stored observations); otherwise a country qualifies when World Bank classification is
   * attached (see withWbMeta) or it is a demo economy.
   */
  onlyWithEconomyData?: boolean;
  economyCodes?: ReadonlySet<CountryCode>;
}

export function hasEconomyData(country: Country, economyCodes?: ReadonlySet<CountryCode>): boolean {
  if (economyCodes) return economyCodes.has(country.code);
  return country.isDemo || Boolean(country.wb);
}

function haystack(c: Country): string {
  buildCatalog();
  return normalizeSearchText(`${c.nameSq} ${c.nameEn} ${c.code} ${c.iso2}`) + ' ' + (aliases?.get(c.code) ?? '');
}

/** 0 = exact code/name, 1 = name starts with query, 2 = contains, -1 = no match. */
function matchRank(c: Country, q: string): number {
  const name = normalizeSearchText(c.nameSq);
  if (q === c.code.toLowerCase() || q === c.iso2.toLowerCase() || q === name) return 0;
  if (name.startsWith(q) || normalizeSearchText(c.nameEn).startsWith(q)) return 1;
  const hay = haystack(c);
  if (hay.includes(q) || stem(hay).includes(stem(q))) return 2;
  return -1;
}

/** Filters a country list; accent- and case-insensitive over Albanian/English names and codes. */
export function searchCountries(list: Country[], opts: CountrySearchOptions = {}): Country[] {
  const kinds = opts.kind === undefined ? null : new Set(Array.isArray(opts.kind) ? opts.kind : [opts.kind]);
  const filtered = list.filter(
    (c) =>
      (!opts.regionSq || c.regionSq === opts.regionSq) &&
      (!opts.subregionSq || c.subregionSq === opts.subregionSq) &&
      (!kinds || kinds.has(c.kind)) &&
      (!opts.onlyWithEconomyData || hasEconomyData(c, opts.economyCodes)),
  );
  const q = normalizeSearchText(opts.query ?? '');
  if (!q) return filtered;
  return filtered
    .map((c, i) => ({ c, i, rank: matchRank(c, q) }))
    .filter((x) => x.rank >= 0)
    .sort((a, b) => a.rank - b.rank || a.i - b.i)
    .map((x) => x.c);
}

/** Attaches World Bank classification (from the store) to matching countries; others unchanged. */
export function withWbMeta(countries: Country[], meta: Record<CountryCode, Country['wb']>): Country[] {
  return countries.map((c) => {
    const wb = meta[c.code];
    return wb ? { ...c, wb } : c;
  });
}

/** Distinct Albanian region labels present in a list, for filter chips. */
export function listRegionsSq(countries: Country[]): string[] {
  return [...new Set(countries.map((c) => c.regionSq))].sort((a, b) => collator.compare(a, b));
}
