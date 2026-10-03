import { z } from 'zod';
import { manualFxSchema, updateProjectSchema } from '@/lib/validation/schemas';
import { handleRoute, jsonOk, parseJsonBody } from '@/lib/server/http';
import type { FxRate } from '@/lib/domain/types';
import { guard, notFound } from '../../_shared';

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = updateProjectSchema.extend({ manualFxRates: z.array(manualFxSchema).max(10).optional() });

export const GET = handleRoute(async (request: Request, ctx: Ctx) => {
  const g = await guard(request, { limit: 'write' });
  if (!g.ok) return g.response;
  const { id } = await ctx.params;
  const project = await g.store.projects.get(g.user.id, id);
  if (!project) return notFound('Projekti nuk u gjet.');
  const tasks = (await g.store.tasks.list(g.user.id, id)) ?? [];
  return jsonOk({ project, tasks });
});

export const PATCH = handleRoute(async (request: Request, ctx: Ctx) => {
  const g = await guard(request, { limit: 'write' });
  if (!g.ok) return g.response;
  const { id } = await ctx.params;
  const body = await parseJsonBody(request, patchSchema, { maxBytes: 128 * 1024 });
  if (!body.ok) return body.response;
  const current = await g.store.projects.get(g.user.id, id);
  if (!current) return notFound('Projekti nuk u gjet.');
  const { manualFxRates, ...patch } = body.data;
  let dataSnapshot = current.dataSnapshot;
  if (manualFxRates && manualFxRates.length > 0) {
    // A manual rate is the user's own value: stored with its date and labelled "manuale", never as a sourced rate.
    const now = new Date().toISOString();
    const manual: FxRate[] = manualFxRates.map((r) => ({ ...r, sourceId: 'manual', kind: 'manuale', retrievedAt: now }));
    const keep = dataSnapshot.fxRates.filter((r) => !manual.some((m) => m.base === r.base && m.quote === r.quote && r.kind === 'manuale'));
    dataSnapshot = { ...dataSnapshot, fxRates: [...keep, ...manual] };
  }
  const updated = await g.store.projects.update(g.user.id, id, { ...patch, ...(manualFxRates?.length ? { dataSnapshot } : {}) });
  if (!updated) return notFound('Projekti nuk u gjet.');
  return jsonOk({ project: updated });
});

export const DELETE = handleRoute(async (request: Request, ctx: Ctx) => {
  const g = await guard(request, { limit: 'write' });
  if (!g.ok) return g.response;
  const { id } = await ctx.params;
  const ok = await g.store.projects.delete(g.user.id, id);
  if (!ok) return notFound('Projekti nuk u gjet.');
  return jsonOk({ ok: true });
});
