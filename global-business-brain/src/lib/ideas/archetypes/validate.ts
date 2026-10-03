/**
 * Rregullat e cilësisë për arketipet (quality gate for the curated idea library).
 * Used by tests; returns human-readable problems instead of throwing so a test can list all of them.
 */
import type { BusinessArchetype, FailureKind, MonthlyCategory, StartupCategory } from '@/lib/domain/types';
import { ASSET_IDS, PHASE_IDS, SECTORS, SKILL_IDS } from '@/lib/domain/taxonomy';
import { INDICATOR_CODE_SET } from '@/lib/data/indicatorCodes';

const STARTUP_CATEGORIES: StartupCategory[] = ['hapje', 'pajisje', 'depozita', 'inventar', 'tarifa', 'testim_tregu'];
const MONTHLY_CATEGORIES: MonthlyCategory[] = [
  'qira',
  'paga',
  'sherbime_komunale',
  'marketing',
  'transport',
  'software',
  'sigurime',
  'kontabilitet',
  'mirembajtje',
  'tjeter',
];
const REQUIRED_FAILURE_KINDS: FailureKind[] = ['kerkese_e_pamjaftueshme', 'cmim', 'konkurrence', 'kosto'];

/** Phrases that promise outcomes or hide risk. */
const FORBIDDEN_PHRASES = [
  /fitim(e)? (i |të )?garantuar/i,
  /sukses(i)? (i )?garantuar/i,
  /pa (asnjë )?rrezik/i,
  /para të sigurta/i,
  /pasurohu/i,
  /\bgarantoj(më|në)?\b/i,
];

/** Activities excluded from the library entirely. */
const EXCLUDED_ACTIVITIES = [/alkool/i, /duhan/i, /cigare/i, /bixhoz/i, /baste/i, /arm(ë|e) zjarri/i, /kanabis/i, /kripto.*fitim/i];

/** Leading or hypothetical questions ("would you buy…") that produce false positives. */
const LEADING_QUESTION_PATTERNS = [
  /^a do (të|ta|t'i|ti)\b/i,
  /do të (blini|paguanit|përdornit)/i,
  /do ta (blini|blinit|përdornit)/i,
  /a ju pëlqen ideja/i,
  /a mendoni se është ide e mirë/i,
];

const URL_PATTERN = /https?:\/\/|www\./i;

function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => collectStrings(v, out));
  return out;
}

export function validateArchetype(a: BusinessArchetype): string[] {
  const p: string[] = [];
  const req = (cond: boolean, msg: string) => {
    if (!cond) p.push(`${a.id}: ${msg}`);
  };

  req(/^[a-z0-9]+(-[a-z0-9]+)*$/.test(a.id), 'id duhet të jetë kebab-case');
  req(a.sector in SECTORS, `sektor i panjohur "${a.sector}"`);

  const strings = collectStrings(a);
  req(strings.every((s) => s.trim().length > 0), 'ka tekste bosh');
  for (const s of strings) {
    if (URL_PATTERN.test(s)) p.push(`${a.id}: tekst me URL (lidhjet vijnë vetëm nga regjistri i burimeve): "${s.slice(0, 60)}"`);
    for (const re of FORBIDDEN_PHRASES) if (re.test(s)) p.push(`${a.id}: frazë e ndaluar ${re} në "${s.slice(0, 60)}"`);
  }
  const identity = `${a.nameSq} ${a.descriptionSq} ${a.offerSq}`;
  for (const re of EXCLUDED_ACTIVITIES) if (re.test(identity)) p.push(`${a.id}: veprimtari e përjashtuar ${re}`);

  req(a.nameSq.length >= 6 && a.nameSq.length <= 80, 'nameSq 6–80 karaktere');
  req(a.descriptionSq.length >= 80, 'descriptionSq shumë i shkurtër (≥80)');
  req(a.offerSq.length >= 40, 'offerSq duhet të jetë konkret (≥40)');
  req(a.problemSq.length >= 40, 'problemSq duhet të jetë konkret (≥40)');
  req(a.payingCustomerSq.length >= 15, 'payingCustomerSq shumë i shkurtër');
  req(a.customerSegments.length > 0, 'customerSegments bosh');
  req(a.modes.length > 0, 'modes bosh');
  req(a.marketScopes.length > 0, 'marketScopes bosh');
  req(a.minHoursPerWeek > 0 && a.minHoursPerWeek <= 60, 'minHoursPerWeek 1–60');

  for (const s of [...a.requiredSkills, ...a.helpfulSkills]) req(SKILL_IDS.has(s), `aftësi e panjohur "${s}"`);
  for (const s of a.helpfulAssets) req(ASSET_IDS.has(s), `aset i panjohur "${s}"`);
  req(a.requiredSkills.length <= 4, 'shumë aftësi të detyrueshme (≤4)');

  if (a.regulated) {
    req(a.regulationNotesSq.length > 0, 'veprimtari e rregulluar pa shënime rregullimi');
    req(
      a.regulationNotesSq.some((n) => /verifik/i.test(n)),
      'shënimet e rregullimit duhet të kërkojnë verifikim lokal',
    );
  }
  req(a.zeroCapitalTestSq.length >= 40, 'zeroCapitalTestSq shumë i shkurtër');
  req(a.revenueModelSq.length >= 30, 'revenueModelSq shumë i shkurtër');

  const pr = a.pricing;
  req(pr.priceUSD.low > 0 && pr.priceUSD.low <= pr.priceUSD.base && pr.priceUSD.base <= pr.priceUSD.high, 'priceUSD low ≤ base ≤ high, > 0');
  req(
    pr.variableCostUSD.low >= 0 &&
      pr.variableCostUSD.low <= pr.variableCostUSD.base &&
      pr.variableCostUSD.base <= pr.variableCostUSD.high,
    'variableCostUSD low ≤ base ≤ high, ≥ 0',
  );
  req(pr.priceUSD.base > pr.variableCostUSD.base, 'në skenarin bazë çmimi duhet të jetë > kostoja variabël');
  req(pr.unitsPerCustomerPerMonth > 0, 'unitsPerCustomerPerMonth > 0');
  req(pr.collectionDays >= 0 && pr.collectionDays <= 120, 'collectionDays 0–120');
  req(pr.supplierPaymentDays >= 0 && pr.supplierPaymentDays <= 90, 'supplierPaymentDays 0–90');

  req(a.startupCosts.length >= 3, 'të paktën 3 kosto hapjeje');
  req(a.monthlyFixedCosts.length >= 2, 'të paktën 2 kosto fikse mujore');
  req(a.startupCosts.some((c) => c.category === 'testim_tregu'), 'duhet një zë "testim_tregu"');
  const ids = new Set<string>();
  for (const c of a.startupCosts) {
    req(STARTUP_CATEGORIES.includes(c.category as StartupCategory), `kategori hapjeje e pavlefshme "${c.category}"`);
  }
  for (const c of a.monthlyFixedCosts) {
    req(MONTHLY_CATEGORIES.includes(c.category as MonthlyCategory), `kategori mujore e pavlefshme "${c.category}"`);
  }
  for (const c of [...a.startupCosts, ...a.monthlyFixedCosts]) {
    req(!ids.has(c.id), `id kostoje e dyfishtë "${c.id}"`);
    ids.add(c.id);
    req(c.lowUSD >= 0 && c.lowUSD <= c.highUSD, `kosto "${c.id}" low ≤ high`);
    req(c.noteSq.length >= 20, `kosto "${c.id}" pa shpjegim të mjaftueshëm`);
    for (const as of c.avoidedByAssets ?? []) req(ASSET_IDS.has(as), `aset i panjohur "${as}" te kosto "${c.id}"`);
  }

  const r = a.ramp;
  for (const k of ['konservator', 'baze', 'optimist'] as const) {
    req(r[k].startCustomers >= 0 && r[k].monthlyNewCustomers >= 0, `ramp.${k} negative`);
    req(r[k].monthlyChurnPct >= 0 && r[k].monthlyChurnPct <= 100, `ramp.${k} churn 0–100`);
  }
  req(
    r.konservator.monthlyNewCustomers <= r.baze.monthlyNewCustomers &&
      r.baze.monthlyNewCustomers <= r.optimist.monthlyNewCustomers,
    'ramp: konservator ≤ bazë ≤ optimist',
  );

  req(a.seasonality.length === 12, 'seasonality duhet të ketë 12 vlera');
  req(a.seasonality.every((m) => m > 0), 'seasonality > 0');
  const mean = a.seasonality.reduce((s, m) => s + m, 0) / (a.seasonality.length || 1);
  req(mean >= 0.9 && mean <= 1.1, `mesatarja e sezonalitetit duhet ≈ 1 (është ${mean.toFixed(2)})`);

  req(a.macroLinks.length >= 2, 'të paktën 2 lidhje makro');
  for (const m of a.macroLinks) req(INDICATOR_CODE_SET.has(m.indicatorCode), `tregues i panjohur "${m.indicatorCode}"`);

  const kinds = new Set(a.failureModes.map((f) => f.kind));
  for (const k of REQUIRED_FAILURE_KINDS) req(kinds.has(k), `mungon mënyra e dështimit "${k}"`);
  req(a.failureModes.length >= 5, 'të paktën 5 mënyra dështimi');

  req(a.falsifiersSq.length >= 3, 'të paktën 3 prova rrëzuese');
  req(a.differentiationSq.length >= 2, 'të paktën 2 mënyra dallimi');
  req(a.competitorTypesSq.length >= 2, 'të paktën 2 lloje alternativash/konkurrentësh');
  req(a.interviewQuestionsSq.length >= 6, 'të paktën 6 pyetje intervistimi');
  for (const q of a.interviewQuestionsSq) {
    for (const re of LEADING_QUESTION_PATTERNS) if (re.test(q.trim())) p.push(`${a.id}: pyetje sugjestive/hipotetike "${q}"`);
  }
  req(a.feedbackQuestionsSq.length >= 3, 'të paktën 3 pyetje reagimi');
  req(a.goCriteriaSq.length >= 2, 'të paktën 2 kritere vazhdimi');
  req(a.killCriteriaSq.length >= 2, 'të paktën 2 kritere ndalimi');
  req(a.assumptionsSq.length >= 3, 'të paktën 3 supozime');
  req(a.firstCustomers.whereSq.length >= 2, 'firstCustomers.whereSq ≥ 2');
  req(a.firstCustomers.howToContactSq.length >= 2, 'firstCustomers.howToContactSq ≥ 2');
  req(a.firstCustomers.metricsSq.length >= 2, 'firstCustomers.metricsSq ≥ 2');
  req(a.pitchTemplateSq.length >= 80, 'pitchTemplateSq shumë i shkurtër');
  req(a.offerTemplateSq.length >= 80, 'offerTemplateSq shumë i shkurtër');
  for (const k of Object.keys(a.phaseNotesSq)) req((PHASE_IDS as string[]).includes(k), `fazë e panjohur "${k}"`);
  req(/^\d{4}-\d{2}-\d{2}$/.test(a.assumptionsDate), 'assumptionsDate YYYY-MM-DD');
  const w = a.whyItCouldWork;
  req(
    [w.changeSq, w.problemSq, w.customerSq, w.offerSq, w.reasonToPaySq, w.profitConditionsSq].every((s) => s.length >= 20),
    'zinxhiri "pse mund të funksionojë" duhet të jetë i plotë',
  );
  return p;
}

export function validateLibrary(list: BusinessArchetype[]): string[] {
  const problems = list.flatMap(validateArchetype);
  const seen = new Set<string>();
  for (const a of list) {
    if (seen.has(a.id)) problems.push(`id e dyfishtë "${a.id}"`);
    seen.add(a.id);
  }
  return problems;
}
