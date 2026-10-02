/**
 * Password hashing, token hashing and session lifecycle.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createSession,
  getUserForToken,
  hashPassword,
  hashToken,
  newSessionToken,
  normalizeEmail,
  SESSION_COOKIE,
  SESSION_TTL_DAYS,
  verifyCredentials,
  verifyPassword,
} from '@/lib/server/auth';
import type { Db } from '@/lib/server/db';
import type { Store } from '@/lib/server/store/types';
import { createMemoryStore } from './helpers';

describe('password hashing', () => {
  it('uses the documented scrypt format and verifies the right password', async () => {
    const stored = await hashPassword('fjalëkalim-i-gjatë-123');
    const parts = stored.split('$');
    expect(parts.slice(0, 4)).toEqual(['scrypt', '16384', '8', '1']);
    expect(Buffer.from(parts[4], 'base64')).toHaveLength(16);
    expect(Buffer.from(parts[5], 'base64')).toHaveLength(64);
    expect(await verifyPassword('fjalëkalim-i-gjatë-123', stored)).toBe(true);
  });

  it('uses a fresh salt every time', async () => {
    const a = await hashPassword('i-njëjti-fjalëkalim');
    const b = await hashPassword('i-njëjti-fjalëkalim');
    expect(a).not.toBe(b);
  });

  it('rejects wrong passwords, tampered hashes and garbage', async () => {
    const stored = await hashPassword('sakte-sakte-sakte');
    expect(await verifyPassword('gabim-gabim-gabim', stored)).toBe(false);

    const parts = stored.split('$');
    const key = Buffer.from(parts[5], 'base64');
    key[0] ^= 0xff;
    const tamperedKey = [...parts.slice(0, 5), key.toString('base64')].join('$');
    expect(await verifyPassword('sakte-sakte-sakte', tamperedKey)).toBe(false);

    const salt = Buffer.from(parts[4], 'base64');
    salt[0] ^= 0xff;
    const tamperedSalt = [...parts.slice(0, 4), salt.toString('base64'), parts[5]].join('$');
    expect(await verifyPassword('sakte-sakte-sakte', tamperedSalt)).toBe(false);

    const hugeN = ['scrypt', String(2 ** 24), ...parts.slice(2)].join('$');
    expect(await verifyPassword('sakte-sakte-sakte', hugeN)).toBe(false);
    expect(await verifyPassword('x', '')).toBe(false);
    expect(await verifyPassword('x', null)).toBe(false);
    expect(await verifyPassword('x', 'bcrypt$whatever')).toBe(false);
    expect(await verifyPassword('x', 'scrypt$16384$8$1$$')).toBe(false);
  });

  it('accepts composed and decomposed forms of the same Albanian characters', async () => {
    const composed = 'çelës-ëndërr-2026';
    const decomposed = composed.normalize('NFD');
    expect(decomposed).not.toBe(composed);
    expect(await verifyPassword(decomposed, await hashPassword(composed))).toBe(true);
  });
});

describe('tokens', () => {
  it('generates 32-byte base64url tokens and hashes them with sha256', () => {
    const token = newSessionToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(newSessionToken()).not.toBe(token);
    expect(hashToken('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(hashToken(token)).toMatch(/^[0-9a-f]{64}$/);
  });

  it('exposes the cookie name and TTL', () => {
    expect(SESSION_COOKIE).toBe('gbb_session');
    expect(SESSION_TTL_DAYS).toBe(30);
  });

  it('normalises emails', () => {
    expect(normalizeEmail('  Ana.Test@Example.INVALID ')).toBe('ana.test@example.invalid');
  });
});

describe('sessions', () => {
  let ctx: { db: Db; store: Store };

  beforeAll(async () => {
    ctx = await createMemoryStore();
  });

  afterAll(async () => {
    await ctx?.db.close();
  });

  it('creates a session that resolves to its user and stores only the token hash', async () => {
    const user = await ctx.store.users.createGuest();
    const now = new Date('2026-10-02T12:00:00.000Z');
    const { token, expiresAt } = await createSession(ctx.store, user.id, now);
    expect(expiresAt).toBe('2026-11-01T12:00:00.000Z');
    expect(await getUserForToken(ctx.store, token, now)).toEqual(user);
    const { rows } = await ctx.db.query<{ token_hash: string }>('SELECT token_hash FROM sessions WHERE user_id = $1', [user.id]);
    expect(rows).toEqual([{ token_hash: hashToken(token) }]);
    expect(rows[0].token_hash).not.toContain(token);
  });

  it('treats unknown, empty and oversized tokens as signed out', async () => {
    const now = new Date('2026-10-02T12:00:00.000Z');
    expect(await getUserForToken(ctx.store, newSessionToken(), now)).toBeNull();
    expect(await getUserForToken(ctx.store, '', now)).toBeNull();
    expect(await getUserForToken(ctx.store, null, now)).toBeNull();
    expect(await getUserForToken(ctx.store, 'x'.repeat(10_000), now)).toBeNull();
  });

  it('deletes an expired session on use', async () => {
    const user = await ctx.store.users.createGuest();
    const created = new Date('2026-01-01T00:00:00.000Z');
    const { token } = await createSession(ctx.store, user.id, created);
    const afterExpiry = new Date(created.getTime() + 30 * 24 * 3600 * 1000);
    expect(await getUserForToken(ctx.store, token, afterExpiry)).toBeNull();
    expect(await ctx.store.sessions.findByTokenHash(hashToken(token))).toBeNull();
  });

  it('removes other expired sessions whenever a new session is created', async () => {
    const stale = await ctx.store.users.createGuest();
    const { token: staleToken } = await createSession(ctx.store, stale.id, new Date('2025-01-01T00:00:00.000Z'));
    const fresh = await ctx.store.users.createGuest();
    const { token } = await createSession(ctx.store, fresh.id, new Date('2025-03-01T00:00:00.000Z'));
    expect(await ctx.store.sessions.findByTokenHash(hashToken(staleToken))).toBeNull();
    expect(await ctx.store.sessions.findByTokenHash(hashToken(token))).not.toBeNull();
  });

  it('verifies credentials only for registered accounts with the right password', async () => {
    const email = `kredenciale-${Date.now()}@example.invalid`;
    const user = await ctx.store.users.create(email, await hashPassword('fjalekalim-shume-i-forte'));
    expect(await verifyCredentials(ctx.store, email.toUpperCase(), 'fjalekalim-shume-i-forte')).toEqual(user);
    expect(await verifyCredentials(ctx.store, email, 'gabim-gabim-gabim')).toBeNull();
    expect(await verifyCredentials(ctx.store, 'askush@example.invalid', 'fjalekalim-shume-i-forte')).toBeNull();
  });
});
