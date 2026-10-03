/** Ndërtimi i pamjeve të ideve për faqet (idea list + idea detail), using the deterministic engines. */
import type { BusinessArchetype, CountryDataContext, IdeaRecommendation, ScoreWeights } from '@/lib/domain/types';
import { DEFAULT_SCORE_WEIGHTS } from '@/lib/domain/taxonomy';
import { getArchetype } from '@/lib/ideas/archetypes';
import { evaluateIdea, generateIdeas } from '@/lib/ideas/engine';
import { explainInSixSteps } from '@/lib/ideas/explain';
import { buildLocationAnalysis } from '@/lib/ideas/location';
import { buildValidationKit } from '@/lib/ideas/validation';
import { buildFinancialInputs } from '@/lib/finance/build';
import { projectAllScenarios } from '@/lib/finance/engine';
import type { FxRate, UserProfile } from '@/lib/domain/types';
import { loadContext } from './data';
import type { Viewer } from './viewer';

/** A neutral profile used only to show ideas before the user fills in their own (clearly labelled). */
export function placeholderProfile(countryCode: string): UserProfile {
  return {
    residenceCountry: countryCode,
    operableCountries: [countryCode],
    targetCountries: [countryCode],
    capital: { amount: 0, currency: 'EUR' },
    skills: [],
    experienceYears: 0,
    experienceSectors: [],
    hoursPerWeek: 20,
    assets: [],
    teamMode: 'vetem',
    businessModes: ['fizik', 'online', 'kombinuar'],
    marketScopes: ['lokal', 'nderkombetar'],
    startLocations: ['shtepi', 'ambient'],
    isAdult: true,
    riskTolerance: 'mesatare',
    ownerIncomeNeedMonthly: null,
  };
}

export async function loadIdeas(viewer: Viewer, countryCode: string, filters: Parameters<typeof generateIdeas>[0]['filters'] = {}) {
  const ctx = await loadContext(viewer, countryCode);
  if (!ctx) return null;
  const profile = viewer.profile ?? placeholderProfile(countryCode);
  const result = generateIdeas({ profile, ctx, now: viewer.now, weights: DEFAULT_SCORE_WEIGHTS, filters });
  return { ctx, profile, usingPlaceholderProfile: !viewer.profile, ...result };
}

export interface IdeaView {
  archetype: BusinessArchetype;
  ctx: CountryDataContext;
  rec: IdeaRecommendation;
  usingPlaceholderProfile: boolean;
  sixSteps: ReturnType<typeof explainInSixSteps>;
  kit: ReturnType<typeof buildValidationKit>;
  location: ReturnType<typeof buildLocationAnalysis>;
  inputs: Extract<ReturnType<typeof buildFinancialInputs>, { ok: true }>['inputs'] | null;
  projections: ReturnType<typeof projectAllScenarios> | null;
  inputsErrorSq: string | null;
  /** Set when the model fell back to USD because no FX rate to the profile currency is stored. */
  currencyFallbackSq: string | null;
}

export async function loadIdeaView(viewer: Viewer, archetypeId: string, countryCode: string, weights?: ScoreWeights): Promise<IdeaView | null> {
  const archetype = getArchetype(archetypeId);
  if (!archetype) return null;
  const ctx = await loadContext(viewer, countryCode);
  if (!ctx) return null;
  const profile = viewer.profile ?? placeholderProfile(countryCode);
  const rec = evaluateIdea(archetype, profile, ctx, { weights: weights ?? DEFAULT_SCORE_WEIGHTS, now: viewer.now });
  const { built, currencyFallbackSq } = buildInputsWithFallback(archetype, profile, ctx, rec.priceLevelAdjustment ?? null, viewer.now);
  return {
    archetype,
    ctx,
    rec,
    usingPlaceholderProfile: !viewer.profile,
    sixSteps: explainInSixSteps(archetype, rec),
    kit: buildValidationKit(archetype, rec),
    location: buildLocationAnalysis(archetype, profile, countryCode, rec.city ?? null),
    inputs: built.ok ? built.inputs : null,
    projections: built.ok ? projectAllScenarios(built.inputs) : null,
    inputsErrorSq: built.ok ? null : built.reasonSq,
    currencyFallbackSq,
  };
}

/**
 * Builds editable inputs in the profile currency. When no FX rate is stored (e.g. before the first
 * refresh), falls back to USD — the currency of the library assumptions — and says so, instead of
 * guessing a rate. The user can then convert with a stored or manual rate in the calculator.
 */
export function buildInputsWithFallback(
  archetype: BusinessArchetype,
  profile: UserProfile,
  ctx: CountryDataContext,
  priceLevel: IdeaRecommendation['priceLevelAdjustment'],
  now: Date,
  extraFxRates: FxRate[] = [],
) {
  const common = {
    fxRates: [...ctx.fxRates, ...extraFxRates],
    ownerIncomeNeedMonthly: profile.ownerIncomeNeedMonthly ?? null,
    priceLevel: priceLevel ?? null,
    assets: profile.assets,
    startMonth: now.getUTCMonth() + 1,
    today: now.toISOString().slice(0, 10),
  };
  const built = buildFinancialInputs(archetype, { ...common, currency: profile.capital.currency, ownCapital: profile.capital.amount });
  if (built.ok || profile.capital.currency === 'USD') return { built, currencyFallbackSq: null as string | null };
  const usd = buildFinancialInputs(archetype, { ...common, currency: 'USD', ownCapital: 0, ownerIncomeNeedMonthly: null });
  if (!usd.ok) return { built, currencyFallbackSq: null as string | null };
  return {
    built: usd,
    currencyFallbackSq: `${built.reasonSq} Modeli po shfaqet në USD (monedha e supozimeve të bibliotekës); kapitali juaj dhe paga e pronarit nuk janë përfshirë sepse janë në ${profile.capital.currency}. Konvertojeni në kalkulator me një kurs të ruajtur ose manual.`,
  };
}
