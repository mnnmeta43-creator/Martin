/**
 * Ndihmës të përbashkët për rrugët e API-së (route-handler helpers).
 * Every mutating route: same-origin check → rate limits → auth → zod validation → user-scoped store call.
 *
 * Rate-limit keys: account-creation and login buckets are keyed by client IP only (a guest cookie
 * must not buy a fresh bucket); the assistant is limited per user AND per IP AND site-wide per day,
 * so creating many guest accounts cannot multiply AI spend.
 */
import { getStore } from '@/lib/server/store';
import { getCurrentUser } from '@/lib/server/session';
import { clientKey, rateLimit, RATE_LIMITS, type RateLimitBucket } from '@/lib/server/rateLimit';
import { assertSameOrigin, jsonError } from '@/lib/server/http';
import type { Store, UserRecord } from '@/lib/server/store/types';

type Fail = { ok: false; response: Response };
type Limit = 'auth' | 'guest' | 'assistant' | 'export' | 'write';

function limitKeys(limit: Limit, request: Request, user: UserRecord | null): [RateLimitBucket, string][] {
  const ip = clientKey(request);
  switch (limit) {
    case 'auth':
    case 'guest':
      return [[limit, `ip:${ip}`]];
    case 'assistant':
      return [
        ['assistant', `user:${user?.id ?? ip}`],
        ['assistantIp', `ip:${ip}`],
        ['assistantGlobal', 'all'],
      ];
    default:
      return [[limit, user ? `user:${user.id}` : `ip:${ip}`]];
  }
}

export async function checkRateLimits(store: Store, keys: [RateLimitBucket, string][]): Promise<Response | null> {
  const now = new Date();
  for (const [bucket, key] of keys) {
    const rl = await rateLimit(store, `${bucket}:${key}`, RATE_LIMITS[bucket], now);
    if (!rl.ok) {
      return jsonError(
        429,
        'rate_limited',
        bucket === 'assistantGlobal'
          ? 'Asistenti ka arritur kufirin ditor të përdorimit për këtë server. Provoni nesër; llogaritjet e kalkulatorit funksionojnë normalisht.'
          : `Shumë kërkesa. Provoni sërish pas ${rl.retryAfterSec} sekondash.`,
        { retryAfterSec: rl.retryAfterSec },
        { headers: { 'Retry-After': String(rl.retryAfterSec) } },
      );
    }
  }
  return null;
}

async function base(request: Request, limit: Limit): Promise<{ ok: true; store: Store; user: UserRecord | null } | Fail> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const bad = assertSameOrigin(request);
    if (bad) return { ok: false, response: bad };
  }
  const store = await getStore();
  const user = await getCurrentUser();
  const limited = await checkRateLimits(store, limitKeys(limit, request, user));
  if (limited) return { ok: false, response: limited };
  return { ok: true, store, user };
}

/** Origin check (writes), rate limits and a signed-in user (guest or registered). */
export async function guard(request: Request, opts: { limit: Limit }): Promise<{ ok: true; store: Store; user: UserRecord } | Fail> {
  const b = await base(request, opts.limit);
  if (!b.ok) return b;
  if (!b.user) return { ok: false, response: jsonError(401, 'unauthorized', 'Duhet të hyni ose të plotësoni profilin si vizitor.') };
  return { ok: true, store: b.store, user: b.user };
}

/** Same checks without requiring a session (login, register, guest creation). */
export async function guardPublic(request: Request, opts: { limit: Limit }) {
  return base(request, opts.limit);
}

export function notFound(messageSq = 'Nuk u gjet.') {
  return jsonError(404, 'not_found', messageSq);
}

/** Per-user storage quotas (protect the shared database from a single account). */
export const QUOTAS = {
  projectsPerUser: 50,
  evidencePerProject: 500,
  chatMessagesKept: 200,
} as const;
