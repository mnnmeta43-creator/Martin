/**
 * Nga supozimet e arketipit te modeli financiar i redaktueshëm (archetype → FinancialInputs).
 *
 * Archetype amounts are general USD assumptions from the curated library, never verified prices.
 * This module converts them with a stored FX rate, optionally adjusts locally-priced items by a
 * cited price-level factor, and writes the provenance of every number into its note so nothing is
 * applied silently. If no FX rate exists the build fails honestly instead of guessing.
 *
 * `FinancialInputs` keeps price, unit variable cost and owner salary as bare numbers, so their range,
 * source and date travel in `assumptionsNotesSq` (which is persisted) and in `unitAssumptions`.
 */
import type {
  BusinessArchetype,
  Citation,
  CostItemTemplate,
  CostSourceKind,
  CurrencyCode,
  FinancialInputs,
  FxRate,
  IsoDate,
  MoneyLine,
  Ramp,
  ScenarioParams,
} from '@/lib/domain/types';
import { assetLabel } from '@/lib/domain/taxonomy';
import { convert, rateTextSq, type FxConversionOk } from '@/lib/finance/currency';
import { formatMoney, formatNumber, formatPeriod } from '@/lib/finance/format';
import { formatIsoDateSq } from '@/lib/finance/locale';

export interface PriceLevelAdjustment {
  factor: number;
  citation: Citation;
}

export interface BuildContext {
  currency: CurrencyCode;
  fxRates: FxRate[];
  ownCapital: number; // in ctx.currency
  ownerIncomeNeedMonthly?: number | null; // in ctx.currency
  priceLevel?: PriceLevelAdjustment | null;
  assets: string[]; // ASSETS ids the user already has
  startMonth: number; // 1–12
  today: IsoDate; // reference date for FX staleness
}

/** Value, range, currency, source and date of a model number that is not a `MoneyLine`. */
export interface UnitAssumption {
  value: number;
  low: number | null;
  high: number | null;
  currency: CurrencyCode;
  sourceKind: CostSourceKind;
  sourceNoteSq: string;
  date: IsoDate;
}

export interface UnitAssumptions {
  pricePerUnit: UnitAssumption;
  variableCostPerUnit: UnitAssumption;
  ownerSalaryMonthly: UnitAssumption | null; // null when no owner income need was given
}

export type BuildResult =
  | {
      ok: true;
      inputs: FinancialInputs;
      warningsSq: string[];
      appliedPriceLevel: PriceLevelAdjustment | null;
      unitAssumptions: UnitAssumptions;
    }
  | { ok: false; reasonSq: string };

/**
 * Optional archetype flag: true when the unit variable cost is local labour or services. Without it
 * the cost is treated as traded (materials, hosting) and NOT scaled by the local price level, which
 * avoids understating costs in low-price countries.
 */
type PricingAssumptions = BusinessArchetype['pricing'] & { variableCostScalesWithPriceLevel?: boolean };

type UsdRange = { low: number; base: number; high: number };

export const PRICE_LEVEL_MIN = 0.25;
export const PRICE_LEVEL_MAX = 1.5;
export const DEFAULT_RESERVE_MONTHS = 3;
export const DEFAULT_HORIZON_MONTHS = 12;

/** Default scenario adjustments on top of the archetype ramps (visible and editable in the UI). */
export const SCENARIO_DEFAULTS = {
  konservator: { priceMultiplier: 0.9, variableCostMultiplier: 1.1, fixedCostMultiplier: 1.1, extraCollectionDays: 15 },
  baze: { priceMultiplier: 1, variableCostMultiplier: 1, fixedCostMultiplier: 1, extraCollectionDays: null },
  optimist: { priceMultiplier: 1.05, variableCostMultiplier: 0.95, fixedCostMultiplier: 1, extraCollectionDays: null },
} as const;

interface LineContext {
  rate: number;
  conversionSq: string; // provenance sentence shared by every line
  priceLevel: PriceLevelAdjustment | null;
  priceLevelSq: string | null;
  assets: ReadonlySet<string>;
  date: IsoDate;
}

function conversionSentenceSq(archetype: BusinessArchetype, currency: CurrencyCode, fx: FxConversionOk): string {
  const library = `Supozim i përgjithshëm i bibliotekës (${archetype.assumptionsDate})`;
  if (currency === 'USD') return `${library}, në USD (pa konvertim).`;
  const via = fx.viaCurrency ? `, përmes ${fx.viaCurrency}` : '';
  return `${library}, konvertuar nga USD me kursin ${rateTextSq('USD', currency, fx.rate)} të datës ${formatIsoDateSq(fx.rateDate)} (${fx.sourceId}${via}).`;
}

function citationPeriodSq(citation: Citation): string {
  return citation.period ? formatPeriod(citation.period) : 'periudhë e pacaktuar';
}

function priceLevelLineSq(level: PriceLevelAdjustment): string {
  return `Shuma u shumëzua me faktorin e nivelit lokal të çmimeve ${formatNumber(level.factor, 2)} (${level.citation.sourceName}, periudha ${citationPeriodSq(level.citation)}): supozim se puna dhe shërbimet lokale ndjekin nivelin e çmimeve — duhet verifikuar me oferta reale.`;
}

function avoidingAssets(template: CostItemTemplate, assets: ReadonlySet<string>): string[] {
  return (template.avoidedByAssets ?? []).filter((id) => assets.has(id));
}

function buildLine(template: CostItemTemplate, ctx: LineContext): MoneyLine {
  const scaled = template.scalesWithPriceLevel && ctx.priceLevel !== null;
  const factor = ctx.rate * (scaled && ctx.priceLevel ? ctx.priceLevel.factor : 1);
  const low = template.lowUSD * factor;
  const high = template.highUSD * factor;
  const avoidedBy = avoidingAssets(template, ctx.assets);
  const notes = [template.noteSq, ctx.conversionSq];
  if (scaled && ctx.priceLevelSq) notes.push(ctx.priceLevelSq);
  if (avoidedBy.length > 0) notes.push(`Shmanget sepse keni: ${avoidedBy.map(assetLabel).join(', ')}.`);
  return {
    id: template.id,
    labelSq: template.labelSq,
    category: template.category,
    amount: (low + high) / 2,
    low,
    high,
    sourceKind: 'supozim',
    sourceNoteSq: notes.join(' '),
    date: ctx.date,
    enabled: avoidedBy.length === 0,
    ...(template.optional !== undefined ? { optional: template.optional } : {}),
  };
}

function resolvePriceLevel(level: PriceLevelAdjustment | null | undefined, warnings: string[]): PriceLevelAdjustment | null {
  if (!level) return null;
  if (!Number.isFinite(level.factor) || level.factor <= 0) {
    warnings.push('Faktori i nivelit të çmimeve nuk është numër pozitiv i vlefshëm; nuk u aplikua asnjë përshtatje.');
    return null;
  }
  const factor = Math.min(PRICE_LEVEL_MAX, Math.max(PRICE_LEVEL_MIN, level.factor));
  if (factor !== level.factor) {
    warnings.push(
      `Faktori i nivelit të çmimeve (${formatNumber(level.factor, 2)}) u kufizua në ${formatNumber(factor, 2)}, brenda kufijve ${formatNumber(PRICE_LEVEL_MIN, 2)}–${formatNumber(PRICE_LEVEL_MAX, 2)}, që një vlerë ekstreme të mos shtrembërojë modelin.`,
    );
  }
  return { factor, citation: level.citation };
}

function scaledRange(range: UsdRange, factor: number): UsdRange {
  return { low: range.low * factor, base: range.base * factor, high: range.high * factor };
}

function rangeSq(range: UsdRange, currency: CurrencyCode): string {
  return `${formatMoney(range.base, currency)} (diapazoni ${formatMoney(range.low, currency)}–${formatMoney(range.high, currency)})`;
}

function priceLevelNoteSq(level: PriceLevelAdjustment, variableScaled: boolean): string {
  const scaled = variableScaled
    ? 'kostot lokale (qira, punë, shërbime), çmimi për njësi dhe kostoja variabël për njësi'
    : 'kostot lokale (qira, punë, shërbime) dhe çmimi për njësi';
  const variableSq = variableScaled
    ? ''
    : ' Kostoja variabël për njësi NUK u shumëzua: supozohet mall ose shërbim me çmim ndërkombëtar (p.sh. materiale, hostim). Nëse te ju është punë lokale, ndryshojeni sipas ofertave.';
  return `Niveli i çmimeve: ${scaled} u shumëzuan me faktorin ${formatNumber(level.factor, 2)} nga ${level.citation.sourceName} (periudha ${citationPeriodSq(level.citation)}). Kjo është supozim: çmimet lokale të shërbimeve priren të ndjekin nivelin e përgjithshëm të çmimeve, por duhet verifikuar.${variableSq}`;
}

function scenarioFromRamp(ramp: Ramp, defaults: (typeof SCENARIO_DEFAULTS)[keyof typeof SCENARIO_DEFAULTS], collectionDays: number): ScenarioParams {
  return {
    startCustomers: ramp.startCustomers,
    monthlyNewCustomers: ramp.monthlyNewCustomers,
    monthlyChurnPct: ramp.monthlyChurnPct,
    priceMultiplier: defaults.priceMultiplier,
    variableCostMultiplier: defaults.variableCostMultiplier,
    fixedCostMultiplier: defaults.fixedCostMultiplier,
    collectionDaysOverride: defaults.extraCollectionDays === null ? null : collectionDays + defaults.extraCollectionDays,
  };
}

function cleanStartMonth(value: number, warnings: string[]): number {
  if (Number.isInteger(value) && value >= 1 && value <= 12) return value;
  warnings.push('Muaji i nisjes duhet të jetë nga 1 deri në 12; u përdor janari (1).');
  return 1;
}

function cleanMoney(value: number | null | undefined, labelSq: string, warnings: string[]): number {
  if (value === null || value === undefined) return 0;
  if (!Number.isFinite(value) || value < 0) {
    warnings.push(`Vlera e pavlefshme për «${labelSq}»; u vendos 0.`);
    return 0;
  }
  return value;
}

function referenceDate(today: IsoDate): Date | undefined {
  const time = Date.parse(`${today}T00:00:00Z`);
  return Number.isFinite(time) ? new Date(time) : undefined;
}

/** Turns an archetype's general USD assumptions into editable inputs in the user's currency. */
export function buildFinancialInputs(archetype: BusinessArchetype, ctx: BuildContext): BuildResult {
  const currency = ctx.currency.trim().toUpperCase();
  const fx = convert(1, 'USD', currency, ctx.fxRates, { now: referenceDate(ctx.today) });
  if (!fx.ok) return { ok: false, reasonSq: `Modeli financiar nuk mund të ndërtohet në ${currency}: ${fx.reasonSq}` };

  const warningsSq: string[] = [...fx.warningsSq];
  const priceLevel = resolvePriceLevel(ctx.priceLevel, warningsSq);
  const lineCtx: LineContext = {
    rate: fx.rate,
    conversionSq: conversionSentenceSq(archetype, currency, fx),
    priceLevel,
    priceLevelSq: priceLevel ? priceLevelLineSq(priceLevel) : null,
    assets: new Set(ctx.assets),
    date: archetype.assumptionsDate,
  };
  const ownerIncome = cleanMoney(ctx.ownerIncomeNeedMonthly, 'nevoja mujore për të ardhura të pronarit', warningsSq);
  const includeOwnerSalary = ownerIncome > 0;
  const pricing: PricingAssumptions = archetype.pricing;
  const levelFactor = priceLevel ? priceLevel.factor : 1;
  const variableScaled = priceLevel !== null && pricing.variableCostScalesWithPriceLevel === true;
  const price = scaledRange(pricing.priceUSD, fx.rate * levelFactor);
  const variable = scaledRange(pricing.variableCostUSD, fx.rate * (variableScaled ? levelFactor : 1));
  const konservatorDays = SCENARIO_DEFAULTS.konservator.extraCollectionDays;

  const unitNoteSq = [
    `Çmimi për njësi (${pricing.unitLabelSq}): ${rangeSq(price, currency)}; kostoja variabël për njësi: ${rangeSq(variable, currency)}. Modeli përdor vlerën bazë; diapazoni tregon sa mund të ndryshojë.`,
    lineCtx.conversionSq,
    pricing.noteSq,
  ].join(' ');
  const ownerSalaryNoteSq = `Paga e pronarit: ${formatMoney(ownerIncome, currency)} në muaj, nga nevoja juaj e deklaruar për të ardhura (vlerë e përdoruesit, ${formatIsoDateSq(ctx.today)}).`;
  const assumptionsNotesSq = [
    `${lineCtx.conversionSq} Këto nuk janë çmime të verifikuara: zëvendësojini me oferta reale sapo t’i keni.`,
    unitNoteSq,
    ...(priceLevel ? [priceLevelNoteSq(priceLevel, variableScaled)] : []),
    'Tatimi mbi fitimin: Kërkon verifikim lokal (vendosur 0%)',
    includeOwnerSalary ? ownerSalaryNoteSq : 'Paga e pronarit nuk përfshihet — rezultati operativ e mbivlerëson atë që ju mbetet.',
    `Skenari konservator: klientët paguajnë ${konservatorDays} ditë më vonë se në supozimin bazë (${pricing.collectionDays} + ${konservatorDays} = ${pricing.collectionDays + konservatorDays} ditë). Nëse ndryshoni ditët bazë, përditësoni edhe ditët e skenarit konservator.`,
    `Sezonaliteti: ${archetype.seasonalityNoteSq}`,
    ...fx.warningsSq.map((w) => `Kursi i këmbimit: ${w}`),
  ];
  const libraryAssumption = (range: UsdRange): UnitAssumption => ({
    value: range.base,
    low: range.low,
    high: range.high,
    currency,
    sourceKind: 'supozim',
    sourceNoteSq: unitNoteSq,
    date: archetype.assumptionsDate,
  });
  const unitAssumptions: UnitAssumptions = {
    pricePerUnit: libraryAssumption(price),
    variableCostPerUnit: libraryAssumption(variable),
    ownerSalaryMonthly: includeOwnerSalary
      ? { value: ownerIncome, low: null, high: null, currency, sourceKind: 'perdoruesi', sourceNoteSq: ownerSalaryNoteSq, date: ctx.today }
      : null,
  };

  const inputs: FinancialInputs = {
    currency,
    startupCosts: archetype.startupCosts.map((t) => buildLine(t, lineCtx)),
    monthlyFixedCosts: archetype.monthlyFixedCosts.map((t) => buildLine(t, lineCtx)),
    includeOwnerSalary,
    ownerSalaryMonthly: ownerIncome,
    pricePerUnit: price.base,
    variableCostPerUnit: variable.base,
    unitLabelSq: pricing.unitLabelSq,
    unitsPerCustomerPerMonth: pricing.unitsPerCustomerPerMonth,
    collectionDays: pricing.collectionDays,
    supplierPaymentDays: pricing.supplierPaymentDays,
    seasonality: [...archetype.seasonality],
    startMonth: cleanStartMonth(ctx.startMonth, warningsSq),
    ownCapital: cleanMoney(ctx.ownCapital, 'kapitali vetjak', warningsSq),
    reserveMonths: DEFAULT_RESERVE_MONTHS,
    profitTaxPct: 0,
    horizonMonths: DEFAULT_HORIZON_MONTHS,
    scenarios: {
      konservator: scenarioFromRamp(archetype.ramp.konservator, SCENARIO_DEFAULTS.konservator, pricing.collectionDays),
      baze: scenarioFromRamp(archetype.ramp.baze, SCENARIO_DEFAULTS.baze, pricing.collectionDays),
      optimist: scenarioFromRamp(archetype.ramp.optimist, SCENARIO_DEFAULTS.optimist, pricing.collectionDays),
    },
    assumptionsNotesSq,
  };

  return { ok: true, inputs, warningsSq, appliedPriceLevel: priceLevel, unitAssumptions };
}
