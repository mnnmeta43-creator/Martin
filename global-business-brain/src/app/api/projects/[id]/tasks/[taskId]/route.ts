import { taskPatchSchema } from '@/lib/validation/schemas';
import { computeProgress } from '@/lib/plan/progress';
import { handleRoute, jsonOk, parseJsonBody } from '@/lib/server/http';
import { guard, notFound } from '../../../../_shared';

type Ctx = { params: Promise<{ id: string; taskId: string }> };

export const PATCH = handleRoute(async (request: Request, ctx: Ctx) => {
  const g = await guard(request, { limit: 'write' });
  if (!g.ok) return g.response;
  const { id, taskId } = await ctx.params;
  const body = await parseJsonBody(request, taskPatchSchema);
  if (!body.ok) return body.response;
  const task = await g.store.tasks.update(g.user.id, id, decodeURIComponent(taskId), body.data);
  if (!task) return notFound('Detyra nuk u gjet.');
  const tasks = (await g.store.tasks.list(g.user.id, id)) ?? [];
  return jsonOk({ task, progress: computeProgress(tasks) });
});
