import { createHash } from 'node:crypto';
import { loginSchema } from '@/lib/validation/schemas';
import { normalizeEmail, verifyCredentials } from '@/lib/server/auth';
import { startSession } from '@/lib/server/session';
import { handleRoute, jsonError, jsonOk, parseJsonBody } from '@/lib/server/http';
import { checkRateLimits, guardPublic } from '../../_shared';

export const POST = handleRoute(async (request: Request) => {
  const g = await guardPublic(request, { limit: 'auth' });
  if (!g.ok) return g.response;
  const body = await parseJsonBody(request, loginSchema);
  if (!body.ok) return body.response;
  const email = normalizeEmail(body.data.email);
  // A second limit per target email stops password guessing spread across many IPs.
  const emailKey = createHash('sha256').update(email).digest('hex').slice(0, 32);
  const limited = await checkRateLimits(g.store, [['loginEmail', emailKey]]);
  if (limited) return limited;
  // verifyCredentials hashes a dummy password for unknown emails, so timing does not reveal accounts.
  const user = await verifyCredentials(g.store, email, body.data.password);
  if (!user) return jsonError(401, 'invalid_credentials', 'Email ose fjalëkalim i pasaktë.');
  // startSession also deletes the session the browser had before (e.g. a guest session).
  await startSession(user.id, new Date());
  return jsonOk({ user: { id: user.id, email: user.email, isGuest: false } });
});
