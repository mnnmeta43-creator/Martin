/**
 * Krijimi dhe leximi i projekteve (shared by API routes and pages).
 * A project freezes the data snapshot used in the analysis (values + provenance + FX) so a saved
 * plan always shows the data and date it was based on.
 */
import type {
  CountryDataContext,
  FinancialInputs,
  FxRate,
  Observation,
  Plan,
  PlanTask,
  Project,
  UserProfile,
} from '@/lib/domain/types';
import { DEFAULT_SCORE_WEIGHTS } from '@/lib/domain/taxonomy';
import { getArchetype } from '@/lib/ideas/archetypes';
import { evaluateIdea } from '@/lib/ideas/engine';
import { projectAllScenarios, projectScenario } from '@/lib/finance/engine';
import { generatePlan } from '@/lib/plan/generate';
import { computeProgress } from '@/lib/plan/progress';
import { getCountryDataContext } from '@/lib/data/context';
import { getCountry } from '@/lib/data/countries';
import { getSource } from '@/lib/data/sources/registry';
import { getIndicator } from '@/lib/data/indicators';
import { formatIndicatorValue } from '@/lib/finance/format';
import type { Store } from '@/lib/server/store/types';
import { buildInputsWithFallback } from './ideas';
import type { Citation } from '@/lib/domain/types';

export class ProjectInputError extends Error {
  constructor(public readonly messageSq: string) {
    super(messageSq);
  }
}

/** Observations actually used by the analysis: the latest value of every series (with provenance). */
export function snapshotObservations(ctx: CountryDataContext): Observation[] {
  return ctx.series.map((s) => s.latest).filter((o): o is Observation => Boolean(o));
}

export interface CreateProjectArgs {
  archetypeId: string;
  countryCode: string;
  city?: string | null;
  registrationCountry?: string | null;
  customerCountries?: string[];
  title?: string;
  financialInputs?: FinancialInputs;
  manualFxRates?: FxRate[];
}

export async function createProjectFromIdea(
  store: Store,
  userId: string,
  profile: UserProfile | null,
  args: CreateProjectArgs,
  now: Date,
  demoMode: boolean,
): Promise<Project> {
  const archetype = getArchetype(args.archetypeId);
  if (!archetype) throw new ProjectInputError('Ideja nuk u gjet.');
  const country = getCountry(args.countryCode, { includeDemo: demoMode });
  if (!country) throw new ProjectInputError('Vendi nuk u gjet ose nuk është i disponueshëm në këtë modalitet.');
  const ctx = await getCountryDataContext(store.data, country.code, now, { demoMode });
  if (!ctx) throw new ProjectInputError('Nuk u ngarkuan të dhënat për këtë vend.');
  if (!profile) throw new ProjectInputError('Plotësoni profilin përpara se të ruani një projekt.');

  const manual = (args.manualFxRates ?? []).map((r) => ({ ...r, sourceId: 'manual', kind: 'manuale' as const }));
  let inputs = args.financialInputs ?? null;
  if (!inputs) {
    const rec = evaluateIdea(archetype, profile, ctx, { weights: DEFAULT_SCORE_WEIGHTS, now, extraFxRates: manual });
    const { built, currencyFallbackSq } = buildInputsWithFallback(archetype, profile, ctx, rec.priceLevelAdjustment ?? null, now, manual);
    if (!built.ok) throw new ProjectInputError(built.reasonSq);
    inputs = currencyFallbackSq ? { ...built.inputs, assumptionsNotesSq: [currencyFallbackSq, ...built.inputs.assumptionsNotesSq] } : built.inputs;
  }
  const base = projectScenario(inputs, 'baze');
  // The profile's target city belongs to the target markets only; never attach it to another country.
  const city = args.city ?? (profile.targetCountries.some((c) => c.toUpperCase() === country.code) ? (profile.targetCity ?? null) : null);
  const plan = generatePlan({ archetype, countryCode: country.code, city, inputs, projection: base });
  return store.projects.create(userId, {
    title: args.title?.trim() || `${archetype.nameSq} — ${country.nameSq}`,
    archetypeId: archetype.id,
    countryCode: country.code,
    city,
    registrationCountry: args.registrationCountry ?? null,
    customerCountries: args.customerCountries?.length ? args.customerCountries : [country.code],
    financialInputs: inputs,
    scoreWeights: DEFAULT_SCORE_WEIGHTS,
    dataSnapshot: { capturedAt: now.toISOString(), isDemo: ctx.isDemo, observations: snapshotObservations(ctx), fxRates: [...ctx.fxRates, ...manual] },
    notesSq: null,
    analysisDate: now.toISOString(),
    tasks: plan.tasks,
  });
}

/** Plan regenerated from the current inputs, carrying over the stored task statuses. */
export function mergePlanWithTasks(plan: Plan, stored: PlanTask[]): Plan {
  const byId = new Map(stored.map((t) => [t.id, t]));
  return { ...plan, tasks: plan.tasks.map((t) => ({ ...t, ...(byId.get(t.id) ? { status: byId.get(t.id)!.status, completedAt: byId.get(t.id)!.completedAt, notesSq: byId.get(t.id)!.notesSq } : {}) })) };
}

/** Citations for every observation frozen in the project snapshot. */
export function snapshotCitations(project: Project): Citation[] {
  return project.dataSnapshot.observations.map((o) => ({
    sourceId: o.sourceId,
    sourceName: getSource(o.sourceId)?.nameSq ?? o.sourceId,
    url: o.sourceUrl,
    indicatorCode: o.indicatorCode,
    countryCode: o.countryCode,
    period: o.period,
    value: o.value,
    retrievedAt: o.retrievedAt,
    sourceLastUpdated: o.sourceLastUpdated ?? null,
    isDemo: o.isDemo,
    isProjection: o.isProjection,
    noteSq: snapshotNoteSq(o),
  }));
}

function snapshotNoteSq(o: Observation): string {
  const def = getIndicator(o.indicatorCode);
  return def ? `${def.nameSq}: ${formatIndicatorValue(o.value, def)}` : o.indicatorCode;
}

export async function loadProjectView(store: Store, userId: string, projectId: string, demoMode: boolean) {
  const project = await store.projects.get(userId, projectId);
  if (!project) return null;
  const archetype = getArchetype(project.archetypeId) ?? null;
  const stored = (await store.tasks.list(userId, projectId)) ?? [];
  const projections = projectAllScenarios(project.financialInputs);
  const plan = archetype
    ? mergePlanWithTasks(
        generatePlan({ archetype, countryCode: project.countryCode, city: project.city ?? null, inputs: project.financialInputs, projection: projections.baze }),
        stored,
      )
    : null;
  const tasks = plan ? plan.tasks : stored;
  const progress = computeProgress(tasks);
  const evidence = (await store.evidence.list(userId, projectId)) ?? [];
  const country = getCountry(project.countryCode, { includeDemo: true });
  return {
    project,
    archetype,
    tasks,
    plan,
    progress,
    projections,
    evidence,
    countryNameSq: country?.nameSq ?? project.countryCode,
    citations: snapshotCitations(project),
    demoModeMismatch: project.dataSnapshot.isDemo && !demoMode,
  };
}
