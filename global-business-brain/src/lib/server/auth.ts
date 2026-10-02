/**
 * Autentikimi: fjalëkalime me scrypt, tokena sesioni dhe verifikim (authentication helpers).
 *
 * - Passwords: node:crypto scrypt (N=16384, r=8, p=1, 16-byte salt, 64-byte key), stored as
 *   "scrypt$16384$8$1$<saltB64>$<hashB64>". Passwords are NFKC-normalised first so the same
 *   password typed with composed or decomposed "ë"/"ç" on different devices still matches.
 * - Sessions: the cookie holds 32 random bytes (base64url); the database holds only its sha256.
 * Functions here take `now` explicitly so expiry logic stays deterministic and testable.
 */
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual, type ScryptOptions } from 'node:crypto';
import type { Store, UserRecord } from '@/lib/server/store/types';

export const SESSION_COOKIE = 'gbb_session';
export const SESSION_TTL_DAYS = 30;

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SALT_BYTES = 16;
const KEY_BYTES = 64;
const MAX_TOKEN_LENGTH = 128;

function scrypt(password: string, salt: Buffer, keyLength: number, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, keyLength, options, (err, key) => (err ? reject(err) : resolve(key)));
  });
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizePassword(password: string): string {
  return password.normalize('NFKC');
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const key = await scrypt(normalizePassword(password), salt, KEY_BYTES, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P });
  return ['scrypt', SCRYPT_N, SCRYPT_R, SCRYPT_P, salt.toString('base64'), key.toString('base64')].join('$');
}

interface ParsedHash {
  N: number;
  r: number;
  p: number;
  salt: Buffer;
  key: Buffer;
}

/** Parses a stored hash; rejects parameters outside a safe range so a tampered row cannot DoS us. */
function parseHash(stored: string): ParsedHash | null {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return null;
  const [N, r, p] = parts.slice(1, 4).map((x) => (/^\d+$/.test(x) ? Number(x) : NaN));
  const isPowerOfTwo = (n: number) => Number.isInteger(n) && n > 1 && (n & (n - 1)) === 0;
  if (!isPowerOfTwo(N) || N < 2 ** 14 || N > 2 ** 17) return null;
  if (r !== 8 || !Number.isInteger(p) || p < 1 || p > 4) return null;
  const salt = Buffer.from(parts[4], 'base64');
  const key = Buffer.from(parts[5], 'base64');
  if (salt.length < SALT_BYTES || key.length < 32 || key.length > 128) return null;
  return { N, r, p, salt, key };
}

export async function verifyPassword(password: string, stored: string | null | undefined): Promise<boolean> {
  if (!stored) return false;
  const parsed = parseHash(stored);
  if (!parsed) return false;
  const candidate = await scrypt(normalizePassword(password), parsed.salt, parsed.key.length, {
    N: parsed.N,
    r: parsed.r,
    p: parsed.p,
    maxmem: 256 * parsed.N * parsed.r,
  });
  return candidate.length === parsed.key.length && timingSafeEqual(candidate, parsed.key);
}

// Verified against when the email is unknown, so "no such user" and "wrong password" take the same time.
let dummyHash: Promise<string> | null = null;

/** Email + password check. Returns the user only for a registered (non-guest) account with a matching password. */
export async function verifyCredentials(store: Store, email: string, password: string): Promise<UserRecord | null> {
  const user = await store.users.findByEmail(normalizeEmail(email));
  if (!user || user.isGuest || !user.passwordHash) {
    dummyHash ??= hashPassword('gbb-dummy-password-for-timing');
    await verifyPassword(password, await dummyHash);
    return null;
  }
  return (await verifyPassword(password, user.passwordHash)) ? user : null;
}

export function newSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

export function sessionExpiry(now: Date): Date {
  return new Date(now.getTime() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
}

export async function createSession(store: Store, userId: string, now: Date): Promise<{ token: string; expiresAt: string }> {
  const token = newSessionToken();
  const expiresAt = sessionExpiry(now).toISOString();
  await store.sessions.create(userId, hashToken(token), expiresAt);
  // Housekeeping at the natural write point (sign-in, registration, every new guest), so expired
  // sessions never pile up even when no scheduler is configured. Uses the expires_at index.
  await store.sessions.deleteExpired(now.toISOString());
  return { token, expiresAt };
}

/** Resolves a cookie token to its user. Expired sessions are deleted and treated as signed out. */
export async function getUserForToken(store: Store, token: string | null | undefined, now: Date): Promise<UserRecord | null> {
  if (!token || token.length > MAX_TOKEN_LENGTH) return null;
  const session = await store.sessions.findByTokenHash(hashToken(token));
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() <= now.getTime()) {
    await store.sessions.delete(session.id);
    return null;
  }
  return store.users.findById(session.userId);
}
