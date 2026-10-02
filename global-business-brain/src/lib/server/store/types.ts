/**
 * Kontrata e ruajtjes (storage contract).
 *
 * Every method that touches user-owned data takes `userId` as its first argument and MUST
 * scope the query by it (project isolation). A record owned by another user behaves exactly
 * like a missing record (null / false), so callers cannot probe for foreign ids.
 */
import type {
  AssistantMessage,
  Country,
  CountryCode,
  DataSnapshot,
  EvidenceEntry,
  FetchLogEntry,
  FinancialInputs,
  FxRate,
  IsoTimestamp,
  Observation,
  PlanTask,
  Project,
  ProjectSummary,
  ScoreWeights,
  TaskStatus,
  UserProfile,
} from '@/lib/domain/types';

export interface UserRecord {
  id: string;
  email: string | null; // null for guest accounts
  passwordHash: string | null;
  isGuest: boolean;
  createdAt: IsoTimestamp;
}

export interface SessionRecord {
  id: string;
  userId: string;
  tokenHash: string; // sha256 of the cookie token; the raw token is never stored
  expiresAt: IsoTimestamp;
  createdAt: IsoTimestamp;
}

export interface ObservationQuery {
  countryCodes?: CountryCode[];
  indicatorCodes?: string[];
  sourceIds?: string[];
  includeDemo?: boolean; // default false
}

export interface DataStore {
  upsertObservations(observations: Observation[]): Promise<number>;
  getObservations(query: ObservationQuery): Promise<Observation[]>;
  addFetchLog(entry: FetchLogEntry): Promise<void>;
  getRecentFetchLogs(limit?: number): Promise<FetchLogEntry[]>;
  /** Latest log entry per (sourceId, scope). */
  getLatestFetchLogs(): Promise<FetchLogEntry[]>;
  upsertFxRates(rates: FxRate[]): Promise<number>;
  /** Latest rate per (base, quote, sourceId). */
  getFxRates(): Promise<FxRate[]>;
  upsertCountryMeta(rows: { code: CountryCode; wb: NonNullable<Country['wb']> }[]): Promise<number>;
  getCountryMeta(): Promise<Record<CountryCode, NonNullable<Country['wb']>>>;
}

export interface NewProjectInput {
  title: string;
  archetypeId: string;
  countryCode: CountryCode;
  city?: string | null;
  registrationCountry?: CountryCode | null;
  customerCountries: CountryCode[];
  financialInputs: FinancialInputs;
  scoreWeights: ScoreWeights;
  dataSnapshot: DataSnapshot;
  notesSq?: string | null;
  analysisDate: IsoTimestamp;
  tasks: PlanTask[];
}

export type ProjectPatch = Partial<
  Pick<
    Project,
    'title' | 'city' | 'registrationCountry' | 'customerCountries' | 'financialInputs' | 'scoreWeights' | 'notesSq' | 'dataSnapshot' | 'analysisDate'
  >
>;

export interface Store {
  readonly kind: 'postgres' | 'pglite';
  users: {
    createGuest(): Promise<UserRecord>;
    create(email: string, passwordHash: string): Promise<UserRecord>;
    findByEmail(email: string): Promise<UserRecord | null>;
    findById(id: string): Promise<UserRecord | null>;
    upgradeGuest(id: string, email: string, passwordHash: string): Promise<UserRecord | null>;
    delete(id: string): Promise<boolean>; // cascades to all user data
  };
  sessions: {
    create(userId: string, tokenHash: string, expiresAt: IsoTimestamp): Promise<SessionRecord>;
    findByTokenHash(tokenHash: string): Promise<SessionRecord | null>;
    delete(id: string): Promise<void>;
    deleteForUser(userId: string): Promise<void>;
    deleteExpired(now: IsoTimestamp): Promise<number>;
  };
  profiles: {
    get(userId: string): Promise<UserProfile | null>;
    upsert(userId: string, profile: UserProfile): Promise<UserProfile>;
  };
  projects: {
    list(userId: string): Promise<ProjectSummary[]>;
    get(userId: string, projectId: string): Promise<Project | null>;
    create(userId: string, input: NewProjectInput): Promise<Project>;
    update(userId: string, projectId: string, patch: ProjectPatch): Promise<Project | null>;
    delete(userId: string, projectId: string): Promise<boolean>;
  };
  tasks: {
    list(userId: string, projectId: string): Promise<PlanTask[] | null>;
    replaceAll(userId: string, projectId: string, tasks: PlanTask[]): Promise<boolean>;
    update(
      userId: string,
      projectId: string,
      taskId: string,
      patch: { status?: TaskStatus; notesSq?: string | null },
    ): Promise<PlanTask | null>;
  };
  evidence: {
    list(userId: string, projectId: string): Promise<EvidenceEntry[] | null>;
    add(
      userId: string,
      projectId: string,
      entry: Omit<EvidenceEntry, 'id' | 'projectId' | 'createdAt'>,
    ): Promise<EvidenceEntry | null>;
    delete(userId: string, projectId: string, evidenceId: string): Promise<boolean>;
  };
  chat: {
    list(userId: string, projectId: string | null, limit?: number): Promise<AssistantMessage[]>;
    append(userId: string, projectId: string | null, messages: AssistantMessage[]): Promise<void>;
  };
  rateLimit: {
    /** Records a hit and returns the number of hits for `key` in the current fixed window. */
    hit(key: string, windowMs: number, now: Date): Promise<number>;
  };
  data: DataStore;
}
