/**
 * Cikli i mjeteve me Claude (manual tool-use loop) për asistentin.
 *
 * A manual loop (rather than the SDK's beta tool runner) because every tool result must be
 * wrapped as untrusted data, citations are numbered across the whole reply, and the loop is
 * bounded: at most MAX_TOOL_ITERATIONS requests, the last one with tool_choice "none" so the
 * model must answer with what it has. Tool calls are executed in order (deterministic citation
 * ids) and all their results go back in a single user message. A refusal, a truncated tool call
 * or an exhausted budget never runs tools on partial input.
 */
import Anthropic from '@anthropic-ai/sdk';
import type {
  BetaContentBlock,
  BetaContentBlockParam,
  BetaMessage,
  BetaMessageParam,
  BetaTextBlockParam,
  BetaToolResultBlockParam,
  BetaToolUseBlock,
  MessageCreateParamsNonStreaming,
} from '@anthropic-ai/sdk/resources/beta/messages/messages';
import type { AssistantMessage } from '@/lib/domain/types';
import type { AssistantContext } from '@/lib/ai/context';
import { stripCitationMarkers, type CitationRegistry } from '@/lib/ai/citations';
import { executeTool, TOOL_DEFINITIONS, toolResultContent } from '@/lib/ai/tools';
import type { AssistantCalculation } from '@/lib/ai/handlers/shared';

/** Default model (per the claude-api skill): Claude Opus 5.5. ANTHROPIC_MODEL overrides it. */
export const DEFAULT_MODEL = 'claude-opus-5-5';
export const MAX_TOKENS = 2000;
export const MAX_TOOL_ITERATIONS = 6;
export const REQUEST_TIMEOUT_MS = 45_000;
export const TOTAL_BUDGET_MS = 100_000;
const MIN_REQUEST_MS = 3_000;
const MAX_HISTORY_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 4_000;

// Models that accept `output_config.effort`; others (e.g. Haiku 4.5) reject it.
const EFFORT_MODELS = /^claude-(fable-5|mythos-5|opus-5|opus-4-[5-8]|sonnet-5|sonnet-4-6)/;
// Models for which the server-side refusal fallback ("default" form) is documented on the Claude API.
const FALLBACK_MODELS: ReadonlySet<string> = new Set(['claude-fable-5-1', 'claude-opus-5-5', 'claude-opus-5', 'claude-sonnet-5-5']);
const FALLBACK_BETA = 'server-side-fallback-2026-07-01';

export interface RequestOptionsLike {
  timeout?: number;
}

/** The slice of the Anthropic client the assistant uses; tests inject a mock with this shape. */
export interface AnthropicLike {
  beta: {
    messages: {
      create(body: MessageCreateParamsNonStreaming, options?: RequestOptionsLike): Promise<BetaMessage>;
    };
  };
}

export function createAnthropicClient(apiKey: string): AnthropicLike {
  return new Anthropic({ apiKey, timeout: REQUEST_TIMEOUT_MS, maxRetries: 1 });
}

export function resolveModel(envModel?: string | null): string {
  return envModel?.trim() || process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL;
}

/** Request fields that depend on the model, so a custom ANTHROPIC_MODEL never gets a field it rejects. */
export function modelOptions(model: string): Partial<MessageCreateParamsNonStreaming> {
  const options: Partial<MessageCreateParamsNonStreaming> = {};
  if (EFFORT_MODELS.test(model)) options.output_config = { effort: 'medium' };
  if (FALLBACK_MODELS.has(model)) {
    options.betas = [FALLBACK_BETA];
    options.fallbacks = 'default';
  }
  return options;
}

/**
 * Chat history → API messages: earlier [cN] markers removed (ids are per reply and would point at
 * the wrong source now), leading assistant turns dropped, long messages and history capped.
 */
export function toApiMessages(history: AssistantMessage[]): BetaMessageParam[] {
  const recent = history.slice(-MAX_HISTORY_MESSAGES);
  const firstUser = recent.findIndex((m) => m.role === 'user');
  if (firstUser < 0) return [];
  return recent.slice(firstUser).map((m) => {
    const content = m.role === 'assistant' ? stripCitationMarkers(m.content) : m.content;
    return { role: m.role, content: content.slice(0, MAX_MESSAGE_CHARS) };
  });
}

/**
 * Assistant content to send back: thinking blocks are kept unchanged (required for preserved
 * thinking); after a server-side refusal fallback, model-internal blocks before the last
 * `fallback` marker are dropped and the marker itself is omitted, as the API documents.
 */
export function echoableContent(content: BetaContentBlock[]): BetaContentBlockParam[] {
  const boundary = content.map((b) => b.type).lastIndexOf('fallback');
  const internal = new Set(['thinking', 'redacted_thinking', 'tool_use', 'server_tool_use']);
  return content.filter((block, i) => block.type !== 'fallback' && !(i < boundary && internal.has(block.type))) as BetaContentBlockParam[];
}

function textOf(content: BetaContentBlock[]): string {
  return content
    .filter((b): b is Extract<BetaContentBlock, { type: 'text' }> => b.type === 'text')
    .map((b) => b.text.trim())
    .filter(Boolean)
    .join('\n\n');
}

export class AssistantDeadlineError extends Error {
  constructor() {
    super('assistant time budget exhausted');
    this.name = 'AssistantDeadlineError';
  }
}

export type ClaudeOutcome = 'ok' | 'refusal' | 'truncated' | 'iteration_limit';

export interface ClaudeRunResult {
  outcome: ClaudeOutcome;
  text: string;
  toolCalls: { name: string; ok: boolean }[];
  calculations: AssistantCalculation[];
}

export interface ClaudeRunInput {
  client: AnthropicLike;
  model: string;
  system: BetaTextBlockParam[];
  messages: BetaMessageParam[];
  ctx: AssistantContext;
  registry: CitationRegistry;
  /** Monotonic-ish clock for the overall time budget; injectable for tests. */
  clock?: () => number;
}

export async function runClaudeLoop(input: ClaudeRunInput): Promise<ClaudeRunResult> {
  const clock = input.clock ?? Date.now;
  const startedAt = clock();
  const conversation = [...input.messages];
  const toolCalls: ClaudeRunResult['toolCalls'] = [];
  const calculations: AssistantCalculation[] = [];
  const result = (outcome: ClaudeOutcome, text = ''): ClaudeRunResult => ({ outcome, text, toolCalls, calculations });

  for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
    const remaining = TOTAL_BUDGET_MS - (clock() - startedAt);
    if (remaining < MIN_REQUEST_MS) throw new AssistantDeadlineError();
    const isLast = i === MAX_TOOL_ITERATIONS - 1;
    const response = await input.client.beta.messages.create(
      {
        model: input.model,
        max_tokens: MAX_TOKENS,
        system: input.system,
        tools: TOOL_DEFINITIONS,
        messages: conversation,
        ...(isLast ? { tool_choice: { type: 'none' as const } } : {}),
        ...modelOptions(input.model),
      },
      { timeout: Math.min(REQUEST_TIMEOUT_MS, remaining) },
    );

    if (response.stop_reason === 'refusal') return result('refusal');
    if (response.stop_reason === 'max_tokens' || response.stop_reason === 'model_context_window_exceeded') {
      // A tool call cut off mid-input is never executed; whatever text exists is returned as truncated.
      return result('truncated', textOf(response.content));
    }
    if (response.stop_reason === 'pause_turn') {
      conversation.push({ role: 'assistant', content: echoableContent(response.content) });
      continue;
    }
    const toolUses = response.content.filter((b): b is BetaToolUseBlock => b.type === 'tool_use');
    if (response.stop_reason !== 'tool_use' || toolUses.length === 0) return result('ok', textOf(response.content));

    conversation.push({ role: 'assistant', content: echoableContent(response.content) });
    const results: BetaToolResultBlockParam[] = [];
    for (const block of toolUses) {
      const execution = await executeTool(block.name, block.input, input.ctx, input.registry);
      toolCalls.push({ name: block.name, ok: execution.ok });
      calculations.push(...execution.calculations);
      results.push({ type: 'tool_result', tool_use_id: block.id, content: toolResultContent(execution), is_error: !execution.ok });
    }
    conversation.push({ role: 'user', content: results });
  }
  return result('iteration_limit');
}
