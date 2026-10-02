/**
 * Fixtures për modulet ndihmëse të ideve dhe për planin (explain, location, validation, adapt, plan).
 *
 * SYNTHETIC — format mirrors the documented API; values are not real.
 * The FX rate, capital amounts and citation values below are round, made-up test numbers. The
 * archetype is the library's reference entry (BATCH_A[0]); its amounts are general library
 * assumptions, not prices. Recommendations are built by hand so these tests do not depend on
 * the idea engine.
 */
import type {
  BusinessArchetype,
  Citation,
  Claim,
  FinancialInputs,
  FxRate,
  IdeaRecommendation,
  ProjectionResult,
  UserProfile,
} from '@/lib/domain/types';
import { DEFAULT_SCORE_WEIGHTS } from '@/lib/domain/taxonomy';
import { BATCH_A } from '@/lib/ideas/archetypes/batchA';
import { buildFinancialInputs, type BuildContext } from '@/lib/finance/build';
import { projectScenario } from '@/lib/finance/engine';

export const PLAN_NOW = new Date('2026-10-02T09:00:00.000Z');

export const PLAN_ARCHETYPE: BusinessArchetype = BATCH_A[0];

// SYNTHETIC — format mirrors the documented API; values are not real
export const PLAN_FX_RATES: FxRate[] = [
  {
    base: 'USD',
    quote: 'EUR',
    rate: 0.5,
    rateDate: '2026-10-01',
    sourceId: 'ecb-frankfurter',
    kind: 'reference_ditore',
    retrievedAt: '2026-10-01T16:00:00.000Z',
  },
];

// SYNTHETIC — a profile for tests; country codes are only identifiers here.
export const PLAN_PROFILE: UserProfile = {
  residenceCountry: 'ALB',
  operableCountries: ['ALB'],
  targetCountries: ['ALB'],
  capital: { amount: 1234, currency: 'EUR' },
  skills: ['dizajn_web'],
  experienceYears: 1,
  experienceSectors: ['digjitale'],
  hoursPerWeek: 20,
  assets: [],
  teamMode: 'vetem',
  businessModes: ['online', 'kombinuar', 'fizik'],
  marketScopes: ['lokal', 'nderkombetar'],
  startLocations: ['shtepi', 'ambient'],
  isAdult: true,
  riskTolerance: 'mesatare',
  ownerIncomeNeedMonthly: null,
};

export function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return { ...PLAN_PROFILE, ...overrides };
}

/** Inputs in EUR built from an archetype with the synthetic rate (throws if the build fails). */
export function buildPlanInputs(archetype: BusinessArchetype = PLAN_ARCHETYPE, overrides: Partial<BuildContext> = {}): FinancialInputs {
  const result = buildFinancialInputs(archetype, {
    currency: 'EUR',
    fxRates: PLAN_FX_RATES,
    ownCapital: PLAN_PROFILE.capital.amount,
    ownerIncomeNeedMonthly: null,
    priceLevel: null,
    assets: [],
    startMonth: 11,
    today: '2026-10-02',
    ...overrides,
  });
  if (!result.ok) throw new Error(result.reasonSq);
  return result.inputs;
}

export function baseProjection(inputs: FinancialInputs): ProjectionResult {
  return projectScenario(inputs, 'baze');
}

/** A physical, premises-based, regulated variant of the reference archetype (for branching tests). */
export function physicalRegulatedArchetype(): BusinessArchetype {
  return {
    ...PLAN_ARCHETYPE,
    id: 'variant-fizik-i-rregulluar',
    nameSq: 'Variant testues fizik dhe i rregulluar',
    modes: ['fizik'],
    marketScopes: ['lokal'],
    canStartFromHome: false,
    regulated: true,
    regulationNotesSq: ['Leja sanitare e lokalit: Kërkon verifikim lokal.'],
    licensedProfessionalsSq: ['teknik i licencuar (shembull testi)'],
    customerSegments: ['b2c'],
    sector: 'tregti',
  };
}

/** A remote-only, international variant of the reference archetype. */
export function remoteInternationalArchetype(): BusinessArchetype {
  return {
    ...PLAN_ARCHETYPE,
    id: 'variant-online-nderkombetar',
    nameSq: 'Variant testues online ndërkombëtar',
    modes: ['online'],
    marketScopes: ['nderkombetar'],
    canStartFromHome: true,
  };
}

// SYNTHETIC — format mirrors the documented API; values are not real
export const DEMO_CITATION: Citation = {
  sourceId: 'demo',
  sourceName: 'DEMO — të dhëna fiktive',
  url: 'demo://global-business-brain/te-dhena-fiktive',
  indicatorCode: 'internet_users_pct',
  countryCode: 'ZZA',
  period: '2025',
  value: 11.11,
  unitLabelSq: '% e popullsisë',
  retrievedAt: '2026-10-01T00:00:00.000Z',
  sourceLastUpdated: null,
  isDemo: true,
  isProjection: false,
};

function claim(id: string, textSq: string, kind: Claim['kind'], label: Claim['label'], citations: Citation[] = []): Claim {
  return { id, textSq, kind, label, citations };
}

/** A hand-built recommendation shaped like the engine's output (demo data, EUR). */
export function makeRecommendation(overrides: Partial<IdeaRecommendation> = {}): IdeaRecommendation {
  return {
    archetypeId: PLAN_ARCHETYPE.id,
    countryCode: 'ZZA',
    nameSq: PLAN_ARCHETYPE.nameSq,
    summarySq: PLAN_ARCHETYPE.taglineSq,
    fit: { matchesSq: ['Përputhet: aftësia kryesore.'], mismatchesSq: [], blockersSq: [], capitalGap: 0, eligible: true },
    score: {
      total: 55.5,
      dimensions: [],
      weights: { ...DEFAULT_SCORE_WEIGHTS },
      assessedWeightPct: 80,
      noteSq: 'Pikëzimi është mjet orientimi, jo probabilitet statistikor fitimi.',
    },
    evidence: {
      level: 'e_ulet',
      dataBackedClaims: 1,
      hypothesisClaims: 2,
      toTestClaims: 2,
      coverage: 'e_pjesshme',
      staleIndicators: [],
      isDemo: true,
      notesSq: ['Të dhënat demo janë fiktive.'],
    },
    claims: {
      macro: [
        claim('macro-1-fakt', '[DEMO] Përdoruesit e internetit: 11,1% (2025, DEMO — të dhëna fiktive).', 'fakt', 'mbeshtetet_nga_te_dhenat', [DEMO_CITATION]),
        claim('macro-1-interpretim', 'Vlera është nën referencën e supozuar; kjo e kundërshton lidhjen.', 'interpretim', 'hipoteze'),
        claim('macro-2-mungon', 'Mungon treguesi për këtë vend — nuk mund ta vlerësojmë; mblidhni prova lokale.', 'supozim', 'hipoteze'),
      ],
      whyWork: [
        claim('why-change', PLAN_ARCHETYPE.whyItCouldWork.changeSq, 'interpretim', 'hipoteze'),
        claim('why-customer', PLAN_ARCHETYPE.whyItCouldWork.customerSq, 'supozim', 'duhet_testuar'),
      ],
      whyFail: [claim('fail-1', PLAN_ARCHETYPE.failureModes[0].textSq, 'supozim', 'hipoteze')],
    },
    capitalRange: { low: 22.22, high: 444.44, currency: 'EUR', basisSq: 'Supozim i përgjithshëm (USD) i konvertuar me kurs sintetik.' },
    monthlyCostRange: { low: 11.11, high: 55.55, currency: 'EUR', basisSq: 'Supozim i përgjithshëm (USD) i konvertuar me kurs sintetik.' },
    priceLevelAdjustment: null,
    warningsSq: ['DEMO — të dhëna fiktive.'],
    isDemoData: true,
    ...overrides,
  };
}
