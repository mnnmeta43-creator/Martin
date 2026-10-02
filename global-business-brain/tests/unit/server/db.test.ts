/**
 * Database layer: migrations, transactions, type parsing, target selection and the getDb singleton.
 */
import { mkdtempSync, rmSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  closeDb,
  ConfigError,
  createPgliteDb,
  getDb,
  getLastMigrationResult,
  MISSING_DATABASE_MESSAGE_SQ,
  resolveDbTarget,
  runMigrations,
  type Db,
} from '@/lib/server/db';
import { resetEnvCache } from '@/lib/server/env';
import { createMemoryDb, MIGRATIONS_DIR } from './helpers';

let db: Db;

beforeAll(async () => {
  db = await createMemoryDb();
});

afterAll(async () => {
  await db?.close();
});

describe('runMigrations', () => {
  it('is idempotent: a second run applies nothing', async () => {
    const again = await runMigrations(db, { dir: MIGRATIONS_DIR });
    expect(again.applied).toEqual([]);
    expect(again.alreadyApplied).toContain('001_init.sql');
    const { rows } = await db.query<{ n: number }>('SELECT count(*)::int AS n FROM schema_migrations');
    expect(rows[0].n).toBe(again.alreadyApplied.length);
  });

  it('creates every table of the schema', async () => {
    const { rows } = await db.query<{ table_name: string }>(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() ORDER BY table_name",
    );
    const names = rows.map((r) => r.table_name);
    for (const table of ['users', 'sessions', 'profiles', 'projects', 'tasks', 'evidence', 'chat_messages', 'observations', 'fetch_log', 'fx_rates', 'country_meta', 'rate_limits', 'schema_migrations']) {
      expect(names).toContain(table);
    }
  });

  it('applies new files in order and rolls back everything when one fails', async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'gbb-mig-'));
    try {
      const fresh = await createPgliteDb();
      copyFileSync(path.join(MIGRATIONS_DIR, '001_init.sql'), path.join(dir, '001_init.sql'));
      writeFileSync(path.join(dir, '002_extra.sql'), 'CREATE TABLE extra_a (id int); CREATE TABLE extra_b (id int);');
      writeFileSync(path.join(dir, 'README.md'), 'ignored');
      const first = await runMigrations(fresh, { dir });
      expect(first.applied).toEqual(['001_init.sql', '002_extra.sql']);

      writeFileSync(path.join(dir, '003_broken.sql'), 'CREATE TABLE extra_c (id int); SELECT * FROM no_such_table;');
      await expect(runMigrations(fresh, { dir })).rejects.toThrow();
      const { rows } = await fresh.query("SELECT to_regclass('extra_c') AS t");
      expect(rows[0].t).toBeNull();
      await fresh.close();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('Db', () => {
  it('returns DATE as YYYY-MM-DD, timestamptz as Date and double precision as number', async () => {
    const { rows } = await db.query<{ d: unknown; ts: unknown; n: unknown }>(
      "SELECT DATE '2026-03-31' AS d, TIMESTAMPTZ '2026-03-31T23:30:00Z' AS ts, 1.5::float8 AS n",
    );
    expect(rows[0].d).toBe('2026-03-31');
    expect(rows[0].ts).toBeInstanceOf(Date);
    expect((rows[0].ts as Date).toISOString()).toBe('2026-03-31T23:30:00.000Z');
    expect(rows[0].n).toBe(1.5);
  });

  it('rolls back a failed transaction and supports nested savepoints', async () => {
    await db.exec('CREATE TABLE tx_probe (v int)');
    await expect(
      db.transaction(async (tx) => {
        await tx.query('INSERT INTO tx_probe VALUES (1)');
        throw new Error('dështim i qëllimshëm');
      }),
    ).rejects.toThrow('dështim i qëllimshëm');
    expect((await db.query('SELECT * FROM tx_probe')).rows).toEqual([]);

    await db.transaction(async (tx) => {
      await tx.query('INSERT INTO tx_probe VALUES (2)');
      await expect(
        tx.transaction(async (inner) => {
          await inner.query('INSERT INTO tx_probe VALUES (3)');
          throw new Error('brendshëm');
        }),
      ).rejects.toThrow('brendshëm');
      await tx.transaction(async (inner) => {
        await inner.query('INSERT INTO tx_probe VALUES (4)');
      });
    });
    expect((await db.query<{ v: number }>('SELECT v FROM tx_probe ORDER BY v')).rows.map((r) => r.v)).toEqual([2, 4]);
  });

  it('creates the PGlite data directory when missing', async () => {
    const parent = mkdtempSync(path.join(os.tmpdir(), 'gbb-pglite-'));
    const dir = path.join(parent, 'nested', 'data');
    try {
      const fileDb = await createPgliteDb(dir);
      expect(existsSync(dir)).toBe(true);
      expect((await fileDb.query<{ one: number }>('SELECT 1 AS one')).rows[0].one).toBe(1);
      await fileDb.close();
    } finally {
      rmSync(parent, { recursive: true, force: true });
    }
  });
});

describe('resolveDbTarget', () => {
  const base = { PGLITE_DATA_DIR: '.data/pglite', ALLOW_EMBEDDED_DB: undefined, DATABASE_URL: undefined } as const;

  it('prefers DATABASE_URL', () => {
    expect(resolveDbTarget({ ...base, NODE_ENV: 'production', DATABASE_URL: 'postgres://h/db' })).toEqual({ kind: 'postgres', url: 'postgres://h/db' });
  });

  it('uses PGlite outside production or when explicitly allowed', () => {
    expect(resolveDbTarget({ ...base, NODE_ENV: 'development' })).toEqual({ kind: 'pglite', dataDir: '.data/pglite' });
    expect(resolveDbTarget({ ...base, NODE_ENV: 'test' }).kind).toBe('pglite');
    expect(resolveDbTarget({ ...base, NODE_ENV: 'production', ALLOW_EMBEDDED_DB: 'true' }).kind).toBe('pglite');
  });

  it('throws an Albanian ConfigError in production without DATABASE_URL', () => {
    let error: unknown;
    try {
      resolveDbTarget({ ...base, NODE_ENV: 'production' });
    } catch (err) {
      error = err;
    }
    expect(error).toBeInstanceOf(ConfigError);
    expect((error as ConfigError).status).toBe(503);
    expect((error as ConfigError).messageSq).toBe(MISSING_DATABASE_MESSAGE_SQ);
    expect(MISSING_DATABASE_MESSAGE_SQ).toContain('DATABASE_URL mungon');
    expect(MISSING_DATABASE_MESSAGE_SQ).toContain('llogaritë');
  });
});

describe('getDb singleton', () => {
  afterEach(async () => {
    await closeDb();
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('opens one migrated embedded database and reuses it', async () => {
    vi.stubEnv('DATABASE_URL', '');
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('PGLITE_DATA_DIR', 'memory://');
    resetEnvCache();
    const first = await getDb();
    const second = await getDb();
    expect(first).toBe(second);
    expect(first.kind).toBe('pglite');
    expect(getLastMigrationResult()?.applied).toContain('001_init.sql');
    const { rows } = await first.query<{ n: number }>('SELECT count(*)::int AS n FROM users');
    expect(rows[0].n).toBe(0);
  });

  it('rejects with ConfigError in production without DATABASE_URL and does not cache the failure', async () => {
    vi.stubEnv('DATABASE_URL', '');
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('ALLOW_EMBEDDED_DB', '');
    resetEnvCache();
    await expect(getDb()).rejects.toBeInstanceOf(ConfigError);

    vi.stubEnv('ALLOW_EMBEDDED_DB', 'true');
    vi.stubEnv('PGLITE_DATA_DIR', 'memory://');
    resetEnvCache();
    expect((await getDb()).kind).toBe('pglite');
  });
});
