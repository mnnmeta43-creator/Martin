/**
 * Përgjigjet pa AI (kur mungon ANTHROPIC_API_KEY): njohje deterministe e qëllimit + mjetet e aplikacionit.
 *
 * The question is normalised (case, ë/ç) and matched against a small set of intents. Each intent
 * runs the same tools the AI uses, so every number and citation comes from the deterministic
 * engines and stored data, exactly as in the AI path. Unknown questions get a help text listing
 * what works without AI. Nothing here imitates free conversation.
 */
import type { CitationRegistry } from '@/lib/ai/citations';
import type { AssistantContext } from '@/lib/ai/context';
import { executeTool, type ToolExecution, type ToolInput, type ToolName } from '@/lib/ai/tools';
import type { AssistantCalculation } from '@/lib/ai/handlers/shared';
import type { adaptToCapital, runFinancialScenario } from '@/lib/ai/handlers/finance';
import type { compareCountry } from '@/lib/ai/handlers/country';
import type { getProjectSummary, listTasksDue, listWeakestAssumptions } from '@/lib/ai/handlers/project';
import { normalizeQuery, parseAmount, parseDays, parsePercent } from '@/lib/ai/text';

export const MISSING_KEY_SQ =
  'ANTHROPIC_API_KEY mungon — biseda e lirë me AI është e çaktivizuar. Përgjigjet më poshtë janë llogaritje deterministe të aplikacionit, jo AI.';

export const DEFAULT_COST_INCREASE_PCT = 20;
export const DEFAULT_CAPITAL_SHARE = 0.5;

export type CostTarget = 'fikse' | 'variabel' | 'fillestare';

export type FallbackIntent =
  | { id: 'pse_funksionon' }
  | { id: 'kapital_me_i_vogel'; amount: number | null }
  | { id: 'krahaso'; countryQuery: string }
  | { id: 'verifiko_sot'; days: number }
  | { id: 'kostot_rriten'; percent: number; targets: CostTarget[] }
  | { id: 'supozimi_me_i_dobet' }
  | { id: 'ndihme' };

const HELP_LINES_SQ = [
  '• „Pse kjo ide ka kuptim këtu?”',
  '• „Ma përshtat me kapital më të vogël” (ose me një shumë, p.sh. „me kapital 3000”)',
  '• „Krahasoje me Kosovën”',
  '• „Çfarë duhet të verifikoj sot?”',
  '• „Çfarë ndodh nëse kostot rriten 20%?”',
  '• „Cili është supozimi më i dobët?”',
];

const PROJECT_INTENTS_SQ = [
  '• pse ideja ka kuptim në vendin e projektit',
  '• përshtatja me kapital më të vogël',
  '• krahasimi me një shtet tjetër',
  '• çfarë të verifikoni sot',
  '• çfarë ndodh nëse kostot rriten',
  '• supozimi më i dobët',
];

/** Text after "krahaso… me" (or after the verb when "me" is missing): where the country name is. */
function countryQueryOf(normalized: string): string {
  const afterVerb = normalized.replace(/^.*?\b(krahas\w*|compare)\b/, '');
  const withMe = /\b(?:me|with)\b\s+(.+)$/.exec(afterVerb);
  return (withMe ? withMe[1] : afterVerb).replace(/[?!.]+$/, '').trim();
}

function costTargetsOf(normalized: string): CostTarget[] {
  const targets: CostTarget[] = [];
  if (/\bfiks/.test(normalized)) targets.push('fikse');
  if (/\bvariab|\bper njesi\b/.test(normalized)) targets.push('variabel');
  if (/\b(fillestar|investim|hapj)/.test(normalized)) targets.push('fillestare');
  return targets.length > 0 ? targets : ['fikse', 'variabel'];
}

/** Deterministic intent matcher over the normalised question (specific intents first). */
export function matchIntent(text: string): FallbackIntent {
  const q = normalizeQuery(text);
  if (/\b(krahas\w*|compare)\b/.test(q)) return { id: 'krahaso', countryQuery: countryQueryOf(q) };
  if (/\b(kapital|buxhet)\w*/.test(q) && (/\b(me (te |i )?(vogel|pak|ulet)|vetem|pershtat|zvogel|ul|ule|reduk)/.test(q) || parseAmount(q) !== null)) {
    return { id: 'kapital_me_i_vogel', amount: parseAmount(q) };
  }
  if (/\b(kosto|shpenzim)\w*/.test(q) && /\b(rrit|shtoh|ngjit)\w*/.test(q)) {
    return { id: 'kostot_rriten', percent: parsePercent(q) ?? DEFAULT_COST_INCREASE_PCT, targets: costTargetsOf(q) };
  }
  if (/\bverifik\w*/.test(q)) {
    return { id: 'verifiko_sot', days: Math.min(7, Math.max(1, parseDays(q) ?? (/\bsot\b/.test(q) ? 1 : 7))) };
  }
  if (/\bsupozim\w*/.test(q) && /\b(dobet|rrezik|pasigurt|paqart)\w*/.test(q)) return { id: 'supozimi_me_i_dobet' };
  if (/\b(me i dobeti|me te dobetin?)\b/.test(q)) return { id: 'supozimi_me_i_dobet' };
  if (/\b(pse|why)\b/.test(q) && /\b(kuptim|funksion|ia vlen|logjik|sens|work|ka mundesi)\w*/.test(q)) return { id: 'pse_funksionon' };
  return { id: 'ndihme' };
}

export interface FallbackResult {
  text: string;
  toolCalls: { name: string; ok: boolean }[];
  calculations: AssistantCalculation[];
}

type Data<F extends (...args: never[]) => unknown> = Awaited<ReturnType<F>>;

class ToolRunner {
  readonly toolCalls: { name: string; ok: boolean }[] = [];
  readonly calculations: AssistantCalculation[] = [];

  constructor(
    private readonly ctx: AssistantContext,
    private readonly registry: CitationRegistry,
  ) {}

  async run<N extends ToolName>(name: N, input: ToolInput<N>): Promise<ToolExecution> {
    const execution = await executeTool(name, input, this.ctx, this.registry);
    this.toolCalls.push({ name, ok: execution.ok });
    this.calculations.push(...execution.calculations);
    return execution;
  }
}

function errorOf(execution: ToolExecution): string {
  const data = execution.data as { error?: string } | null;
  return data?.error ?? 'Llogaritja nuk u krye.';
}

function refs(ids: string[]): string {
  return ids.map((id) => `[${id}]`).join('');
}

function withRef(text: string, id: string | null): string {
  return id ? `${text} [${id}]` : text;
}

function claimLine(c: { textSq: string; citations: string[]; kindSq: string; labelSq: string }): string {
  const markers = refs(c.citations);
  return `• ${c.textSq}${markers ? ` ${markers}` : ''} (${c.kindSq}; ${c.labelSq})`;
}

function renderWhy(data: Data<typeof getProjectSummary>): string {
  const idea = data.idea;
  const lines = [`Pse „${idea?.nameSq ?? data.project.title}” mund të ketë kuptim në ${data.project.countryNameSq}${data.project.isDemo ? ' (DEMO — të dhëna fiktive)' : ''}:`];
  if (data.analysis) {
    lines.push('', 'Çfarë thonë treguesit makro:');
    if (data.analysis.macro.length === 0) lines.push('• Nuk ka tregues të lidhur me vlera të ruajtura për këtë vend.');
    for (const c of data.analysis.macro.slice(0, 4)) lines.push(claimLine(c));
    lines.push('', 'Pse mund të funksionojë (analiza e aplikacionit):');
    for (const c of data.analysis.whyWork.slice(0, 6)) lines.push(claimLine(c));
  } else if (idea) {
    const w = idea.whyItCouldWork;
    lines.push(
      '',
      data.analysisNoteSq ?? '',
      'Arsyetimi i bibliotekës së ideve (supozim, jo fakt):',
      `• Ndryshimi: ${w.changeSq}`,
      `• Problemi: ${w.problemSq}`,
      `• Klienti: ${w.customerSq}`,
      `• Arsyeja për të paguar: ${w.reasonToPaySq}`,
      `• Kushtet për fitim: ${w.profitConditionsSq}`,
    );
  }
  if (idea && idea.falsifiersSq.length > 0) lines.push('', `Çfarë mund ta rrëzojë: ${idea.falsifiersSq.slice(0, 2).join(' ')}`);
  const total = data.analysis?.score.total;
  lines.push(
    '',
    `${typeof total === 'number' ? `Pikët (${Math.round(total)}/100) janë` : 'Pikët janë'} mjet orientimi, jo probabilitet suksesi. Asnjë fitim nuk është i garantuar.`,
  );
  return lines.join('\n');
}

function renderAdapt(data: Data<typeof adaptToCapital>, defaulted: boolean): string {
  const lines = [
    'Përshtatja me kapital më të vogël (motori financiar, skenari bazë):',
    `• Kapitali i nevojshëm tani: ${data.currentRequiredSq}`,
    `• Objektivi: ${data.targetCapitalSq}${defaulted ? ' (50% e kapitalit të nevojshëm aktual, sepse pyetja nuk përmbante shumë)' : ` (në monedhën e projektit, ${data.currency})`}`,
    '',
    'Ndryshimet e sugjeruara:',
  ];
  if (data.changesSq.length === 0) lines.push('• Asnjë zë nuk u ul.');
  data.changesSq.forEach((c, i) => lines.push(`${i + 1}. ${c}`));
  lines.push(
    '',
    `Rezultati: ${data.resultingTotalSq} — ${data.reachesTarget ? 'brenda objektivit.' : 'ende mbi objektivin.'}`,
    data.noteSq,
    ...(data.profileNoteSq ? [data.profileNoteSq] : []),
    '',
    `Test me kapital minimal (supozim i bibliotekës): ${data.lowCapitalTest.zeroCapitalTestSq}`,
    '',
    data.disclaimerSq,
  );
  return lines.join('\n');
}

function renderCompare(data: Data<typeof compareCountry>): string {
  const names = data.rows.map((r) => r.nameSq).join(' – ');
  const lines = [`Krahasim për „${data.archetypeNameSq}” (${names}):`];
  for (const r of data.rows) {
    const score = r.score.total === null ? 'nuk vlerësohen' : `${Math.round(r.score.total)}/100 (u vlerësua ${Math.round(r.score.assessedWeightPct)}% e peshave)`;
    lines.push(
      '',
      `${r.nameSq}${r.isDemo ? ' (DEMO — fiktive)' : ''}:`,
      `• Pikët orientuese: ${score}`,
      `• Kapitali i nevojshëm: ${r.capitalRange?.rangeSq ?? 'mungon (nuk ka kurs këmbimi të ruajtur)'}`,
      `• Pretendime makro të mbështetura / të kundërshtuara: ${r.supportedMacroClaims} / ${r.contradictedMacroClaims}`,
      `• ${withRef(`Fuqia blerëse (PBB për frymë, PPP): ${r.purchasingPower.value === null ? 'mungon' : r.purchasingPower.valueSq}${r.purchasingPower.period ? ` (${r.purchasingPower.period})` : ''}`, r.purchasingPower.citation)}`,
      `• ${withRef(`Niveli i çmimeve: ${r.priceLevel.value === null ? 'mungon' : r.priceLevel.valueSq}${r.priceLevel.period ? ` (${r.priceLevel.period})` : ''}`, r.priceLevel.citation)}`,
      `• Mbulimi i të dhënave: ${r.coverageSq}`,
      `• E drejta për të operuar: ${r.operabilitySq}`,
    );
    for (const w of r.warningsSq.slice(0, 1)) lines.push(`• Kujdes: ${w}`);
  }
  for (const w of data.warningsSq.slice(0, 2)) lines.push(`Kujdes: ${w}`);
  if (data.profileNoteSq) lines.push(data.profileNoteSq);
  lines.push('', data.noteSq, data.scoreNoteSq);
  return lines.join('\n');
}

function renderTasks(data: Data<typeof listTasksDue>, title: string): string {
  const when = data.horizonDays === 1 ? 'sot' : `në ${data.horizonDays} ditët e ardhshme`;
  const lines = [`Çfarë të verifikoni ${when} për „${title}” (dita ${data.planDay} e planit):`, '', 'Detyrat e hapura:'];
  if (data.dueTasks.length === 0) {
    lines.push('• Asnjë detyrë e hapur për këtë periudhë.');
    if (data.nextTasks.length > 0) lines.push(`• Detyrat e radhës: ${data.nextTasks.map((t) => `${t.titleSq} (dita ${t.startDay})`).join('; ')}`);
  }
  for (const t of data.dueTasks) lines.push(`• ${t.titleSq} — ${t.statusSq}${t.overdue ? ', me vonesë' : ''}. Prova: ${t.proofSq}`);
  if (data.dueTasksOmitted > 0) lines.push(`• … dhe ${data.dueTasksOmitted} të tjera.`);
  lines.push('', 'Për t’u verifikuar:');
  for (const v of data.toVerify.slice(0, 10)) lines.push(`• ${v.textSq}${v.noteSq ? ` ${v.noteSq}` : ''}`);
  if (data.officialLinks.length > 0) {
    lines.push('', `Lidhje zyrtare për verifikim: ${data.officialLinks.map((l) => withRef(l.nameSq, l.citation)).join('; ')}`);
  }
  if (data.plan) lines.push('', `Plani: ${Math.floor(data.plan.completionPct)}% i përfunduar (${data.plan.noteSq}).`);
  return lines.join('\n');
}

function renderCosts(data: Data<typeof runFinancialScenario>): string {
  const lines = [`Nëse ${data.shockSq} (skenari ${data.scenarioSq}, ${data.horizonMonths} muaj):`];
  for (const m of data.metrics) lines.push(`• ${m.labelSq}: ${m.beforeSq} → ${m.afterSq} (${m.changeSq})`);
  if (data.minCashMonth.after !== null) lines.push(`• Arka më e ulët pas ndryshimit bie në muajin ${data.minCashMonth.after}.`);
  lines.push('', `Rikuperimi: ${data.paybackStatementSq.after}`, '', data.noteSq);
  return lines.join('\n');
}

function renderWeakest(data: Data<typeof listWeakestAssumptions>): string {
  const lines = [`Supozimi më i dobët: ${data.weakestSq ?? 'nuk u llogarit.'}`, '', 'Renditja sipas ndikimit (ndryshim 20%, skenari bazë):'];
  data.sensitivity.slice(0, 4).forEach((s, i) =>
    lines.push(`${i + 1}. ${s.labelSq} (${s.changeSq}): arka më e ulët ${s.impactMinCashSq}; rezultati neto ${s.impactNetResultSq}`),
  );
  const unverified = data.unverifiedCostLines;
  lines.push('', `Kosto që janë ende supozim: ${unverified.items.length + unverified.omitted} nga ${data.costLinesCount}.`);
  for (const l of unverified.items.slice(0, 5)) lines.push(`• ${l.labelSq}: ${l.amountSq}`);
  const u = data.unitAssumptions;
  lines.push('', `Çmimi (${u.pricePerUnitSq} për ${u.unitLabelSq}) dhe ritmi i klientëve janë supozime derisa t’i provoni me klientë.`);
  if (data.macroLinksWithoutData.length > 0) {
    lines.push(`Të dhëna makro që mungojnë ose janë të vjetra: ${data.macroLinksWithoutData.map((g) => `${g.nameSq} (${g.statusSq})`).join('; ')}.`);
  }
  lines.push('', 'Hapi tjetër: verifikoni së pari supozimin me ndikimin më të madh, me klientë ose oferta reale.');
  return lines.join('\n');
}

function helpText(hasProject: boolean): string {
  const lines = ['Pa çelës AI mund të përgjigjem vetëm me llogaritjet e aplikacionit. Provoni një nga këto pyetje:', ...HELP_LINES_SQ];
  if (!hasProject) lines.push('', 'Të gjitha këto kërkojnë një projekt të zgjedhur: zgjidhni ose ruani një projekt.');
  return lines.join('\n');
}

function noProjectText(): string {
  return [
    'Kjo pyetje kërkon një projekt të zgjedhur. Zgjidhni një projekt sipër ose ruani një ide si projekt; pa projekt mund të shihni profilin dhe idetë.',
    'Pyetjet që kërkojnë projekt:',
    ...PROJECT_INTENTS_SQ,
  ].join('\n');
}

async function answer(intent: FallbackIntent, ctx: AssistantContext, tools: ToolRunner): Promise<string> {
  switch (intent.id) {
    case 'pse_funksionon': {
      const r = await tools.run('get_project_summary', {});
      return r.ok ? renderWhy(r.data as Data<typeof getProjectSummary>) : errorOf(r);
    }
    case 'kapital_me_i_vogel': {
      const current = ctx.baseProjection?.capital.totalRequired ?? 0;
      const target = intent.amount ?? current * DEFAULT_CAPITAL_SHARE;
      if (!(target > 0)) return 'Kapitali i nevojshëm i projektit është zero, prandaj nuk ka çfarë të ulet.';
      const r = await tools.run('adapt_to_capital', { targetCapital: target });
      return r.ok ? renderAdapt(r.data as Data<typeof adaptToCapital>, intent.amount === null) : errorOf(r);
    }
    case 'krahaso': {
      if (!intent.countryQuery) return 'Me cilin shtet doni ta krahasoni? Shkruani p.sh. „Krahasoje me Kosovën”.';
      const r = await tools.run('compare_country', { countryCode: intent.countryQuery });
      return r.ok ? renderCompare(r.data as Data<typeof compareCountry>) : errorOf(r);
    }
    case 'verifiko_sot': {
      const r = await tools.run('list_tasks_due', { days: intent.days });
      return r.ok ? renderTasks(r.data as Data<typeof listTasksDue>, ctx.project?.title ?? '') : errorOf(r);
    }
    case 'kostot_rriten': {
      const shock = {
        ...(intent.targets.includes('fikse') ? { fixedCostPct: intent.percent } : {}),
        ...(intent.targets.includes('variabel') ? { variableCostPct: intent.percent } : {}),
        ...(intent.targets.includes('fillestare') ? { startupCostPct: intent.percent } : {}),
      };
      const r = await tools.run('run_financial_scenario', { scenario: 'baze', shock });
      return r.ok ? renderCosts(r.data as Data<typeof runFinancialScenario>) : errorOf(r);
    }
    case 'supozimi_me_i_dobet': {
      const r = await tools.run('list_weakest_assumptions', {});
      return r.ok ? renderWeakest(r.data as Data<typeof listWeakestAssumptions>) : errorOf(r);
    }
    case 'ndihme':
      return helpText(Boolean(ctx.project));
  }
}

/** Answers one question deterministically; citations are registered in `registry` by the tools. */
export async function runFallback(ctx: AssistantContext, question: string, registry: CitationRegistry): Promise<FallbackResult> {
  const intent = matchIntent(question);
  const tools = new ToolRunner(ctx, registry);
  if (intent.id !== 'ndihme' && !ctx.project) return { text: noProjectText(), toolCalls: [], calculations: [] };
  const text = await answer(intent, ctx, tools);
  return { text, toolCalls: tools.toolCalls, calculations: tools.calculations };
}
