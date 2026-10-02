import { handleRoute, jsonOk } from '@/lib/server/http';
import { guard, notFound } from '../../../../_shared';

type Ctx = { params: Promise<{ id: string; evidenceId: string }> };

export const DELETE = handleRoute(async (request: Request, ctx: Ctx) => {
  const g = await guard(request, { limit: 'write' });
  if (!g.ok) return g.response;
  const { id, evidenceId } = await ctx.params;
  const ok = await g.store.evidence.delete(g.user.id, id, evidenceId);
  if (!ok) return notFound('Prova nuk u gjet.');
  return jsonOk({ ok: true });
});
