/**
 * Mjetet e profilit dhe projektit: përmbledhja, supozimet më të dobëta dhe detyrat për t’u bërë.
 *
 * Text the user typed (project title, notes, evidence summaries, task notes, "other skills") is
 * passed through as data; the tool-result wrapper marks it untrusted. Library texts from the
 * archetype are labelled as assumptions ("supozim"), never as facts. Legal and licence notes always
 * carry "Kërkon verifikim lokal".
 */
import type { Claim, EvidenceEntry, MoneyLine, PlanTask, ProjectionResult } from '@/lib/domain/types';
import {
  BUSINESS_MODE_LABELS,
  CLAIM_KIND_LABELS,
  COVERAGE_LABELS,
  DATA_STATUS_LABELS,
  EVIDENCE_LABELS,
  EVIDENCE_TYPE_LABELS,
  MARKET_SCOPE_LABELS,
  MONTHLY_CATEGORY_LABELS,
  PHASE_TITLES,
  RISK_TOLERANCE_LABELS,
  SECTORS,
  START_LOCATION_LABELS,
  STARTUP_CATEGORY_LABELS,
  TASK_STATUS_LABELS,
  TEAM_MODE_LABELS,
  assetLabel,
  skillLabel,
} from '@/lib/domain/taxonomy';
import { sensitivityAnalysis } from '@/lib/finance/engine';
import { formatMoney } from '@/lib/finance/format';
import { getOfficialLinks } from '@/lib/data/sources/registry';
import { computeProgress } from '@/lib/plan/progress';
import { countryNameSq, recommendationFor, type AssistantContext } from '@/lib/ai/context';
import { capList, moneySq, requireArchetype, requireProject, signedMoneySq, type ToolEnv } from '@/lib/ai/handlers/shared';

const VERIFY_LOCALLY_SQ = 'Kërkon verifikim lokal.';
const DAY_MS = 86_400_000;
const STALE_OR_MISSING = new Set(['mungon', 'i_vjeter', 'shume_i_vjeter', 'gabim_burimi']);

export function getProfile(_input: Record<string, never>, env: ToolEnv) {
  const p = env.ctx.profile;
  if (!p) return { profile: null, noteSq: 'Profili nuk është plotësuar ende.' };
  return {
    profile: {
      residenceCountry: p.residenceCountry,
      residenceCountrySq: countryNameSq(p.residenceCountry),
      residenceCity: p.residenceCity ?? null,
      operableCountries: p.operableCountries.map((c) => ({ code: c, nameSq: countryNameSq(c) })),
      targetCountries: p.targetCountries.map((c) => ({ code: c, nameSq: countryNameSq(c) })),
      targetCity: p.targetCity ?? null,
      capital: { amount: p.capital.amount, currency: p.capital.currency, amountSq: moneySq(p.capital.amount, p.capital.currency) },
      skillsSq: p.skills.map(skillLabel),
      otherSkills: p.otherSkills ?? null,
      experienceYears: p.experienceYears,
      experienceSectorsSq: p.experienceSectors.map((s) => SECTORS[s] ?? s),
      hoursPerWeek: p.hoursPerWeek,
      assetsSq: p.assets.map(assetLabel),
      otherAssets: p.otherAssets ?? null,
      teamSq: TEAM_MODE_LABELS[p.teamMode],
      businessModesSq: p.businessModes.map((m) => BUSINESS_MODE_LABELS[m]),
      marketScopesSq: p.marketScopes.map((m) => MARKET_SCOPE_LABELS[m]),
      startLocationsSq: p.startLocations.map((s) => START_LOCATION_LABELS[s]),
      isAdult: p.isAdult,
      riskToleranceSq: RISK_TOLERANCE_LABELS[p.riskTolerance],
      ownerIncomeNeedMonthly: p.ownerIncomeNeedMonthly ?? null,
    },
    noteSq: 'Të dhëna të vetëdeklaruara nga përdoruesi, jo të verifikuara (p.sh. e drejta për të operuar në një vend).',
  };
}

function claimView(claim: Claim, env: ToolEnv) {
  return {
    kind: claim.kind,
    kindSq: CLAIM_KIND_LABELS[claim.kind],
    labelSq: EVIDENCE_LABELS[claim.label],
    textSq: claim.textSq,
    citations: claim.citations.map((c) => env.cite(c)).filter((id): id is string => id !== null),
  };
}

function evidenceView(entry: EvidenceEntry) {
  return {
    typeSq: EVIDENCE_TYPE_LABELS[entry.type],
    summary: entry.summarySq,
    quantity: entry.quantity ?? null,
    amount: entry.amount ?? null,
    source: entry.sourceSq,
    collectedAt: entry.collectedAt,
  };
}

function progressView(tasks: PlanTask[]) {
  if (tasks.length === 0) return null;
  const progress = computeProgress(tasks);
  return {
    completionPct: progress.completionPct,
    completedTasks: progress.completedTasks,
    totalTasks: progress.totalTasks,
    labelSq: progress.labelSq,
    noteSq: '% = përfundimi i planit, jo probabilitet suksesi.',
  };
}

export function getProjectSummary(_input: Record<string, never>, env: ToolEnv) {
  const { ctx } = env;
  const project = requireProject(ctx);
  const archetype = ctx.archetype;
  const rec = recommendationFor(ctx);
  const recent = [...ctx.evidence].sort((a, b) => b.collectedAt.localeCompare(a.collectedAt));
  const evidence = capList(recent, 10);
  return {
    project: {
      title: project.title,
      countryCode: project.countryCode,
      countryNameSq: countryNameSq(project.countryCode),
      city: project.city ?? null,
      registrationCountry: project.registrationCountry ?? null,
      customerCountries: project.customerCountries,
      analysisDate: project.analysisDate,
      isDemo: project.dataSnapshot.isDemo || Boolean(ctx.countryCtx?.isDemo),
      notes: project.notesSq ?? null,
    },
    idea: archetype
      ? {
          id: archetype.id,
          nameSq: archetype.nameSq,
          taglineSq: archetype.taglineSq,
          sectorSq: SECTORS[archetype.sector],
          offerSq: archetype.offerSq,
          payingCustomerSq: archetype.payingCustomerSq,
          problemSq: archetype.problemSq,
          regulated: archetype.regulated,
          regulationNotesSq: archetype.regulationNotesSq,
          licensedProfessionalsSq: archetype.licensedProfessionalsSq,
          whyItCouldWork: { kind: 'supozim', ...archetype.whyItCouldWork },
          falsifiersSq: archetype.falsifiersSq,
        }
      : null,
    analysis: rec
      ? {
          whyWork: rec.claims.whyWork.map((c) => claimView(c, env)),
          whyFail: rec.claims.whyFail.map((c) => claimView(c, env)),
          macro: rec.claims.macro.map((c) => claimView(c, env)),
          score: { total: rec.score.total, assessedWeightPct: rec.score.assessedWeightPct, noteSq: rec.score.noteSq },
          evidenceQuality: rec.evidence.level,
          isDemoData: rec.isDemoData,
          warningsSq: rec.warningsSq,
        }
      : null,
    analysisNoteSq: rec ? null : 'Analiza e idesë nuk është e disponueshme (mungon ideja, profili ose të dhënat e vendit në këtë modalitet).',
    dataCoverage: ctx.countryCtx
      ? { levelSq: COVERAGE_LABELS[ctx.countryCtx.coverage.level], noteSq: ctx.countryCtx.coverage.noteSq, lastRefreshAt: ctx.countryCtx.lastRefreshAt }
      : null,
    plan: progressView(ctx.tasks),
    evidence: { entries: evidence.items.map(evidenceView), omitted: evidence.omitted, total: ctx.evidence.length },
    financeNoteSq: 'Për çdo numër financiar përdor run_financial_scenario (motori deterministik i aplikacionit).',
  };
}

interface CostLineView {
  labelSq: string;
  groupSq: string;
  amount: number;
  amountSq: string;
  sourceKind: MoneyLine['sourceKind'];
  sourceNote: string;
}

function costLines(ctx: AssistantContext): CostLineView[] {
  const { currency, startupCosts, monthlyFixedCosts } = requireProject(ctx).financialInputs;
  const view = (line: MoneyLine, groupSq: string): CostLineView => ({
    labelSq: line.labelSq,
    groupSq,
    amount: line.amount,
    amountSq: moneySq(line.amount, currency),
    sourceKind: line.sourceKind,
    sourceNote: line.sourceNoteSq,
  });
  return [
    ...startupCosts.filter((l) => l.enabled).map((l) => view(l, `Investim fillestar — ${STARTUP_CATEGORY_LABELS[l.category as keyof typeof STARTUP_CATEGORY_LABELS] ?? l.category}`)),
    ...monthlyFixedCosts.filter((l) => l.enabled).map((l) => view(l, `Kosto mujore — ${MONTHLY_CATEGORY_LABELS[l.category as keyof typeof MONTHLY_CATEGORY_LABELS] ?? l.category}`)),
  ];
}

/** Cost lines still marked as general assumptions, largest first. */
export function unverifiedCostLines(ctx: AssistantContext): CostLineView[] {
  return costLines(ctx)
    .filter((l) => l.sourceKind === 'supozim')
    .sort((a, b) => b.amount - a.amount);
}

/** Macro links of the idea whose indicator is missing or stale in the project's economy. */
export function macroGaps(ctx: AssistantContext) {
  const links = ctx.archetype?.macroLinks ?? [];
  return links
    .map((link) => ({ link, series: ctx.countryCtx?.series.find((s) => s.definition.code === link.indicatorCode) ?? null }))
    .filter(({ series }) => !series || STALE_OR_MISSING.has(series.status))
    .map(({ link, series }) => ({
      indicatorCode: link.indicatorCode,
      nameSq: series?.definition.nameSq ?? link.indicatorCode,
      status: series?.status ?? 'mungon',
      statusSq: DATA_STATUS_LABELS[series?.status ?? 'mungon'],
      mechanismSq: link.mechanismSq,
    }));
}

function evidenceCounts(evidence: EvidenceEntry[]) {
  const counts = new Map<string, number>();
  for (const e of evidence) counts.set(e.type, (counts.get(e.type) ?? 0) + 1);
  return Object.fromEntries(counts);
}

function sensitivityView(base: ProjectionResult, ctx: AssistantContext) {
  const inputs = requireProject(ctx).financialInputs;
  const currency = inputs.currency;
  return sensitivityAnalysis(inputs, 'baze', 20).map((item) => ({
    driver: item.driver,
    labelSq: item.labelSq,
    changeSq: item.changeSq,
    minCashBeforeSq: moneySq(item.baseMinCash, currency),
    minCashAfterSq: moneySq(item.shockedMinCash, currency),
    impactMinCash: item.impactMinCash,
    impactMinCashSq: signedMoneySq(item.impactMinCash, currency),
    impactNetResultSq: signedMoneySq(item.impactTotalNet, currency),
    baseMinCashMonth: base.minCashMonth,
  }));
}

export function listWeakestAssumptions(_input: Record<string, never>, env: ToolEnv) {
  const { ctx } = env;
  const project = requireProject(ctx);
  const inputs = project.financialInputs;
  const base = ctx.baseProjection!;
  const sensitivity = sensitivityView(base, ctx);
  const unverified = unverifiedCostLines(ctx);
  const allLines = costLines(ctx);
  const baze = inputs.scenarios.baze;
  return {
    currency: inputs.currency,
    method: 'Ndjeshmëria e skenarit bazë: secili supozim ndryshohet veç e veç (±20%) dhe matet ndikimi në arkën më të ulët dhe në rezultatin neto.',
    sensitivity,
    weakestSq: sensitivity[0]
      ? `${sensitivity[0].labelSq} (${sensitivity[0].changeSq}) ka ndikimin më të madh: arka më e ulët ndryshon ${sensitivity[0].impactMinCashSq}.`
      : null,
    unitAssumptions: {
      kind: 'supozim',
      pricePerUnitSq: formatMoney(inputs.pricePerUnit, inputs.currency),
      variableCostPerUnitSq: formatMoney(inputs.variableCostPerUnit, inputs.currency),
      unitLabelSq: inputs.unitLabelSq,
      startCustomers: baze.startCustomers,
      monthlyNewCustomers: baze.monthlyNewCustomers,
      monthlyChurnPct: baze.monthlyChurnPct,
      noteSq: 'Çmimi, kostoja për njësi dhe ritmi i klientëve mbeten supozime derisa të provohen me klientë dhe oferta reale.',
    },
    unverifiedCostLines: capList(unverified, 8),
    verifiedCostLinesCount: allLines.length - unverified.length,
    costLinesCount: allLines.length,
    macroLinksWithoutData: macroGaps(ctx),
    evidenceCountsByType: evidenceCounts(ctx.evidence),
  };
}

function elapsedDays(createdAt: string, now: Date): number {
  const start = Date.parse(createdAt);
  if (!Number.isFinite(start)) return 0;
  return Math.max(0, Math.floor((now.getTime() - start) / DAY_MS));
}

function taskView(task: PlanTask, elapsed: number) {
  return {
    titleSq: task.titleSq,
    phaseSq: PHASE_TITLES[task.phaseId]?.titleSq ?? task.phaseId,
    statusSq: TASK_STATUS_LABELS[task.status],
    startDay: task.dayOffset + 1,
    endDay: task.dayOffset + task.durationDays,
    overdue: task.dayOffset + task.durationDays <= elapsed,
    proofSq: task.proofSq,
    notes: task.notesSq ?? null,
  };
}

function missingEvidenceSq(evidence: EvidenceEntry[]): string[] {
  const has = (...types: EvidenceEntry['type'][]) => evidence.some((e) => types.includes(e.type));
  const out: string[] = [];
  if (!has('interviste')) out.push('Asnjë intervistë me klientë nuk është regjistruar ende.');
  if (!has('oferte_cmimi', 'kosto_e_verifikuar')) out.push('Asnjë ofertë çmimi nga furnitorë ose kosto e verifikuar nuk është regjistruar ende.');
  if (!has('parapagim', 'pagese')) out.push('Gatishmëria për të paguar nuk është provuar ende (asnjë parapagim ose pagesë e regjistruar).');
  return out;
}

export function listTasksDue(input: { days: number }, env: ToolEnv) {
  const { ctx } = env;
  const project = requireProject(ctx);
  const archetype = requireArchetype(ctx);
  const elapsed = elapsedDays(project.createdAt, ctx.now);
  const horizonEnd = elapsed + input.days;
  const open = ctx.tasks
    .filter((t) => t.status === 'per_tu_bere' || t.status === 'ne_progres')
    .sort((a, b) => a.dayOffset - b.dayOffset || a.id.localeCompare(b.id));
  const due = open.filter((t) => t.dayOffset < horizonEnd);
  const shown = capList(due, 10);
  const officialLinks = getOfficialLinks(project.countryCode)
    .slice(0, 6)
    .map((link) => ({ nameSq: link.sourceName, noteSq: link.noteSq ?? null, citation: env.cite(link) }));
  const unverified = unverifiedCostLines(ctx).slice(0, 3);

  return {
    todaySq: ctx.now.toISOString().slice(0, 10),
    planDay: elapsed + 1,
    horizonDays: input.days,
    dueTasks: shown.items.map((t) => taskView(t, elapsed)),
    dueTasksOmitted: shown.omitted,
    nextTasks: due.length === 0 ? open.slice(0, 3).map((t) => taskView(t, elapsed)) : [],
    toVerify: [
      ...archetype.regulationNotesSq.map((textSq) => ({ kind: 'rregullore', textSq, noteSq: VERIFY_LOCALLY_SQ })),
      ...archetype.licensedProfessionalsSq.map((p) => ({ kind: 'profesionist_i_licencuar', textSq: `Kërkohet: ${p}.`, noteSq: VERIFY_LOCALLY_SQ })),
      ...unverified.map((l) => ({
        kind: 'kosto_supozim',
        textSq: `${l.labelSq}: ${l.amountSq} është ende supozim — merrni të paktën një ofertë reale.`,
        noteSq: null,
      })),
      ...missingEvidenceSq(ctx.evidence).map((textSq) => ({ kind: 'prove_qe_mungon', textSq, noteSq: null })),
      ...macroGaps(ctx).map((g) => ({ kind: 'te_dhena_makro', textSq: `${g.nameSq}: ${g.statusSq}.`, noteSq: null })),
    ],
    officialLinks,
    plan: progressView(ctx.tasks),
    noteSq: 'Detyrat llogariten nga data e krijimit të projektit. Asistenti nuk kryen asnjë veprim në emrin tuaj.',
  };
}
