import { createSession } from '@/lib/server/auth';
import { getCurrentUser, setSessionCookie } from '@/lib/server/session';
import { handleRoute, jsonOk } from '@/lib/server/http';
import { guardPublic } from '../../_shared';

/** Starts a guest account (no email) so people can try the app before registering. */
export const POST = handleRoute(async (request: Request) => {
  const g = await guardPublic(request, { limit: 'auth' });
  if (!g.ok) return g.response;
  const existing = await getCurrentUser();
  if (existing) return jsonOk({ user: { id: existing.id, email: existing.email, isGuest: existing.isGuest } });
  const user = await g.store.users.createGuest();
  const { token, expiresAt } = await createSession(g.store, user.id, new Date());
  await setSessionCookie(token, expiresAt);
  return jsonOk({ user: { id: user.id, email: null, isGuest: true } }, { status: 201 });
});
