import { registerSchema } from '@/lib/validation/schemas';
import { createSession, hashPassword } from '@/lib/server/auth';
import { getCurrentUser, setSessionCookie } from '@/lib/server/session';
import { handleRoute, jsonError, jsonOk, parseJsonBody } from '@/lib/server/http';
import { guardPublic } from '../../_shared';

/** Registers with email + password. A signed-in guest is upgraded in place, keeping its data. */
export const POST = handleRoute(async (request: Request) => {
  const g = await guardPublic(request, { limit: 'auth' });
  if (!g.ok) return g.response;
  const body = await parseJsonBody(request, registerSchema);
  if (!body.ok) return body.response;
  const email = body.data.email.trim().toLowerCase();
  if (await g.store.users.findByEmail(email)) {
    return jsonError(409, 'email_taken', 'Ky email është i regjistruar. Hyni me fjalëkalimin tuaj.');
  }
  const passwordHash = await hashPassword(body.data.password);
  const current = await getCurrentUser();
  const user =
    current && current.isGuest ? await g.store.users.upgradeGuest(current.id, email, passwordHash) : await g.store.users.create(email, passwordHash);
  if (!user) return jsonError(500, 'register_failed', 'Regjistrimi dështoi. Provoni sërish.');
  await g.store.sessions.deleteForUser(user.id);
  const { token, expiresAt } = await createSession(g.store, user.id, new Date());
  await setSessionCookie(token, expiresAt);
  return jsonOk({ user: { id: user.id, email: user.email, isGuest: false } }, { status: 201 });
});
