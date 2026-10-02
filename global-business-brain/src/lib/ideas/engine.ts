/**
 * Motori i ideve: vlerëson një arketip për një profil dhe një vend, dhe rendit bibliotekën.
 *
 * Pure: `now` is a parameter and every number comes from the deterministic finance engine.
 * Ideas that a solo founder cannot start (team blockers) and ideas excluded for other hard
 * reasons are returned in their own lists with reasons — they are never ranked next to ideas the
 * user can actually start. Demo data is flagged on every recommendation and in its warnings.
 */
import type {
  BusinessArchetype,
  BusinessMode,
  Citation,
  CountryDataContext,
  EvidenceEntry,
  FinancialInputs,
  FxRate,
  IdeaRecommendation,
  MarketScope,
  MoneyLine,
  MoneyRange,
  ProjectionResult,
  ScoreWeights,
  SectorId,
  UserProfile,
} from '@/lib/domain/types';
import { DEFAULT_SCORE_WEIGHTS } from '@/lib/domain/taxonomy';
import { citationForObservation } from '@/lib/analysis/citations';
import { buildFinancialInputs, type PriceLevelAdjustment } from '@/lib/finance/build';
import { projectScenario } from '@/lib/finance/engine';
import { formatMoney, formatNumber, formatPeriod } from '@/lib/finance/format';
import { ARCHETYPES } from '@/lib/ideas/archetypes';
import { assessMacroLinks, buildMacroClaims, buildWhyFailClaims, buildWhyWorkClaims } from '@/lib/ideas/claims';
import { assessProfileFitDetailed, type FitBlocker } from '@/lib/ideas/fit';
import { assessEvidenceQuality, scoreIdea } from '@/lib/scoring/score';

export interface EvaluateOptions {
  weights?: ScoreWeights;
  now: Date;
  /** Customer evidence recorded for a project (payments, pre-orders, interviews…). */
  evidence?: EvidenceEntry[];
  /** Scale locally-priced costs by the country's cited price level (default true). */
  applyPriceLevel?: boolean;
  /** Extra rates (e.g. manual ones typed by the user) tried together with the stored ones. */
  extraFxRates?: FxRate[];
}

export interface IdeaFilters {
  sector?: SectorId;
  mode?: BusinessMode;
  scope?: MarketScope;
  /** Maximum startup capital (low end of the range) in the profile currency. */
  maxCapital?: number;
}

export interface GenerateIdeasInput {
  profile: UserProfile;
  ctx: CountryDataContext;
  now: Date;
  weights?: ScoreWeights;
  filters?: IdeaFilters;
  library?: BusinessArchetype[];
  evidence?: EvidenceEntry[];
}

export interface GenerateIdeasResult {
  /** Eligible ideas, best score first; ties broken by evidence quality, then name. */
  recommendations: IdeaRecommendation[];
  /** Ideas blocked only because they need a partner or a team. */
  teamRequired: IdeaRecommendation[];
  /** Ideas excluded for other hard reasons (age, home-only start…), with the reasons in fit.blockersSq. */
  excluded: IdeaRecommendation[];
  noteSq: string;
}

/** Everything evaluateIdea computes, for callers that need the projection or typed blockers too. */
export interface IdeaEvaluation {
  recommendation: IdeaRecommendation;
  inputs: FinancialInputs | null;
  projection: ProjectionResult | null;
  blockers: FitBlocker[];
}

const EVIDENCE_RANK: Record<IdeaRecommendation['evidence']['level'], number> = {
  e_larte: 3,
  mesatare: 2,
  e_ulet: 1,
  shume_e_ulet: 0,
};

// ─────────────────────────────────────────────────────────────────────────────
// Single idea
// ─────────────────────────────────────────────────────────────────────────────

function priceLevelFor(ctx: CountryDataContext): PriceLevelAdjustment | null {
  const series = ctx.series.find((s) => s.definition.code === 'price_level_ratio');
  const latest = series?.latest;
  if (!series || !latest || typeof latest.value !== 'number' || !Number.isFinite(latest.value) || latest.value <= 0) return null;
  const citation: Citation = citationForObservation(series.definition, latest);
  return { factor: latest.value, citation };
}

function lineRange(lines: MoneyLine[]): { low: number; high: number } {
  let low = 0;
  let high = 0;
  for (const line of lines) {
    if (!line.enabled) continue;
    const lo = typeof line.low === 'number' && Number.isFinite(line.low) ? line.low : line.amount;
    const hi = typeof line.high === 'number' && Number.isFinite(line.high) ? line.high : line.amount;
    low += Math.min(lo, hi);
    high += Math.max(lo, hi);
  }
  return { low, high };
}

function priceLevelBasisSq(level: PriceLevelAdjustment | null): string {
  if (!level) return ' Pa përshtatje për nivelin lokal të çmimeve.';
  return ` Kostot lokale u përshtatën me faktorin e nivelit të çmimeve ${formatNumber(level.factor, 2)} (${level.citation.sourceName}, ${formatPeriod(level.citation.period)}) — supozim, jo çmim i verifikuar.`;
}

function capitalRangeOf(inputs: FinancialInputs, projection: ProjectionResult, level: PriceLevelAdjustment | null): MoneyRange {
  const { low, high } = lineRange(inputs.startupCosts);
  return {
    low,
    high,
    currency: inputs.currency,
    basisSq: `Shuma e kostove të hapjes (zërat e aktivizuar; zërat që shmangen me asetet tuaja janë hequr), nga supozimet e përgjithshme të bibliotekës në USD të konvertuara në ${inputs.currency}.${priceLevelBasisSq(level)} Nuk përfshin rezervën dhe deficitin e muajve të parë: kapitali i plotë i nevojshëm në skenarin bazë është ${formatMoney(projection.capital.totalRequired, inputs.currency)}.`,
  };
}

function monthlyCostRangeOf(inputs: FinancialInputs, level: PriceLevelAdjustment | null): MoneyRange {
  const { low, high } = lineRange(inputs.monthlyFixedCosts);
  return {
    low,
    high,
    currency: inputs.currency,
    basisSq: `Kostot fikse mujore të biznesit (zërat e aktivizuar), pa pagën e pronarit dhe pa kostot variabël, nga supozimet e bibliotekës të konvertuara në ${inputs.currency}.${priceLevelBasisSq(level)}`,
  };
}

function dataWarnings(a: BusinessArchetype, ctx: CountryDataContext): string[] {
  const out: string[] = [];
  if (ctx.isDemo) out.push('[DEMO] Të dhëna fiktive: kjo ekonomi nuk ekziston dhe rezultati shërben vetëm për të provuar aplikacionin, jo për vendime reale.');
  if (ctx.coverage.level !== 'e_plote') out.push(ctx.coverage.noteSq);
  const links = assessMacroLinks(a, ctx);
  const missing = links.filter((m) => m.stance === 'mungon').map((m) => m.nameSq);
  const stale = links.filter((m) => m.status === 'i_vjeter' || m.status === 'shume_i_vjeter').map((m) => m.nameSq);
  if (missing.length > 0) out.push(`Mungojnë të dhënat për treguesit e lidhur me këtë ide: ${missing.join(', ')} (shfaqen si mungesë, jo si zero).`);
  if (stale.length > 0) out.push(`Tregues të vjetër të lidhur me këtë ide: ${stale.join(', ')}.`);
  if (ctx.sourceErrors.length > 0) out.push('Rifreskimi i fundit i disa burimeve dështoi; po përdoren të dhënat e ruajtura më parë.');
  return out;
}

function summaryOf(a: BusinessArchetype): string {
  return `${a.taglineSq} Kush paguan: ${a.payingCustomerSq}`;
}

/** Full evaluation: recommendation plus the inputs/projection and typed blockers behind it. */
export function evaluateIdeaDetailed(a: BusinessArchetype, profile: UserProfile, ctx: CountryDataContext, opts: EvaluateOptions): IdeaEvaluation {
  const currency = profile.capital.currency.trim().toUpperCase();
  const candidateLevel = opts.applyPriceLevel === false ? null : priceLevelFor(ctx);
  const built = buildFinancialInputs(a, {
    currency,
    fxRates: [...ctx.fxRates, ...(opts.extraFxRates ?? [])],
    ownCapital: profile.capital.amount,
    ownerIncomeNeedMonthly: profile.ownerIncomeNeedMonthly ?? null,
    priceLevel: candidateLevel,
    assets: profile.assets,
    startMonth: opts.now.getUTCMonth() + 1,
    today: opts.now.toISOString().slice(0, 10),
  });

  const warningsSq = dataWarnings(a, ctx);
  let inputs: FinancialInputs | null = null;
  let projection: ProjectionResult | null = null;
  let capitalRange: MoneyRange | null = null;
  let monthlyCostRange: MoneyRange | null = null;
  let priceLevelAdjustment: PriceLevelAdjustment | null = candidateLevel;
  if (built.ok) {
    inputs = built.inputs;
    projection = projectScenario(inputs, 'baze');
    priceLevelAdjustment = built.appliedPriceLevel;
    capitalRange = capitalRangeOf(inputs, projection, priceLevelAdjustment);
    monthlyCostRange = monthlyCostRangeOf(inputs, priceLevelAdjustment);
    warningsSq.push(...built.warningsSq.map((w) => `Kursi/modeli: ${w}`));
    if (!inputs.includeOwnerSalary) {
      warningsSq.push('Paga e pronarit nuk përfshihet në kosto (nuk keni dhënë nevojën mujore për të ardhura) — rezultati e mbivlerëson atë që ju mbetet.');
    }
  } else {
    warningsSq.push(`${built.reasonSq} Kapitali, kostot dhe ekonomia e biznesit nuk vlerësohen derisa të ketë një kurs të ruajtur ose manual.`);
  }

  const { fit, blockers } = assessProfileFitDetailed(a, profile, { capitalRange, ownCapital: profile.capital.amount });
  const macro = buildMacroClaims(a, ctx);
  const whyWork = buildWhyWorkClaims(a, ctx, macro, projection, currency);
  const whyFail = buildWhyFailClaims(a, ctx, projection, fit, currency);
  const score = scoreIdea({
    archetype: a,
    profile,
    fit,
    projection,
    macroClaims: macro,
    ctx,
    weights: opts.weights ?? DEFAULT_SCORE_WEIGHTS,
    evidence: opts.evidence,
    capitalRange,
  });
  const evidence = assessEvidenceQuality([...macro, ...whyWork, ...whyFail], ctx, opts.evidence);

  const recommendation: IdeaRecommendation = {
    archetypeId: a.id,
    countryCode: ctx.country.code,
    ...(profile.targetCity ? { city: profile.targetCity } : {}),
    nameSq: a.nameSq,
    summarySq: summaryOf(a),
    fit,
    score,
    evidence,
    claims: { whyWork, whyFail, macro },
    capitalRange,
    monthlyCostRange,
    priceLevelAdjustment,
    warningsSq: [...new Set(warningsSq)],
    isDemoData: ctx.isDemo,
  };
  return { recommendation, inputs, projection, blockers };
}

export function evaluateIdea(a: BusinessArchetype, profile: UserProfile, ctx: CountryDataContext, opts: EvaluateOptions): IdeaRecommendation {
  return evaluateIdeaDetailed(a, profile, ctx, opts).recommendation;
}

// ─────────────────────────────────────────────────────────────────────────────
// Library ranking
// ─────────────────────────────────────────────────────────────────────────────

function matchesPreFilters(a: BusinessArchetype, filters: IdeaFilters): boolean {
  if (filters.sector && a.sector !== filters.sector) return false;
  if (filters.mode && !a.modes.includes(filters.mode)) return false;
  if (filters.scope && !a.marketScopes.includes(filters.scope)) return false;
  return true;
}

/** Ranking order: score desc (unscored last), then evidence quality desc, then name, then id. */
export function compareRecommendations(x: IdeaRecommendation, y: IdeaRecommendation): number {
  const sx = x.score.total ?? -1;
  const sy = y.score.total ?? -1;
  if (sx !== sy) return sy - sx;
  const ex = EVIDENCE_RANK[x.evidence.level];
  const ey = EVIDENCE_RANK[y.evidence.level];
  if (ex !== ey) return ey - ex;
  return x.nameSq.localeCompare(y.nameSq, 'sq') || x.archetypeId.localeCompare(y.archetypeId);
}

/** Applies the capital filter; an idea whose capital is unknown stays, with a warning. */
function capitalFilter(evaluation: IdeaEvaluation, maxCapital: number | undefined, currency: string): IdeaEvaluation | null {
  if (maxCapital === undefined || !Number.isFinite(maxCapital)) return evaluation;
  const range = evaluation.recommendation.capitalRange;
  if (range) return range.low <= maxCapital ? evaluation : null;
  const rec = evaluation.recommendation;
  const warning = `Filtri i kapitalit maksimal (${formatMoney(maxCapital, currency)}) nuk mund të zbatohet për këtë ide, sepse kostoja e hapjes nuk u konvertua (mungon kursi).`;
  return { ...evaluation, recommendation: { ...rec, warningsSq: [...rec.warningsSq, warning] } };
}

export function generateIdeas(input: GenerateIdeasInput): GenerateIdeasResult {
  const { profile, ctx, now, weights, evidence } = input;
  const filters = input.filters ?? {};
  const library = input.library ?? ARCHETYPES;
  const evaluations = library
    .filter((a) => matchesPreFilters(a, filters))
    .map((a) => evaluateIdeaDetailed(a, profile, ctx, { now, weights, evidence }))
    .map((e) => capitalFilter(e, filters.maxCapital, profile.capital.currency))
    .filter((e): e is IdeaEvaluation => e !== null);

  const recommendations: IdeaRecommendation[] = [];
  const teamRequired: IdeaRecommendation[] = [];
  const excluded: IdeaRecommendation[] = [];
  for (const e of evaluations) {
    if (e.recommendation.fit.eligible) recommendations.push(e.recommendation);
    else if (e.blockers.every((b) => b.kind === 'ekipi')) teamRequired.push(e.recommendation);
    else excluded.push(e.recommendation);
  }
  recommendations.sort(compareRecommendations);
  teamRequired.sort(compareRecommendations);
  excluded.sort((x, y) => x.nameSq.localeCompare(y.nameSq, 'sq') || x.archetypeId.localeCompare(y.archetypeId));

  const notes = [
    'Renditja bazohet në pikëzimin orientues — nuk është probabilitet fitimi dhe asnjë ide nuk garanton fitim.',
    'Idetë që kërkojnë partner ose ekip dhe idetë e përjashtuara shfaqen veçmas, me arsyet, dhe nuk renditen bashkë me të tjerat.',
  ];
  if (ctx.isDemo) notes.push('[DEMO] Vendi është fiktiv: renditja shërben vetëm për demonstrim.');
  return { recommendations, teamRequired, excluded, noteSq: notes.join(' ') };
}
