// SYNTHETIC — format mirrors the documented API; values are not real
import { describe, expect, it } from 'vitest';
import type { AssistantReply } from '@/lib/domain/types';
import { DEFAULT_SCORE_WEIGHTS } from '@/lib/domain/taxonomy';
import { runAssistant, PROJECT_NOT_FOUND_SQ } from '@/lib/ai/assistant';
import { matchIntent, MISSING_KEY_SQ } from '@/lib/ai/fallback';
import { applyShock, projectScenario, sensitivityAnalysis } from '@/lib/finance/engine';
import { adaptToLowerCapital } from '@/lib/ideas/adapt';
import { compareCountriesForIdea } from '@/lib/ideas/compareForIdea';
import { evaluateIdea } from '@/lib/ideas/engine';
import { getArchetype } from '@/lib/ideas/archetypes';
import { getCountryDataContext } from '@/lib/data/context';
import { getOfficialLinks } from '@/lib/data/sources/registry';
import {
  ARCHETYPE_ID,
  DEMO_PROJECT_ID,
  FOREIGN_NOTES,
  FOREIGN_PROJECT_ID,
  makeInputs,
  makeObservations,
  makeProfile,
  NOW,
  PROJECT_ID,
  standardStore,
  USER_ID,
} from './helpers';

const archetype = getArchetype(ARCHETYPE_ID)!;

async function ask(question: string, opts: { projectId?: string | null; demoMode?: boolean; store?: ReturnType<typeof standardStore> } = {}) {
  const store = opts.store ?? standardStore();
  const reply = await runAssistant({
    store,
    userId: USER_ID,
    projectId: opts.projectId === undefined ? PROJECT_ID : opts.projectId,
    messages: [{ role: 'user', content: question }],
    env: { apiKey: null, model: null, demoMode: opts.demoMode ?? false },
    now: NOW,
  });
  return { reply, store };
}

/** Every [cN] in the text points into reply.citations, and nothing else is listed. */
function expectConsistentCitations(reply: AssistantReply) {
  const ids = [...new Set([...reply.replySq.matchAll(/\[c(\d+)\]/g)].map((m) => Number(m[1])))];
  expect(ids.sort((a, b) => a - b)).toEqual(reply.citations.map((_, i) => i + 1));
}

const knownUrls = new Set([...makeObservations().map((o) => o.sourceUrl), ...getOfficialLinks('ALB').map((c) => c.url)]);

describe('matchIntent', () => {
  it('recognises the suggested questions (diacritics and case do not matter)', () => {
    expect(matchIntent('Pse kjo ide ka kuptim këtu?').id).toBe('pse_funksionon');
    expect(matchIntent('PSE FUNKSIONON KETU').id).toBe('pse_funksionon');
    expect(matchIntent('Ma përshtat me kapital më të vogël.')).toEqual({ id: 'kapital_me_i_vogel', amount: null });
    expect(matchIntent('Dua një version me më pak kapital, 2 500')).toEqual({ id: 'kapital_me_i_vogel', amount: 2500 });
    expect(matchIntent('Krahasoje me një shtet tjetër, p.sh. Kosova.')).toEqual({ id: 'krahaso', countryQuery: 'nje shtet tjeter, p.sh. kosova' });
    expect(matchIntent('krahaso me Italinë')).toEqual({ id: 'krahaso', countryQuery: 'italine' });
    expect(matchIntent('Çfarë duhet të verifikoj sot?')).toEqual({ id: 'verifiko_sot', days: 1 });
    expect(matchIntent('Çfarë duhet të verifikoj këtë javë?')).toEqual({ id: 'verifiko_sot', days: 7 });
    expect(matchIntent('Çfarë ndodh nëse kostot rriten 15%?')).toEqual({ id: 'kostot_rriten', percent: 15, targets: ['fikse', 'variabel'] });
    expect(matchIntent('nëse kostot fikse rriten')).toEqual({ id: 'kostot_rriten', percent: 20, targets: ['fikse'] });
    expect(matchIntent('Cili supozim është më i dobëti?').id).toBe('supozimi_me_i_dobet');
    expect(matchIntent('Si është moti nesër?').id).toBe('ndihme');
  });
});

describe('runAssistant without an API key (deterministic answers)', () => {
  it('answers "costs rise X%" with the engine numbers', async () => {
    const { reply } = await ask('Çfarë ndodh nëse kostot rriten 15%?');
    expect(reply.mode).toBe('pa_ai');
    expect(reply.missingConfigSq).toBe(MISSING_KEY_SQ);
    expect(reply.toolCalls).toEqual([{ name: 'run_financial_scenario', ok: true }]);
    const inputs = makeInputs();
    const before = projectScenario(inputs, 'baze');
    const after = projectScenario(applyShock(inputs, { fixedCostPct: 15, variableCostPct: 15 }), 'baze');
    const byLabel = new Map(reply.calculations?.map((c) => [c.labelSq, c]));
    expect(byLabel.get('Të ardhurat totale')).toMatchObject({ before: before.totals.revenue, after: after.totals.revenue, scenario: 'baze', currency: 'USD' });
    expect(byLabel.get('Rezultati operativ total')).toMatchObject({ before: before.totals.operatingResult, after: after.totals.operatingResult });
    expect(byLabel.get('Gjendja më e ulët e parasë')).toMatchObject({ before: before.minCashBalance, after: after.minCashBalance });
    expect(byLabel.get('Kapitali i nevojshëm')).toMatchObject({ before: before.capital.totalRequired, after: after.capital.totalRequired });
    expect(reply.replySq).toContain('kostot fikse mujore +15%');
    expect(reply.citations).toEqual([]);
  });

  it('uses 20% when no percentage is given', async () => {
    const { reply } = await ask('Po nëse kostot rriten?');
    const inputs = makeInputs();
    const after = projectScenario(applyShock(inputs, { fixedCostPct: 20, variableCostPct: 20 }), 'baze');
    expect(reply.calculations?.find((c) => c.labelSq === 'Rezultati operativ total')?.after).toBe(after.totals.operatingResult);
  });

  it('adapts to a lower capital: 50% of the current requirement by default, or the stated amount', async () => {
    const inputs = makeInputs();
    const current = projectScenario(inputs, 'baze').capital.totalRequired;
    const { reply } = await ask('Ma përshtat me kapital më të vogël.');
    const expected = adaptToLowerCapital(archetype, makeProfile(), inputs, current * 0.5);
    const capital = reply.calculations?.find((c) => c.labelSq === 'Kapitali i nevojshëm');
    expect(capital).toMatchObject({ before: current, after: expected.resultingTotal });
    expect(reply.replySq).toContain('50% e kapitalit të nevojshëm aktual');
    for (const change of expected.changesSq) expect(reply.replySq).toContain(change);

    const { reply: withAmount } = await ask('Ma përshtat me kapital 300');
    const expected300 = adaptToLowerCapital(archetype, makeProfile(), inputs, 300);
    expect(withAmount.calculations?.find((c) => c.labelSq === 'Kapitali i nevojshëm')?.after).toBe(expected300.resultingTotal);
    expect(withAmount.replySq).toContain(expected300.noteSq);
  });

  it('compares with another country by Albanian name, with citations only from stored data', async () => {
    const { reply } = await ask('Krahasoje me Kosovën');
    expect(reply.toolCalls).toEqual([{ name: 'compare_country', ok: true }]);
    const store = standardStore();
    const [alb, xkx] = await Promise.all([getCountryDataContext(store.data, 'ALB', NOW), getCountryDataContext(store.data, 'XKX', NOW)]);
    const expected = compareCountriesForIdea(archetype, makeProfile(), [alb!, xkx!], { weights: DEFAULT_SCORE_WEIGHTS, now: NOW });
    for (const row of expected.rows) expect(reply.replySq).toContain(row.nameSq);
    expect(reply.citations.length).toBeGreaterThan(0);
    for (const c of reply.citations) expect(knownUrls.has(c.url)).toBe(true);
    expectConsistentCitations(reply);
    // A value that is not stored is reported as missing, never as zero.
    expect(reply.replySq).toContain('mungon');
  });

  it('reports an unknown country instead of guessing', async () => {
    const { reply } = await ask('Krahasoje me Atlantidën');
    expect(reply.toolCalls).toEqual([{ name: 'compare_country', ok: false }]);
    expect(reply.replySq).toContain('nuk u gjet');
  });

  it('lists what to verify today: due tasks, local-verification notes and official links', async () => {
    const { reply } = await ask('Çfarë duhet të verifikoj sot?');
    expect(reply.toolCalls).toEqual([{ name: 'list_tasks_due', ok: true }]);
    expect(reply.replySq).toContain('Detyrë sintetike 1 — Për t’u bërë, me vonesë');
    expect(reply.replySq).toContain('Detyrë sintetike 2');
    expect(reply.replySq).not.toContain('Detyrë sintetike 3');
    expect(reply.replySq).not.toContain('Detyrë sintetike 4');
    expect(reply.replySq).toContain('Kërkon verifikim lokal.');
    expect(reply.replySq).toContain('Asnjë intervistë me klientë');
    for (const c of reply.citations) expect(getOfficialLinks('ALB').map((l) => l.url)).toContain(c.url);
    expectConsistentCitations(reply);
  });

  it('names the weakest assumption from the sensitivity analysis', async () => {
    const { reply } = await ask('Cili supozim është më i dobëti?');
    const top = sensitivityAnalysis(makeInputs(), 'baze', 20)[0];
    expect(reply.replySq).toContain(`Supozimi më i dobët: ${top.labelSq} (${top.changeSq})`);
    expect(reply.replySq).toContain('Kosto që janë ende supozim');
  });

  it('explains why the idea could work with the engine claims and their citations', async () => {
    const { reply } = await ask('Pse kjo ide ka kuptim këtu?');
    expect(reply.toolCalls).toEqual([{ name: 'get_project_summary', ok: true }]);
    expect(reply.replySq).toContain(archetype.whyItCouldWork.changeSq);
    expect(reply.replySq).toContain('jo probabilitet suksesi');
    const store = standardStore();
    const ctx = await getCountryDataContext(store.data, 'ALB', NOW);
    const rec = evaluateIdea(archetype, makeProfile(), ctx!, { weights: DEFAULT_SCORE_WEIGHTS, now: NOW });
    const engineUrls = new Set([...rec.claims.whyWork, ...rec.claims.macro].flatMap((c) => c.citations.map((x) => x.url)));
    for (const c of reply.citations) expect(engineUrls.has(c.url)).toBe(true);
    expectConsistentCitations(reply);
  });

  it('answers unknown questions with the list of supported questions', async () => {
    const { reply } = await ask('Si është moti nesër?');
    expect(reply.toolCalls).toEqual([]);
    expect(reply.replySq).toContain('„Krahasoje me Kosovën”');
    expect(reply.replySq).toContain('„Çfarë duhet të verifikoj sot?”');
  });

  it('explains which questions need a project when none is selected', async () => {
    const { reply } = await ask('Çfarë ndodh nëse kostot rriten 20%?', { projectId: null });
    expect(reply.toolCalls).toEqual([]);
    expect(reply.replySq).toContain('kërkon një projekt të zgjedhur');
    expect(reply.replySq).toContain('supozimi më i dobët');
    const { reply: help } = await ask('Përshëndetje', { projectId: null });
    expect(help.replySq).toContain('Të gjitha këto kërkojnë një projekt të zgjedhur');
  });

  it('persists the exchange in the project thread', async () => {
    const { reply, store } = await ask('Cili supozim është më i dobëti?');
    expect(store.state.chat).toEqual([
      { userId: USER_ID, projectId: PROJECT_ID, message: { role: 'user', content: 'Cili supozim është më i dobëti?' } },
      { userId: USER_ID, projectId: PROJECT_ID, message: { role: 'assistant', content: reply.replySq } },
    ]);
  });

  it('treats another user’s project as not found, without leaking or storing anything', async () => {
    const { reply, store } = await ask('Pse kjo ide ka kuptim këtu?', { projectId: FOREIGN_PROJECT_ID });
    expect(reply).toEqual({ mode: 'pa_ai', replySq: PROJECT_NOT_FOUND_SQ, citations: [], missingConfigSq: MISSING_KEY_SQ });
    expect(JSON.stringify(reply)).not.toContain(FOREIGN_NOTES);
    expect(store.state.chat).toEqual([]);
  });

  it('works with the demo economies in demo mode and labels them', async () => {
    const { reply } = await ask('Krahasoje me ZZB', { projectId: DEMO_PROJECT_ID, demoMode: true });
    expect(reply.toolCalls).toEqual([{ name: 'compare_country', ok: true }]);
    expect(reply.replySq).toContain('DEMO');
    for (const c of reply.citations) expect(c.isDemo).toBe(true);
  });
});
