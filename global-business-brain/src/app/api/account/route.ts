import { clearSessionCookie } from '@/lib/server/session';
import { handleRoute, jsonOk } from '@/lib/server/http';
import { logger } from '@/lib/server/logger';
import { guard } from '../_shared';

/** Permanently deletes the account and every user-owned record (cascade). */
export const DELETE = handleRoute(async (request: Request) => {
  const g = await guard(request, { limit: 'write' });
  if (!g.ok) return g.response;
  await g.store.users.delete(g.user.id);
  await clearSessionCookie();
  logger.info('account.deleted', { userId: g.user.id });
  return jsonOk({ ok: true });
});
