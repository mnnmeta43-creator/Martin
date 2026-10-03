/**
 * Next.js session glue with a fake cookie jar: guest start, current user, expiry, cookie flags.
 * `next/headers` is mocked because cookies() only exists inside a Next.js request scope.
 */
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

interface CookieWrite {
  name: string;
  value: string;
  options: Record<string, unknown>;
}

const jar = vi.hoisted(() => {
  const values = new Map<string, string>();
  const writes: CookieWrite[] = [];
  return {
    values,
    writes,
    api: {
      get: (name: string) => (values.has(name) ? { name, value: values.get(name) as string } : undefined),
      set: (name: string, value: string, options: Record<string, unknown> = {}) => {
        writes.push({ name, value, options });
        if (options.maxAge === 0 || value === '') values.delete(name);
        else values.set(name, value);
      },
    },
  };
});

vi.mock('next/headers', () => ({ cookies: async () => jar.api }));

import { createSession, hashToken, SESSION_COOKIE } from '@/lib/server/auth';
import { closeDb } from '@/lib/server/db';
import { resetEnvCache } from '@/lib/server/env';
import {
  clearSessionCookie,
  ensureGuestUser,
  getCurrentUser,
  requireUser,
  setSessionCookie,
  signOut,
  startSession,
  UnauthorizedError,
} from '@/lib/server/session';
import { getStore } from '@/lib/server/store';

function useEmbeddedDb(nodeEnv: 'test' | 'production'): void {
  vi.stubEnv('DATABASE_URL', '');
  vi.stubEnv('NODE_ENV', nodeEnv);
  vi.stubEnv('ALLOW_EMBEDDED_DB', 'true');
  vi.stubEnv('PGLITE_DATA_DIR', 'memory://');
  resetEnvCache();
}

beforeEach(() => {
  jar.values.clear();
  jar.writes.length = 0;
  useEmbeddedDb('test');
});

afterAll(async () => {
  await closeDb();
  vi.unstubAllEnvs();
  resetEnvCache();
});

describe('ensureGuestUser', () => {
  it('creates a guest with a session cookie once, then reuses it', async () => {
    expect(await getCurrentUser()).toBeNull();
    const guest = await ensureGuestUser();
    expect(guest).toMatchObject({ isGuest: true, email: null });

    expect(jar.writes).toHaveLength(1);
    const [write] = jar.writes;
    expect(write.name).toBe(SESSION_COOKIE);
    expect(write.value).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(write.options).toMatchObject({ httpOnly: true, sameSite: 'lax', secure: false, path: '/' });
    expect(write.options.expires).toBeInstanceOf(Date);

    // The database keeps only the hash of the cookie token.
    const store = await getStore();
    const session = await store.sessions.findByTokenHash(hashToken(write.value));
    expect(session?.userId).toBe(guest.id);

    expect(await ensureGuestUser()).toEqual(guest);
    expect(jar.writes).toHaveLength(1);
    expect(await getCurrentUser()).toEqual(guest);
  });

  it('replaces an unknown or expired cookie with a fresh guest', async () => {
    jar.values.set(SESSION_COOKIE, 'token-qe-nuk-ekziston');
    const guest = await ensureGuestUser();
    expect(guest.isGuest).toBe(true);
    expect(jar.values.get(SESSION_COOKIE)).not.toBe('token-qe-nuk-ekziston');
  });
});

describe('getCurrentUser / requireUser', () => {
  it('requireUser throws UnauthorizedError (401) without a valid session', async () => {
    await expect(requireUser()).rejects.toBeInstanceOf(UnauthorizedError);
    await expect(requireUser()).rejects.toMatchObject({ status: 401 });
  });

  it('treats an expired session as signed out and deletes it', async () => {
    const store = await getStore();
    const user = await store.users.createGuest();
    const { token } = await createSession(store, user.id, new Date('2020-01-01T00:00:00.000Z'));
    jar.values.set(SESSION_COOKIE, token);
    expect(await getCurrentUser()).toBeNull();
    expect(await store.sessions.findByTokenHash(hashToken(token))).toBeNull();
  });

  it('returns the user of a valid session', async () => {
    const store = await getStore();
    const user = await store.users.create('sesion@example.invalid', 'scrypt$hash');
    const { token } = await createSession(store, user.id, new Date());
    jar.values.set(SESSION_COOKIE, token);
    expect(await requireUser()).toEqual(user);
  });
});

describe('startSession / signOut', () => {
  it('rotates the session on sign-in and removes it on sign-out', async () => {
    const guest = await ensureGuestUser();
    const oldToken = jar.values.get(SESSION_COOKIE) as string;
    const store = await getStore();

    await startSession(guest.id);
    const newToken = jar.values.get(SESSION_COOKIE) as string;
    expect(newToken).not.toBe(oldToken);
    expect(await store.sessions.findByTokenHash(hashToken(oldToken))).toBeNull();

    await signOut();
    expect(jar.values.has(SESSION_COOKIE)).toBe(false);
    expect(await store.sessions.findByTokenHash(hashToken(newToken))).toBeNull();
    expect(jar.writes.at(-1)?.options).toMatchObject({ maxAge: 0, httpOnly: true, path: '/' });
  });
});

describe('cookie flags', () => {
  it('marks cookies secure in production', async () => {
    useEmbeddedDb('production');
    await setSessionCookie('abc', '2026-11-01T00:00:00.000Z');
    await clearSessionCookie();
    expect(jar.writes.map((w) => w.options.secure)).toEqual([true, true]);
    expect((jar.writes[0].options.expires as Date).toISOString()).toBe('2026-11-01T00:00:00.000Z');
  });
});
