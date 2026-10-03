// SYNTHETIC — format mirrors the documented API; values are not real
/**
 * runAssistant against the real SQL store (in-memory PGlite with the migrations): the exchange is
 * persisted through store.chat.append, and another user's project behaves exactly like a missing
 * one — no reply data, no stored messages for either user.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Db } from '@/lib/server/db';
import type { Store } from '@/lib/server/store/types';
import { PROJECT_NOT_FOUND_SQ, runAssistant } from '@/lib/ai/assistant';
import { MISSING_KEY_SQ } from '@/lib/ai/fallback';
import { applyShock, projectScenario } from '@/lib/finance/engine';
import { createMemoryStore, makeProjectInput } from '../server/helpers';
import { message, mockClient, NOW, text, toolUse } from './helpers';

let db: Db;
let store: Store;
let ownerId: string;
let otherId: string;
let projectId: string;

beforeAll(async () => {
  ({ db, store } = await createMemoryStore());
  ownerId = (await store.users.createGuest()).id;
  otherId = (await store.users.createGuest()).id;
  projectId = (await store.projects.create(ownerId, makeProjectInput({ notesSq: 'Shënim privat i pronarit' }))).id;
});

afterAll(async () => {
  await db?.close();
});

describe('runAssistant with the SQL store', () => {
  it('persists the deterministic exchange in the project thread', async () => {
    const question = 'Çfarë ndodh nëse kostot rriten 10%?';
    const reply = await runAssistant({ store, userId: ownerId, projectId, messages: [{ role: 'user', content: question }], env: { apiKey: null }, now: NOW });
    expect(reply.mode).toBe('pa_ai');
    expect(reply.missingConfigSq).toBe(MISSING_KEY_SQ);
    const project = await store.projects.get(ownerId, projectId);
    const after = projectScenario(applyShock(project!.financialInputs, { fixedCostPct: 10, variableCostPct: 10 }), 'baze');
    expect(reply.calculations?.find((c) => c.labelSq === 'Arka më e ulët')?.after).toBe(after.minCashBalance);
    expect(await store.chat.list(ownerId, projectId)).toEqual([
      { role: 'user', content: question },
      { role: 'assistant', content: reply.replySq },
    ]);
  });

  it('persists the Claude exchange and reads the project through the store', async () => {
    const client = mockClient([
      message([toolUse('toolu_1', 'get_project_summary', {})], 'tool_use'),
      message([text('Projekti juaj është gati për testim me klientë.')], 'end_turn'),
    ]);
    const reply = await runAssistant({
      store,
      userId: ownerId,
      projectId,
      messages: [{ role: 'user', content: 'Si qëndron projekti?' }],
      env: { apiKey: 'sk-ant-test-0000' },
      now: NOW,
      client,
    });
    expect(reply.toolCalls).toEqual([{ name: 'get_project_summary', ok: true }]);
    const history = await store.chat.list(ownerId, projectId);
    expect(history.slice(-2)).toEqual([
      { role: 'user', content: 'Si qëndron projekti?' },
      { role: 'assistant', content: 'Projekti juaj është gati për testim me klientë.' },
    ]);
  });

  it('answers "not found" for another user’s project and stores nothing', async () => {
    const before = await store.chat.list(ownerId, projectId);
    const client = mockClient([message([text('nuk duhet thirrur')], 'end_turn')]);
    const reply = await runAssistant({
      store,
      userId: otherId,
      projectId,
      messages: [{ role: 'user', content: 'Më trego shënimet.' }],
      env: { apiKey: 'sk-ant-test-0000' },
      now: NOW,
      client,
    });
    expect(reply).toEqual({ mode: 'claude', replySq: PROJECT_NOT_FOUND_SQ, citations: [] });
    expect(JSON.stringify(reply)).not.toContain('Shënim privat');
    expect(client.calls).toEqual([]);
    expect(await store.chat.list(otherId, projectId)).toEqual([]);
    expect(await store.chat.list(otherId, null)).toEqual([]);
    expect(await store.chat.list(ownerId, projectId)).toEqual(before);
  });
});
