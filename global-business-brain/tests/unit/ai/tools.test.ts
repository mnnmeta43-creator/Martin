// SYNTHETIC — format mirrors the documented API; values are not real
/**
 * Every tool executor against direct calls to the deterministic engines: the assistant must report
 * exactly the numbers the engines compute, cite only stored data, and keep missing values missing.
 */
import { describe, expect, it } from 'vitest';
import type { Citation } from '@/lib/domain/types';
import { DEFAULT_SCORE_WEIGHTS } from '@/lib/domain/taxonomy';
import { CitationRegistry } from '@/lib/ai/citations';
import { executeTool, TOOL_DEFINITIONS, TOOL_NAMES, toolResultContent, type ToolExecution } from '@/lib/ai/tools';
import { NO_PROJECT_SQ } from '@/lib/ai/handlers/shared';
import { applyShock, projectScenario, sensitivityAnalysis } from '@/lib/finance/engine';
import { adaptToLowerCapital } from '@/lib/ideas/adapt';
import { compareCountriesForIdea } from '@/lib/ideas/compareForIdea';
import { evaluateIdea } from '@/lib/ideas/engine';
import { getArchetype } from '@/lib/ideas/archetypes';
import { getCountryDataContext } from '@/lib/data/context';
import { getOfficialLinks } from '@/lib/data/sources/registry';
import {
  ARCHETYPE_ID,
  createFakeStore,
  loadContext,
  makeInputs,
  makeProfile,
  makeProject,
  NOW,
  standardStore,
  SYNTHETIC_URL,
  unwrap,
} from './helpers';

const archetype = getArchetype(ARCHETYPE_ID)!;

async function run(name: string, input: unknown, opts: { projectId?: string | null; demoMode?: boolean; registry?: CitationRegistry } = {}) {
  const store = standardStore();
  const ctx = await loadContext(store, opts);
  const registry = opts.registry ?? new CitationRegistry();
  const execution = await executeTool(name, input, ctx, registry);
  return { execution, registry, store, ctx };
}

/** Citation object behind an id the tool data references. */
function citationOf(execution: ToolExecution, id: string | null): Citation | undefined {
  if (id === null) return undefined;
  const index = execution.citationIds.indexOf(id);
  return index < 0 ? undefined : execution.citations[index];
}

// Loose views of tool data, so assertions read naturally without re-declaring every handler type.
type AnyData = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

describe('tool definitions', () => {
  it('exposes the eight tools of the spec in a fixed order, with object JSON schemas', () => {
    expect(TOOL_NAMES).toEqual([
      'get_profile',
      'get_project_summary',
      'get_country_indicators',
      'run_financial_scenario',
      'compare_country',
      'adapt_to_capital',
      'list_weakest_assumptions',
      'list_tasks_due',
    ]);
    for (const def of TOOL_DEFINITIONS) {
      expect(def.input_schema.type).toBe('object');
      expect(def.description?.length ?? 0).toBeGreaterThan(40);
    }
    const scenario = TOOL_DEFINITIONS.find((d) => d.name === 'run_financial_scenario')!;
    expect(Object.keys((scenario.input_schema.properties as AnyData).shock.properties)).toEqual(
      expect.arrayContaining(['fixedCostPct', 'variableCostPct', 'pricePct', 'startupCostPct', 'collectionDaysDelta', 'newCustomersPct']),
    );
  });
});

describe('executeTool validation', () => {
  it('rejects unknown tools and invalid input without running a handler', async () => {
    const unknown = await run('delete_project', {});
    expect(unknown.execution).toMatchObject({ ok: false, citations: [], calculations: [] });
    expect((unknown.execution.data as AnyData).error).toContain('Mjet i panjohur');

    const invalid = await run('list_tasks_due', { days: 'shume' });
    expect(invalid.execution.ok).toBe(false);
    expect((invalid.execution.data as AnyData).error).toBe('Hyrje e pavlefshme për mjetin.');
    expect((invalid.execution.data as AnyData).issues[0]).toContain('days');

    const outOfRange = await run('run_financial_scenario', { shock: { fixedCostPct: 5000 } });
    expect(outOfRange.execution.ok).toBe(false);
    expect(outOfRange.execution.calculations).toEqual([]);
  });

  it('refuses project tools when no project is selected', async () => {
    for (const name of ['get_project_summary', 'run_financial_scenario', 'compare_country', 'adapt_to_capital', 'list_weakest_assumptions', 'list_tasks_due']) {
      const input = name === 'compare_country' ? { countryCode: 'XKX' } : name === 'adapt_to_capital' ? { targetCapital: 1 } : name === 'list_tasks_due' ? { days: 1 } : name === 'run_financial_scenario' ? { shock: {} } : {};
      const { execution } = await run(name, input, { projectId: null });
      expect(execution).toMatchObject({ ok: false, data: { error: NO_PROJECT_SQ } });
    }
  });
});

describe('get_profile', () => {
  it('returns the self-declared profile with Albanian labels', async () => {
    const { execution } = await run('get_profile', {});
    const data = execution.data as AnyData;
    expect(execution.ok).toBe(true);
    expect(data.profile.residenceCountry).toBe('ALB');
    expect(data.profile.capital).toMatchObject({ amount: 1111, currency: 'USD' });
    expect(data.noteSq).toContain('vetëdeklaruara');
    expect(execution.citations).toEqual([]);
  });

  it('says when the profile is missing', async () => {
    const store = createFakeStore({ projects: [makeProject()] });
    const ctx = await loadContext(store);
    const execution = await executeTool('get_profile', {}, ctx, new CitationRegistry());
    expect(execution.data).toEqual({ profile: null, noteSq: 'Profili nuk është plotësuar ende.' });
  });
});

describe('get_project_summary', () => {
  it('returns the engine claims with citation ids that resolve to the engine citations', async () => {
    const { execution, store } = await run('get_project_summary', {});
    const data = execution.data as AnyData;
    const ctx = await getCountryDataContext(store.data, 'ALB', NOW);
    const rec = evaluateIdea(archetype, makeProfile(), ctx!, { weights: DEFAULT_SCORE_WEIGHTS, now: NOW });
    expect(data.analysis.score.total).toBe(rec.score.total);
    expect(data.analysis.whyWork.map((c: AnyData) => c.textSq)).toEqual(rec.claims.whyWork.map((c) => c.textSq));
    data.analysis.macro.forEach((view: AnyData, i: number) => {
      expect(view.citations.map((id: string) => citationOf(execution, id)?.url)).toEqual(rec.claims.macro[i].citations.map((c) => c.url));
    });
    expect(execution.citationIds).toEqual(execution.citationIds.map((_, i) => `c${i + 1}`));
    // No financial projection here: numbers come only from run_financial_scenario.
    expect(data.financeNoteSq).toContain('run_financial_scenario');
    expect(JSON.stringify(data)).not.toContain('totalRequired');
  });
});

describe('get_country_indicators', () => {
  it('returns stored values with citations and keeps missing indicators missing', async () => {
    const { execution, store } = await run('get_country_indicators', { indicatorCodes: ['internet_users_pct', 'gdp_growth', 'nuk_ekziston'] });
    const data = execution.data as AnyData;
    const ctx = await getCountryDataContext(store.data, 'ALB', NOW);
    const internet = ctx!.series.find((s) => s.definition.code === 'internet_users_pct')!;
    expect(data.countryCode).toBe('ALB');
    expect(data.unknownIndicatorCodes).toEqual(['nuk_ekziston']);
    const [internetRow, growthRow] = data.indicators;
    expect(internetRow.latest).toMatchObject({ value: internet.latest!.value, period: internet.latest!.period });
    expect(internetRow.latest.value).toBe(11.11);
    expect(citationOf(execution, internetRow.latest.citation)).toMatchObject({ url: `${SYNTHETIC_URL}/alb-internet`, period: '2024', value: 11.11 });
    expect(growthRow).toMatchObject({ code: 'gdp_growth', status: 'mungon', latest: null, nextProjection: null });
    expect(execution.citations.map((c) => c.url)).toEqual([`${SYNTHETIC_URL}/alb-internet`]);
    expect(data.noteSq).toContain('jo të drejtpërdrejta');
  });

  it('resolves another country by Albanian name and refuses unknown or demo-only countries', async () => {
    const { execution } = await run('get_country_indicators', { countryCode: 'Kosova', indicatorCodes: ['internet_users_pct'] });
    expect((execution.data as AnyData).countryCode).toBe('XKX');
    expect((execution.data as AnyData).indicators[0].latest.value).toBe(22.22);

    const unknown = await run('get_country_indicators', { countryCode: 'Atlantida' });
    expect(unknown.execution.ok).toBe(false);
    expect((unknown.execution.data as AnyData).error).toContain('nuk u gjet');

    const demoOutsideDemoMode = await run('get_country_indicators', { countryCode: 'ZZA' });
    expect(demoOutsideDemoMode.execution.ok).toBe(false);
  });

  it('defaults to the indicators linked to the project idea', async () => {
    const { execution } = await run('get_country_indicators', {});
    expect((execution.data as AnyData).indicators.map((r: AnyData) => r.code)).toEqual(archetype.macroLinks.map((l) => l.indicatorCode));
  });
});

describe('run_financial_scenario', () => {
  it('reports before/after values identical to applyShock + projectScenario', async () => {
    const shock = { fixedCostPct: 25, pricePct: -10, collectionDaysDelta: 30 };
    const { execution, ctx } = await run('run_financial_scenario', { scenario: 'konservator', shock });
    const data = execution.data as AnyData;
    const inputs = makeInputs();
    const before = projectScenario(inputs, 'konservator');
    const after = projectScenario(applyShock(inputs, shock), 'konservator');
    const metric = (key: string) => data.metrics.find((m: AnyData) => m.key === key);
    expect(metric('totalRevenue')).toMatchObject({ before: before.totals.revenue, after: after.totals.revenue });
    expect(metric('operatingResult')).toMatchObject({ before: before.totals.operatingResult, after: after.totals.operatingResult });
    expect(metric('minCash')).toMatchObject({ before: before.minCashBalance, after: after.minCashBalance });
    expect(metric('capitalRequired')).toMatchObject({ before: before.capital.totalRequired, after: after.capital.totalRequired });
    expect(metric('breakEvenUnits')).toMatchObject({ before: before.unitEconomics.breakEvenUnitsPerMonth, after: after.unitEconomics.breakEvenUnitsPerMonth });
    expect(metric('paybackMonth')).toMatchObject({ before: before.payback.recoveredInMonth, after: after.payback.recoveredInMonth });
    expect(data.minCashMonth).toEqual({ before: before.minCashMonth, after: after.minCashMonth });
    expect(data.paybackStatementSq).toEqual({ before: before.payback.statementSq, after: after.payback.statementSq });
    expect(data.shockSq).toBe('kostot fikse mujore +25%, çmimi për njësi -10%, vonesa e arkëtimit nga klientët +30 ditë');
    // Only money metrics become calculations, all for the requested scenario and currency.
    expect(execution.calculations.map((c) => c.labelSq)).toEqual(['Të ardhurat totale', 'Rezultati operativ total', 'Gjendja më e ulët e parasë', 'Kapitali i nevojshëm']);
    for (const c of execution.calculations) expect(c).toMatchObject({ scenario: 'konservator', currency: 'USD' });
    // The project itself is never changed.
    expect(ctx.project!.financialInputs).toEqual(inputs);
  });

  it('defaults to the base scenario', async () => {
    const { execution } = await run('run_financial_scenario', { shock: { variableCostPct: 20 } });
    const after = projectScenario(applyShock(makeInputs(), { variableCostPct: 20 }), 'baze');
    expect((execution.data as AnyData).scenario).toBe('baze');
    expect(execution.calculations.find((c) => c.labelSq === 'Gjendja më e ulët e parasë')?.after).toBe(after.minCashBalance);
  });
});

describe('compare_country', () => {
  it('returns the rows of compareCountriesForIdea with citations from stored data', async () => {
    const { execution, store } = await run('compare_country', { countryCode: 'Kosovën' });
    const data = execution.data as AnyData;
    const [alb, xkx] = await Promise.all([getCountryDataContext(store.data, 'ALB', NOW), getCountryDataContext(store.data, 'XKX', NOW)]);
    const expected = compareCountriesForIdea(archetype, makeProfile(), [alb!, xkx!], { weights: DEFAULT_SCORE_WEIGHTS, now: NOW });
    expect(data.rows.map((r: AnyData) => r.countryCode)).toEqual(expected.rows.map((r) => r.countryCode));
    data.rows.forEach((row: AnyData, i: number) => {
      const e = expected.rows[i];
      expect(row.score.total).toBe(e.score.total);
      expect(row.supportedMacroClaims).toBe(e.supportedMacroClaims);
      expect(row.contradictedMacroClaims).toBe(e.contradictedMacroClaims);
      expect(row.capitalRange?.low ?? null).toBe(e.capitalRange?.low ?? null);
      expect(row.purchasingPower.value).toBe(e.purchasingPower.value);
      expect(row.priceLevel.value).toBe(e.priceLevel.value);
      if (row.priceLevel.citation) expect(citationOf(execution, row.priceLevel.citation)?.url).toBe(e.priceLevel.citation?.url);
    });
    // XKX has no stored PPP value: missing, uncited.
    const xkxRow = data.rows.find((r: AnyData) => r.countryCode === 'XKX');
    expect(xkxRow.purchasingPower).toMatchObject({ value: null, citation: null });
    for (const c of execution.citations) expect(c.url.startsWith(SYNTHETIC_URL)).toBe(true);
  });

  it('refuses to compare the project country with itself', async () => {
    const { execution } = await run('compare_country', { countryCode: 'Shqipëria' });
    expect(execution.ok).toBe(false);
    expect((execution.data as AnyData).error).toContain('vetë vendi i projektit');
  });
});

describe('adapt_to_capital', () => {
  it('returns exactly what adaptToLowerCapital computes and never changes the project', async () => {
    const { execution, ctx } = await run('adapt_to_capital', { targetCapital: 500 });
    const data = execution.data as AnyData;
    const inputs = makeInputs();
    const expected = adaptToLowerCapital(archetype, makeProfile(), inputs, 500);
    expect(data).toMatchObject({
      currentRequired: expected.initialTotal,
      resultingTotal: expected.resultingTotal,
      reachesTarget: expected.reachesTarget,
      changesSq: expected.changesSq,
      noteSq: expected.noteSq,
    });
    const capital = execution.calculations.find((c) => c.labelSq === 'Kapitali i nevojshëm');
    expect(capital).toEqual({
      labelSq: 'Kapitali i nevojshëm',
      scenario: 'baze',
      before: projectScenario(inputs, 'baze').capital.totalRequired,
      after: projectScenario(expected.inputs, 'baze').capital.totalRequired,
      currency: 'USD',
    });
    expect(ctx.project!.financialInputs).toEqual(inputs);
  });
});

describe('list_weakest_assumptions', () => {
  it('ranks drivers exactly like sensitivityAnalysis and lists unverified cost lines', async () => {
    const { execution } = await run('list_weakest_assumptions', {});
    const data = execution.data as AnyData;
    const inputs = makeInputs();
    const expected = sensitivityAnalysis(inputs, 'baze', 20);
    expect(data.sensitivity.map((s: AnyData) => [s.driver, s.impactMinCash])).toEqual(expected.map((s) => [s.driver, s.impactMinCash]));
    expect(data.weakestSq).toContain(expected[0].labelSq);
    const enabled = [...inputs.startupCosts, ...inputs.monthlyFixedCosts].filter((l) => l.enabled);
    const assumptions = enabled.filter((l) => l.sourceKind === 'supozim');
    expect(data.costLinesCount).toBe(enabled.length);
    expect(data.verifiedCostLinesCount).toBe(enabled.length - assumptions.length);
    expect(data.unverifiedCostLines.items.length + data.unverifiedCostLines.omitted).toBe(assumptions.length);
    // services_va_gdp and tourism_arrivals have no stored data for ALB in the fixture.
    expect(data.macroLinksWithoutData.map((g: AnyData) => g.indicatorCode)).toEqual(['services_va_gdp', 'tourism_arrivals']);
    expect(data.macroLinksWithoutData.every((g: AnyData) => g.status === 'mungon')).toBe(true);
  });
});

describe('list_tasks_due', () => {
  it('lists open tasks in the horizon, items to verify and official links with citations', async () => {
    const { execution } = await run('list_tasks_due', { days: 7 });
    const data = execution.data as AnyData;
    // Project created 2026-09-30, today 2026-10-02 → plan day 3; horizon ends at day offset 9.
    expect(data.planDay).toBe(3);
    expect(data.dueTasks.map((t: AnyData) => t.titleSq)).toEqual(['Detyrë sintetike 1', 'Detyrë sintetike 2', 'Detyrë sintetike 3']);
    expect(data.dueTasks[0].overdue).toBe(true);
    const regulation = data.toVerify.filter((v: AnyData) => v.kind === 'rregullore');
    expect(regulation.map((v: AnyData) => v.textSq)).toEqual(archetype.regulationNotesSq);
    for (const v of regulation) expect(`${v.textSq} ${v.noteSq ?? ''}`).toContain('erifik');
    expect(data.toVerify.some((v: AnyData) => v.kind === 'kosto_supozim')).toBe(true);
    expect(data.toVerify.some((v: AnyData) => v.kind === 'prove_qe_mungon')).toBe(true);
    const official = getOfficialLinks('ALB').slice(0, 6).map((c) => c.url);
    expect(data.officialLinks.map((l: AnyData) => citationOf(execution, l.citation)?.url)).toEqual(official);
  });
});

describe('citation numbering across tools', () => {
  it('keeps ids unique within one reply and wraps results as untrusted data without URLs', async () => {
    const store = standardStore();
    const ctx = await loadContext(store);
    const registry = new CitationRegistry();
    const first = await executeTool('get_country_indicators', { indicatorCodes: ['internet_users_pct', 'gdp_per_capita_ppp'] }, ctx, registry);
    const second = await executeTool('list_tasks_due', { days: 1 }, ctx, registry);
    const again = await executeTool('get_country_indicators', { indicatorCodes: ['internet_users_pct'] }, ctx, registry);
    expect(first.citationIds).toEqual(['c1', 'c2']);
    expect(second.citationIds[0]).toBe('c3');
    expect(new Set([...first.citationIds, ...second.citationIds]).size).toBe(first.citationIds.length + second.citationIds.length);
    // The same stored value keeps its id later in the reply.
    expect(again.citationIds).toEqual(['c1']);

    const content = toolResultContent(first);
    const parsed = unwrap(content);
    expect(parsed.ok).toBe(true);
    expect(parsed.citations.map((c) => c.id)).toEqual(['c1', 'c2']);
    expect(content).not.toContain('https://');
  });

  it('serves country indicators without a project (profile country)', async () => {
    const store = standardStore();
    const ctx = await loadContext(store, { projectId: null });
    const execution = await executeTool('get_country_indicators', { indicatorCodes: ['internet_users_pct'] }, ctx, new CitationRegistry());
    expect(execution.ok).toBe(true);
    expect((execution.data as AnyData).countryCode).toBe('ALB');
    expect(ctx.project).toBeNull();
  });
});
