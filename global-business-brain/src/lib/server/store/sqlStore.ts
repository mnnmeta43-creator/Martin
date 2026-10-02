/**
 * Implementimi SQL i kontratës së ruajtjes (SQL implementation of the Store contract).
 *
 * Works on PostgreSQL and PGlite through the `Db` interface. Rules enforced here:
 * - Only parametrized SQL; column names in dynamic updates come from a fixed whitelist.
 * - Isolation: every project/task/evidence/chat statement is scoped by `user_id` (tasks and
 *   evidence via projects.user_id). A foreign or malformed id behaves exactly like a missing
 *   record (null / false / []), so callers cannot probe for other users' ids.
 * - Rows are mapped snake_case → camelCase; timestamps become ISO strings, DATE columns
 *   'YYYY-MM-DD'. Missing values stay null, never 0.
 */
import type {
  AssistantMessage,
  Country,
  CountryCode,
  EvidenceEntry,
  FetchLogEntry,
  FxRate,
  Observation,
  PlanTask,
  Project,
  ProjectSummary,
  TaskStatus,
  UserProfile,
} from '@/lib/domain/types';
import type { Db } from '@/lib/server/db';
import { normalizeEmail } from '@/lib/server/auth';
import { EmailTakenError } from '@/lib/server/errors';
import type { NewProjectInput, ObservationQuery, ProjectPatch, SessionRecord, Store, UserRecord } from '@/lib/server/store/types';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DEFAULT_CHAT_LIMIT = 50;
const MAX_CHAT_LIMIT = 500;
const DEFAULT_FETCH_LOG_LIMIT = 50;
const MAX_RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT_RETENTION_MS = 2 * MAX_RATE_LIMIT_WINDOW_MS;
// Keeps each multi-row INSERT well below Postgres' 65 535 bind-parameter limit.
const MAX_PARAMS_PER_STATEMENT = 6000;

type Row = Record<string, unknown>;

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value);
}

function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString();
}

function toIsoOrNull(value: unknown): string | null {
  return value === null || value === undefined ? null : toIso(value);
}

function toDateOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function str(value: unknown): string {
  return value === null || value === undefined ? '' : String(value);
}

function strOrNull(value: unknown): string | null {
  return value === null || value === undefined ? null : String(value);
}

function json(value: unknown): string {
  return JSON.stringify(value ?? null);
}

/** Builds "($1,$2,…),($n,…)" placeholders for a multi-row insert; `casts` adds per-column casts. */
function valuesClause(rowCount: number, casts: string[], offset = 0): string {
  const width = casts.length;
  const rows: string[] = [];
  for (let r = 0; r < rowCount; r++) {
    const cols = casts.map((cast, c) => `$${offset + r * width + c + 1}${cast}`);
    rows.push(`(${cols.join(',')})`);
  }
  return rows.join(',');
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** Last occurrence wins: ON CONFLICT cannot touch the same row twice in one statement. */
function dedupeBy<T>(items: T[], key: (item: T) => string): T[] {
  const map = new Map<string, T>();
  for (const item of items) map.set(key(item), item);
  return [...map.values()];
}

function isUniqueViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: unknown }).code === '23505';
}

// ─── Row mappers ────────────────────────────────────────────────────────────

function mapUser(r: Row): UserRecord {
  return {
    id: str(r.id),
    email: strOrNull(r.email),
    passwordHash: strOrNull(r.password_hash),
    isGuest: Boolean(r.is_guest),
    createdAt: toIso(r.created_at),
  };
}

function mapSession(r: Row): SessionRecord {
  return {
    id: str(r.id),
    userId: str(r.user_id),
    tokenHash: str(r.token_hash),
    expiresAt: toIso(r.expires_at),
    createdAt: toIso(r.created_at),
  };
}

const PROJECT_COLUMNS =
  'id, user_id, title, archetype_id, country_code, city, registration_country, customer_countries, financial_inputs, score_weights, data_snapshot, notes, analysis_date, created_at, updated_at';

function mapProject(r: Row): Project {
  return {
    id: str(r.id),
    userId: str(r.user_id),
    title: str(r.title),
    archetypeId: str(r.archetype_id),
    countryCode: str(r.country_code),
    city: strOrNull(r.city),
    registrationCountry: strOrNull(r.registration_country),
    customerCountries: Array.isArray(r.customer_countries) ? (r.customer_countries as string[]) : [],
    financialInputs: r.financial_inputs as Project['financialInputs'],
    scoreWeights: r.score_weights as Project['scoreWeights'],
    dataSnapshot: r.data_snapshot as Project['dataSnapshot'],
    notesSq: strOrNull(r.notes),
    analysisDate: toIso(r.analysis_date),
    createdAt: toIso(r.created_at),
    updatedAt: toIso(r.updated_at),
  };
}

/** Plan completion by task weight; skipped tasks leave the denominator. Not a success probability. */
export function progressFromWeights(doneWeight: number, totalWeight: number): number {
  if (!(totalWeight > 0)) return 0;
  return Math.round((Math.min(doneWeight, totalWeight) / totalWeight) * 100);
}

function mapSummary(r: Row): ProjectSummary {
  return {
    id: str(r.id),
    title: str(r.title),
    archetypeId: str(r.archetype_id),
    countryCode: str(r.country_code),
    city: strOrNull(r.city),
    progressPct: progressFromWeights(toNumberOrNull(r.done_weight) ?? 0, toNumberOrNull(r.total_weight) ?? 0),
    analysisDate: toIso(r.analysis_date),
    updatedAt: toIso(r.updated_at),
    isDemo: Boolean(r.is_demo),
  };
}

const TASK_COLUMNS = 'id, phase_id, title, description, day_offset, duration_days, weight, status, proof, completed_at, notes';

function mapTask(r: Row): PlanTask {
  return {
    id: str(r.id),
    phaseId: str(r.phase_id) as PlanTask['phaseId'],
    titleSq: str(r.title),
    descriptionSq: str(r.description),
    dayOffset: toNumberOrNull(r.day_offset) ?? 0,
    durationDays: toNumberOrNull(r.duration_days) ?? 0,
    weight: toNumberOrNull(r.weight) ?? 0,
    status: str(r.status) as TaskStatus,
    proofSq: str(r.proof),
    completedAt: toIsoOrNull(r.completed_at),
    notesSq: strOrNull(r.notes),
  };
}

const EVIDENCE_COLUMNS = 'id, project_id, type, summary, quantity, amount, source, collected_at, created_at';

function mapEvidence(r: Row): EvidenceEntry {
  return {
    id: str(r.id),
    projectId: str(r.project_id),
    type: str(r.type) as EvidenceEntry['type'],
    summarySq: str(r.summary),
    quantity: toNumberOrNull(r.quantity),
    amount: toNumberOrNull(r.amount),
    sourceSq: str(r.source),
    collectedAt: toDateOrNull(r.collected_at) ?? '',
    createdAt: toIso(r.created_at),
  };
}

const OBSERVATION_COLUMNS =
  'source_id, indicator_code, country_code, period, value, unit, currency, is_projection, is_demo, obs_status, source_url, source_last_updated, retrieved_at';

function mapObservation(r: Row): Observation {
  return {
    sourceId: str(r.source_id),
    indicatorCode: str(r.indicator_code),
    countryCode: str(r.country_code),
    period: str(r.period),
    value: toNumberOrNull(r.value),
    unit: str(r.unit) as Observation['unit'],
    currency: strOrNull(r.currency),
    isProjection: Boolean(r.is_projection),
    isDemo: Boolean(r.is_demo),
    obsStatus: strOrNull(r.obs_status),
    sourceUrl: str(r.source_url),
    sourceLastUpdated: toDateOrNull(r.source_last_updated),
    retrievedAt: toIso(r.retrieved_at),
  };
}

const FETCH_LOG_COLUMNS = 'id, source_id, scope, started_at, finished_at, status, http_status, row_count, message';

function mapFetchLog(r: Row): FetchLogEntry {
  const entry: FetchLogEntry = {
    id: str(r.id),
    sourceId: str(r.source_id),
    scope: str(r.scope),
    startedAt: toIso(r.started_at),
    finishedAt: toIsoOrNull(r.finished_at),
    status: str(r.status) as FetchLogEntry['status'],
    httpStatus: toNumberOrNull(r.http_status),
    messageSq: strOrNull(r.message),
  };
  const rows = toNumberOrNull(r.row_count);
  if (rows !== null) entry.rows = rows;
  return entry;
}

function mapFx(r: Row): FxRate {
  return {
    base: str(r.base),
    quote: str(r.quote),
    rate: toNumberOrNull(r.rate) ?? 0,
    rateDate: toDateOrNull(r.rate_date) ?? '',
    sourceId: str(r.source_id),
    kind: str(r.kind) as FxRate['kind'],
    retrievedAt: toIso(r.retrieved_at),
  };
}

// ─── Namespaces ─────────────────────────────────────────────────────────────

function usersApi(db: Db): Store['users'] {
  const USER_COLUMNS = 'id, email, password_hash, is_guest, created_at';
  return {
    async createGuest() {
      const { rows } = await db.query(`INSERT INTO users (is_guest) VALUES (true) RETURNING ${USER_COLUMNS}`);
      return mapUser(rows[0]);
    },
    async create(email, passwordHash) {
      try {
        const { rows } = await db.query(
          `INSERT INTO users (email, password_hash, is_guest) VALUES ($1, $2, false) RETURNING ${USER_COLUMNS}`,
          [normalizeEmail(email), passwordHash],
        );
        return mapUser(rows[0]);
      } catch (err) {
        if (isUniqueViolation(err)) throw new EmailTakenError();
        throw err;
      }
    },
    async findByEmail(email) {
      const { rows } = await db.query(`SELECT ${USER_COLUMNS} FROM users WHERE email = $1`, [normalizeEmail(email)]);
      return rows[0] ? mapUser(rows[0]) : null;
    },
    async findById(id) {
      if (!isUuid(id)) return null;
      const { rows } = await db.query(`SELECT ${USER_COLUMNS} FROM users WHERE id = $1`, [id]);
      return rows[0] ? mapUser(rows[0]) : null;
    },
    async upgradeGuest(id, email, passwordHash) {
      if (!isUuid(id)) return null;
      try {
        const { rows } = await db.query(
          `UPDATE users SET email = $2, password_hash = $3, is_guest = false
           WHERE id = $1 AND is_guest = true RETURNING ${USER_COLUMNS}`,
          [id, normalizeEmail(email), passwordHash],
        );
        return rows[0] ? mapUser(rows[0]) : null;
      } catch (err) {
        if (isUniqueViolation(err)) throw new EmailTakenError();
        throw err;
      }
    },
    async delete(id) {
      if (!isUuid(id)) return false;
      const { rows } = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
      return rows.length > 0;
    },
  };
}

function sessionsApi(db: Db): Store['sessions'] {
  const COLUMNS = 'id, user_id, token_hash, expires_at, created_at';
  return {
    async create(userId, tokenHash, expiresAt) {
      const { rows } = await db.query(
        `INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3::timestamptz) RETURNING ${COLUMNS}`,
        [userId, tokenHash, expiresAt],
      );
      return mapSession(rows[0]);
    },
    async findByTokenHash(tokenHash) {
      const { rows } = await db.query(`SELECT ${COLUMNS} FROM sessions WHERE token_hash = $1`, [tokenHash]);
      return rows[0] ? mapSession(rows[0]) : null;
    },
    async delete(id) {
      if (!isUuid(id)) return;
      await db.query('DELETE FROM sessions WHERE id = $1', [id]);
    },
    async deleteForUser(userId) {
      if (!isUuid(userId)) return;
      await db.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
    },
    async deleteExpired(now) {
      const { rows } = await db.query('DELETE FROM sessions WHERE expires_at <= $1::timestamptz RETURNING id', [now]);
      return rows.length;
    },
  };
}

function profilesApi(db: Db): Store['profiles'] {
  const toProfile = (r: Row): UserProfile => ({ ...(r.data as UserProfile), updatedAt: toIso(r.updated_at) });
  return {
    async get(userId) {
      if (!isUuid(userId)) return null;
      const { rows } = await db.query('SELECT data, updated_at FROM profiles WHERE user_id = $1', [userId]);
      return rows[0] ? toProfile(rows[0]) : null;
    },
    async upsert(userId, profile) {
      // updatedAt is owned by the database column, not by the stored document.
      const data = { ...profile };
      delete data.updatedAt;
      const { rows } = await db.query(
        `INSERT INTO profiles (user_id, data, updated_at) VALUES ($1, $2::jsonb, now())
         ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
         RETURNING data, updated_at`,
        [userId, json(data)],
      );
      return toProfile(rows[0]);
    },
  };
}

const TASK_INSERT_CASTS = ['::uuid', '', '', '', '', '::int', '::int', '::float8', '', '', '::timestamptz', '', '::int'];

async function insertTasks(tx: Db, projectId: string, tasks: PlanTask[]): Promise<void> {
  const perStatement = Math.floor(MAX_PARAMS_PER_STATEMENT / TASK_INSERT_CASTS.length);
  const indexed = tasks.map((task, sort) => ({ task, sort }));
  for (const batch of chunk(indexed, perStatement)) {
    const params = batch.flatMap(({ task, sort }) => [
      projectId,
      task.id,
      task.phaseId,
      task.titleSq,
      task.descriptionSq ?? '',
      // Offsets are whole days; rounding keeps a fractional value from a generator bug from failing the save.
      Math.round(task.dayOffset),
      Math.round(task.durationDays),
      task.weight,
      task.status,
      task.proofSq ?? '',
      task.completedAt ?? null,
      task.notesSq ?? null,
      sort,
    ]);
    await tx.query(
      `INSERT INTO tasks (project_id, id, phase_id, title, description, day_offset, duration_days, weight, status, proof, completed_at, notes, sort)
       VALUES ${valuesClause(batch.length, TASK_INSERT_CASTS)}`,
      params,
    );
  }
}

async function ownsProject(db: Db, userId: string, projectId: string, lock = false): Promise<boolean> {
  if (!isUuid(userId) || !isUuid(projectId)) return false;
  const { rows } = await db.query(`SELECT 1 FROM projects WHERE id = $1 AND user_id = $2${lock ? ' FOR UPDATE' : ''}`, [
    projectId,
    userId,
  ]);
  return rows.length > 0;
}

async function touchProject(db: Db, userId: string, projectId: string): Promise<void> {
  await db.query('UPDATE projects SET updated_at = now() WHERE id = $1 AND user_id = $2', [projectId, userId]);
}

/** Whitelisted patch fields → column + SQL cast + value serializer. */
const PROJECT_PATCH_COLUMNS: { [K in keyof Required<ProjectPatch>]: { column: string; cast: string; toParam: (v: ProjectPatch[K]) => unknown } } = {
  title: { column: 'title', cast: '', toParam: (v) => v },
  city: { column: 'city', cast: '', toParam: (v) => v ?? null },
  registrationCountry: { column: 'registration_country', cast: '', toParam: (v) => v ?? null },
  customerCountries: { column: 'customer_countries', cast: '::jsonb', toParam: (v) => json(v ?? []) },
  financialInputs: { column: 'financial_inputs', cast: '::jsonb', toParam: (v) => json(v) },
  scoreWeights: { column: 'score_weights', cast: '::jsonb', toParam: (v) => json(v) },
  notesSq: { column: 'notes', cast: '', toParam: (v) => v ?? null },
  dataSnapshot: { column: 'data_snapshot', cast: '::jsonb', toParam: (v) => json(v) },
  analysisDate: { column: 'analysis_date', cast: '::timestamptz', toParam: (v) => v },
};

function projectsApi(db: Db): Store['projects'] {
  return {
    async list(userId) {
      if (!isUuid(userId)) return [];
      const { rows } = await db.query(
        `SELECT p.id, p.title, p.archetype_id, p.country_code, p.city, p.analysis_date, p.updated_at, p.created_at,
                (p.data_snapshot -> 'isDemo') = 'true'::jsonb AS is_demo,
                COALESCE(SUM(t.weight) FILTER (WHERE t.status = 'perfunduar'), 0) AS done_weight,
                COALESCE(SUM(t.weight) FILTER (WHERE t.status <> 'anashkaluar'), 0) AS total_weight
         FROM projects p
         LEFT JOIN tasks t ON t.project_id = p.id
         WHERE p.user_id = $1
         GROUP BY p.id
         ORDER BY p.updated_at DESC, p.created_at DESC`,
        [userId],
      );
      return rows.map(mapSummary);
    },
    async get(userId, projectId) {
      if (!isUuid(userId) || !isUuid(projectId)) return null;
      const { rows } = await db.query(`SELECT ${PROJECT_COLUMNS} FROM projects WHERE id = $1 AND user_id = $2`, [projectId, userId]);
      return rows[0] ? mapProject(rows[0]) : null;
    },
    async create(userId, input: NewProjectInput) {
      return db.transaction(async (tx) => {
        const { rows } = await tx.query(
          `INSERT INTO projects (user_id, title, archetype_id, country_code, city, registration_country, customer_countries,
                                 financial_inputs, score_weights, data_snapshot, notes, analysis_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9::jsonb, $10::jsonb, $11, $12::timestamptz)
           RETURNING ${PROJECT_COLUMNS}`,
          [
            userId,
            input.title,
            input.archetypeId,
            input.countryCode,
            input.city ?? null,
            input.registrationCountry ?? null,
            json(input.customerCountries ?? []),
            json(input.financialInputs),
            json(input.scoreWeights),
            json(input.dataSnapshot),
            input.notesSq ?? null,
            input.analysisDate,
          ],
        );
        const project = mapProject(rows[0]);
        await insertTasks(tx, project.id, input.tasks ?? []);
        return project;
      });
    },
    async update(userId, projectId, patch) {
      if (!isUuid(userId) || !isUuid(projectId)) return null;
      const sets: string[] = [];
      const params: unknown[] = [projectId, userId];
      for (const key of Object.keys(PROJECT_PATCH_COLUMNS) as (keyof ProjectPatch)[]) {
        if (!(key in patch) || patch[key] === undefined) continue;
        const spec = PROJECT_PATCH_COLUMNS[key] as { column: string; cast: string; toParam: (v: unknown) => unknown };
        params.push(spec.toParam(patch[key]));
        sets.push(`${spec.column} = $${params.length}${spec.cast}`);
      }
      sets.push('updated_at = now()');
      const { rows } = await db.query(
        `UPDATE projects SET ${sets.join(', ')} WHERE id = $1 AND user_id = $2 RETURNING ${PROJECT_COLUMNS}`,
        params,
      );
      return rows[0] ? mapProject(rows[0]) : null;
    },
    async delete(userId, projectId) {
      if (!isUuid(userId) || !isUuid(projectId)) return false;
      const { rows } = await db.query('DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id', [projectId, userId]);
      return rows.length > 0;
    },
  };
}

function tasksApi(db: Db): Store['tasks'] {
  return {
    async list(userId, projectId) {
      if (!(await ownsProject(db, userId, projectId))) return null;
      const { rows } = await db.query(
        `SELECT ${TASK_COLUMNS.split(', ')
          .map((c) => `t.${c}`)
          .join(', ')}
         FROM tasks t JOIN projects p ON p.id = t.project_id
         WHERE t.project_id = $1 AND p.user_id = $2
         ORDER BY t.sort, t.day_offset, t.id`,
        [projectId, userId],
      );
      return rows.map(mapTask);
    },
    async replaceAll(userId, projectId, tasks) {
      return db.transaction(async (tx) => {
        if (!(await ownsProject(tx, userId, projectId, true))) return false;
        await tx.query('DELETE FROM tasks WHERE project_id = $1', [projectId]);
        await insertTasks(tx, projectId, tasks);
        await touchProject(tx, userId, projectId);
        return true;
      });
    },
    async update(userId, projectId, taskId, patch) {
      if (!isUuid(userId) || !isUuid(projectId) || typeof taskId !== 'string') return null;
      return db.transaction(async (tx) => {
        const hasNotes = Object.prototype.hasOwnProperty.call(patch, 'notesSq') && patch.notesSq !== undefined;
        // completed_at is set on the first transition to "perfunduar" and cleared when un-done.
        const { rows } = await tx.query(
          `UPDATE tasks t SET
             status = COALESCE($4::text, t.status),
             completed_at = CASE
               WHEN $4::text IS NULL THEN t.completed_at
               WHEN $4::text = 'perfunduar' THEN COALESCE(t.completed_at, now())
               ELSE NULL END,
             notes = CASE WHEN $6::boolean THEN $5::text ELSE t.notes END
           FROM projects p
           WHERE p.id = t.project_id AND p.user_id = $1 AND t.project_id = $2 AND t.id = $3
           RETURNING ${TASK_COLUMNS.split(', ')
             .map((c) => `t.${c}`)
             .join(', ')}`,
          [userId, projectId, taskId, patch.status ?? null, hasNotes ? patch.notesSq : null, hasNotes],
        );
        if (!rows[0]) return null;
        if (patch.status !== undefined || hasNotes) await touchProject(tx, userId, projectId);
        return mapTask(rows[0]);
      });
    },
  };
}

function evidenceApi(db: Db): Store['evidence'] {
  return {
    async list(userId, projectId) {
      if (!(await ownsProject(db, userId, projectId))) return null;
      const { rows } = await db.query(
        `SELECT ${EVIDENCE_COLUMNS.split(', ')
          .map((c) => `e.${c}`)
          .join(', ')}
         FROM evidence e JOIN projects p ON p.id = e.project_id
         WHERE e.project_id = $1 AND p.user_id = $2
         ORDER BY e.collected_at DESC, e.created_at DESC`,
        [projectId, userId],
      );
      return rows.map(mapEvidence);
    },
    async add(userId, projectId, entry) {
      if (!isUuid(userId) || !isUuid(projectId)) return null;
      return db.transaction(async (tx) => {
        const { rows } = await tx.query(
          `INSERT INTO evidence (project_id, type, summary, quantity, amount, source, collected_at)
           SELECT p.id, $3, $4, $5::float8, $6::float8, $7, $8::date FROM projects p WHERE p.id = $2 AND p.user_id = $1
           RETURNING ${EVIDENCE_COLUMNS}`,
          [userId, projectId, entry.type, entry.summarySq, entry.quantity ?? null, entry.amount ?? null, entry.sourceSq ?? '', entry.collectedAt],
        );
        if (!rows[0]) return null;
        await touchProject(tx, userId, projectId);
        return mapEvidence(rows[0]);
      });
    },
    async delete(userId, projectId, evidenceId) {
      if (!isUuid(userId) || !isUuid(projectId) || !isUuid(evidenceId)) return false;
      const { rows } = await db.query(
        `DELETE FROM evidence e USING projects p
         WHERE e.project_id = p.id AND p.user_id = $1 AND e.project_id = $2 AND e.id = $3
         RETURNING e.id`,
        [userId, projectId, evidenceId],
      );
      return rows.length > 0;
    },
  };
}

function chatApi(db: Db): Store['chat'] {
  return {
    async list(userId, projectId, limit = DEFAULT_CHAT_LIMIT) {
      if (!isUuid(userId)) return [];
      if (projectId !== null && !isUuid(projectId)) return [];
      const n = Math.max(1, Math.min(MAX_CHAT_LIMIT, Math.floor(limit) || DEFAULT_CHAT_LIMIT));
      // The join on projects re-checks ownership even though append already did.
      const { rows } = await db.query(
        `SELECT role, content FROM (
           SELECT m.id, m.role, m.content FROM chat_messages m
           LEFT JOIN projects p ON p.id = m.project_id
           WHERE m.user_id = $1
             AND m.project_id IS NOT DISTINCT FROM $2::uuid
             AND (m.project_id IS NULL OR p.user_id = $1)
           ORDER BY m.id DESC LIMIT $3
         ) recent ORDER BY id ASC`,
        [userId, projectId, n],
      );
      return rows.map((r): AssistantMessage => ({ role: str(r.role) as AssistantMessage['role'], content: str(r.content) }));
    },
    async append(userId, projectId, messages) {
      if (!isUuid(userId) || messages.length === 0) return;
      // Appending to a foreign project is silently ignored, exactly like a missing project.
      if (projectId !== null && !(await ownsProject(db, userId, projectId))) return;
      const casts = ['::uuid', '::uuid', '', ''];
      for (const batch of chunk(messages, Math.floor(MAX_PARAMS_PER_STATEMENT / casts.length))) {
        await db.query(
          `INSERT INTO chat_messages (user_id, project_id, role, content) VALUES ${valuesClause(batch.length, casts)}`,
          batch.flatMap((m) => [userId, projectId, m.role, m.content]),
        );
      }
    },
  };
}

function rateLimitApi(db: Db): Store['rateLimit'] {
  return {
    async hit(key, windowMs, now) {
      if (!(windowMs > 0) || windowMs > MAX_RATE_LIMIT_WINDOW_MS) {
        throw new Error('rateLimit window must be between 1 ms and 24 h');
      }
      const windowStart = new Date(Math.floor(now.getTime() / windowMs) * windowMs).toISOString();
      const { rows } = await db.query<{ count: number }>(
        `INSERT INTO rate_limits (key, window_start, count) VALUES ($1, $2::timestamptz, 1)
         ON CONFLICT (key, window_start) DO UPDATE SET count = rate_limits.count + 1
         RETURNING count`,
        [key, windowStart],
      );
      // Housekeeping: old windows of this key, and anything older than the retention period.
      await db.query('DELETE FROM rate_limits WHERE (key = $1 AND window_start < $2::timestamptz) OR window_start < $3::timestamptz', [
        key,
        windowStart,
        new Date(now.getTime() - RATE_LIMIT_RETENTION_MS).toISOString(),
      ]);
      return Number(rows[0]?.count ?? 0);
    },
  };
}

const OBSERVATION_CASTS = ['', '', '', '', '::float8', '', '', '::boolean', '::boolean', '', '', '::date', '::timestamptz'];
const FX_CASTS = ['', '', '::float8', '::date', '', '', '::timestamptz'];

function dataApi(db: Db): Store['data'] {
  return {
    async upsertObservations(observations) {
      const unique = dedupeBy(observations, (o) => [o.sourceId, o.indicatorCode, o.countryCode, o.period].join('\u0000'));
      const perStatement = Math.floor(MAX_PARAMS_PER_STATEMENT / OBSERVATION_CASTS.length);
      for (const batch of chunk(unique, perStatement)) {
        await db.query(
          `INSERT INTO observations (${OBSERVATION_COLUMNS}) VALUES ${valuesClause(batch.length, OBSERVATION_CASTS)}
           ON CONFLICT (source_id, indicator_code, country_code, period) DO UPDATE SET
             value = EXCLUDED.value, unit = EXCLUDED.unit, currency = EXCLUDED.currency,
             is_projection = EXCLUDED.is_projection, is_demo = EXCLUDED.is_demo, obs_status = EXCLUDED.obs_status,
             source_url = EXCLUDED.source_url, source_last_updated = EXCLUDED.source_last_updated,
             retrieved_at = EXCLUDED.retrieved_at`,
          batch.flatMap((o) => [
            o.sourceId,
            o.indicatorCode,
            o.countryCode,
            o.period,
            o.value ?? null,
            o.unit,
            o.currency ?? null,
            o.isProjection,
            o.isDemo,
            o.obsStatus ?? null,
            o.sourceUrl,
            o.sourceLastUpdated ?? null,
            o.retrievedAt,
          ]),
        );
      }
      return unique.length;
    },
    async getObservations(query: ObservationQuery) {
      const { rows } = await db.query(
        `SELECT ${OBSERVATION_COLUMNS} FROM observations
         WHERE ($1::text[] IS NULL OR country_code = ANY($1::text[]))
           AND ($2::text[] IS NULL OR indicator_code = ANY($2::text[]))
           AND ($3::text[] IS NULL OR source_id = ANY($3::text[]))
           AND ($4::boolean OR NOT is_demo)
         ORDER BY country_code, indicator_code, source_id, period`,
        [query.countryCodes ?? null, query.indicatorCodes ?? null, query.sourceIds ?? null, query.includeDemo === true],
      );
      return rows.map(mapObservation);
    },
    async addFetchLog(entry) {
      // Re-using an id updates the entry, so a refresh job can log "started" and later "finished".
      await db.query(
        `INSERT INTO fetch_log (id, source_id, scope, started_at, finished_at, status, http_status, row_count, message)
         VALUES (COALESCE($1::uuid, gen_random_uuid()), $2, $3, $4::timestamptz, $5::timestamptz, $6, $7::int, $8::int, $9)
         ON CONFLICT (id) DO UPDATE SET
           finished_at = EXCLUDED.finished_at, status = EXCLUDED.status, http_status = EXCLUDED.http_status,
           row_count = EXCLUDED.row_count, message = EXCLUDED.message`,
        [
          isUuid(entry.id) ? entry.id : null,
          entry.sourceId,
          entry.scope,
          entry.startedAt,
          entry.finishedAt ?? null,
          entry.status,
          entry.httpStatus ?? null,
          entry.rows ?? null,
          entry.messageSq ?? null,
        ],
      );
    },
    async getRecentFetchLogs(limit = DEFAULT_FETCH_LOG_LIMIT) {
      const n = Math.max(1, Math.min(1000, Math.floor(limit) || DEFAULT_FETCH_LOG_LIMIT));
      const { rows } = await db.query(`SELECT ${FETCH_LOG_COLUMNS} FROM fetch_log ORDER BY started_at DESC, id LIMIT $1`, [n]);
      return rows.map(mapFetchLog);
    },
    async getLatestFetchLogs() {
      const { rows } = await db.query(
        `SELECT DISTINCT ON (source_id, scope) ${FETCH_LOG_COLUMNS} FROM fetch_log
         ORDER BY source_id, scope, started_at DESC, finished_at DESC NULLS LAST`,
      );
      return rows.map(mapFetchLog);
    },
    async upsertFxRates(rates) {
      const unique = dedupeBy(rates, (r) => [r.base, r.quote, r.sourceId, r.rateDate].join('\u0000'));
      for (const batch of chunk(unique, Math.floor(MAX_PARAMS_PER_STATEMENT / FX_CASTS.length))) {
        await db.query(
          `INSERT INTO fx_rates (base, quote, rate, rate_date, source_id, kind, retrieved_at) VALUES ${valuesClause(batch.length, FX_CASTS)}
           ON CONFLICT (base, quote, source_id, rate_date) DO UPDATE SET
             rate = EXCLUDED.rate, kind = EXCLUDED.kind, retrieved_at = EXCLUDED.retrieved_at`,
          batch.flatMap((r) => [r.base, r.quote, r.rate, r.rateDate, r.sourceId, r.kind, r.retrievedAt]),
        );
      }
      return unique.length;
    },
    async getFxRates() {
      const { rows } = await db.query(
        `SELECT DISTINCT ON (base, quote, source_id) base, quote, rate, rate_date, source_id, kind, retrieved_at
         FROM fx_rates ORDER BY base, quote, source_id, rate_date DESC, retrieved_at DESC`,
      );
      return rows.map(mapFx);
    },
    async upsertCountryMeta(rows: { code: CountryCode; wb: NonNullable<Country['wb']> }[]) {
      const unique = dedupeBy(rows, (r) => r.code);
      const casts = ['', '::jsonb'];
      for (const batch of chunk(unique, Math.floor(MAX_PARAMS_PER_STATEMENT / casts.length))) {
        await db.query(
          `INSERT INTO country_meta (code, wb) VALUES ${valuesClause(batch.length, casts)}
           ON CONFLICT (code) DO UPDATE SET wb = EXCLUDED.wb, updated_at = now()`,
          batch.flatMap((r) => [r.code, json(r.wb)]),
        );
      }
      return unique.length;
    },
    async getCountryMeta() {
      const { rows } = await db.query('SELECT code, wb FROM country_meta ORDER BY code');
      const out: Record<CountryCode, NonNullable<Country['wb']>> = {};
      for (const r of rows) out[str(r.code)] = r.wb as NonNullable<Country['wb']>;
      return out;
    },
  };
}

export function createSqlStore(db: Db): Store {
  return {
    kind: db.kind,
    users: usersApi(db),
    sessions: sessionsApi(db),
    profiles: profilesApi(db),
    projects: projectsApi(db),
    tasks: tasksApi(db),
    evidence: evidenceApi(db),
    chat: chatApi(db),
    rateLimit: rateLimitApi(db),
    data: dataApi(db),
  };
}
