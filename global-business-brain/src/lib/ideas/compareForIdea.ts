/**
 * Krahasimi i 2–5 vendeve për të njëjtën ide biznesi (same archetype, same profile).
 *
 * Pure. Each row reuses the full idea evaluation for that country, so the comparison shows the
 * same score, macro verdicts and capital range the user sees on the idea page. Purchasing power
 * and price level are the latest measured values with their period and citation, or null
 * ("mungon"). Whether the user may legally work or register in a country is never assumed:
 * only countries the user declared themselves are marked as such, all others need verification.
 */
import type {
  BusinessArchetype,
  Citation,
  CountryCode,
  CountryDataContext,
  CoverageLevel,
  MoneyRange,
  ScoreResult,
  ScoreWeights,
  UserProfile,
} from '@/lib/domain/types';
import { citationForObservation } from '@/lib/analysis/citations';
import { formatPeriod } from '@/lib/finance/format';
import { macroClaimStance } from '@/lib/ideas/claims';
import { evaluateIdea } from '@/lib/ideas/engine';

export const MIN_IDEA_COMPARE_COUNTRIES = 2;
export const MAX_IDEA_COMPARE_COUNTRIES = 5;

export const OPERABILITY_DECLARED_SQ = 'E deklaruar nga ju';
export const OPERABILITY_VERIFY_SQ = 'Kërkon verifikim: e drejta për të punuar/regjistruar';

export interface IndicatorCell {
  value: number | null;
  period: string | null;
  citation: Citation | null;
}

export interface IdeaCountryRow {
  countryCode: CountryCode;
  nameSq: string;
  isDemo: boolean;
  score: ScoreResult;
  capitalRange: MoneyRange | null;
  supportedMacroClaims: number;
  contradictedMacroClaims: number;
  purchasingPower: IndicatorCell;
  priceLevel: IndicatorCell;
  operabilitySq: string;
  coverage: CoverageLevel;
  warningsSq: string[];
}

export interface IdeaCountryComparison {
  rows: IdeaCountryRow[];
  warningsSq: string[];
  noteSq: string;
}

export interface CompareForIdeaOptions {
  weights?: ScoreWeights;
  now: Date;
}

const PPP_CODE = 'gdp_per_capita_ppp';
const PRICE_LEVEL_CODE = 'price_level_ratio';

function cellFor(ctx: CountryDataContext, code: string): IndicatorCell {
  const series = ctx.series.find((s) => s.definition.code === code);
  const latest = series?.latest;
  if (!series || !latest || typeof latest.value !== 'number' || !Number.isFinite(latest.value)) {
    return { value: null, period: null, citation: null };
  }
  return { value: latest.value, period: latest.period, citation: citationForObservation(series.definition, latest) };
}

function rowFor(a: BusinessArchetype, profile: UserProfile, ctx: CountryDataContext, opts: CompareForIdeaOptions): IdeaCountryRow {
  const rec = evaluateIdea(a, profile, ctx, { weights: opts.weights, now: opts.now });
  const stances = rec.claims.macro.map(macroClaimStance);
  const purchasingPower = cellFor(ctx, PPP_CODE);
  const priceLevel = cellFor(ctx, PRICE_LEVEL_CODE);
  const warningsSq = [...rec.warningsSq];
  if (purchasingPower.value === null) warningsSq.push('Mungon PBB-ja për frymë sipas fuqisë blerëse (PPP) për këtë vend.');
  if (priceLevel.value === null) warningsSq.push('Mungon niveli i çmimeve për këtë vend; kostot lokale nuk u përshtatën.');
  if (!rec.fit.eligible) warningsSq.push(...rec.fit.blockersSq.map((b) => `Pengesë nga profili: ${b}`));
  const declared = profile.operableCountries.map((c) => c.toUpperCase()).includes(ctx.country.code.toUpperCase());
  return {
    countryCode: ctx.country.code,
    nameSq: ctx.country.nameSq,
    isDemo: ctx.isDemo,
    score: rec.score,
    capitalRange: rec.capitalRange,
    supportedMacroClaims: stances.filter((s) => s === 'mbeshtet').length,
    contradictedMacroClaims: stances.filter((s) => s === 'kundershton').length,
    purchasingPower,
    priceLevel,
    operabilitySq: declared ? OPERABILITY_DECLARED_SQ : OPERABILITY_VERIFY_SQ,
    coverage: ctx.coverage.level,
    warningsSq: [...new Set(warningsSq)],
  };
}

function periodWarning(labelSq: string, rows: IdeaCountryRow[], pick: (r: IdeaCountryRow) => IndicatorCell): string | null {
  const periods = rows.map(pick).map((c) => c.period).filter((p): p is string => p !== null);
  const distinct = [...new Set(periods)];
  if (distinct.length <= 1) return null;
  return `${labelSq}: periudhat ndryshojnë mes vendeve (${distinct.map(formatPeriod).join(', ')}) — krahasojini me kujdes.`;
}

function tableWarnings(contexts: CountryDataContext[], rows: IdeaCountryRow[]): string[] {
  const out: string[] = [];
  if (contexts.length < MIN_IDEA_COMPARE_COUNTRIES) {
    out.push(`Krahasimi kërkon të paktën ${MIN_IDEA_COMPARE_COUNTRIES} vende.`);
  }
  if (contexts.length > MAX_IDEA_COMPARE_COUNTRIES) {
    out.push(`U krahasuan vetëm ${MAX_IDEA_COMPARE_COUNTRIES} vendet e para (maksimumi).`);
  }
  const codes = contexts.map((c) => c.country.code);
  if (new Set(codes).size !== codes.length) out.push('I njëjti vend u zgjodh më shumë se një herë; u shfaq vetëm një herë.');
  const demo = rows.filter((r) => r.isDemo);
  if (demo.length > 0 && demo.length < rows.length) {
    out.push('Ekonomitë DEMO (fiktive) nuk duhen krahasuar me vende reale; vlerat e tyre janë të shpikura.');
  } else if (demo.length > 0) {
    out.push('[DEMO] Të gjitha vendet janë fiktive: krahasimi shërben vetëm për demonstrim.');
  }
  const ppp = periodWarning('Fuqia blerëse (PPP)', rows, (r) => r.purchasingPower);
  const price = periodWarning('Niveli i çmimeve', rows, (r) => r.priceLevel);
  if (ppp) out.push(ppp);
  if (price) out.push(price);
  if (rows.some((r) => r.capitalRange === null)) {
    out.push('Për disa vende kapitali nuk u llogarit (mungon kursi i këmbimit); ato nuk krahasohen me zero.');
  }
  if (rows.some((r) => r.coverage === 'e_pamjaftueshme')) {
    out.push('Për disa vende të dhënat janë të pamjaftueshme: pikëzimi i tyre mbështetet më shumë te profili dhe supozimet.');
  }
  return out;
}

function uniqueContexts(contexts: CountryDataContext[]): CountryDataContext[] {
  const seen = new Set<string>();
  return contexts.filter((c) => {
    if (seen.has(c.country.code)) return false;
    seen.add(c.country.code);
    return true;
  });
}

export function compareCountriesForIdea(
  a: BusinessArchetype,
  profile: UserProfile,
  contexts: CountryDataContext[],
  opts: CompareForIdeaOptions,
): IdeaCountryComparison {
  const selected = uniqueContexts(contexts).slice(0, MAX_IDEA_COMPARE_COUNTRIES);
  const rows = selected.map((ctx) => rowFor(a, profile, ctx, opts));
  return {
    rows,
    warningsSq: tableWarnings(contexts, rows),
    noteSq:
      'Krahasim orientues për të njëjtën ide dhe të njëjtin profil: pikëzimi nuk është probabilitet fitimi, periudhat e të dhënave mund të ndryshojnë mes vendeve dhe kapitali jepet në monedhën e profilit tuaj. E drejta për të punuar, për t’u regjistruar ose për t’u zhvendosur nuk supozohet — verifikojeni me burime zyrtare. Mos vendosni regjistrim ose zhvendosje vetëm nga një tregues.',
  };
}
