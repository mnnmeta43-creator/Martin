import { evidenceInputSchema } from '@/lib/validation/schemas';
import { handleRoute, jsonOk, parseJsonBody } from '@/lib/server/http';
import { guard, notFound } from '../../../_shared';

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
  const entry = await g.store.evidence.add(g.user.id, id, body.data);
  if (!entry) return notFound('Projekti nuk u gjet.');
  return jsonOk({ evidence: entry }, { status: 201 });
});
