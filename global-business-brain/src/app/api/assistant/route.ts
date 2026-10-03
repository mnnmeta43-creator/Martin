import { assistantRequestSchema } from '@/lib/validation/schemas';
import { runAssistant } from '@/lib/ai/assistant';
import { isDemoMode } from '@/lib/data/demo/dataset';
import { getEnv } from '@/lib/server/env';
import { handleRoute, jsonOk, parseJsonBody } from '@/lib/server/http';
import { guard, QUOTAS } from '../_shared';

export const runtime = 'nodejs';

export const GET = handleRoute(async (request: Request) => {
  const g = await guard(request, { limit: 'write' });
  if (!g.ok) return g.response;
  const projectId = new URL(request.url).searchParams.get('projectId');
  return jsonOk({ messages: await g.store.chat.list(g.user.id, projectId || null, 30) });
});

/** The API key stays on the server; the browser only sees the reply and the citations from stored data. */
export const POST = handleRoute(async (request: Request) => {
  const g = await guard(request, { limit: 'assistant' });
  if (!g.ok) return g.response;
  const body = await parseJsonBody(request, assistantRequestSchema);
  if (!body.ok) return body.response;
  const env = getEnv();
  const history = await g.store.chat.list(g.user.id, body.data.projectId ?? null, 12);
  const reply = await runAssistant({
    store: g.store,
    userId: g.user.id,
    projectId: body.data.projectId ?? null,
    messages: [...history, { role: 'user', content: body.data.message }],
    env: { apiKey: env.ANTHROPIC_API_KEY ?? null, model: env.ANTHROPIC_MODEL ?? null, demoMode: isDemoMode() },
    now: new Date(),
  });
  await g.store.chat.prune(g.user.id, body.data.projectId ?? null, QUOTAS.chatMessagesKept);
  return jsonOk(reply);
});
