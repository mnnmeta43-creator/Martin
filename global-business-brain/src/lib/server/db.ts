/**
 * Shtresa e databazës: PostgreSQL në prodhim, PGlite në zhvillim/teste (database layer).
 *
 * - `Db` is the minimal interface the SQL store needs: parametrized queries, multi-statement
 *   scripts (`exec`, migrations only), transactions (nested calls become savepoints) and close.
 * - DATE columns come back as 'YYYY-MM-DD' strings in both drivers (no local-timezone shifts);
 *   timestamptz comes back as JS Date. NUMERIC would come back as a string, so the schema uses
 *   double precision for every numeric column.
 * - `getDb()` is a process-wide singleton (kept on globalThis so Next.js dev reloads do not open a
 *   second PGlite on the same directory) and applies pending migrations on first use.
 * - Migrations are read from `<process.cwd()>/db/migrations`: Next.js, the scripts and Vitest all
 *   run with the app root as the working directory.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { getEnv, type AppEnv } from '@/lib/server/env';
import { ConfigError } from '@/lib/server/errors';
import { logger } from '@/lib/server/logger';

export { ConfigError } from '@/lib/server/errors';

export type DbKind = 'postgres' | 'pglite';

export interface Db {
  readonly kind: DbKind;
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
  /** Runs a multi-statement SQL script without parameters (used for migrations). */
  exec(sql: string): Promise<void>;
  transaction<T>(fn: (tx: Db) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

const DATE_OID = 1082;
const MIGRATION_LOCK_KEY = 74_283_100_01;
const MIGRATION_FILE = /^\d{3,}_[a-z0-9_]+\.sql$/;

interface Queryable {
  query(sql: string, params?: unknown[]): Promise<{ rows: unknown[] }>;
}

/** A Db bound to an open transaction; nested transactions use savepoints. */
function transactionDb(kind: DbKind, conn: Queryable, runScript: (sql: string) => Promise<void>, depth = 0): Db {
  const self: Db = {
    kind,
    async query<T>(sql: string, params?: unknown[]) {
      const res = await conn.query(sql, params);
      return { rows: res.rows as T[] };
    },
    exec: runScript,
    async transaction<T>(fn: (tx: Db) => Promise<T>): Promise<T> {
      const name = `sp_${depth + 1}`;
      await conn.query(`SAVEPOINT ${name}`);
      try {
        const result = await fn(transactionDb(kind, conn, runScript, depth + 1));
        await conn.query(`RELEASE SAVEPOINT ${name}`);
        return result;
      } catch (err) {
        await conn.query(`ROLLBACK TO SAVEPOINT ${name}`);
        throw err;
      }
    },
    async close() {
      // The owning Db closes the connection; closing from inside a transaction is a no-op.
    },
  };
  return self;
}

export interface PgDbOptions {
  /** Schema to use via search_path (tests isolate runs in a throwaway schema). */
  schema?: string;
  max?: number;
}

export function createPgDb(url: string, options: PgDbOptions = {}): Db {
  if (options.schema !== undefined && !/^[a-z_][a-z0-9_]{0,62}$/.test(options.schema)) {
    throw new Error('Invalid schema name');
  }
  const types: pg.CustomTypesConfig = {
    getTypeParser: ((oid: number, format?: 'text' | 'binary') =>
      oid === DATE_OID ? (value: string) => value : pg.types.getTypeParser(oid, format)) as pg.CustomTypesConfig['getTypeParser'],
  };
  const pool = new pg.Pool({
    connectionString: url,
    max: options.max ?? 10,
    types,
    options: options.schema ? `-c search_path=${options.schema}` : undefined,
  });
  // An idle client can error (e.g. server restart); without a listener this would crash the process.
  pool.on('error', (err) => logger.error('db.pool_error', { error: err }));

  return {
    kind: 'postgres',
    async query<T>(sql: string, params?: unknown[]) {
      const res = await pool.query(sql, params);
      return { rows: res.rows as T[] };
    },
    async exec(sql: string) {
      await pool.query(sql);
    },
    async transaction<T>(fn: (tx: Db) => Promise<T>): Promise<T> {
      const client = await pool.connect();
      let broken = false;
      try {
        await client.query('BEGIN');
        const runScript = async (sql: string) => {
          await client.query(sql);
        };
        const result = await fn(transactionDb('postgres', client, runScript));
        await client.query('COMMIT');
        return result;
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {
          broken = true;
        });
        throw err;
      } finally {
        client.release(broken);
      }
    },
    async close() {
      await pool.end();
    },
  };
}

/** "memory://" (with or without a name) means an in-memory database, never a folder on disk. */
export function isInMemoryPgliteDir(dataDir: string | undefined): boolean {
  return dataDir === undefined || dataDir.trim() === '' || dataDir.trim().startsWith('memory://');
}

/**
 * Embedded Postgres (WASM). `dataDir` undefined or "memory://" → in-memory (lost on restart);
 * any other value is a filesystem path relative to the app root, created when missing.
 */
export async function createPgliteDb(dataDir?: string): Promise<Db> {
  const { PGlite } = await import('@electric-sql/pglite');
  const parsers = { [DATE_OID]: (value: string) => value };
  let instance: InstanceType<typeof PGlite>;
  if (dataDir === undefined || isInMemoryPgliteDir(dataDir)) {
    instance = new PGlite({ parsers });
  } else {
    const absolute = path.resolve(process.cwd(), dataDir.trim());
    mkdirSync(absolute, { recursive: true });
    instance = new PGlite(absolute, { parsers });
  }
  await instance.waitReady;

  return {
    kind: 'pglite',
    async query<T>(sql: string, params?: unknown[]) {
      const res = await instance.query<T>(sql, params as unknown[] | undefined);
      return { rows: res.rows };
    },
    async exec(sql: string) {
      await instance.exec(sql);
    },
    transaction<T>(fn: (tx: Db) => Promise<T>): Promise<T> {
      return instance.transaction(async (tx) => {
        const runScript = async (sql: string) => {
          await tx.exec(sql);
        };
        return fn(transactionDb('pglite', tx, runScript));
      });
    },
    async close() {
      if (!instance.closed) await instance.close();
    },
  };
}

export interface MigrationResult {
  applied: string[];
  alreadyApplied: string[];
}

export function defaultMigrationsDir(): string {
  return path.join(process.cwd(), 'db', 'migrations');
}

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

/**
 * Applies db/migrations/*.sql in file-name order, once each, inside a single transaction.
 * On Postgres an advisory transaction lock serialises concurrent starters (several server
 * instances booting at once). Re-running is a no-op.
 */
export async function runMigrations(db: Db, options: { dir?: string } = {}): Promise<MigrationResult> {
  const dir = options.dir ?? defaultMigrationsDir();
  const files = readdirSync(dir)
    .filter((f) => MIGRATION_FILE.test(f))
    .sort();
  return db.transaction(async (tx) => {
    if (tx.kind === 'postgres') await tx.query('SELECT pg_advisory_xact_lock($1)', [MIGRATION_LOCK_KEY]);
    await tx.exec(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
         id text PRIMARY KEY,
         checksum text NOT NULL,
         applied_at timestamptz NOT NULL DEFAULT now()
       )`,
    );
    const { rows } = await tx.query<{ id: string; checksum: string }>('SELECT id, checksum FROM schema_migrations');
    const done = new Map(rows.map((r) => [r.id, r.checksum]));
    const result: MigrationResult = { applied: [], alreadyApplied: [] };
    for (const file of files) {
      const sql = readFileSync(path.join(dir, file), 'utf8');
      const checksum = sha256(sql);
      const previous = done.get(file);
      if (previous !== undefined) {
        // Editing an applied migration has no effect; surface it instead of silently diverging.
        if (previous !== checksum) logger.warn('db.migration_changed_after_apply', { migration: file });
        result.alreadyApplied.push(file);
        continue;
      }
      await tx.exec(sql);
      await tx.query('INSERT INTO schema_migrations (id, checksum) VALUES ($1, $2)', [file, checksum]);
      result.applied.push(file);
    }
    return result;
  });
}

export type DbTarget = { kind: 'postgres'; url: string } | { kind: 'pglite'; dataDir: string };

export const MISSING_DATABASE_MESSAGE_SQ =
  'DATABASE_URL mungon. Në prodhim aplikacioni ka nevojë për një databazë PostgreSQL. Pa të nuk funksionojnë: llogaritë, profilet, projektet, plani 0–100, provat nga klientët, historia e bisedës dhe ruajtja e të dhënave makroekonomike. Vendosni DATABASE_URL në variablat e mjedisit të serverit (ose ALLOW_EMBEDDED_DB=true vetëm për demonstrim).';

/** Decides which database to open; pure so the production rule is testable. */
export function resolveDbTarget(env: Pick<AppEnv, 'DATABASE_URL' | 'NODE_ENV' | 'ALLOW_EMBEDDED_DB' | 'PGLITE_DATA_DIR'>): DbTarget {
  if (env.DATABASE_URL) return { kind: 'postgres', url: env.DATABASE_URL };
  if (env.NODE_ENV !== 'production' || env.ALLOW_EMBEDDED_DB === 'true') {
    return { kind: 'pglite', dataDir: env.PGLITE_DATA_DIR };
  }
  throw new ConfigError(MISSING_DATABASE_MESSAGE_SQ, { missing: ['DATABASE_URL'] });
}

interface DbHolder {
  promise: Promise<Db> | null;
  lastMigration: MigrationResult | null;
}

const HOLDER_KEY = Symbol.for('global-business-brain.db');

function holder(): DbHolder {
  const g = globalThis as typeof globalThis & { [HOLDER_KEY]?: DbHolder };
  g[HOLDER_KEY] ??= { promise: null, lastMigration: null };
  return g[HOLDER_KEY];
}

async function openConfiguredDb(): Promise<Db> {
  const target = resolveDbTarget(getEnv());
  const db = target.kind === 'postgres' ? createPgDb(target.url) : await createPgliteDb(target.dataDir);
  try {
    const result = await runMigrations(db);
    holder().lastMigration = result;
    if (result.applied.length > 0) logger.info('db.migrations_applied', { kind: db.kind, applied: result.applied });
  } catch (err) {
    await db.close().catch(() => undefined);
    throw err;
  }
  return db;
}

export function getDb(): Promise<Db> {
  const h = holder();
  if (!h.promise) {
    // A failed start (DB unreachable, config missing) is not cached, so the next request retries.
    h.promise = openConfiguredDb().catch((err) => {
      h.promise = null;
      throw err;
    });
  }
  return h.promise;
}

/** What the singleton's automatic migration run did (null before the first successful getDb()). */
export function getLastMigrationResult(): MigrationResult | null {
  return holder().lastMigration;
}

/** Closes the singleton (scripts call this before exiting). */
export async function closeDb(): Promise<void> {
  const h = holder();
  const pending = h.promise;
  h.promise = null;
  if (pending) {
    const db = await pending.catch(() => null);
    await db?.close();
  }
}
