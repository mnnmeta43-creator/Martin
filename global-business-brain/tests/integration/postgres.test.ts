/**
 * Store contract + migrations against a real PostgreSQL server.
 *
 * Runs only when TEST_DATABASE_URL is set (skipped otherwise), e.g.
 *   TEST_DATABASE_URL=postgres://postgres@127.0.0.1:54329/gbb_test npx vitest run tests/integration
 * Every run works in its own throwaway schema (dropped afterwards), so it never touches the
 * tables of the database it connects to.
 */
import { randomBytes } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createPgDb, runMigrations, type Db } from '@/lib/server/db';
import { createSqlStore } from '@/lib/server/store/sqlStore';
import type { Store } from '@/lib/server/store/types';
import { MIGRATIONS_DIR } from '../unit/server/helpers';
import { defineStoreContractSuite } from '../unit/server/storeSuite';

const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)('PostgreSQL (TEST_DATABASE_URL)', () => {
  const schema = `gbb_it_${randomBytes(6).toString('hex')}`;
  let admin: Db;
  let ctx: { db: Db; store: Store };

  beforeAll(async () => {
    admin = createPgDb(url as string, { max: 2 });
    await admin.query(`CREATE SCHEMA ${schema}`);
    const db = createPgDb(url as string, { schema, max: 5 });
    const first = await runMigrations(db, { dir: MIGRATIONS_DIR });
    expect(first.applied).toContain('001_init.sql');
    ctx = { db, store: createSqlStore(db) };
  });

  afterAll(async () => {
    await ctx?.db.close();
    if (admin) {
      await admin.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
      await admin.close();
    }
  });

  describe('database layer', () => {
    it('reports kind postgres and parses DATE, timestamptz and double precision', async () => {
      expect(ctx.db.kind).toBe('postgres');
      expect(ctx.store.kind).toBe('postgres');
      const { rows } = await ctx.db.query<{ d: unknown; ts: unknown; n: unknown }>(
        "SELECT DATE '2026-03-31' AS d, TIMESTAMPTZ '2026-03-31T23:30:00Z' AS ts, 1.5::float8 AS n",
      );
      expect(rows[0].d).toBe('2026-03-31');
      expect((rows[0].ts as Date).toISOString()).toBe('2026-03-31T23:30:00.000Z');
      expect(rows[0].n).toBe(1.5);
    });

    it('works inside the throwaway schema only', async () => {
      const { rows } = await ctx.db.query<{ s: string }>('SELECT current_schema() AS s');
      expect(rows[0].s).toBe(schema);
    });

    it('migrations are idempotent', async () => {
      const again = await runMigrations(ctx.db, { dir: MIGRATIONS_DIR });
      expect(again.applied).toEqual([]);
      expect(again.alreadyApplied).toContain('001_init.sql');
    });

    it('serialises concurrent migration runs with the advisory lock', async () => {
      const fresh = `${schema}_c`;
      await admin.query(`CREATE SCHEMA ${fresh}`);
      const a = createPgDb(url as string, { schema: fresh, max: 1 });
      const b = createPgDb(url as string, { schema: fresh, max: 1 });
      try {
        const [ra, rb] = await Promise.all([runMigrations(a, { dir: MIGRATIONS_DIR }), runMigrations(b, { dir: MIGRATIONS_DIR })]);
        expect([...ra.applied, ...rb.applied]).toEqual(['001_init.sql']);
        expect([...ra.alreadyApplied, ...rb.alreadyApplied]).toEqual(['001_init.sql']);
      } finally {
        await a.close();
        await b.close();
        await admin.query(`DROP SCHEMA IF EXISTS ${fresh} CASCADE`);
      }
    });

    it('rolls back a failed transaction on a checked-out client', async () => {
      await ctx.db.query('CREATE TABLE tx_probe (v int)');
      await expect(
        ctx.db.transaction(async (tx) => {
          await tx.query('INSERT INTO tx_probe VALUES (1)');
          await tx.transaction(async (inner) => inner.query('INSERT INTO tx_probe VALUES (2)'));
          throw new Error('dështim i qëllimshëm');
        }),
      ).rejects.toThrow('dështim i qëllimshëm');
      expect((await ctx.db.query('SELECT * FROM tx_probe')).rows).toEqual([]);
    });
  });

  defineStoreContractSuite('PostgreSQL', () => ctx);
});
