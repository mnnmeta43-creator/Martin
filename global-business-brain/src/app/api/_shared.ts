/**
 * Ndihmës të përbashkët për rrugët e API-së (route-handler helpers).
 * Every mutating route: same-origin check → rate limit → auth → zod validation → user-scoped store call.
 */
import { getStore } from '@/lib/server/store';
import { getCurrentUser } from '@/lib/server/session';
import { clientKey, rateLimit, RATE_LIMITS } from '@/lib/server/rateLimit';
import { assertSameOrigin, jsonError } from '@/lib/server/http';
import type { Store, UserRecord } from '@/lib/server/store/types';

type LimitName = keyof typeof RATE_LIMITS;
type Fail = { ok: false; response: Response };

async function base(request: Request, limit: LimitName): Promise<{ ok: true; store: Store; user: UserRecord | null } | Fail> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const bad = assertSameOrigin(request);
    if (bad) return { ok: false, response: bad };
  }
  const store = await getStore();
  const user = await getCurrentUser();
  const key = `${String(limit)}:${user?.id ?? clientKey(request)}`;
  const rl = await rateLimit(store, key, RATE_LIMITS[limit], new Date());
  if (!rl.ok) {
    return {
      ok: false,
      response: jsonError(429, 'rate_limited', `Shumë kërkesa. Provoni sërish pas ${rl.retryAfterSec} sekondash.`, { retryAfterSec: rl.retryAfterSec }),
    };
  }
  return { ok: true, store, user };
}

/** Origin check (writes), rate limit and a signed-in user (guest or registered). */
export async function guard(request: Request, opts: { limit: LimitName }): Promise<{ ok: true; store: Store; user: UserRecord } | Fail> {
  const b = await base(request, opts.limit);
  if (!b.ok) return b;
  if (!b.user) return { ok: false, response: jsonError(401, 'unauthorized', 'Duhet të hyni ose të plotësoni profilin si vizitor.') };
  return { ok: true, store: b.store, user: b.user };
}

/** Same checks without requiring a session (login, register, guest creation). */
export async function guardPublic(request: Request, opts: { limit: LimitName }) {
  return base(request, opts.limit);
}

export function notFound(messageSq = 'Nuk u gjet.') {
  return jsonError(404, 'not_found', messageSq);
}
