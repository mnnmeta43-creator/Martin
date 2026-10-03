/**
 * Kufizimi i shpeshtësisë së kërkesave (fixed-window rate limiting stored in the database).
 *
 * Windows are aligned to multiples of `windowMs` since the epoch, so every server instance agrees
 * on the current window without coordination. Keys are built by callers, e.g.
 * `auth:${clientKey(request)}` or `assistant:${user.id}`.
 * The client IP comes from headers the hosting platform sets (Netlify: x-nf-client-connection-ip).
 * The left-most x-forwarded-for entry is client-controlled and is never used.
 */
import type { Store } from '@/lib/server/store/types';
import { jsonError } from '@/lib/server/http';

export interface RateLimitRule {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

const MINUTE = 60_000;

export const RATE_LIMITS = {
  auth: { limit: 10, windowMs: 10 * MINUTE }, // per client IP (login, register)
  loginEmail: { limit: 10, windowMs: 60 * MINUTE }, // per target email (password guessing across IPs)
  guest: { limit: 20, windowMs: 10 * MINUTE }, // guest accounts per client IP
  assistant: { limit: 30, windowMs: 10 * MINUTE }, // per user
  assistantIp: { limit: 60, windowMs: 10 * MINUTE }, // per client IP, across guest accounts
  assistantGlobal: { limit: 3000, windowMs: 24 * 60 * MINUTE }, // whole site per day: caps AI spend
  export: { limit: 20, windowMs: 10 * MINUTE },
  write: { limit: 120, windowMs: 10 * MINUTE },
  refresh: { limit: 3, windowMs: 60 * MINUTE },
} as const satisfies Record<string, RateLimitRule>;

export type RateLimitBucket = keyof typeof RATE_LIMITS;

export function windowStartMs(now: Date, windowMs: number): number {
  return Math.floor(now.getTime() / windowMs) * windowMs;
}

export async function rateLimit(store: Store, key: string, rule: RateLimitRule, now: Date): Promise<RateLimitResult> {
  const count = await store.rateLimit.hit(key, rule.windowMs, now);
  const ok = count <= rule.limit;
  const windowEnd = windowStartMs(now, rule.windowMs) + rule.windowMs;
  return {
    ok,
    remaining: Math.max(0, rule.limit - count),
    retryAfterSec: ok ? 0 : Math.max(1, Math.ceil((windowEnd - now.getTime()) / 1000)),
  };
}

const MAX_KEY_PART = 64;

/**
 * Client IP for rate-limit keys. Platform headers first (Netlify sets x-nf-client-connection-ip,
 * which clients cannot override), then x-real-ip, then the RIGHT-most x-forwarded-for entry (the
 * one appended by the nearest proxy). The left-most entry is chosen by the client and is ignored.
 */
export function clientKey(request: Request): string {
  const platform = request.headers.get('x-nf-client-connection-ip')?.trim();
  const realIp = request.headers.get('x-real-ip')?.trim();
  const forwarded = request.headers
    .get('x-forwarded-for')
    ?.split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .pop();
  const ip = platform || realIp || forwarded || 'unknown';
  return ip.slice(0, MAX_KEY_PART);
}

/**
 * Applies a named rule and returns a ready 429 response (Albanian, with Retry-After) when the
 * limit is exceeded, or null when the request may proceed.
 */
export async function enforceRateLimit(store: Store, bucket: RateLimitBucket, key: string, now: Date): Promise<Response | null> {
  const result = await rateLimit(store, `${bucket}:${key}`, RATE_LIMITS[bucket], now);
  if (result.ok) return null;
  const minutes = Math.ceil(result.retryAfterSec / 60);
  return jsonError(
    429,
    'shume_kerkesa',
    `Shumë kërkesa në pak kohë. Provoni sërish pas rreth ${minutes} ${minutes === 1 ? 'minute' : 'minutash'}.`,
    { retryAfterSec: result.retryAfterSec },
    { headers: { 'Retry-After': String(result.retryAfterSec) } },
  );
}
