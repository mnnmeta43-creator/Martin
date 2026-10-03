/**
 * Asistenti i Global Business Brain: hyrja e vetme (`runAssistant`) për rrugën me Claude dhe atë pa AI.
 *
 * Flow: load the context (project isolation first) → answer with Claude + tools when an API key
 * is configured, otherwise with the deterministic fallback → apply the citation/link rules to the
 * final text → persist the exchange. Numbers always come from the app's tools; the reply's
 * citations are only those the tools returned and the text actually references.
 */
import Anthropic from '@anthropic-ai/sdk';
import type { AssistantMessage, AssistantReply } from '@/lib/domain/types';
import type { Store } from '@/lib/server/store/types';
import { logger } from '@/lib/server/logger';
import { loadAssistantContext, type AssistantContext } from '@/lib/ai/context';
import { CitationRegistry, finalizeAnswer } from '@/lib/ai/citations';
import { buildContextBlock, SYSTEM_PROMPT } from '@/lib/ai/prompt';
import { MISSING_KEY_SQ, runFallback } from '@/lib/ai/fallback';
import {
  AssistantDeadlineError,
  createAnthropicClient,
  resolveModel,
  runClaudeLoop,
  toApiMessages,
  type AnthropicLike,
} from '@/lib/ai/claude';

export type { AnthropicLike } from '@/lib/ai/claude';

export interface AssistantEnv {
  apiKey?: string | null;
  model?: string | null;
  demoMode?: boolean;
}

export interface RunAssistantInput {
  store: Store;
  userId: string;
  projectId?: string | null;
  /** History plus the latest user message, which must be last. */
  messages: AssistantMessage[];
  env: AssistantEnv;
  now: Date;
  /** Injectable client (tests); by default one is created from `env.apiKey`. */
  client?: AnthropicLike;
}

export const PROJECT_NOT_FOUND_SQ = 'Projekti nuk u gjet. Zgjidhni një nga projektet tuaja ose vazhdoni pa projekt.';
export const EMPTY_QUESTION_SQ = 'Shkruani një pyetje.';
export const REFUSAL_SQ =
  'Nuk mund të ndihmoj me këtë kërkesë. Mund të pyesni për analizën e idesë, buxhetin, rreziqet, krahasimin me një vend tjetër ose hapat e planit.';
export const NO_ANSWER_SQ = 'Nuk arrita të formuloj një përgjigje të plotë. Provoni ta ndani pyetjen në pjesë më të vogla.';
export const TRUNCATED_NOTE_SQ = '(Përgjigjja u shkurtua për shkak të gjatësisë.)';

/** Friendly Albanian message for a failed Claude call; never includes technical details. */
export function friendlyErrorSq(error: unknown): string {
  const tail = ' Kalkulatori, plani dhe të dhënat funksionojnë normalisht.';
  if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
    return `Asistenti AI nuk është i disponueshëm për shkak të konfigurimit të serverit.${tail}`;
  }
  if (error instanceof Anthropic.NotFoundError) return `Modeli i AI i konfiguruar nuk është i disponueshëm.${tail}`;
  if (error instanceof Anthropic.RateLimitError) return 'Asistenti AI është i ngarkuar për momentin. Provoni përsëri pas pak.';
  if (error instanceof Anthropic.APIConnectionTimeoutError || error instanceof AssistantDeadlineError) {
    return 'Asistenti AI nuk u përgjigj në kohë. Provoni përsëri, mundësisht me një pyetje më të shkurtër.';
  }
  if (error instanceof Anthropic.APIConnectionError) return 'Nuk u arrit lidhja me shërbimin e AI. Provoni përsëri pas pak.';
  if (error instanceof Anthropic.BadRequestError) return 'Kërkesa drejt asistentit AI nuk u pranua. Provoni ta formuloni pyetjen ndryshe ose më shkurt.';
  if (error instanceof Anthropic.InternalServerError) return 'Shërbimi i AI ka një problem të përkohshëm. Provoni përsëri pas pak.';
  return `Asistenti AI nuk mundi të përgjigjet tani. Provoni përsëri pas pak.${tail}`;
}

function latestQuestion(messages: AssistantMessage[]): string | null {
  const last = messages[messages.length - 1];
  return last && last.role === 'user' && last.content.trim() ? last.content.trim() : null;
}

async function persistExchange(store: Store, userId: string, projectId: string | null, question: string, answer: string): Promise<void> {
  try {
    await store.chat.append(userId, projectId, [
      { role: 'user', content: question },
      { role: 'assistant', content: answer },
    ]);
  } catch (error) {
    // The reply is still useful without history; the failure is logged (redacted), not shown.
    logger.error('assistant.persist_failed', { error });
  }
}

async function answerWithoutAi(ctx: AssistantContext, question: string): Promise<AssistantReply> {
  const registry = new CitationRegistry();
  const result = await runFallback(ctx, question, registry);
  const final = finalizeAnswer(result.text, registry);
  return {
    mode: 'pa_ai',
    replySq: final.text,
    citations: final.citations,
    ...(result.calculations.length > 0 ? { calculations: result.calculations } : {}),
    missingConfigSq: MISSING_KEY_SQ,
    toolCalls: result.toolCalls,
  };
}

async function answerWithClaude(ctx: AssistantContext, input: RunAssistantInput, apiKey: string): Promise<{ reply: AssistantReply; failed: boolean }> {
  const registry = new CitationRegistry();
  const model = resolveModel(input.env.model);
  try {
    const result = await runClaudeLoop({
      client: input.client ?? createAnthropicClient(apiKey),
      model,
      system: [
        { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: buildContextBlock(ctx) },
      ],
      messages: toApiMessages(input.messages),
      ctx,
      registry,
    });
    const base = { mode: 'claude' as const, toolCalls: result.toolCalls };
    if (result.outcome === 'refusal') return { reply: { ...base, replySq: REFUSAL_SQ, citations: [] }, failed: false };
    if (!result.text) return { reply: { ...base, replySq: NO_ANSWER_SQ, citations: [] }, failed: false };
    const raw = result.outcome === 'truncated' ? `${result.text}\n\n${TRUNCATED_NOTE_SQ}` : result.text;
    const final = finalizeAnswer(raw, registry);
    return {
      reply: {
        ...base,
        replySq: final.text,
        citations: final.citations,
        ...(result.calculations.length > 0 ? { calculations: result.calculations } : {}),
      },
      failed: false,
    };
  } catch (error) {
    logger.error('assistant.claude_failed', {
      model,
      status: error instanceof Anthropic.APIError ? (error.status ?? null) : null,
      error,
    });
    return { reply: { mode: 'claude', replySq: friendlyErrorSq(error), citations: [] }, failed: true };
  }
}

/** Answers the latest user message about the user's profile and (optionally) one of their projects. */
export async function runAssistant(input: RunAssistantInput): Promise<AssistantReply> {
  const apiKey = input.env.apiKey?.trim() || null;
  const mode: AssistantReply['mode'] = apiKey ? 'claude' : 'pa_ai';
  const configNote = apiKey ? {} : { missingConfigSq: MISSING_KEY_SQ };
  const question = latestQuestion(input.messages);
  if (!question) return { mode, replySq: EMPTY_QUESTION_SQ, citations: [], ...configNote };

  const load = await loadAssistantContext({
    store: input.store,
    userId: input.userId,
    projectId: input.projectId,
    now: input.now,
    demoMode: input.env.demoMode === true,
  });
  // Foreign and missing projects get the same answer, and nothing is stored for them.
  if (!load.ok) return { mode, replySq: PROJECT_NOT_FOUND_SQ, citations: [], ...configNote };
  const ctx = load.context;

  if (!apiKey) {
    const reply = await answerWithoutAi(ctx, question);
    await persistExchange(input.store, input.userId, ctx.project?.id ?? null, question, reply.replySq);
    return reply;
  }
  const { reply, failed } = await answerWithClaude(ctx, input, apiKey);
  // A failed call is not stored, so the next attempt does not carry an error message as history.
  if (!failed) await persistExchange(input.store, input.userId, ctx.project?.id ?? null, question, reply.replySq);
  return reply;
}
