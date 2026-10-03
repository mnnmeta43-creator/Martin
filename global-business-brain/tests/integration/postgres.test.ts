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
import { purgeOldGuests } from '@/lib/server/maintenance';
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

  // Own schema: the purge deletes every old guest, which would remove other suites' users.
  describe('guest purge and chat retention', () => {
    const own = `${schema}_m`;
    let db: Db;
    let store: Store;

    beforeAll(async () => {
      await admin.query(`CREATE SCHEMA ${own}`);
      db = createPgDb(url as string, { schema: own, max: 2 });
      await runMigrations(db, { dir: MIGRATIONS_DIR });
      store = createSqlStore(db);
    });

    afterAll(async () => {
      await db?.close();
      await admin.query(`DROP SCHEMA IF EXISTS ${own} CASCADE`);
    });

    it('removes old guests without a live session (with their projects), keeps active guests and members', async () => {
      const now = new Date('2026-12-01T00:00:00Z');
      const oldGuest = await store.users.createGuest();
      const activeGuest = await store.users.createGuest();
      const member = await store.users.create('member@example.invalid', 'scrypt$x');
      await db.query("UPDATE users SET created_at = '2026-09-01T00:00:00Z'");
      await store.sessions.create(activeGuest.id, 'a'.repeat(64), '2027-01-01T00:00:00Z');
      await store.chat.append(oldGuest.id, null, [{ role: 'user', content: 'pyetje' }]);
      expect(await purgeOldGuests(store, now)).toBe(1);
      expect(await store.users.findById(oldGuest.id)).toBeNull();
      expect((await db.query('SELECT 1 FROM chat_messages WHERE user_id = $1', [oldGuest.id])).rows).toEqual([]);
      expect(await store.users.findById(activeGuest.id)).not.toBeNull();
      expect(await store.users.findById(member.id)).not.toBeNull();
    });

    it('prune keeps only the newest messages of one conversation and never touches other users', async () => {
      const a = await store.users.createGuest();
      const b = await store.users.createGuest();
      const msgs = Array.from({ length: 7 }, (_, i) => ({ role: 'user' as const, content: `m${i}` }));
      await store.chat.append(a.id, null, msgs);
      await store.chat.append(b.id, null, msgs);
      expect(await store.chat.prune(a.id, null, 3)).toBe(4);
      expect((await store.chat.list(a.id, null, 50)).map((m) => m.content)).toEqual(['m4', 'm5', 'm6']);
      expect(await store.chat.list(b.id, null, 50)).toHaveLength(7);
    });
  });

  defineStoreContractSuite('PostgreSQL', () => ctx);
});
