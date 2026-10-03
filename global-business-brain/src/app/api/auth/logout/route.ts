import { cookies } from 'next/headers';
import { hashToken, SESSION_COOKIE } from '@/lib/server/auth';
import { clearSessionCookie } from '@/lib/server/session';
import { assertSameOrigin, handleRoute, jsonOk } from '@/lib/server/http';
import { getStore } from '@/lib/server/store';

export const POST = handleRoute(async (request: Request) => {
  const bad = assertSameOrigin(request);
  if (bad) return bad;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token) {
    const store = await getStore();
    const session = await store.sessions.findByTokenHash(hashToken(token));
    if (session) await store.sessions.delete(session.id);
  }
  await clearSessionCookie();
  return jsonOk({ ok: true });
});
