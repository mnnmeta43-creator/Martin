// SYNTHETIC — format mirrors the documented API; values are not real
/**
 * Ndihmës për testet e asistentit: një Store në memorie, projekte/profile sintetike dhe një klient
 * Anthropic i simuluar. Numbers are deliberately synthetic (11.11, 22.22, 1111 …) and URLs use the
 * reserved ".invalid" TLD, so nothing here can be mistaken for a real statistic or source.
 */
import type { BetaContentBlock, BetaMessage, MessageCreateParamsNonStreaming } from '@anthropic-ai/sdk/resources/beta/messages/messages';
import type {
  AssistantMessage,
  EvidenceEntry,
  FinancialInputs,
  FxRate,
  Observation,
  PlanTask,
  Project,
  UserProfile,
} from '@/lib/domain/types';
import type { DataStore, Store } from '@/lib/server/store/types';
import { DEFAULT_SCORE_WEIGHTS } from '@/lib/domain/taxonomy';
import { getArchetype } from '@/lib/ideas/archetypes';
import { buildFinancialInputs } from '@/lib/finance/build';
import type { AnthropicLike } from '@/lib/ai/claude';

export const USER_ID = '11111111-1111-4111-8111-111111111111';
export const OTHER_USER_ID = '22222222-2222-4222-8222-222222222222';
export const PROJECT_ID = '33333333-3333-4333-8333-333333333333';
export const DEMO_PROJECT_ID = '44444444-4444-4444-8444-444444444444';
export const FOREIGN_PROJECT_ID = '55555555-5555-4555-8555-555555555555';
export const ARCHETYPE_ID = 'mirembajtje-prezence-online-per-biznese-lokale';
export const NOW = new Date('2026-10-02T09:00:00.000Z');
export const SYNTHETIC_URL = 'https://example.invalid/synthetic-indicator';
export const FOREIGN_NOTES = 'SEKRET-I-PERDORUESIT-TJETER: shënime private që nuk duhet të shfaqen kurrë.';

export function makeInputs(): FinancialInputs {
  const archetype = getArchetype(ARCHETYPE_ID);
  if (!archetype) throw new Error('reference archetype missing');
  const built = buildFinancialInputs(archetype, {
    currency: 'USD',
    fxRates: [],
    ownCapital: 1111,
    ownerIncomeNeedMonthly: null,
    priceLevel: null,
    assets: [],
    startMonth: 10,
    today: '2026-10-02',
  });
  if (!built.ok) throw new Error(built.reasonSq);
  return built.inputs;
}

export function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    residenceCountry: 'ALB',
    operableCountries: ['ALB'],
    targetCountries: ['ALB'],
    capital: { amount: 1111, currency: 'USD' },
    skills: ['dizajn_web', 'shitje'],
    experienceYears: 2,
    experienceSectors: ['digjitale'],
    hoursPerWeek: 30,
    assets: ['kompjuter', 'telefon_smart'],
    teamMode: 'vetem',
    businessModes: ['online', 'kombinuar'],
    marketScopes: ['lokal'],
    startLocations: ['shtepi'],
    isAdult: true,
    riskTolerance: 'mesatare',
    ownerIncomeNeedMonthly: null,
    ...overrides,
  };
}

export function makeTasks(): PlanTask[] {
  return [
    { id: 't1', phaseId: 'p00_10', titleSq: 'Detyrë sintetike 1', descriptionSq: 'Përshkrim 1', dayOffset: 0, durationDays: 2, weight: 1, status: 'per_tu_bere', proofSq: 'Provë 1' },
    { id: 't2', phaseId: 'p00_10', titleSq: 'Detyrë sintetike 2', descriptionSq: 'Përshkrim 2', dayOffset: 2, durationDays: 3, weight: 2, status: 'ne_progres', proofSq: 'Provë 2' },
    { id: 't3', phaseId: 'p10_20', titleSq: 'Detyrë sintetike 3', descriptionSq: 'Përshkrim 3', dayOffset: 5, durationDays: 5, weight: 3, status: 'per_tu_bere', proofSq: 'Provë 3' },
    { id: 't4', phaseId: 'p20_30', titleSq: 'Detyrë sintetike 4', descriptionSq: 'Përshkrim 4', dayOffset: 0, durationDays: 1, weight: 1, status: 'perfunduar', proofSq: 'Provë 4' },
  ];
}

export function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: PROJECT_ID,
    userId: USER_ID,
    title: 'Projekt sintetik',
    archetypeId: ARCHETYPE_ID,
    countryCode: 'ALB',
    city: null,
    registrationCountry: 'ALB',
    customerCountries: ['ALB'],
    financialInputs: makeInputs(),
    scoreWeights: DEFAULT_SCORE_WEIGHTS,
    dataSnapshot: { capturedAt: '2026-09-30T00:00:00.000Z', isDemo: false, observations: [], fxRates: [] },
    notesSq: null,
    analysisDate: '2026-09-30T00:00:00.000Z',
    createdAt: '2026-09-30T00:00:00.000Z',
    updatedAt: '2026-09-30T00:00:00.000Z',
    ...overrides,
  };
}

export function makeObservation(overrides: Partial<Observation>): Observation {
  return {
    sourceId: 'worldbank-wdi',
    indicatorCode: 'internet_users_pct',
    countryCode: 'ALB',
    period: '2024',
    value: 11.11,
    unit: 'perqind',
    currency: null,
    isProjection: false,
    isDemo: false,
    obsStatus: null,
    sourceUrl: SYNTHETIC_URL,
    sourceLastUpdated: null,
    retrievedAt: '2026-10-01T00:00:00.000Z',
    ...overrides,
  };
}

/** Synthetic observations for ALB and XKX (a few indicators only, so "mungon" also occurs). */
export function makeObservations(): Observation[] {
  return [
    makeObservation({ countryCode: 'ALB', indicatorCode: 'internet_users_pct', period: '2024', value: 11.11, sourceUrl: `${SYNTHETIC_URL}/alb-internet` }),
    makeObservation({ countryCode: 'ALB', indicatorCode: 'gdp_per_capita_ppp', period: '2024', value: 12345, unit: 'monedhe', currency: 'INTL$', sourceUrl: `${SYNTHETIC_URL}/alb-ppp` }),
    makeObservation({ countryCode: 'XKX', indicatorCode: 'internet_users_pct', period: '2024', value: 22.22, sourceUrl: `${SYNTHETIC_URL}/xkx-internet` }),
    makeObservation({ countryCode: 'XKX', indicatorCode: 'price_level_ratio', period: '2024', value: 0.11, unit: 'raport', sourceUrl: `${SYNTHETIC_URL}/xkx-price` }),
  ];
}

interface FakeData {
  projects: Project[];
  profiles: Map<string, UserProfile>;
  tasks: Map<string, PlanTask[]>;
  evidence: Map<string, EvidenceEntry[]>;
  observations: Observation[];
  fxRates: FxRate[];
  chat: { userId: string; projectId: string | null; message: AssistantMessage }[];
}

const unused = (): never => {
  throw new Error('not used by the assistant tests');
};

/** In-memory Store honouring the isolation contract (foreign ids behave like missing ones). */
export function createFakeStore(seed: Partial<FakeData> = {}): Store & { state: FakeData } {
  const state: FakeData = {
    projects: seed.projects ?? [],
    profiles: seed.profiles ?? new Map(),
    tasks: seed.tasks ?? new Map(),
    evidence: seed.evidence ?? new Map(),
    observations: seed.observations ?? [],
    fxRates: seed.fxRates ?? [],
    chat: seed.chat ?? [],
  };
  const owned = (userId: string, projectId: string) => state.projects.find((p) => p.id === projectId && p.userId === userId) ?? null;
  const data: DataStore = {
    upsertObservations: async () => 0,
    getObservations: async (q) =>
      state.observations.filter(
        (o) =>
          (q.includeDemo || !o.isDemo) &&
          (!q.countryCodes || q.countryCodes.includes(o.countryCode)) &&
          (!q.indicatorCodes || q.indicatorCodes.includes(o.indicatorCode)) &&
          (!q.sourceIds || q.sourceIds.includes(o.sourceId)),
      ),
    addFetchLog: async () => undefined,
    getRecentFetchLogs: async () => [],
    getLatestFetchLogs: async () => [],
    upsertFxRates: async () => 0,
    getFxRates: async () => state.fxRates,
    upsertCountryMeta: async () => 0,
    getCountryMeta: async () => ({}),
  };
  return {
    state,
    kind: 'pglite',
    users: { createGuest: unused, create: unused, findByEmail: unused, findById: unused, upgradeGuest: unused, delete: unused },
    sessions: { create: unused, findByTokenHash: unused, delete: unused, deleteForUser: unused, deleteExpired: unused },
    profiles: {
      get: async (userId) => state.profiles.get(userId) ?? null,
      upsert: unused,
    },
    projects: {
      list: unused,
      get: async (userId, projectId) => owned(userId, projectId),
      create: unused,
      update: unused,
      delete: unused,
    },
    tasks: {
      list: async (userId, projectId) => (owned(userId, projectId) ? (state.tasks.get(projectId) ?? []) : null),
      replaceAll: unused,
      update: unused,
    },
    evidence: {
      list: async (userId, projectId) => (owned(userId, projectId) ? (state.evidence.get(projectId) ?? []) : null),
      add: unused,
      delete: unused,
    },
    chat: {
      list: async (userId, projectId) => state.chat.filter((c) => c.userId === userId && c.projectId === projectId).map((c) => c.message),
      append: async (userId, projectId, messages) => {
        if (projectId !== null && !owned(userId, projectId)) return;
        for (const message of messages) state.chat.push({ userId, projectId, message });
      },
    },
    rateLimit: { hit: unused },
    data,
  };
}

/** Store with: our project (ALB), a demo project (ZZA), another user's project, profile, tasks. */
export function standardStore(extra: { notesSq?: string | null; evidence?: EvidenceEntry[]; title?: string } = {}) {
  const project = makeProject({ notesSq: extra.notesSq ?? null, ...(extra.title ? { title: extra.title } : {}) });
  const demoProject = makeProject({ id: DEMO_PROJECT_ID, countryCode: 'ZZA', title: 'Projekt demo', dataSnapshot: { capturedAt: '2026-09-30T00:00:00.000Z', isDemo: true, observations: [], fxRates: [] } });
  const foreign = makeProject({ id: FOREIGN_PROJECT_ID, userId: OTHER_USER_ID, title: 'Projekti i dikujt tjetër', notesSq: FOREIGN_NOTES });
  return createFakeStore({
    projects: [project, demoProject, foreign],
    profiles: new Map([[USER_ID, makeProfile()]]),
    tasks: new Map([
      [PROJECT_ID, makeTasks()],
      [DEMO_PROJECT_ID, makeTasks()],
      [FOREIGN_PROJECT_ID, makeTasks()],
    ]),
    evidence: new Map([[PROJECT_ID, extra.evidence ?? []]]),
    observations: makeObservations(),
  });
}

export function evidenceEntry(overrides: Partial<EvidenceEntry>): EvidenceEntry {
  return {
    id: 'e1',
    projectId: PROJECT_ID,
    type: 'interviste',
    summarySq: 'Intervistë sintetike.',
    quantity: 1,
    amount: null,
    sourceSq: 'Burim sintetik',
    collectedAt: '2026-10-01',
    createdAt: '2026-10-01T10:00:00.000Z',
    ...overrides,
  };
}

// ── Mock Anthropic client ───────────────────────────────────────────────────

type Block = Record<string, unknown> & { type: string };

export function message(content: Block[], stopReason: BetaMessage['stop_reason']): BetaMessage {
  return {
    id: 'msg_synthetic',
    type: 'message',
    role: 'assistant',
    model: 'claude-opus-5-5',
    content: content as unknown as BetaContentBlock[],
    stop_reason: stopReason,
    stop_sequence: null,
    usage: { input_tokens: 1, output_tokens: 1 },
  } as unknown as BetaMessage;
}

export const text = (t: string): Block => ({ type: 'text', text: t, citations: null });
export const toolUse = (id: string, name: string, input: unknown): Block => ({ type: 'tool_use', id, name, input });

export interface MockClient extends AnthropicLike {
  calls: MessageCreateParamsNonStreaming[];
}

/** Returns the scripted responses in order and records a deep copy of every request. */
export function mockClient(responses: (BetaMessage | Error)[]): MockClient {
  const calls: MessageCreateParamsNonStreaming[] = [];
  let index = 0;
  return {
    calls,
    beta: {
      messages: {
        create: async (body) => {
          calls.push(structuredClone(body));
          const next = responses[Math.min(index++, responses.length - 1)];
          if (next instanceof Error) throw next;
          return next;
        },
      },
    },
  };
}

/** The tool_result blocks of the last user message in a recorded request. */
export function toolResultsOf(call: MessageCreateParamsNonStreaming): { tool_use_id: string; content: string; is_error?: boolean }[] {
  const last = call.messages[call.messages.length - 1];
  if (!Array.isArray(last.content)) return [];
  return last.content.filter((b) => b.type === 'tool_result') as unknown as { tool_use_id: string; content: string; is_error?: boolean }[];
}

/** Parses the JSON inside an <untrusted_data> wrapper. */
export function unwrap(content: string): { ok: boolean; data: unknown; citations: { id: string }[] } {
  const match = /^<untrusted_data source="[^"]+">\n([\s\S]*)\n<\/untrusted_data>$/.exec(content);
  if (!match) throw new Error(`not wrapped: ${content.slice(0, 80)}`);
  return JSON.parse(match[1]);
}
