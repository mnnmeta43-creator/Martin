// SYNTHETIC — format mirrors the documented API; values are not real
/**
 * The Claude path of runAssistant with a scripted client (no network): the tool-use loop, the
 * request shape, citation/link clean-up of the final text, persistence, isolation and errors.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import Anthropic from '@anthropic-ai/sdk';
import type { AssistantMessage } from '@/lib/domain/types';
import {
  EMPTY_QUESTION_SQ,
  friendlyErrorSq,
  NO_ANSWER_SQ,
  PROJECT_NOT_FOUND_SQ,
  REFUSAL_SQ,
  runAssistant,
  TRUNCATED_NOTE_SQ,
} from '@/lib/ai/assistant';
import {
  AssistantDeadlineError,
  DEFAULT_MODEL,
  echoableContent,
  MAX_TOKENS,
  MAX_TOOL_ITERATIONS,
  modelOptions,
  resolveModel,
  runClaudeLoop,
  toApiMessages,
} from '@/lib/ai/claude';
import { CitationRegistry, REMOVED_LINK_SQ } from '@/lib/ai/citations';
import { MISSING_KEY_SQ } from '@/lib/ai/fallback';
import { SYSTEM_PROMPT } from '@/lib/ai/prompt';
import { TOOL_NAMES } from '@/lib/ai/tools';
import { applyShock, projectScenario } from '@/lib/finance/engine';
import {
  FOREIGN_NOTES,
  FOREIGN_PROJECT_ID,
  loadContext,
  makeInputs,
  message,
  mockClient,
  PROJECT_ID,
  standardStore,
  SYNTHETIC_URL,
  text,
  toolResultsOf,
  toolUse,
  unwrap,
  USER_ID,
  type MockClient,
} from './helpers';

const KEY = 'sk-ant-test-0000000000000000';
const ALB_INTERNET_URL = `${SYNTHETIC_URL}/alb-internet`;

async function askClaude(
  client: MockClient,
  opts: { question?: string; history?: AssistantMessage[]; projectId?: string | null; model?: string | null; store?: ReturnType<typeof standardStore> } = {},
) {
  const store = opts.store ?? standardStore();
  const question = opts.question ?? 'Sa përdoret interneti në vendin e projektit?';
  const reply = await runAssistant({
    store,
    userId: USER_ID,
    projectId: opts.projectId === undefined ? PROJECT_ID : opts.projectId,
    messages: [...(opts.history ?? []), { role: 'user', content: question }],
    env: { apiKey: KEY, model: opts.model ?? null, demoMode: false },
    now: new Date('2026-10-02T09:00:00.000Z'),
    client,
  });
  return { reply, store };
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('Claude path: tool_use → tool_result → final answer', () => {
  it('runs the tool, sends the wrapped result back and keeps the cited source', async () => {
    const client = mockClient([
      message([text('Po kontrolloj të dhënat.'), toolUse('toolu_1', 'get_country_indicators', { indicatorCodes: ['internet_users_pct'] })], 'tool_use'),
      message([text('Përdorimi i internetit është 11,11% (2024) [c1]. Kjo është e dhëna më e fundit e disponueshme.')], 'end_turn'),
    ]);
    const { reply, store } = await askClaude(client);

    expect(reply).toEqual({
      mode: 'claude',
      replySq: 'Përdorimi i internetit është 11,11% (2024) [c1]. Kjo është e dhëna më e fundit e disponueshme.',
      citations: [expect.objectContaining({ url: ALB_INTERNET_URL, countryCode: 'ALB', period: '2024', value: 11.11 })],
      toolCalls: [{ name: 'get_country_indicators', ok: true }],
    });

    expect(client.calls).toHaveLength(2);
    const [first, second] = client.calls;
    // First request: the latest question last, all tools, the cached instructions and per-turn context.
    expect(first.messages).toEqual([{ role: 'user', content: 'Sa përdoret interneti në vendin e projektit?' }]);
    expect(first.tools?.map((t) => (t as { name: string }).name)).toEqual(TOOL_NAMES);
    expect(first.system).toEqual([
      { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
      expect.objectContaining({ type: 'text', text: expect.stringContaining("Today's date: 2026-10-02.") }),
    ]);
    // Second request: the assistant turn echoed unchanged, then one user message with the tool result.
    expect(second.messages[1]).toEqual({
      role: 'assistant',
      content: [
        { type: 'text', text: 'Po kontrolloj të dhënat.', citations: null },
        { type: 'tool_use', id: 'toolu_1', name: 'get_country_indicators', input: { indicatorCodes: ['internet_users_pct'] } },
      ],
    });
    const [result] = toolResultsOf(second);
    expect(result).toMatchObject({ tool_use_id: 'toolu_1', is_error: false });
    const payload = unwrap(result.content);
    expect(payload.ok).toBe(true);
    expect(payload.citations).toEqual([expect.objectContaining({ id: 'c1', sourceName: expect.any(String), period: '2024' })]);
    expect(result.content).not.toContain(ALB_INTERNET_URL);

    // The exchange is persisted in the project's thread.
    expect(store.state.chat).toEqual([
      { userId: USER_ID, projectId: PROJECT_ID, message: { role: 'user', content: 'Sa përdoret interneti në vendin e projektit?' } },
      { userId: USER_ID, projectId: PROJECT_ID, message: { role: 'assistant', content: reply.replySq } },
    ]);
  });

  it('removes unknown [cN] markers, strips foreign URLs and lists only cited tool sources', async () => {
    const client = mockClient([
      message([toolUse('toolu_1', 'get_country_indicators', { indicatorCodes: ['internet_users_pct', 'gdp_per_capita_ppp'] })], 'tool_use'),
      message(
        [text(`Interneti [c1] dhe një burim tjetër [c9]. Shihni https://evil.example/oferta ose [faqen](http://spam.example). Burimi: ${ALB_INTERNET_URL}`)],
        'end_turn',
      ),
    ]);
    const { reply } = await askClaude(client);
    expect(reply.replySq).toBe(`Interneti [c1] dhe një burim tjetër. Shihni ${REMOVED_LINK_SQ} ose faqen ${REMOVED_LINK_SQ}. Burimi: ${ALB_INTERNET_URL}`);
    expect(reply.replySq).not.toMatch(/evil|spam|\[c9\]/);
    // c2 (PPP) was returned by the tool but never cited, so it is not listed.
    expect(reply.citations.map((c) => c.url)).toEqual([ALB_INTERNET_URL]);
  });

  it('never keeps a marker the model invents without any tool call', async () => {
    const client = mockClient([message([text('Rritja është 99% [c1] sipas https://made-up.example/stat.')], 'end_turn')]);
    const { reply } = await askClaude(client, { question: 'Sa është rritja?' });
    expect(reply.replySq).toBe(`Rritja është 99% sipas ${REMOVED_LINK_SQ}.`);
    expect(reply.citations).toEqual([]);
    expect(reply.toolCalls).toEqual([]);
  });

  it('takes financial numbers from the engine (calculations equal applyShock + projectScenario)', async () => {
    const shock = { fixedCostPct: 30 };
    const client = mockClient([
      message([toolUse('toolu_1', 'run_financial_scenario', { shock })], 'tool_use'),
      message([text('Me kosto fikse +30%, arka më e ulët ulet.')], 'end_turn'),
    ]);
    const { reply } = await askClaude(client, { question: 'Po sikur kostot fikse të rriten 30%?' });
    const inputs = makeInputs();
    const before = projectScenario(inputs, 'baze');
    const after = projectScenario(applyShock(inputs, shock), 'baze');
    expect(reply.calculations).toEqual([
      { labelSq: 'Të ardhurat totale', scenario: 'baze', before: before.totals.revenue, after: after.totals.revenue, currency: 'USD' },
      { labelSq: 'Rezultati operativ total', scenario: 'baze', before: before.totals.operatingResult, after: after.totals.operatingResult, currency: 'USD' },
      { labelSq: 'Gjendja më e ulët e parasë', scenario: 'baze', before: before.minCashBalance, after: after.minCashBalance, currency: 'USD' },
      { labelSq: 'Kapitali i nevojshëm', scenario: 'baze', before: before.capital.totalRequired, after: after.capital.totalRequired, currency: 'USD' },
    ]);
    const data = unwrap(toolResultsOf(client.calls[1])[0].content).data as { metrics: { key: string; after: number | null }[] };
    expect(data.metrics.find((m) => m.key === 'paybackMonth')?.after).toBe(after.payback.recoveredInMonth);
  });

  it('answers parallel tool calls in one user message with reply-wide citation ids', async () => {
    const client = mockClient([
      message(
        [
          toolUse('toolu_a', 'get_country_indicators', { indicatorCodes: ['internet_users_pct'] }),
          toolUse('toolu_b', 'get_country_indicators', { countryCode: 'XKX', indicatorCodes: ['internet_users_pct'] }),
        ],
        'tool_use',
      ),
      message([text('Shqipëria [c1] dhe Kosova [c2].')], 'end_turn'),
    ]);
    const { reply } = await askClaude(client);
    const results = toolResultsOf(client.calls[1]);
    expect(results.map((r) => r.tool_use_id)).toEqual(['toolu_a', 'toolu_b']);
    expect(client.calls[1].messages).toHaveLength(3);
    expect(results.map((r) => unwrap(r.content).citations.map((c) => c.id))).toEqual([['c1'], ['c2']]);
    expect(reply.citations.map((c) => c.countryCode)).toEqual(['ALB', 'XKX']);
    expect(reply.toolCalls).toEqual([
      { name: 'get_country_indicators', ok: true },
      { name: 'get_country_indicators', ok: true },
    ]);
  });

  it('returns invalid tool input as an error result the model can recover from', async () => {
    const client = mockClient([
      message([toolUse('toolu_1', 'list_tasks_due', { days: 500 })], 'tool_use'),
      message([toolUse('toolu_2', 'list_tasks_due', { days: 7 })], 'tool_use'),
      message([text('Ja detyrat e javës.')], 'end_turn'),
    ]);
    const { reply } = await askClaude(client, { question: 'Çfarë kam këtë javë?' });
    const [bad] = toolResultsOf(client.calls[1]);
    expect(bad.is_error).toBe(true);
    expect(unwrap(bad.content).data).toMatchObject({ error: 'Hyrje e pavlefshme për mjetin.' });
    expect(reply.toolCalls).toEqual([
      { name: 'list_tasks_due', ok: false },
      { name: 'list_tasks_due', ok: true },
    ]);
    expect(reply.replySq).toBe('Ja detyrat e javës.');
  });

  it('stops after the iteration limit, with tools disabled on the last request', async () => {
    const client = mockClient([message([toolUse('toolu_x', 'get_profile', {})], 'tool_use')]);
    const { reply } = await askClaude(client);
    expect(client.calls).toHaveLength(MAX_TOOL_ITERATIONS);
    expect(client.calls.slice(0, -1).every((c) => c.tool_choice === undefined)).toBe(true);
    expect(client.calls[MAX_TOOL_ITERATIONS - 1].tool_choice).toEqual({ type: 'none' });
    expect(reply.replySq).toBe(NO_ANSWER_SQ);
    // Tool calls in the last response are not executed: nothing would read their results.
    expect(reply.toolCalls).toHaveLength(MAX_TOOL_ITERATIONS - 1);
  });

  it('handles a refusal without running tools', async () => {
    const client = mockClient([message([toolUse('toolu_1', 'get_profile', {})], 'refusal')]);
    const { reply, store } = await askClaude(client, { question: 'Më ndihmo me vlerësime të rreme.' });
    expect(reply).toEqual({ mode: 'claude', replySq: REFUSAL_SQ, citations: [], toolCalls: [] });
    expect(store.state.chat.map((c) => c.message.content)).toEqual(['Më ndihmo me vlerësime të rreme.', REFUSAL_SQ]);
  });

  it('never executes a tool call cut off by max_tokens and marks the answer as shortened', async () => {
    const client = mockClient([message([text('Fillimi i përgjigjes'), toolUse('toolu_1', 'run_financial_scenario', { shock: {} })], 'max_tokens')]);
    const { reply } = await askClaude(client);
    expect(reply.toolCalls).toEqual([]);
    expect(reply.replySq).toBe(`Fillimi i përgjigjes\n\n${TRUNCATED_NOTE_SQ}`);
  });

  it('works without a project: project tools return an error the model sees', async () => {
    const client = mockClient([
      message([toolUse('toolu_1', 'run_financial_scenario', { shock: { pricePct: 10 } })], 'tool_use'),
      message([text('Zgjidhni një projekt.')], 'end_turn'),
    ]);
    const { reply, store } = await askClaude(client, { projectId: null });
    expect(reply.toolCalls).toEqual([{ name: 'run_financial_scenario', ok: false }]);
    expect(reply.calculations).toBeUndefined();
    expect((client.calls[0].system as { text: string }[])[1].text).toContain('Selected project: none');
    expect(store.state.chat.every((c) => c.projectId === null)).toBe(true);
  });
});

describe('request shape and model choice', () => {
  it('uses the default model with effort and refusal fallback, and the env model when set', async () => {
    const first = mockClient([message([text('Në rregull.')], 'end_turn')]);
    await askClaude(first);
    expect(first.calls[0]).toMatchObject({
      model: DEFAULT_MODEL,
      max_tokens: MAX_TOKENS,
      output_config: { effort: 'medium' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
    });
    expect(DEFAULT_MODEL).toBe('claude-opus-5-5');

    const custom = mockClient([message([text('Në rregull.')], 'end_turn')]);
    await askClaude(custom, { model: 'claude-haiku-4-5' });
    expect(custom.calls[0].model).toBe('claude-haiku-4-5');
    // Fields a model does not accept are not sent.
    expect(custom.calls[0]).not.toHaveProperty('output_config');
    expect(custom.calls[0]).not.toHaveProperty('fallbacks');
  });

  it('resolves env.model → ANTHROPIC_MODEL → default', () => {
    vi.stubEnv('ANTHROPIC_MODEL', 'claude-sonnet-5-5');
    expect(resolveModel('claude-opus-5')).toBe('claude-opus-5');
    expect(resolveModel(null)).toBe('claude-sonnet-5-5');
    expect(resolveModel('  ')).toBe('claude-sonnet-5-5');
    vi.stubEnv('ANTHROPIC_MODEL', '');
    expect(resolveModel(undefined)).toBe('claude-opus-5-5');
    expect(modelOptions('claude-sonnet-5-5')).toMatchObject({ fallbacks: 'default' });
  });

  it('sends history without stale citation markers and starting with a user turn', () => {
    const history: AssistantMessage[] = [
      { role: 'assistant', content: 'Mirë se erdhët.' },
      { role: 'user', content: 'Pyetja e parë' },
      { role: 'assistant', content: 'Vlera [c1] dhe [c2, c3].' },
      { role: 'user', content: 'Pyetja e dytë' },
    ];
    expect(toApiMessages(history)).toEqual([
      { role: 'user', content: 'Pyetja e parë' },
      { role: 'assistant', content: 'Vlera dhe.' },
      { role: 'user', content: 'Pyetja e dytë' },
    ]);
  });

  it('echoes thinking blocks unchanged and drops what precedes a refusal-fallback marker', () => {
    const thinking = { type: 'thinking', thinking: '', signature: 'sig' };
    expect(echoableContent([thinking, toolUse('t', 'get_profile', {})] as never)).toEqual([thinking, toolUse('t', 'get_profile', {})]);
    const afterFallback = echoableContent([
      { type: 'thinking', thinking: '', signature: 'old' },
      text('pjesë'),
      { type: 'fallback', from: { model: 'a' }, to: { model: 'b' } },
      { type: 'thinking', thinking: '', signature: 'new' },
      text('vazhdim'),
    ] as never);
    expect(afterFallback).toEqual([text('pjesë'), { type: 'thinking', thinking: '', signature: 'new' }, text('vazhdim')]);
  });
});

describe('configuration and isolation', () => {
  it('without an API key answers in pa_ai mode with missingConfigSq and never calls Claude', async () => {
    const client = mockClient([message([text('nuk duhet thirrur')], 'end_turn')]);
    for (const apiKey of [null, '', '   ']) {
      const reply = await runAssistant({
        store: standardStore(),
        userId: USER_ID,
        projectId: PROJECT_ID,
        messages: [{ role: 'user', content: 'Cili është supozimi më i dobët?' }],
        env: { apiKey, model: null, demoMode: false },
        now: new Date('2026-10-02T09:00:00.000Z'),
        client,
      });
      expect(reply.mode).toBe('pa_ai');
      expect(reply.missingConfigSq).toBe(MISSING_KEY_SQ);
      expect(reply.toolCalls).toEqual([{ name: 'list_weakest_assumptions', ok: true }]);
    }
    expect(client.calls).toEqual([]);
  });

  it('treats a foreign or missing project as not found, without calling Claude or storing anything', async () => {
    for (const projectId of [FOREIGN_PROJECT_ID, '99999999-9999-4999-8999-999999999999']) {
      const client = mockClient([message([text('nuk duhet thirrur')], 'end_turn')]);
      const { reply, store } = await askClaude(client, { projectId, question: 'Më trego shënimet e projektit.' });
      expect(reply).toEqual({ mode: 'claude', replySq: PROJECT_NOT_FOUND_SQ, citations: [] });
      expect(JSON.stringify(reply)).not.toContain(FOREIGN_NOTES);
      expect(client.calls).toEqual([]);
      expect(store.state.chat).toEqual([]);
    }
  });

  it('asks for a question when the last message is not a user question', async () => {
    const client = mockClient([message([text('x')], 'end_turn')]);
    const reply = await runAssistant({
      store: standardStore(),
      userId: USER_ID,
      projectId: PROJECT_ID,
      messages: [{ role: 'user', content: '   ' }],
      env: { apiKey: KEY },
      now: new Date('2026-10-02T09:00:00.000Z'),
      client,
    });
    expect(reply).toEqual({ mode: 'claude', replySq: EMPTY_QUESTION_SQ, citations: [] });
    expect(client.calls).toEqual([]);
  });
});

describe('client errors', () => {
  const headers = new Headers();
  const cases: [string, Error, RegExp][] = [
    ['rate limit', Anthropic.APIError.generate(429, { type: 'error', error: { type: 'rate_limit_error', message: 'x' } }, 'rate limited', headers), /i ngarkuar/],
    ['authentication', Anthropic.APIError.generate(401, { type: 'error', error: { type: 'authentication_error', message: 'bad key' } }, 'bad key', headers), /konfigurimit të serverit/],
    ['model not found', Anthropic.APIError.generate(404, { type: 'error', error: { type: 'not_found_error', message: 'model' } }, 'model', headers), /Modeli i AI/],
    ['server error', Anthropic.APIError.generate(529, { type: 'error', error: { type: 'overloaded_error', message: 'overloaded' } }, 'overloaded', headers), /problem të përkohshëm/],
    ['bad request', Anthropic.APIError.generate(400, { type: 'error', error: { type: 'invalid_request_error', message: 'bad' } }, 'bad', headers), /nuk u pranua/],
    ['timeout', new Anthropic.APIConnectionTimeoutError(), /nuk u përgjigj në kohë/],
    ['connection', new Anthropic.APIConnectionError({ message: 'ECONNRESET' }), /lidhja me shërbimin/],
    ['unexpected', new TypeError(`boom at internal.ts:42 with key ${KEY}`), /nuk mundi të përgjigjet tani/],
  ];

  it.each(cases)('%s → friendly Albanian message, nothing stored, secrets never logged', async (_label, error, expected) => {
    const lines: string[] = [];
    vi.spyOn(console, 'error').mockImplementation((line: unknown) => {
      lines.push(String(line));
    });
    const client = mockClient([error]);
    const { reply, store } = await askClaude(client);
    expect(reply.mode).toBe('claude');
    expect(reply.replySq).toMatch(expected);
    expect(reply.replySq).toBe(friendlyErrorSq(error));
    expect(reply.citations).toEqual([]);
    expect(reply.replySq).not.toMatch(/Error|stack|\.ts:|sk-ant|ECONNRESET|429|401/);
    expect(store.state.chat).toEqual([]);
    expect(lines.some((l) => l.includes('assistant.claude_failed'))).toBe(true);
    expect(lines.join('\n')).not.toContain(KEY);
  });

  it('a tool-loop failure after a tool ran still yields only the friendly message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const client = mockClient([message([toolUse('toolu_1', 'get_profile', {})], 'tool_use'), new Anthropic.APIConnectionError({ message: 'reset' })]);
    const { reply } = await askClaude(client);
    expect(reply).toEqual({ mode: 'claude', replySq: friendlyErrorSq(new Anthropic.APIConnectionError({ message: 'reset' })), citations: [] });
  });

  it('stops when the overall time budget is exhausted', async () => {
    const store = standardStore();
    const ctx = await loadContext(store);
    const client = mockClient([message([toolUse('toolu_1', 'get_profile', {})], 'tool_use')]);
    let now = 0;
    const clock = () => {
      const t = now;
      now += 60_000;
      return t;
    };
    await expect(
      runClaudeLoop({ client, model: DEFAULT_MODEL, system: [], messages: [{ role: 'user', content: 'x' }], ctx, registry: new CitationRegistry(), clock }),
    ).rejects.toBeInstanceOf(AssistantDeadlineError);
    expect(client.calls.length).toBeLessThan(MAX_TOOL_ITERATIONS);
    expect(friendlyErrorSq(new AssistantDeadlineError())).toMatch(/nuk u përgjigj në kohë/);
  });
});
