/**
 * Konteksti i asistentit: profili, projekti, arketipi, detyrat, provat, të dhënat e vendit dhe
 * projeksioni bazë — gjithçka që mjetet e asistentit lexojnë.
 *
 * Isolation: the project is read with `store.projects.get(userId, projectId)`, which treats a
 * foreign id exactly like a missing one. A requested project that does not resolve stops the
 * whole turn with "not found", so nothing about another user's data can reach the model.
 */
import type {
  BusinessArchetype,
  CountryDataContext,
  EvidenceEntry,
  IdeaRecommendation,
  PlanTask,
  Project,
  ProjectionResult,
  UserProfile,
} from '@/lib/domain/types';
import type { Store } from '@/lib/server/store/types';
import { getArchetype } from '@/lib/ideas/archetypes';
import { evaluateIdea } from '@/lib/ideas/engine';
import { getCountryDataContext } from '@/lib/data/context';
import { getCountry } from '@/lib/data/countries';
import { projectScenario } from '@/lib/finance/engine';

export interface AssistantContext {
  readonly store: Store;
  readonly userId: string;
  readonly now: Date;
  readonly demoMode: boolean;
  readonly profile: UserProfile | null;
  readonly project: Project | null;
  readonly archetype: BusinessArchetype | null;
  readonly tasks: PlanTask[];
  readonly evidence: EvidenceEntry[];
  /** Data context of the project's economy; null without a project or when unavailable in this mode. */
  readonly countryCtx: CountryDataContext | null;
  /** 'baze' projection of the project's saved financial inputs. */
  readonly baseProjection: ProjectionResult | null;
  /** Per-turn memo for derived values (e.g. the idea evaluation), so tools do not recompute them. */
  readonly memo: Map<string, unknown>;
}

export interface LoadContextInput {
  store: Store;
  userId: string;
  projectId?: string | null;
  now: Date;
  demoMode: boolean;
}

export type ContextLoad = { ok: true; context: AssistantContext } | { ok: false; reason: 'projekti_nuk_u_gjet' };

export async function loadAssistantContext(input: LoadContextInput): Promise<ContextLoad> {
  const { store, userId, now, demoMode } = input;
  const projectId = input.projectId?.trim() || null;
  const [profile, project] = await Promise.all([
    store.profiles.get(userId),
    projectId ? store.projects.get(userId, projectId) : Promise.resolve(null),
  ]);
  if (projectId && !project) return { ok: false, reason: 'projekti_nuk_u_gjet' };

  const [tasks, evidence, countryCtx] = project
    ? await Promise.all([
        store.tasks.list(userId, project.id),
        store.evidence.list(userId, project.id),
        getCountryDataContext(store.data, project.countryCode, now, { demoMode }),
      ])
    : [null, null, null];

  return {
    ok: true,
    context: {
      store,
      userId,
      now,
      demoMode,
      profile,
      project,
      archetype: project ? (getArchetype(project.archetypeId) ?? null) : null,
      tasks: tasks ?? [],
      evidence: evidence ?? [],
      countryCtx: countryCtx ?? null,
      baseProjection: project ? projectScenario(project.financialInputs, 'baze') : null,
      memo: new Map(),
    },
  };
}

/** Albanian display name for any code the catalogue knows (demo names included: it is only a label). */
export function countryNameSq(code: string): string {
  return getCountry(code, { includeDemo: true })?.nameSq ?? code;
}

/**
 * The user's profile, or — when it has not been filled in — a neutral one built from the project
 * (its country and own capital), so the idea can still be evaluated. Callers label the result.
 */
export function effectiveProfile(ctx: AssistantContext): UserProfile | null {
  if (ctx.profile) return ctx.profile;
  if (!ctx.project) return null;
  const { countryCode, financialInputs } = ctx.project;
  return {
    residenceCountry: countryCode,
    operableCountries: [countryCode],
    targetCountries: [countryCode],
    capital: { amount: financialInputs.ownCapital, currency: financialInputs.currency },
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

/** The idea engine's evaluation of the project's archetype in the project's economy (memoised). */
export function recommendationFor(ctx: AssistantContext): IdeaRecommendation | null {
  if (ctx.memo.has('rec')) return ctx.memo.get('rec') as IdeaRecommendation | null;
  const profile = effectiveProfile(ctx);
  const rec =
    ctx.project && ctx.archetype && ctx.countryCtx && profile
      ? evaluateIdea(ctx.archetype, profile, ctx.countryCtx, { weights: ctx.project.scoreWeights, now: ctx.now, evidence: ctx.evidence })
      : null;
  ctx.memo.set('rec', rec);
  return rec;
}
