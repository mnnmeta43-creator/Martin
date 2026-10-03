// SYNTHETIC — format mirrors the documented API; values are not real
/**
 * Fixtures and database helpers shared by the server tests (and the Postgres integration test).
 * All numbers are deliberately synthetic (1.11, 2.22, 12345 …); URLs use the reserved
 * ".invalid" TLD so they can never be mistaken for real sources.
 */
import path from 'node:path';
import { createPgliteDb, runMigrations, type Db } from '@/lib/server/db';
import { createSqlStore } from '@/lib/server/store/sqlStore';
import type { NewProjectInput, Store } from '@/lib/server/store/types';
import type { DataSnapshot, FinancialInputs, FxRate, Observation, PlanTask, ScenarioParams, ScoreWeights } from '@/lib/domain/types';

export const MIGRATIONS_DIR = path.join(process.cwd(), 'db', 'migrations');
export const SYNTHETIC_URL = 'https://example.invalid/synthetic';

export async function createMemoryDb(): Promise<Db> {
  const db = await createPgliteDb();
  await runMigrations(db, { dir: MIGRATIONS_DIR });
  return db;
}

export async function createMemoryStore(): Promise<{ db: Db; store: Store }> {
  const db = await createMemoryDb();
  return { db, store: createSqlStore(db) };
}

const scenario = (n: number): ScenarioParams => ({
  startCustomers: n,
  monthlyNewCustomers: n,
  monthlyChurnPct: 5,
  priceMultiplier: 1,
  variableCostMultiplier: 1,
  fixedCostMultiplier: 1,
  collectionDaysOverride: null,
});

export function makeFinancialInputs(overrides: Partial<FinancialInputs> = {}): FinancialInputs {
  return {
    currency: 'EUR',
    startupCosts: [
      {
        id: 'pajisje-1',
        labelSq: 'Pajisje (sintetike)',
        category: 'pajisje',
        amount: 1111,
        low: 1000,
        high: 1222,
        sourceKind: 'supozim',
        sourceNoteSq: 'Supozim testimi.',
        date: '2026-01-01',
        enabled: true,
      },
    ],
    monthlyFixedCosts: [
      {
        id: 'qira-1',
        labelSq: 'Qira (sintetike)',
        category: 'qira',
        amount: 222,
        sourceKind: 'perdoruesi',
        sourceNoteSq: 'Vlerë testimi.',
        date: '2026-01-01',
        enabled: true,
      },
    ],
    includeOwnerSalary: false,
    ownerSalaryMonthly: 0,
    pricePerUnit: 33,
    variableCostPerUnit: 11,
    unitLabelSq: 'porosi',
    unitsPerCustomerPerMonth: 2,
    collectionDays: 15,
    supplierPaymentDays: 0,
    seasonality: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    startMonth: 1,
    ownCapital: 12345,
    reserveMonths: 3,
    profitTaxPct: 0,
    horizonMonths: 12,
    scenarios: { konservator: scenario(1), baze: scenario(2), optimist: scenario(3) },
    assumptionsNotesSq: ['Të gjitha vlerat janë sintetike.'],
    ...overrides,
  };
}

export const WEIGHTS: ScoreWeights = { kerkesa: 25, kapitali: 15, aftesite: 20, veshtiresia: 10, ekonomia: 15, rreziku: 15 };

export function makeTasks(): PlanTask[] {
  return [
    { id: 't1', phaseId: 'p00_10', titleSq: 'Detyra 1', descriptionSq: 'Përshkrim 1', dayOffset: 0, durationDays: 2, weight: 1, status: 'per_tu_bere', proofSq: 'Provë 1' },
    { id: 't2', phaseId: 'p00_10', titleSq: 'Detyra 2', descriptionSq: 'Përshkrim 2', dayOffset: 2, durationDays: 3, weight: 3, status: 'per_tu_bere', proofSq: 'Provë 2' },
    { id: 't3', phaseId: 'p10_20', titleSq: 'Detyra 3', descriptionSq: 'Përshkrim 3', dayOffset: 5, durationDays: 5, weight: 4, status: 'per_tu_bere', proofSq: 'Provë 3' },
    { id: 't4', phaseId: 'p20_30', titleSq: 'Detyra 4', descriptionSq: 'Përshkrim 4', dayOffset: 10, durationDays: 1, weight: 2, status: 'per_tu_bere', proofSq: 'Provë 4' },
  ];
}

export function makeObservation(overrides: Partial<Observation> = {}): Observation {
  return {
    sourceId: 'test-source',
    indicatorCode: 'gdp_growth',
    countryCode: 'ALB',
    period: '2023',
    value: 1.11,
    unit: 'perqind',
    currency: null,
    isProjection: false,
    isDemo: false,
    obsStatus: null,
    sourceUrl: SYNTHETIC_URL,
    sourceLastUpdated: '2026-01-02',
    retrievedAt: '2026-10-01T10:00:00.000Z',
    ...overrides,
  };
}

export function makeSnapshot(isDemo = false): DataSnapshot {
  return {
    capturedAt: '2026-10-01T10:00:00.000Z',
    isDemo,
    observations: [makeObservation(isDemo ? { countryCode: 'ZZA', isDemo: true, sourceId: 'demo' } : {})],
    fxRates: [],
  };
}

export function makeProjectInput(overrides: Partial<NewProjectInput> = {}): NewProjectInput {
  return {
    title: 'Projekt testimi',
    archetypeId: 'mirembajtje-prezence-online-per-biznese-lokale',
    countryCode: 'ALB',
    city: 'Qytet testimi',
    registrationCountry: 'ALB',
    customerCountries: ['ALB', 'XKX'],
    financialInputs: makeFinancialInputs(),
    scoreWeights: WEIGHTS,
    dataSnapshot: makeSnapshot(),
    notesSq: 'Shënim',
    analysisDate: '2026-10-01T10:00:00.000Z',
    tasks: makeTasks(),
    ...overrides,
  };
}

export function makeFx(overrides: Partial<FxRate> = {}): FxRate {
  return {
    base: 'EUR',
    quote: 'ALL',
    rate: 111.11,
    rateDate: '2026-09-30',
    sourceId: 'test-fx',
    kind: 'reference_ditore',
    retrievedAt: '2026-10-01T10:00:00.000Z',
    ...overrides,
  };
}
