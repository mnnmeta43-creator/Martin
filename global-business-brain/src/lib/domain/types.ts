/**
 * Kontratat e përbashkëta të domenit (shared domain contracts).
 *
 * Every module (data, analysis, ideas, finance, scoring, plan, export, ai, server, UI)
 * imports its shared shapes from here. Keep this file free of runtime logic so it can be
 * imported from both server and client code.
 *
 * Conventions
 * - User-facing strings are Albanian and their field names end in `Sq`.
 * - Dates: `YYYY-MM-DD` for calendar dates, full ISO-8601 for timestamps.
 * - Country codes are canonical ISO 3166-1 alpha-3, except Kosovo = "XKX" (World Bank code)
 *   and the fictional demo economies "ZZA", "ZZB", "ZZC".
 * - Money is a plain `number` in the major unit of the stated currency. Rounding happens
 *   only for display (see `finance/format.ts`).
 */

// ─────────────────────────────────────────────────────────────────────────────
// Common
// ─────────────────────────────────────────────────────────────────────────────

export type CountryCode = string;
export type CurrencyCode = string; // ISO 4217, e.g. "EUR", "ALL", "USD"
export type IsoDate = string; // YYYY-MM-DD
export type IsoTimestamp = string; // 2026-10-02T12:00:00.000Z

/** Nature of a statement. The UI must render these differently. */
export type ClaimKind = 'fakt' | 'interpretim' | 'supozim' | 'parashikim';

/**
 * Evidence label requested by the product spec:
 * - mbeshtetet_nga_te_dhenat → "Kjo mbështetet nga të dhënat." (MUST carry ≥1 citation)
 * - hipoteze → "Kjo është hipotezë."
 * - duhet_testuar → "Kjo duhet testuar me klientë."
 */
export type EvidenceLabel = 'mbeshtetet_nga_te_dhenat' | 'hipoteze' | 'duhet_testuar';

export interface Citation {
  sourceId: string; // key in the source registry, e.g. "worldbank-wdi"
  sourceName: string;
  url: string; // exact URL that was (or will be) queried / the official page
  indicatorCode?: string; // internal indicator code
  countryCode?: CountryCode;
  period?: string; // "2023", "2024-Q1", "2024-05", "2024-05-17"
  value?: number | null;
  unitLabelSq?: string;
  retrievedAt?: IsoTimestamp | null;
  sourceLastUpdated?: IsoDate | null; // publication / last-updated date if the source gives it
  isDemo?: boolean;
  isProjection?: boolean;
  noteSq?: string;
}

export interface Claim {
  id: string;
  textSq: string;
  kind: ClaimKind;
  label: EvidenceLabel;
  /** Required (non-empty) when label === 'mbeshtetet_nga_te_dhenat'. */
  citations: Citation[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Data sources, indicators, observations
// ─────────────────────────────────────────────────────────────────────────────

export type SourceAccess =
  | 'api_publike_falas' // public, keyless API
  | 'api_me_celes' // needs an API key / subscription
  | 'shkarkim_masiv' // bulk download only
  | 'faqe_zyrtare' // official website, no machine-readable API used
  | 'paketë_e_te_dhenave' // dataset bundled in an npm package (versioned)
  | 'demo'; // fictional, for testing only

export type IntegrationStatus =
  | 'integruar' // adapter implemented and used by the refresh job
  | 'integruar_pa_verifikim_live' // adapter implemented & unit-tested against documented format, not yet reached live
  | 'vleresuar_jo_integruar' // evaluated, not integrated (reason in notes)
  | 'kerkon_celes' // adapter exists but needs a key that is not configured
  | 'lidhje_zyrtare' // only linked for manual verification
  | 'demo';

export interface DataSourceInfo {
  id: string;
  nameSq: string;
  publisher: string;
  homepageUrl: string;
  apiBaseUrl?: string;
  docsUrl?: string;
  termsUrl?: string;
  license?: string;
  access: SourceAccess;
  status: IntegrationStatus;
  coverageSq: string;
  cadenceSq: string; // how often the source publishes
  refreshEveryHours?: number; // how often our job re-checks it
  rateLimitSq?: string;
  notesSq: string[];
  requiresEnv?: string[]; // env vars needed (names only, never values)
}

export type DataStatus =
  | 'i_fresket' // latest available period is as recent as can be expected
  | 'i_vjeter' // older than expected given the publication cadence
  | 'shume_i_vjeter'
  | 'mungon' // no value available for this country/indicator
  | 'gabim_burimi' // last refresh failed; showing stored values (if any)
  | 'demo' // fictional demo data
  | 'parashikim'; // projection (e.g. IMF WEO future years)

export type Periodicity = 'ditore' | 'mujore' | 'tremujore' | 'vjetore' | 'e_parregullt';
export type ValueBasis = 'nominal' | 'real' | 'raport' | 'indeks' | 'numer' | 'norme';
export type UnitKind =
  | 'perqind' // %
  | 'monedhe' // currency amount (see currency field)
  | 'numer' // persons, arrivals, …
  | 'per_100'
  | 'per_1000'
  | 'indeks'
  | 'dite'
  | 'raport'
  | 'mv_per_usd' // local currency units per USD
  | 'pike'; // score / index points

export type IndicatorCategory =
  | 'rritja'
  | 'cmimet'
  | 'financa'
  | 'puna'
  | 'popullsia'
  | 'tregtia'
  | 'sektoret'
  | 'digjitale'
  | 'turizmi'
  | 'infrastruktura'
  | 'te_ardhurat'
  | 'remitancat';

export interface IndicatorExplanation {
  whatItMeasuresSq: string; // Çfarë mat?
  whyItMattersSq: string;
  affectedBusinessesSq: string; // Cilat biznese mund të ndikohen?
  mechanismSq: string; // Përmes cilit mekanizëm?
  extraEvidenceSq: string; // Çfarë prove shtesë duhet para një vendimi?
  analogySq?: string; // analogji fizike
  cautionSq?: string; // common misreading
}

export interface IndicatorDefinition {
  code: string; // internal code, e.g. "gdp_growth"
  sourceId: string;
  sourceCode: string; // e.g. "NY.GDP.MKTP.KD.ZG"
  nameSq: string;
  nameEn: string;
  unit: UnitKind;
  unitLabelSq: string; // "% në vit", "USD aktuale", …
  currency?: CurrencyCode | 'INTL$' | 'MV' | null; // MV = monedha vendase (LCU)
  basis: ValueBasis;
  periodicity: Periodicity;
  category: IndicatorCategory;
  /** Expected publication lag in years for annual series (used for freshness). */
  expectedLagYears?: number;
  explain: IndicatorExplanation;
  isProjectionSource?: boolean;
  discontinued?: boolean;
}

export interface Observation {
  sourceId: string;
  indicatorCode: string; // internal code
  countryCode: CountryCode;
  period: string; // "2023" | "2024-Q1" | "2024-05" | "2024-05-17"
  value: number | null;
  unit: UnitKind;
  currency?: string | null;
  isProjection: boolean;
  isDemo: boolean;
  obsStatus?: string | null;
  sourceUrl: string;
  sourceLastUpdated?: IsoDate | null;
  retrievedAt: IsoTimestamp;
}

export interface FetchLogEntry {
  id?: string;
  sourceId: string;
  scope: string; // e.g. "indicator:gdp_growth" or "countries" or "fx:EUR"
  startedAt: IsoTimestamp;
  finishedAt: IsoTimestamp | null;
  status: 'ok' | 'gabim' | 'pjesshem' | 'anashkaluar'; // anashkaluar = skipped (still fresh / disabled)
  httpStatus?: number | null;
  rows?: number;
  messageSq?: string | null; // never contains secrets
}

export interface IndicatorChange {
  comparable: boolean;
  fromPeriod: string | null;
  toPeriod: string | null;
  fromValue: number | null;
  toValue: number | null;
  /** For percent/rate series: difference in percentage points. Otherwise relative % change. */
  delta: number | null;
  deltaKind: 'pike_perqindjeje' | 'ndryshim_perqindjeje' | 'ndryshim_absolut' | null;
  warningsSq: string[];
}

export interface IndicatorSeries {
  definition: IndicatorDefinition;
  countryCode: CountryCode;
  observations: Observation[]; // ascending by period; includes projections (flagged)
  latest: Observation | null; // latest non-null, non-projection observation
  change: IndicatorChange;
  status: DataStatus;
  statusReasonSq: string;
  lastFetch?: FetchLogEntry | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Countries
// ─────────────────────────────────────────────────────────────────────────────

export type EconomyKind =
  | 'shtet_anetar_okb' // UN member state
  | 'shtet_vezhgues_okb' // UN observer state (Holy See, Palestine)
  | 'njohje_e_pjesshme' // partially recognised (e.g. Kosovo, Taiwan)
  | 'territor' // dependent territory / special administrative region
  | 'demo';

export type CoverageLevel = 'e_plote' | 'e_pjesshme' | 'e_pamjaftueshme';

export interface Country {
  code: CountryCode;
  iso2: string;
  nameSq: string;
  nameEn: string;
  kind: EconomyKind;
  kindNoteSq?: string;
  regionSq: string;
  subregionSq?: string;
  currencies: CurrencyCode[];
  capital?: string;
  sourceCodes: { worldbank?: string | null; imf?: string | null };
  /** Classification from the World Bank country API, only when it has been fetched. */
  wb?: {
    regionSq?: string | null;
    incomeLevel?: string | null;
    lendingType?: string | null;
    retrievedAt: IsoTimestamp;
  } | null;
  isDemo: boolean;
}

export interface CountryCoverage {
  countryCode: CountryCode;
  level: CoverageLevel;
  availableCount: number;
  totalTracked: number;
  freshCount: number;
  missingIndicators: string[];
  staleIndicators: string[];
  noteSq: string;
}

/** Everything the analysis layers need to know about one economy at a point in time. */
export interface CountryDataContext {
  country: Country;
  series: IndicatorSeries[]; // one per tracked indicator; status 'mungon' when no data
  coverage: CountryCoverage;
  fxRates: FxRate[];
  isDemo: boolean;
  lastRefreshAt: IsoTimestamp | null;
  sourceErrors: FetchLogEntry[]; // recent failed fetches relevant to this economy
  generatedAt: IsoTimestamp;
}

// ─────────────────────────────────────────────────────────────────────────────
// FX
// ─────────────────────────────────────────────────────────────────────────────

export interface FxRate {
  base: CurrencyCode;
  quote: CurrencyCode;
  rate: number; // 1 base = rate quote
  rateDate: IsoDate;
  sourceId: string; // "ecb-frankfurter" | "worldbank-wdi" (annual average) | "manual" | "demo"
  kind: 'reference_ditore' | 'mesatare_vjetore' | 'manuale' | 'demo';
  retrievedAt: IsoTimestamp;
}

export type FxConversion =
  | {
      ok: true;
      value: number;
      rate: number; // effective from→to
      rateDate: IsoDate;
      sourceId: string;
      kind: FxRate['kind'];
      viaCurrency?: CurrencyCode; // when triangulated (e.g. via EUR or USD)
      warningsSq: string[];
    }
  | { ok: false; reasonSq: string };

// ─────────────────────────────────────────────────────────────────────────────
// User profile
// ─────────────────────────────────────────────────────────────────────────────

export type BusinessMode = 'fizik' | 'online' | 'kombinuar';
export type MarketScope = 'lokal' | 'nderkombetar';
export type StartLocation = 'shtepi' | 'ambient';
export type TeamMode = 'vetem' | 'partner' | 'ekip';
export type RiskTolerance = 'e_ulet' | 'mesatare' | 'e_larte';

export interface UserProfile {
  residenceCountry: CountryCode; // vendbanimi
  residenceCity?: string;
  /** Countries where the user states they can legally operate (self-declared, not verified). */
  operableCountries: CountryCode[];
  /** Markets the user wants to target (may differ from residence / operable countries). */
  targetCountries: CountryCode[];
  targetCity?: string;
  capital: { amount: number; currency: CurrencyCode };
  skills: string[]; // ids from taxonomy SKILLS
  otherSkills?: string;
  experienceYears: number;
  experienceSectors: SectorId[];
  hoursPerWeek: number;
  assets: string[]; // ids from taxonomy ASSETS
  otherAssets?: string;
  teamMode: TeamMode;
  businessModes: BusinessMode[]; // accepted modes (≥1)
  marketScopes: MarketScope[]; // accepted scopes (≥1)
  startLocations: StartLocation[]; // accepted (≥1)
  isAdult: boolean; // 18+
  riskTolerance: RiskTolerance;
  /** Monthly personal income the owner needs (used as owner salary default). */
  ownerIncomeNeedMonthly?: number | null;
  updatedAt?: IsoTimestamp;
}

// ─────────────────────────────────────────────────────────────────────────────
// Business archetypes (curated library) & generated ideas
// ─────────────────────────────────────────────────────────────────────────────

export type SectorId =
  | 'sherbime_biznesi'
  | 'sherbime_shtepie'
  | 'ushqim'
  | 'turizem'
  | 'digjitale'
  | 'logjistike'
  | 'edukim'
  | 'bujqesi'
  | 'tregti'
  | 'prodhim'
  | 'kujdes'
  | 'energji'
  | 'riparime'
  | 'diaspora'
  | 'mjedis';

export type StartupCategory = 'hapje' | 'pajisje' | 'depozita' | 'inventar' | 'tarifa' | 'testim_tregu';
export type MonthlyCategory =
  | 'qira'
  | 'paga'
  | 'sherbime_komunale'
  | 'marketing'
  | 'transport'
  | 'software'
  | 'sigurime'
  | 'kontabilitet'
  | 'mirembajtje'
  | 'tjeter';

/** Default cost line in an archetype. Values are GENERAL ASSUMPTIONS in USD, never verified prices. */
export interface CostItemTemplate {
  id: string;
  labelSq: string;
  category: StartupCategory | MonthlyCategory;
  lowUSD: number;
  highUSD: number;
  noteSq: string; // what drives the cost and how to get a real quote
  /** true for local labour/services/rent (scale with local price level); false for traded goods. */
  scalesWithPriceLevel: boolean;
  optional?: boolean; // can be avoided (e.g. by using own assets)
  avoidedByAssets?: string[]; // asset ids that remove this cost
}

export interface Ramp {
  startCustomers: number;
  monthlyNewCustomers: number;
  monthlyChurnPct: number; // 0–100
}

export type FailureKind =
  | 'kerkese_e_pamjaftueshme'
  | 'cmim'
  | 'konkurrence'
  | 'kosto'
  | 'aftesi'
  | 'vonesa_pagesash'
  | 'sezonalitet'
  | 'ligjore'
  | 'operacionale';

export type MacroDirection = 'me_i_larte_mbeshtet' | 'me_i_ulet_mbeshtet' | 'rritja_mbeshtet' | 'renia_mbeshtet';

export interface MacroLink {
  indicatorCode: string; // internal indicator code
  direction: MacroDirection;
  /** Optional reference level; an explicit, explained assumption (not a law of economics). */
  referenceValue?: number;
  mechanismSq: string;
  ifSupportsSq: string;
  ifContradictsSq: string;
}

export type PhaseId =
  | 'p00_10'
  | 'p10_20'
  | 'p20_30'
  | 'p30_40'
  | 'p40_50'
  | 'p50_60'
  | 'p60_70'
  | 'p70_80'
  | 'p80_90'
  | 'p90_100';

export interface BusinessArchetype {
  id: string; // kebab-case slug
  nameSq: string;
  taglineSq: string;
  descriptionSq: string;
  sector: SectorId;
  offerSq: string; // concrete product/service
  payingCustomerSq: string; // who pays
  customerSegments: ('b2b' | 'b2c' | 'b2g')[];
  problemSq: string;
  modes: BusinessMode[];
  marketScopes: MarketScope[];
  canStartFromHome: boolean;
  minTeam: TeamMode;
  requiredSkills: string[]; // SKILLS ids
  helpfulSkills: string[];
  helpfulAssets: string[]; // ASSETS ids
  minHoursPerWeek: number;
  regulated: boolean;
  regulationNotesSq: string[]; // what to verify; never presented as verified
  licensedProfessionalsSq: string[]; // e.g. "elektricist i licencuar"
  adultOnly: boolean;
  zeroCapitalTestSq: string; // legal low/no-cash way to test demand; honest about what still costs money
  revenueModelSq: string;
  pricing: {
    unitLabelSq: string; // "porosi", "orë", "abonim mujor"
    priceUSD: { low: number; base: number; high: number };
    variableCostUSD: { low: number; base: number; high: number };
    unitsPerCustomerPerMonth: number;
    collectionDays: number;
    supplierPaymentDays: number;
    noteSq: string;
  };
  startupCosts: CostItemTemplate[];
  monthlyFixedCosts: CostItemTemplate[];
  ramp: { konservator: Ramp; baze: Ramp; optimist: Ramp };
  seasonality: number[]; // 12 multipliers Jan→Dec, mean ≈ 1
  seasonalityNoteSq: string;
  macroLinks: MacroLink[];
  whyItCouldWork: {
    changeSq: string; // ndryshimi ekonomik ose lokal
    problemSq: string; // problemi i krijuar
    customerSq: string; // klienti i prekur
    offerSq: string; // oferta e biznesit
    reasonToPaySq: string; // arsyeja për të paguar
    profitConditionsSq: string; // kushtet për fitim
  };
  failureModes: { kind: FailureKind; textSq: string }[];
  falsifiersSq: string[]; // evidence that would refute the idea
  differentiationSq: string[];
  competitorTypesSq: string[]; // TYPES of alternatives, never invented company names
  cheapestTestSq: string;
  interviewQuestionsSq: string[]; // non-leading, about past behaviour
  firstCustomers: {
    whereSq: string[];
    howToContactSq: string[]; // lawful, no spam
    offerSq: string;
    followUpSq: string;
    metricsSq: string[];
  };
  pitchTemplateSq: string;
  offerTemplateSq: string;
  feedbackQuestionsSq: string[];
  goCriteriaSq: string[];
  killCriteriaSq: string[];
  phaseNotesSq: Partial<Record<PhaseId, string[]>>;
  assumptionsSq: string[];
  sourcesNoteSq: string;
  assumptionsDate: IsoDate; // when the default assumptions were authored
}

export interface ProfileFit {
  matchesSq: string[]; // "Përputhet: …"
  mismatchesSq: string[]; // "Nuk përputhet: …"
  blockersSq: string[]; // hard blockers
  capitalGap: number | null; // in profile currency; null when unknown (missing FX)
  eligible: boolean; // false → shown only in "të përjashtuara" with reasons
}

export type ScoreDimensionId = 'kerkesa' | 'kapitali' | 'aftesite' | 'veshtiresia' | 'ekonomia' | 'rreziku';
export type ScoreWeights = Record<ScoreDimensionId, number>; // integers that sum to 100

export interface DimensionScore {
  id: ScoreDimensionId;
  labelSq: string;
  score: number | null; // 0–100; null = not assessable (never treated as 0)
  basis: 'te_dhena' | 'profil' | 'supozim' | 'mungon';
  reasonSq: string;
}

export interface ScoreResult {
  total: number | null; // weighted over assessable dimensions only
  dimensions: DimensionScore[];
  weights: ScoreWeights;
  assessedWeightPct: number; // share of total weight that could be assessed (0–100)
  noteSq: string; // reminds: orientation tool, not a probability of success
}

export interface EvidenceQuality {
  level: 'e_larte' | 'mesatare' | 'e_ulet' | 'shume_e_ulet';
  dataBackedClaims: number;
  hypothesisClaims: number;
  toTestClaims: number;
  coverage: CoverageLevel;
  staleIndicators: string[];
  isDemo: boolean;
  notesSq: string[];
}

export interface MoneyRange {
  low: number;
  high: number;
  currency: CurrencyCode;
  basisSq: string; // e.g. "Supozim i përgjithshëm (USD) i konvertuar me kursin …"
}

export interface IdeaRecommendation {
  archetypeId: string;
  countryCode: CountryCode;
  city?: string;
  nameSq: string;
  summarySq: string;
  fit: ProfileFit;
  score: ScoreResult;
  evidence: EvidenceQuality;
  claims: {
    whyWork: Claim[];
    whyFail: Claim[];
    macro: Claim[];
  };
  capitalRange: MoneyRange | null; // null when currency conversion impossible
  monthlyCostRange: MoneyRange | null;
  priceLevelAdjustment?: { factor: number; citation: Citation } | null;
  warningsSq: string[];
  isDemoData: boolean;
}

export interface SixSteps {
  whatItIsSq: string; // Çfarë është
  whoItServesSq: string; // kujt i shërben
  whyItCouldWorkSq: string; // pse mund të funksionojë
  whatItRequiresSq: string; // çfarë kërkon
  howToStartSq: string; // si niset
  howToMeasureSq: string; // si matet
}

export interface LocationAnalysis {
  registrationVsOperationSq: {
    registrationSq: string; // Vendi ku regjistrohet biznesi
    operationSq: string; // Vendi ku operon
    customersSq: string; // Vendi ku janë klientët
  };
  toVerifySq: string[]; // residency, right to work, payments, operations…
  fieldResearchPlan: {
    stepSq: string;
    howSq: string;
    outputSq: string;
    costSq: string;
  }[];
  officialLinks: Citation[]; // only from the source registry
  noteSq: string;
}

export interface ValidationKit {
  interviewQuestionsSq: string[];
  avoidQuestionsSq: string[]; // leading questions to avoid, with why
  interestTestsSq: string[];
  trialOfferSq: string;
  decisionCriteriaSq: { metricSq: string; thresholdSq: string; meaningSq: string }[];
  verbalVsBehaviourSq: string;
  firstCustomers: BusinessArchetype['firstCustomers'];
  pitchTemplateSq: string;
  offerTemplateSq: string;
  feedbackQuestionsSq: string[];
  doNotSq: string[]; // no spam, no fake testimonials, no big ad spend before validation
}

// ─────────────────────────────────────────────────────────────────────────────
// Finance
// ─────────────────────────────────────────────────────────────────────────────

export type ScenarioId = 'konservator' | 'baze' | 'optimist';
export type CostSourceKind = 'supozim' | 'oferte' | 'verifikuar' | 'perdoruesi';

export interface MoneyLine {
  id: string;
  labelSq: string;
  category: StartupCategory | MonthlyCategory;
  amount: number; // value used by the model (project currency)
  low?: number | null;
  high?: number | null;
  sourceKind: CostSourceKind;
  sourceNoteSq: string; // assumption text or quote reference
  date: IsoDate;
  enabled: boolean;
  optional?: boolean; // can be dropped/reduced when adapting to lower capital
}

export interface ScenarioParams {
  startCustomers: number;
  monthlyNewCustomers: number;
  monthlyChurnPct: number; // 0–100
  priceMultiplier: number; // 1 = base price
  variableCostMultiplier: number;
  fixedCostMultiplier: number;
  collectionDaysOverride?: number | null;
}

export interface FinancialInputs {
  currency: CurrencyCode;
  startupCosts: MoneyLine[]; // StartupCategory only
  monthlyFixedCosts: MoneyLine[]; // MonthlyCategory only (owner salary is separate)
  includeOwnerSalary: boolean;
  ownerSalaryMonthly: number;
  pricePerUnit: number;
  variableCostPerUnit: number;
  unitLabelSq: string;
  unitsPerCustomerPerMonth: number;
  collectionDays: number; // customers pay N days after the sale
  supplierPaymentDays: number; // we pay variable costs N days after purchase
  seasonality: number[]; // 12 multipliers Jan→Dec
  startMonth: number; // 1–12 calendar month of month 1
  ownCapital: number; // cash the owner puts in (project currency)
  reserveMonths: number; // safety reserve, expressed in months of fixed costs (+ owner salary if included)
  profitTaxPct: number; // simple tax on positive cumulative profit; default 0 = "Kërkon verifikim lokal"
  horizonMonths: number; // 12 (UI allows 12/24/36)
  scenarios: Record<ScenarioId, ScenarioParams>;
  assumptionsNotesSq: string[];
}

export interface MonthRow {
  month: number; // 1..horizon
  calendarMonth: number; // 1..12
  customers: number;
  units: number;
  revenue: number; // accrual
  variableCosts: number;
  contribution: number;
  fixedCosts: number; // excl. owner salary
  ownerSalary: number;
  operatingResult: number; // revenue − variable − fixed − owner salary
  tax: number;
  netResult: number;
  cashIn: number;
  cashOut: number;
  netCashFlow: number;
  cashBalance: number; // closing balance incl. own capital and startup spend
  receivablesEnd: number;
  payablesEnd: number;
}

export interface UnitEconomics {
  pricePerUnit: number;
  variableCostPerUnit: number;
  contributionPerUnit: number; // price − variable cost
  contributionMarginPct: number | null; // null when price = 0
  fixedCostsMonthly: number; // incl. owner salary if included
  breakEvenUnitsPerMonth: number | null; // null when contribution ≤ 0
  breakEvenCustomersPerMonth: number | null;
  status: 'ok' | 'kontribut_zero_ose_negativ';
  explanationSq: string;
}

export interface CapitalRequirement {
  startupTotal: number;
  byCategory: Record<StartupCategory, number>;
  maxOperatingDeficit: number; // largest cumulative operating cash shortfall after startup (≥0)
  reserve: number;
  totalRequired: number; // startup + max deficit + reserve (no double counting)
  ownCapital: number;
  gap: number; // max(0, totalRequired − ownCapital)
  explanationSq: string[];
}

export interface PaybackResult {
  recoveredInMonth: number | null; // first month where cumulative operating cash ≥ startup investment
  statementSq: string; // never a guarantee
}

export interface ProjectionResult {
  scenario: ScenarioId;
  params: ScenarioParams;
  rows: MonthRow[];
  totals: {
    revenue: number;
    variableCosts: number;
    fixedCosts: number;
    ownerSalary: number;
    operatingResult: number;
    tax: number;
    netResult: number;
    netCashFlow: number;
  };
  unitEconomics: UnitEconomics;
  capital: CapitalRequirement;
  payback: PaybackResult;
  minCashBalance: number;
  minCashMonth: number | null;
  monthsWithNegativeCash: number;
  warningsSq: string[];
  formulasSq: string[]; // human-readable formulas used
}

// ─────────────────────────────────────────────────────────────────────────────
// Plan 0–100, tasks, evidence log
// ─────────────────────────────────────────────────────────────────────────────

export interface PlanPhase {
  id: PhaseId;
  rangeLabel: string; // "0–10"
  titleSq: string;
  actionsSq: string[];
  outputSq: string; // rezultati që duhet prodhuar
  budget: { amount: number; currency: CurrencyCode; basisSq: string };
  dependencies: PhaseId[];
  proofOfCompletionSq: string;
  continueCriterionSq: string;
  stopCriterionSq: string;
}

export type TaskStatus = 'per_tu_bere' | 'ne_progres' | 'perfunduar' | 'anashkaluar';

export interface PlanTask {
  id: string;
  phaseId: PhaseId;
  titleSq: string;
  descriptionSq: string;
  dayOffset: number; // days from project start
  durationDays: number;
  weight: number; // relative weight for completion %
  status: TaskStatus;
  proofSq: string;
  completedAt?: IsoTimestamp | null;
  notesSq?: string | null;
}

export interface Plan {
  phases: PlanPhase[];
  tasks: PlanTask[];
  horizons: { d7: string[]; d30: string[]; d90: string[] }; // task ids
  noteSq: string; // % = plan completion, not probability of success
}

export interface PlanProgress {
  completionPct: number; // 0–100 of plan completion
  completedTasks: number;
  totalTasks: number;
  byPhase: Record<PhaseId, { completionPct: number; done: number; total: number }>;
  labelSq: string; // never says "success guaranteed"
}

export type EvidenceType =
  | 'interviste'
  | 'vezhgim'
  | 'oferte_cmimi'
  | 'parapagim'
  | 'pagese'
  | 'konkurrent'
  | 'kosto_e_verifikuar'
  | 'tjeter';

export interface EvidenceEntry {
  id: string;
  projectId: string;
  type: EvidenceType;
  summarySq: string;
  quantity?: number | null;
  amount?: number | null;
  sourceSq: string; // where it came from
  collectedAt: IsoDate;
  createdAt: IsoTimestamp;
}

// ─────────────────────────────────────────────────────────────────────────────
// Projects
// ─────────────────────────────────────────────────────────────────────────────

export interface DataSnapshot {
  capturedAt: IsoTimestamp;
  isDemo: boolean;
  observations: Observation[]; // values used in the analysis, with provenance
  fxRates: FxRate[];
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  archetypeId: string;
  countryCode: CountryCode; // where it operates
  city?: string | null;
  registrationCountry?: CountryCode | null;
  customerCountries: CountryCode[];
  financialInputs: FinancialInputs;
  scoreWeights: ScoreWeights;
  dataSnapshot: DataSnapshot;
  notesSq?: string | null;
  analysisDate: IsoTimestamp;
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
}

export interface ProjectSummary {
  id: string;
  title: string;
  archetypeId: string;
  countryCode: CountryCode;
  city?: string | null;
  progressPct: number;
  analysisDate: IsoTimestamp;
  updatedAt: IsoTimestamp;
  isDemo: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// AI assistant
// ─────────────────────────────────────────────────────────────────────────────

export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantReply {
  mode: 'claude' | 'pa_ai'; // pa_ai = deterministic built-in answers (no API key)
  replySq: string;
  citations: Citation[]; // only from tool results / stored data, never generated
  calculations?: { labelSq: string; scenario: ScenarioId; before: number; after: number; currency: CurrencyCode }[];
  missingConfigSq?: string | null; // e.g. "ANTHROPIC_API_KEY mungon — …"
  toolCalls?: { name: string; ok: boolean }[];
}
