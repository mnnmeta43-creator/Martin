/**
 * Konvertimi i monedhave dhe rrumbullakimi (pure, deterministic).
 *
 * Uses only rates that were stored by the data layer (or entered manually); it never fetches and
 * never guesses. When no usable rate exists the result is `{ ok: false }` with an Albanian reason,
 * so callers show "missing" instead of a made-up number. Every caveat about the rate (stale,
 * annual average, demo, triangulated) travels with the result as an Albanian warning.
 */
import type { CurrencyCode, FinancialInputs, FxConversion, FxRate, MoneyLine } from '@/lib/domain/types';
import { currencyDisplayDigits, formatIsoDateSq, numberFormat } from '@/lib/finance/locale';

export interface ConvertOptions {
  /** Reference "today" for staleness checks; without it no staleness warning is produced. */
  now?: Date;
  maxAgeDaysDaily?: number; // default 7 — also used for manual rates
  maxAgeDaysAnnual?: number; // default 550 — an annual average is naturally months old
}

export type FxConversionOk = Extract<FxConversion, { ok: true }>;

export type ConvertInputsResult =
  | { ok: true; inputs: FinancialInputs; conversion: FxConversionOk }
  | { ok: false; reasonSq: string };

/** sourceId reported when no conversion is needed (same currency, rate exactly 1). */
export const SAME_CURRENCY_SOURCE_ID = 'e-njejta-monedhe';

/** Currencies tried, in order, as the bridge when no direct or inverse rate is stored. */
export const TRIANGULATION_CURRENCIES: readonly CurrencyCode[] = ['EUR', 'USD'];

const DEFAULT_MAX_AGE_DAILY = 7;
const DEFAULT_MAX_AGE_ANNUAL = 550;
const MS_PER_DAY = 86_400_000;

// Lower number = preferred. A rate the user typed in wins; demo rates only as a last resort.
const KIND_PRIORITY: Record<FxRate['kind'], number> = {
  manuale: 0,
  reference_ditore: 1,
  mesatare_vjetore: 2,
  demo: 3,
};

interface Leg {
  from: CurrencyCode;
  to: CurrencyCode;
  rate: number; // 1 from = rate to
  rateDate: string;
  sourceId: string;
  kind: FxRate['kind'];
  retrievedAt: string;
  inverted: boolean;
}

function normalizeCode(code: string): CurrencyCode {
  return code.trim().toUpperCase();
}

function isUsableRate(rate: FxRate): boolean {
  return Number.isFinite(rate.rate) && rate.rate > 0 && typeof rate.base === 'string' && typeof rate.quote === 'string';
}

function compareLegs(a: Leg, b: Leg): number {
  const byKind = KIND_PRIORITY[a.kind] - KIND_PRIORITY[b.kind];
  if (byKind !== 0) return byKind;
  if (a.rateDate !== b.rateDate) return a.rateDate < b.rateDate ? 1 : -1; // most recent first
  if (a.inverted !== b.inverted) return a.inverted ? 1 : -1; // stored direction avoids 1/x rounding
  if (a.retrievedAt !== b.retrievedAt) return a.retrievedAt < b.retrievedAt ? 1 : -1;
  return 0;
}

/** Best stored rate for from→to, using the inverse (1/rate) of to→from when needed. */
function findLeg(from: CurrencyCode, to: CurrencyCode, rates: readonly FxRate[]): Leg | null {
  const candidates: Leg[] = [];
  for (const stored of rates) {
    if (!isUsableRate(stored)) continue;
    const base = normalizeCode(stored.base);
    const quote = normalizeCode(stored.quote);
    const common = { from, to, rateDate: stored.rateDate, sourceId: stored.sourceId, kind: stored.kind, retrievedAt: stored.retrievedAt };
    if (base === from && quote === to) candidates.push({ ...common, rate: stored.rate, inverted: false });
    else if (base === to && quote === from) candidates.push({ ...common, rate: 1 / stored.rate, inverted: true });
  }
  candidates.sort(compareLegs);
  return candidates[0] ?? null;
}

function ageInDays(rateDate: string, now: Date): number | null {
  const rateTime = Date.parse(`${rateDate}T00:00:00Z`);
  const nowTime = now.getTime();
  if (!Number.isFinite(rateTime) || !Number.isFinite(nowTime)) return null;
  return Math.floor((nowTime - rateTime) / MS_PER_DAY);
}

function legWarnings(leg: Leg, opts: ConvertOptions): string[] {
  const warnings: string[] = [];
  if (leg.kind === 'demo') warnings.push('Kurs DEMO — jo për vendime.');
  if (leg.kind === 'mesatare_vjetore') {
    warnings.push(`Kurs mesatar vjetor i periudhës ${leg.rateDate.slice(0, 4)}, jo kurs i ditës.`);
  }
  if (opts.now && leg.kind !== 'demo') {
    const maxAge =
      leg.kind === 'mesatare_vjetore'
        ? (opts.maxAgeDaysAnnual ?? DEFAULT_MAX_AGE_ANNUAL)
        : (opts.maxAgeDaysDaily ?? DEFAULT_MAX_AGE_DAILY);
    const age = ageInDays(leg.rateDate, opts.now);
    if (age !== null && age > maxAge) {
      warnings.push(
        `Kursi ${leg.from}→${leg.to} është i datës ${formatIsoDateSq(leg.rateDate)} (${age} ditë më parë), më i vjetër se ${maxAge} ditë — mund të mos pasqyrojë kursin aktual.`,
      );
    }
  }
  return warnings;
}

function combineLegs(amount: number, legs: Leg[], opts: ConvertOptions, viaCurrency?: CurrencyCode): FxConversionOk {
  const rate = legs.reduce((product, leg) => product * leg.rate, 1);
  // The weakest leg defines the quality of the combined rate (oldest date, least reliable kind).
  const rateDate = legs.reduce((oldest, leg) => (leg.rateDate < oldest ? leg.rateDate : oldest), legs[0].rateDate);
  const kind = legs.reduce<FxRate['kind']>(
    (worst, leg) => (KIND_PRIORITY[leg.kind] > KIND_PRIORITY[worst] ? leg.kind : worst),
    legs[0].kind,
  );
  const sourceId = [...new Set(legs.map((leg) => leg.sourceId))].join('+');
  const warnings = new Set<string>();
  if (viaCurrency) {
    warnings.add(`Kurs i llogaritur përmes ${viaCurrency} (${legs[0].from}→${viaCurrency}→${legs[legs.length - 1].to}).`);
  }
  for (const leg of legs) for (const warning of legWarnings(leg, opts)) warnings.add(warning);
  return { ok: true, value: amount * rate, rate, rateDate, sourceId, kind, ...(viaCurrency ? { viaCurrency } : {}), warningsSq: [...warnings] };
}

function isoDateOf(date: Date | undefined): string {
  if (!date || !Number.isFinite(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

/**
 * Converts `amount` from one currency to another using stored rates.
 * Order: same currency → direct/inverse rate → triangulation via EUR, then USD → missing.
 */
export function convert(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: readonly FxRate[],
  opts: ConvertOptions = {},
): FxConversion {
  const fromCode = normalizeCode(from);
  const toCode = normalizeCode(to);
  if (!Number.isFinite(amount)) return { ok: false, reasonSq: 'Shuma për konvertim nuk është numër i vlefshëm.' };
  if (fromCode === toCode) {
    return { ok: true, value: amount, rate: 1, rateDate: isoDateOf(opts.now), sourceId: SAME_CURRENCY_SOURCE_ID, kind: 'manuale', warningsSq: [] };
  }

  const direct = findLeg(fromCode, toCode, rates);
  if (direct) return combineLegs(amount, [direct], opts);

  for (const via of TRIANGULATION_CURRENCIES) {
    if (via === fromCode || via === toCode) continue;
    const first = findLeg(fromCode, via, rates);
    const second = first ? findLeg(via, toCode, rates) : null;
    if (first && second) return combineLegs(amount, [first, second], opts, via);
  }

  return {
    ok: false,
    reasonSq: `Nuk ka kurs këmbimi të ruajtur për ${fromCode}→${toCode}. Vendosni kursin manualisht ose rifreskoni burimin.`,
  };
}

/** Number of decimals customary for a currency (JPY 0, EUR 2, CLDR display digits); static so every runtime agrees. */
export function currencyMinorUnits(code: CurrencyCode): number {
  return currencyDisplayDigits(code);
}

/**
 * Rounds half away from zero to the currency's minor unit, avoiding binary artefacts (1.005 → 1.01).
 * The decimal-string shift needs the plain notation JavaScript only prints between 1e-6 and 1e21, so
 * values below half a minor unit (float noise) return 0 and values with no fractional precision
 * left (≥ 2^53 minor units) are returned unchanged.
 */
export function roundMoney(value: number, currency: CurrencyCode): number {
  if (!Number.isFinite(value)) return value;
  const digits = currencyMinorUnits(currency);
  const abs = Math.abs(value);
  if (abs < 0.5 * 10 ** -digits) return 0;
  if (abs * 10 ** digits >= Number.MAX_SAFE_INTEGER) return value;
  const magnitude = Math.round(Number(`${abs}e${digits}`));
  const rounded = Number(`${magnitude}e-${digits}`);
  return value < 0 && rounded !== 0 ? -rounded : rounded;
}

/** "1 USD = 0,5 EUR" — rate shown with up to 6 significant digits. */
export function rateTextSq(from: CurrencyCode, to: CurrencyCode, rate: number): string {
  return `1 ${normalizeCode(from)} = ${numberFormat({ maximumSignificantDigits: 6 }).format(rate)} ${normalizeCode(to)}`;
}

/** Sentence appended to every converted line so the provenance of the number stays visible. */
export function conversionNoteSq(from: CurrencyCode, to: CurrencyCode, conversion: FxConversionOk): string {
  const via = conversion.viaCurrency ? `, përmes ${conversion.viaCurrency}` : '';
  return `Konvertuar nga ${normalizeCode(from)} në ${normalizeCode(to)} me kursin ${rateTextSq(from, to, conversion.rate)} të datës ${formatIsoDateSq(conversion.rateDate)} (${conversion.sourceId}${via}).`;
}

function convertLine(line: MoneyLine, rate: number, note: string): MoneyLine {
  return {
    ...line,
    amount: line.amount * rate,
    low: typeof line.low === 'number' ? line.low * rate : line.low,
    high: typeof line.high === 'number' ? line.high * rate : line.high,
    sourceNoteSq: `${line.sourceNoteSq} ${note}`.trim(),
  };
}

/** Converts every money field of a financial model to another currency (returns a new object). */
export function convertInputs(
  inputs: FinancialInputs,
  to: CurrencyCode,
  rates: readonly FxRate[],
  opts: ConvertOptions = {},
): ConvertInputsResult {
  const from = normalizeCode(inputs.currency);
  const toCode = normalizeCode(to);
  const conversion = convert(1, from, toCode, rates, opts);
  if (!conversion.ok) return conversion;
  if (from === toCode) return { ok: true, inputs: structuredClone(inputs), conversion };

  const { rate } = conversion;
  const note = conversionNoteSq(from, toCode, conversion);
  const next: FinancialInputs = {
    ...structuredClone(inputs),
    currency: toCode,
    startupCosts: inputs.startupCosts.map((line) => convertLine(line, rate, note)),
    monthlyFixedCosts: inputs.monthlyFixedCosts.map((line) => convertLine(line, rate, note)),
    ownerSalaryMonthly: inputs.ownerSalaryMonthly * rate,
    pricePerUnit: inputs.pricePerUnit * rate,
    variableCostPerUnit: inputs.variableCostPerUnit * rate,
    ownCapital: inputs.ownCapital * rate,
    assumptionsNotesSq: [...inputs.assumptionsNotesSq, `Të gjitha shumat: ${note}`, ...conversion.warningsSq],
  };
  return { ok: true, inputs: next, conversion };
}
