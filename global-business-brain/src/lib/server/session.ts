/**
 * Sesioni në Next.js: lexim/shkrim i cookie-t dhe përdoruesi aktual (Next.js session glue).
 *
 * Reading (`getCurrentUser`, `requireUser`) works in Server Components and Route Handlers.
 * Writing cookies (`setSessionCookie`, `clearSessionCookie`, `ensureGuestUser`, `signOut`) only
 * works in Route Handlers and Server Functions — Next.js cannot set cookies while rendering.
 */
import { cookies } from 'next/headers';
import { createSession, getUserForToken, hashToken, SESSION_COOKIE } from '@/lib/server/auth';
import { getEnv } from '@/lib/server/env';
import { UnauthorizedError } from '@/lib/server/errors';
import { getStore } from '@/lib/server/store';
import type { UserRecord } from '@/lib/server/store/types';

export { UnauthorizedError } from '@/lib/server/errors';

function isProduction(): boolean {
  try {
    return getEnv().NODE_ENV === 'production';
  } catch {
    // Invalid configuration: err on the safe side and keep cookies HTTPS-only.
    return true;
  }
}

async function readToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value ?? null;
}

export async function getCurrentUser(): Promise<UserRecord | null> {
  const token = await readToken();
  if (!token) return null;
  const store = await getStore();
  return getUserForToken(store, token, new Date());
}

export async function requireUser(): Promise<UserRecord> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

export async function setSessionCookie(token: string, expiresAt: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction(),
    path: '/',
    expires: new Date(expiresAt),
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction(),
    path: '/',
    maxAge: 0,
  });
}

/** Starts a fresh session for `userId` (call after login/registration to prevent session fixation). */
export async function startSession(userId: string, now: Date = new Date()): Promise<void> {
  const store = await getStore();
  const previous = await readToken();
  if (previous) {
    const old = await store.sessions.findByTokenHash(hashToken(previous));
    if (old) await store.sessions.delete(old.id);
  }
  const { token, expiresAt } = await createSession(store, userId, now);
  await setSessionCookie(token, expiresAt);
}

/** Deletes the current session server-side and clears the cookie. */
export async function signOut(): Promise<void> {
  const token = await readToken();
  if (token) {
    const store = await getStore();
    const session = await store.sessions.findByTokenHash(hashToken(token));
    if (session) await store.sessions.delete(session.id);
  }
  await clearSessionCookie();
}

/**
 * Returns the signed-in user, or creates a guest account + session so people can start the
 * profile flow without registering. A guest keeps its data when it later registers
 * (`store.users.upgradeGuest`).
 */
export async function ensureGuestUser(): Promise<UserRecord> {
  const existing = await getCurrentUser();
  if (existing) return existing;
  const store = await getStore();
  const guest = await store.users.createGuest();
  const { token, expiresAt } = await createSession(store, guest.id, new Date());
  await setSessionCookie(token, expiresAt);
  return guest;
}
