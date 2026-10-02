import { z } from 'zod';
import { createProjectSchema, financialInputsSchema, manualFxSchema } from '@/lib/validation/schemas';
import { isDemoMode } from '@/lib/data/demo/dataset';
import { handleRoute, jsonError, jsonOk, parseJsonBody } from '@/lib/server/http';
import { createProjectFromIdea, ProjectInputError } from '../../_lib/projects';
import { guard } from '../_shared';

const bodySchema = createProjectSchema.extend({
  financialInputs: financialInputsSchema.optional(),
  manualFxRates: z.array(manualFxSchema).max(10).optional(),
});

export const GET = handleRoute(async (request: Request) => {
  const g = await guard(request, { limit: 'write' });
  if (!g.ok) return g.response;
  return jsonOk({ projects: await g.store.projects.list(g.user.id) });
});

/** Creates a project from an idea: inputs from the library (or the unsaved calculator), data snapshot, plan + tasks. */
export const POST = handleRoute(async (request: Request) => {
  const g = await guard(request, { limit: 'write' });
  if (!g.ok) return g.response;
  const body = await parseJsonBody(request, bodySchema);
  if (!body.ok) return body.response;
  const profile = await g.store.profiles.get(g.user.id);
  const now = new Date();
  try {
    const project = await createProjectFromIdea(
      g.store,
      g.user.id,
      profile,
      {
        ...body.data,
        manualFxRates: body.data.manualFxRates?.map((r) => ({ ...r, sourceId: 'manual', kind: 'manuale' as const, retrievedAt: now.toISOString() })),
      },
      now,
      isDemoMode(),
    );
    return jsonOk({ project: { id: project.id } }, { status: 201 });
  } catch (err) {
    if (err instanceof ProjectInputError) return jsonError(400, 'invalid_project', err.messageSq);
    throw err;
  }
});
