import { evidenceInputSchema } from '@/lib/validation/schemas';
import { handleRoute, jsonError, jsonOk, parseJsonBody } from '@/lib/server/http';
import { guard, notFound, QUOTAS } from '../../../_shared';

type Ctx = { params: Promise<{ id: string }> };

export const GET = handleRoute(async (request: Request, ctx: Ctx) => {
  const g = await guard(request, { limit: 'write' });
  if (!g.ok) return g.response;
  const { id } = await ctx.params;
  const list = await g.store.evidence.list(g.user.id, id);
  if (!list) return notFound('Projekti nuk u gjet.');
  return jsonOk({ evidence: list });
});

export const POST = handleRoute(async (request: Request, ctx: Ctx) => {
  const g = await guard(request, { limit: 'write' });
  if (!g.ok) return g.response;
  const { id } = await ctx.params;
  const body = await parseJsonBody(request, evidenceInputSchema);
  if (!body.ok) return body.response;
  const existing = await g.store.evidence.list(g.user.id, id);
  if (!existing) return notFound('Projekti nuk u gjet.');
  if (existing.length >= QUOTAS.evidencePerProject) {
    return jsonError(409, 'quota', `Ky projekt ka arritur kufirin prej ${QUOTAS.evidencePerProject} provash.`);
  }
  const entry = await g.store.evidence.add(g.user.id, id, body.data);
  if (!entry) return notFound('Projekti nuk u gjet.');
  return jsonOk({ evidence: entry }, { status: 201 });
});
