import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createPgliteDb, runMigrations, type Db } from '@/lib/server/db';
import { createSqlStore } from '@/lib/server/store/sqlStore';
import type { Store } from '@/lib/server/store/types';
import { purgeOldGuests } from '@/lib/server/maintenance';

let db: Db;
let store: Store;

beforeAll(async () => {
  db = await createPgliteDb();
  await runMigrations(db);
  store = createSqlStore(db);
});
afterAll(async () => {
  await db.close();
});

describe('guest purge and chat retention', () => {
  it('removes old guests without a live session, keeps active guests and registered users', async () => {
    const now = new Date('2026-12-01T00:00:00Z');
    const oldGuest = await store.users.createGuest();
    const activeGuest = await store.users.createGuest();
    const member = await store.users.create('member@example.test', 'scrypt$x');
    await db.query("UPDATE users SET created_at = '2026-09-01T00:00:00Z'");
    await store.sessions.create(activeGuest.id, 'a'.repeat(64), '2027-01-01T00:00:00Z');
    expect(await purgeOldGuests(store, now)).toBe(1);
    expect(await store.users.findById(oldGuest.id)).toBeNull();
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
