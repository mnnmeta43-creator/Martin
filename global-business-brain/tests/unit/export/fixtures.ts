/**
 * Ndërtuesi i hyrjes për testet e eksportit: një projekt i plotë i ndërtuar me modulet reale
 * (arketipi i bibliotekës → buildFinancialInputs → projectAllScenarios → generatePlan → computeProgress).
 *
 * SYNTHETIC — format mirrors the documented API; values are not real. FX rates, citation values,
 * own capital and owner income are obviously made-up numbers (0.5, 111.11, 12345, 1.11, …).
 */
import type {
  BusinessArchetype,
  Citation,
  CurrencyCode,
  FinancialInputs,
  FxRate,
  Observation,
  PlanTask,
  Project,
  TaskStatus,
} from '@/lib/domain/types';
import { DEFAULT_SCORE_WEIGHTS } from '@/lib/domain/taxonomy';
import { ARCHETYPES } from '@/lib/ideas/archetypes';
import { buildFinancialInputs } from '@/lib/finance/build';
import { projectAllScenarios } from '@/lib/finance/engine';
import { generatePlan } from '@/lib/plan/generate';
import { computeProgress } from '@/lib/plan/progress';
import { INDICATORS } from '@/lib/data/indicators';
import { buildWbIndicatorUrl } from '@/lib/data/sources/worldbank';
import { getSource } from '@/lib/data/sources/registry';
import { buildDemoFxRates, buildDemoObservations, DEMO_COUNTRIES } from '@/lib/data/demo/dataset';
import type { ExportInput } from '@/lib/export/excel';

export const NOW = new Date('2026-10-02T09:00:00.000Z');
export const GENERATED_AT = '2026-10-02T10:30:00.000Z';

// SYNTHETIC — format mirrors the documented API; values are not real
const SYNTHETIC_FX: Record<string, FxRate> = {
  EUR: {
    base: 'USD',
    quote: 'EUR',
    rate: 0.5,
    rateDate: '2026-10-01',
    sourceId: 'ecb-frankfurter',
    kind: 'reference_ditore',
    retrievedAt: '2026-10-01T16:00:00.000Z',
  },
  JPY: {
    base: 'USD',
    quote: 'JPY',
    rate: 111.11,
    rateDate: '2026-10-01',
    sourceId: 'ecb-frankfurter',
    kind: 'reference_ditore',
    retrievedAt: '2026-10-01T16:00:00.000Z',
  },
};

// SYNTHETIC — format mirrors the documented API; values are not real
function syntheticCitations(countryCode: string): Citation[] {
  const defs = INDICATORS.filter((d) => d.sourceId === 'worldbank-wdi').slice(0, 2);
  const values = [12345, 1.11];
  return defs.map((def, i) => ({
    sourceId: def.sourceId,
    sourceName: getSource(def.sourceId)?.nameSq ?? def.sourceId,
    url: buildWbIndicatorUrl(def.sourceCode, [countryCode], { from: 2015, to: 2026 }),
    indicatorCode: def.code,
    countryCode,
    period: '2024',
    value: values[i],
    unitLabelSq: def.unitLabelSq,
    retrievedAt: '2026-10-01T08:00:00.000Z',
    sourceLastUpdated: '2026-09-15',
    isDemo: false,
    isProjection: false,
  }));
}

function demoCitations(observations: Observation[]): Citation[] {
  return observations.slice(0, 3).map((o) => ({
    sourceId: o.sourceId,
    sourceName: getSource(o.sourceId)?.nameSq ?? o.sourceId,
    url: o.sourceUrl,
    indicatorCode: o.indicatorCode,
    countryCode: o.countryCode,
    period: o.period,
    value: o.value,
    retrievedAt: o.retrievedAt,
    isDemo: o.isDemo,
    isProjection: o.isProjection,
  }));
}

export interface FixtureOptions {
  demo?: boolean;
  currency?: CurrencyCode;
  archetype?: BusinessArchetype;
  profitTaxPct?: number;
  includeOwnerSalary?: boolean;
  /** Final tweak of the built inputs (e.g. to force a negative contribution). */
  mutateInputs?: (inputs: FinancialInputs) => FinancialInputs;
  statuses?: TaskStatus[]; // applied to the first tasks, in order
}

function applyStatuses(tasks: PlanTask[], statuses: TaskStatus[]): PlanTask[] {
  return tasks.map((task, i) =>
    i < statuses.length
      ? { ...task, status: statuses[i], completedAt: statuses[i] === 'perfunduar' ? '2026-10-05T12:00:00.000Z' : null }
      : task,
  );
}

export function makeExportInput(opts: FixtureOptions = {}): ExportInput {
  const demo = opts.demo ?? false;
  const currency = opts.currency ?? 'EUR';
  const archetype = opts.archetype ?? ARCHETYPES[0];
  const countryCode = demo ? 'ZZA' : currency === 'JPY' ? 'JPN' : 'XKX';
  const fxRates = demo ? buildDemoFxRates(NOW) : [SYNTHETIC_FX[currency]];
  const observations = demo ? buildDemoObservations(NOW).filter((o) => o.countryCode === 'ZZA') : [];
  const countryNameSq = demo ? (DEMO_COUNTRIES.find((c) => c.code === 'ZZA')?.nameSq ?? 'ZZA') : 'Vend testues';

  const built = buildFinancialInputs(archetype, {
    currency,
    fxRates,
    ownCapital: currency === 'JPY' ? 1234567 : 12345,
    ownerIncomeNeedMonthly: opts.includeOwnerSalary === false ? 0 : currency === 'JPY' ? 22222 : 222,
    priceLevel: null,
    assets: [],
    startMonth: 3,
    today: '2026-10-02',
  });
  if (!built.ok) throw new Error(built.reasonSq);
  let inputs: FinancialInputs = { ...built.inputs, profitTaxPct: opts.profitTaxPct ?? 0 };
  if (opts.mutateInputs) inputs = opts.mutateInputs(inputs);

  const projections = projectAllScenarios(inputs);
  const plan = generatePlan({
    archetype,
    countryCode,
    city: 'Qyteti testues',
    inputs,
    projection: projections.baze,
    countryNameSq,
  });
  const tasks = applyStatuses(plan.tasks, opts.statuses ?? ['perfunduar', 'ne_progres', 'anashkaluar']);
  const project: Project = {
    id: 'projekt-test-1',
    userId: 'perdorues-test-1',
    title: 'Projekti testues: shërbim çdo javë',
    archetypeId: archetype.id,
    countryCode,
    city: 'Qyteti testues',
    registrationCountry: null,
    customerCountries: [countryCode],
    financialInputs: inputs,
    scoreWeights: DEFAULT_SCORE_WEIGHTS,
    dataSnapshot: { capturedAt: NOW.toISOString(), isDemo: demo, observations, fxRates },
    notesSq: null,
    analysisDate: NOW.toISOString(),
    createdAt: NOW.toISOString(),
    updatedAt: NOW.toISOString(),
  };
  return {
    project,
    archetype,
    projections,
    plan,
    progress: computeProgress(tasks),
    tasks,
    citations: demo ? demoCitations(observations) : syntheticCitations(countryCode),
    countryNameSq,
    generatedAt: GENERATED_AT,
  };
}
