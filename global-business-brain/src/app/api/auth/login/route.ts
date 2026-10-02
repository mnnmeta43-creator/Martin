import { loginSchema } from '@/lib/validation/schemas';
import { createSession, verifyPassword } from '@/lib/server/auth';
import { setSessionCookie } from '@/lib/server/session';
import { handleRoute, jsonError, jsonOk, parseJsonBody } from '@/lib/server/http';
import { guardPublic } from '../../_shared';

export const POST = handleRoute(async (request: Request) => {
  const g = await guardPublic(request, { limit: 'auth' });
  if (!g.ok) return g.response;
  const body = await parseJsonBody(request, loginSchema);
  if (!body.ok) return body.response;
  const user = await g.store.users.findByEmail(body.data.email.trim().toLowerCase());
  // Same message for unknown email and wrong password, so accounts cannot be enumerated.
  if (!user || !user.passwordHash || !(await verifyPassword(body.data.password, user.passwordHash))) {
    return jsonError(401, 'invalid_credentials', 'Email ose fjalëkalim i pasaktë.');
  }
  const { token, expiresAt } = await createSession(g.store, user.id, new Date());
  await setSessionCookie(token, expiresAt);
  return jsonOk({ user: { id: user.id, email: user.email, isGuest: false } });
});
