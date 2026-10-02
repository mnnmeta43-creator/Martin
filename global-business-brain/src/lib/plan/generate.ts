/**
 * Plani 0–100: ten ordered phases from "clarify the problem" to "stabilise and decide on
 * growth", each with concrete actions, an output, a budget, dependencies, proof of completion
 * and continue/stop criteria, plus ~40 dated tasks spread over roughly 120 days.
 *
 * Deterministic and pure: actions are built from the archetype's own fields, money comes from
 * the finance engine's projection (every figure is labelled an assumption), and phase budgets
 * split the enabled startup investment so they always add up to it. Task ids depend only on the
 * phase and the task's position, so stored task statuses survive regenerating the plan.
 * The percentage of a plan measures completion of its steps, never the chance of success.
 * Server-side (uses the country catalogue for the country name).
 */
import type {
  BusinessArchetype,
  CountryCode,
  CurrencyCode,
  FinancialInputs,
  MoneyLine,
  PhaseId,
  Plan,
  PlanPhase,
  PlanTask,
  ProjectionResult,
  StartupCategory,
} from '@/lib/domain/types';
import { PHASE_IDS, PHASE_TITLES, skillLabel } from '@/lib/domain/taxonomy';
import { getCountry } from '@/lib/data/countries';
import { formatMoney, formatNumber } from '@/lib/finance/format';

export interface GeneratePlanArgs {
  archetype: BusinessArchetype;
  countryCode: CountryCode;
  city?: string | null;
  inputs: FinancialInputs;
  projection: ProjectionResult; // base scenario of `inputs`
  /** Optional display name override; defaults to the catalogue name of `countryCode`. */
  countryNameSq?: string;
}

export const PLAN_NOTE_SQ =
  'Përqindja mat përfundimin e planit, jo probabilitetin e suksesit. 100% do të thotë që hapat e planit janë kryer — jo që biznesi është i garantuar.';

export const INTERVIEW_TARGET = 15;
export const PLAN_LENGTH_DAYS = 120;

const VERIFY = 'Kërkon verifikim lokal.';
const TIME_ONLY_SQ = 'Kryesisht kohë';

/** Which startup categories each phase pays for; phases not listed have no startup budget. */
const PHASE_BUDGET_CATEGORIES: Partial<Record<PhaseId, StartupCategory[]>> = {
  p40_50: ['tarifa'],
  p50_60: ['pajisje', 'inventar', 'depozita', 'hapje'],
  p60_70: ['testim_tregu'],
};

/** Day window of each phase (start, length); the windows tile 0–120 in phase order. */
const PHASE_WINDOWS: Record<PhaseId, { start: number; days: number }> = {
  p00_10: { start: 0, days: 3 },
  p10_20: { start: 3, days: 14 },
  p20_30: { start: 17, days: 10 },
  p30_40: { start: 27, days: 7 },
  p40_50: { start: 34, days: 14 },
  p50_60: { start: 48, days: 12 },
  p60_70: { start: 60, days: 18 },
  p70_80: { start: 78, days: 18 },
  p80_90: { start: 96, days: 14 },
  p90_100: { start: 110, days: 10 },
};

/** Extra prerequisites beyond "the previous phase": a legal trial needs permits verified first. */
const EXTRA_DEPENDENCIES: Partial<Record<PhaseId, PhaseId[]>> = {
  p40_50: ['p30_40'],
  p60_70: ['p40_50'],
};

interface Ctx {
  a: BusinessArchetype;
  inputs: FinancialInputs;
  p: ProjectionResult;
  area: string;
  countryNameSq: string;
  money: (v: number) => string;
}

interface PhaseText {
  actionsSq: string[];
  outputSq: string;
  proofOfCompletionSq: string;
  continueCriterionSq: string;
  stopCriterionSq: string;
}

interface TaskText {
  titleSq: string;
  descriptionSq: string;
  proofSq: string;
}

function joinSq(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} dhe ${items[items.length - 1]}`;
}

function quoted(items: string[]): string {
  return items.map((q) => `“${q}”`).join(' ');
}

function firstMatching(items: string[], pattern: RegExp): string | undefined {
  return items.find((s) => pattern.test(s));
}

function breakEvenCustomers(p: ProjectionResult): number | null {
  const c = p.unitEconomics.breakEvenCustomersPerMonth;
  return c === null || !Number.isFinite(c) ? null : Math.ceil(c);
}

function breakEvenSq(c: Ctx): string {
  const ue = c.p.unitEconomics;
  if (ue.status === 'kontribut_zero_ose_negativ') {
    return 'Me këto supozime kontributi për njësi është zero ose negativ, prandaj pika e barazimit nuk ekziston derisa të ndryshoni çmimin ose koston.';
  }
  const customers = breakEvenCustomers(c.p);
  if (customers === null) return 'Pika e barazimit në klientë nuk mund të llogaritet me këto supozime.';
  return `Pika e barazimit sipas supozimeve: rreth ${formatNumber(customers)} klientë në muaj (${formatNumber(ue.breakEvenUnitsPerMonth, 1)} njësi «${c.inputs.unitLabelSq}»).`;
}

/** Labels of enabled startup lines in the given categories, quoted for use inside sentences. */
function enabledStartupLabels(inputs: FinancialInputs, categories: readonly StartupCategory[]): string[] {
  return inputs.startupCosts
    .filter((l: MoneyLine) => l.enabled && l.amount > 0 && (categories as readonly string[]).includes(l.category))
    .map((l) => `«${l.labelSq}»`);
}

function withVerify(text: string): string {
  return /verifikim lokal/i.test(text) ? text : `${text} ${VERIFY}`.trim();
}

function withNotes(c: Ctx, id: PhaseId, actions: string[]): string[] {
  return [...new Set([...actions, ...(c.a.phaseNotesSq[id] ?? [])].filter((s) => s.trim().length > 0))];
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase texts
// ─────────────────────────────────────────────────────────────────────────────

function phase00(c: Ctx): PhaseText {
  const { a, p } = c;
  const skills =
    a.requiredSkills.length > 0
      ? `Aftësitë që kërkon ideja: ${joinSq(a.requiredSkills.map((id) => `«${skillLabel(id)}»`))}. Shënoni cilat i keni dhe cilat duhet t’i mësoni ose t’i siguroni me partner.`
      : 'Ideja nuk kërkon aftësi të detyrueshme nga lista; shënoni aftësitë ndihmëse që keni dhe ato që do t’ju duheshin.';
  return {
    actionsSq: [
      `Shkruani në një faqe problemin që zgjidh ideja: ${a.problemSq}`,
      `Përcaktoni klientin që paguan: ${a.payingCustomerSq}`,
      skills,
      `Vendosni sa orë në javë mund t’i kushtoni realisht (ideja kërkon të paktën ${formatNumber(a.minHoursPerWeek)}) dhe sa para mund të rrezikoni pa prekur nevojat bazë.`,
      `Kapitali i nevojshëm sipas modelit bazë: ${c.money(p.capital.totalRequired)}; kapitali juaj në model: ${c.money(p.capital.ownCapital)} (supozime, jo oferta).`,
    ],
    outputSq: 'Një faqe me problemin, klientin, burimet tuaja (kohë, para, aftësi) dhe shumën maksimale që pranoni të humbni.',
    proofOfCompletionSq: 'Dokumenti me problemin, klientin dhe burimet është shkruar dhe ruajtur te projekti.',
    continueCriterionSq: `Problemi dhe klienti përshkruhen qartë me nga një fjali, dhe keni të paktën ${formatNumber(a.minHoursPerWeek)} orë në javë.`,
    stopCriterionSq: `Nuk mund t’i kushtoni të paktën ${formatNumber(a.minHoursPerWeek)} orë në javë, ose humbja që pranoni është më e vogël se kostoja e provës më të lirë.`,
  };
}

function phase10(c: Ctx): PhaseText {
  const { a } = c;
  const falsifier = a.falsifiersSq[0];
  return {
    actionsSq: [
      `Bëni të paktën ${INTERVIEW_TARGET} intervista me persona nga grupi: ${a.payingCustomerSq}`,
      `Pyetni për sjelljen e kaluar, p.sh.: ${quoted(a.interviewQuestionsSq.slice(0, 3))}`,
      'Mos pyesni “A do ta blinit?” — pyesni çfarë kanë bërë herën e fundit dhe sa paguajnë sot.',
      'Regjistroni çdo intervistë në ditarin e provave: data, kush, çfarë bën sot, sa paguan sot, kush vendos.',
    ],
    outputSq: `Shënime nga ≥${INTERVIEW_TARGET} intervista dhe një përmbledhje: sa e përshkruan problemin pa sugjerim, si e zgjidhin sot dhe sa paguajnë.`,
    proofOfCompletionSq: `Të paktën ${INTERVIEW_TARGET} intervista të regjistruara në ditarin e provave.`,
    continueCriterionSq: `Të paktën 10 nga ${INTERVIEW_TARGET} të intervistuarit e përshkruajnë problemin pa sugjerim (prag-supozim që mund ta ndryshoni).`,
    stopCriterionSq: falsifier
      ? `Ndaloni ose ndryshoni segmentin nëse: ${falsifier}`
      : `Më pak se 5 nga ${INTERVIEW_TARGET} të intervistuarit e njohin problemin.`,
  };
}

function phase20(c: Ctx): PhaseText {
  const { a } = c;
  return {
    actionsSq: [
      `Hartoni alternativat sipas llojit: ${a.competitorTypesSq.join('; ')}. Verifikoni secilën në terren ose online, mos e supozoni.`,
      `Mblidhni çmimet e të paktën 10 alternativave për njësinë «${c.inputs.unitLabelSq}».`,
      `Zgjidhni 1–2 mënyra dallimi që klientët i përmendën në intervista: ${a.differentiationSq.join(' ')}`,
      `Shkruani ofertën: ${a.offerSq}`,
    ],
    outputSq: 'Tabelë alternativash (lloji, çmimi, dobësitë) dhe një ofertë e shkruar me çmim, çfarë përfshin dhe çfarë jo.',
    proofOfCompletionSq: 'Tabela me ≥10 alternativa dhe oferta e shkruar janë ruajtur te projekti.',
    continueCriterionSq: 'Keni një arsye të qartë, të konfirmuar nga intervistat, pse klienti do t’ju zgjidhte ju në vend të alternativës më të zakonshme.',
    stopCriterionSq: 'Alternativat ekzistuese e zgjidhin problemin mirë dhe lirë, dhe nuk gjeni asnjë dallim që klientët ta vlerësojnë.',
  };
}

function phase30(c: Ctx): PhaseText {
  const { a, p, money } = c;
  const ue = p.unitEconomics;
  const gap =
    p.capital.gap > 0
      ? ` Mungesa ndaj kapitalit tuaj: ${money(p.capital.gap)}.`
      : ' Sipas supozimeve, kapitali juaj e mbulon këtë shumë.';
  const priceKill = firstMatching(a.killCriteriaSq, /çmim/i);
  return {
    actionsSq: [
      `Çmimi në modelin bazë: ${money(ue.pricePerUnit)} për «${c.inputs.unitLabelSq}»; kostoja variabël: ${money(ue.variableCostPerUnit)}; kontributi për njësi: ${money(ue.contributionPerUnit)} (supozime, jo çmime të verifikuara).`,
      breakEvenSq(c),
      `Investimi fillestar: ${money(p.capital.startupTotal)}; kapitali i nevojshëm gjithsej, me deficitin e operimit dhe rezervën: ${money(p.capital.totalRequired)}.${gap}`,
      'Zëvendësoni supozimet me çmimet nga anketa e fazës 20–30 dhe me ofertat e furnitorëve, pastaj rillogaritni në kalkulator.',
      'Kontrolloni skenarin konservator dhe goditjet (çmim më i ulët, kosto më e lartë, pagesa me vonesë) para çdo shpenzimi.',
    ],
    outputSq: 'Model financiar me çmime reale ose oferta, tre skenarë dhe një pikë barazimi që e kuptoni.',
    proofOfCompletionSq: 'Modeli i projektit është përditësuar dhe të paktën çmimi dhe dy kostot më të mëdha kanë burim «ofertë» ose «verifikuar».',
    continueCriterionSq: 'Me çmimet reale kontributi për njësi mbetet pozitiv dhe numri i klientëve për pikën e barazimit duket i arritshëm sipas intervistave.',
    stopCriterionSq:
      priceKill ??
      'Çmimi që tregu pranon nuk mbulon koston variabël, ose pika e barazimit kërkon më shumë klientë sesa mund të shërbeni me orët që keni.',
  };
}

function phase40(c: Ctx): PhaseText {
  const { a } = c;
  const pros =
    a.licensedProfessionalsSq.length > 0
      ? [`Profesionistët e licencuar që duhen: ${joinSq(a.licensedProfessionalsSq)}. Mos e ushtroni pjesën e rregulluar pa ta.`]
      : [];
  return {
    actionsSq: [
      `Verifikoni formën e regjistrimit dhe faturimin për veprimtarinë në zonën ku do të operoni (${c.area}). ${VERIFY}`,
      ...a.regulationNotesSq,
      ...pros,
      `Verifikoni tatimet, kontributet shoqërore dhe sigurimet përpara klientit të parë me pagesë. ${VERIFY}`,
      'Përdorni vetëm burime zyrtare (regjistri i bizneseve, administrata tatimore, bashkia) ose një profesionist të licencuar, dhe ruani datën e çdo verifikimi.',
    ],
    outputSq: 'Listë e verifikuar regjistrimesh, lejesh, tarifash dhe detyrimesh, secila me burimin zyrtar dhe datën.',
    proofOfCompletionSq: 'Çdo detyrim ka burim zyrtar ose konfirmim me shkrim nga një profesionist; regjistrimi është bërë ose ka datë të caktuar.',
    continueCriterionSq: 'Të gjitha lejet e nevojshme janë të arritshme brenda kohës dhe buxhetit që keni.',
    stopCriterionSq: `Nuk keni të drejtë ligjore të punoni ose të regjistroheni në vendin e operimit (${c.countryNameSq}), ose aktiviteti kërkon një licencë ose profesionist që nuk mund ta siguroni.`,
  };
}

function phase50(c: Ctx): PhaseText {
  const { inputs } = c;
  const equipment = enabledStartupLabels(inputs, PHASE_BUDGET_CATEGORIES.p50_60 ?? []);
  const monthly = inputs.monthlyFixedCosts.filter((l) => l.enabled && l.amount > 0).map((l) => `«${l.labelSq}»`);
  return {
    actionsSq: [
      equipment.length > 0
        ? `Merrni 2–3 oferta me shkrim për: ${joinSq(equipment)}.`
        : 'Modeli nuk ka pajisje ose inventar për të blerë; kontrolloni që nuk ju mungon asgjë për provën.',
      'Krahasoni blerjen e re me të përdorurën ose me marrjen me qira, aty ku kjo është e sigurt.',
      ...(monthly.length > 0 ? [`Konfirmoni kostot mujore me oferta: ${joinSq(monthly)}.`] : []),
      `Shkruani procesin e punës hap pas hapi (porosia → realizimi → dorëzimi → faturimi → arkëtimi); modeli supozon arkëtim pas ${formatNumber(inputs.collectionDays)} ditësh.`,
    ],
    outputSq: 'Oferta furnitorësh të futura në model si «ofertë», mjetet e nevojshme të siguruara dhe procesi i punës i shkruar.',
    proofOfCompletionSq: 'Ofertat janë ruajtur me datë, procesi i shkruar ekziston dhe mjetet janë gati për provën.',
    continueCriterionSq: 'Kostot reale nga ofertat janë brenda ose afër supozimeve dhe modeli mbetet me kontribut pozitiv.',
    stopCriterionSq: 'Ofertat reale i rrisin kostot aq sa kontributi bëhet negativ ose kapitali i nevojshëm del shumë mbi atë që keni.',
  };
}

function phase60(c: Ctx): PhaseText {
  const { a } = c;
  const testBudget = c.p.capital.byCategory.testim_tregu;
  return {
    actionsSq: [
      `Prova: ${a.cheapestTestSq}`,
      `Nëse nuk doni të shpenzoni ende: ${a.zeroCapitalTestSq}`,
      `Vendosni që në fillim kufirin e shpenzimit (sipas modelit ${c.money(testBudget)} për testim tregu, supozim) dhe afatin e provës.`,
      'Bëni oferta konkrete me çmim dhe numëroni pagesat, jo komplimentet.',
    ],
    outputSq: 'Rezultati i provës: sa oferta, sa pagesa, sa kohë mori secili klient dhe çfarë doli ndryshe nga supozimet.',
    proofOfCompletionSq: 'Ditari i provave përmban ofertat dhe pagesat e provës, me data.',
    continueCriterionSq: a.goCriteriaSq[0] ?? 'Të paktën 3 pagesa nga 20 oferta konkrete (prag-supozim).',
    stopCriterionSq: a.killCriteriaSq[0] ?? 'Më pak se 2 pagesa pas 20 ofertave konkrete (prag-supozim).',
  };
}

function phase70(c: Ctx): PhaseText {
  const { firstCustomers, killCriteriaSq } = c.a;
  return {
    actionsSq: [
      `Ku t’i gjeni: ${firstCustomers.whereSq.join('; ')}.`,
      `Si t’i kontaktoni, ligjshëm dhe pa spam: ${firstCustomers.howToContactSq.join('; ')}.`,
      `Oferta: ${firstCustomers.offerSq}`,
      `Ndjekja: ${firstCustomers.followUpSq}`,
    ],
    outputSq: 'Klientët e parë me pagesë, të shërbyer sipas ofertës, me reagimet e tyre të regjistruara.',
    proofOfCompletionSq: 'Fatura ose pagesa të regjistruara për klientët e parë dhe reagimet e tyre në ditarin e provave.',
    continueCriterionSq: 'Klientët e parë paguajnë në kohë dhe të paktën njëri prej tyre blen sërish ose ju rekomandon.',
    stopCriterionSq:
      firstMatching(killCriteriaSq, /anul|largo/i) ?? 'Klientët e parë anulojnë shpejt ose nuk paguajnë, edhe pse shërbimi u dha sipas marrëveshjes.',
  };
}

function phase80(c: Ctx): PhaseText {
  const { a, inputs } = c;
  return {
    actionsSq: [
      `Ndiqni çdo javë: ${a.firstCustomers.metricsSq.join('; ')}.`,
      'Krahasoni klientët, të ardhurat dhe kostot reale me modelin bazë dhe përditësoni supozimet.',
      `Pyetni klientët: ${quoted(a.feedbackQuestionsSq.slice(0, 2))}`,
      `Kontrolloni arkëtimet: a paguajnë klientët brenda ${formatNumber(inputs.collectionDays)} ditëve siç supozon modeli?`,
    ],
    outputSq: 'Panel i thjeshtë javor me metrikat dhe listë përmirësimesh të zbatuara.',
    proofOfCompletionSq: 'Të paktën 4 javë metrika të regjistruara dhe modeli financiar i përditësuar me shifra reale.',
    continueCriterionSq: 'Metrikat përmirësohen ose qëndrojnë, dhe të ardhurat reale mbulojnë kostot variabël.',
    stopCriterionSq: 'Pas përmirësimeve, metrikat kryesore përkeqësohen për dy muaj radhazi.',
  };
}

function phase90(c: Ctx): PhaseText {
  const { a, p } = c;
  const customers = breakEvenCustomers(p);
  const coverage = customers === null ? 'a mbulohen kostot fikse' : `a mbulohen kostot fikse (sipas supozimeve rreth ${formatNumber(customers)} klientë në muaj)`;
  const payback =
    p.payback.recoveredInMonth === null
      ? 'Sipas supozimeve investimi fillestar nuk rikuperohet brenda horizontit të modelit — mos e zgjeroni pa e kuptuar pse.'
      : `Sipas supozimeve investimi fillestar rikuperohet rreth muajit ${p.payback.recoveredInMonth} — vlerësim, jo datë e garantuar.`;
  return {
    actionsSq: [
      `Kriteret e vazhdimit: ${a.goCriteriaSq.join(' ')}`,
      `Kriteret e ndalimit: ${a.killCriteriaSq.join(' ')}`,
      `Para zgjerimit kontrolloni ${coverage}, a mbetet paraja pozitive pa kapital shtesë dhe a mund të shërbeni më shumë klientë pa ulur cilësinë.`,
      payback,
      'Zgjeroni vetëm një gjë në një kohë (zonë, shërbim ose kanal) dhe matni efektin para hapit tjetër.',
    ],
    outputSq: 'Vendim i shkruar — vazhdo, ndrysho ose ndalo — me provat që e mbështesin.',
    proofOfCompletionSq: 'Vendimi dhe metrikat e muajve të fundit janë ruajtur te projekti.',
    continueCriterionSq: `Plotësohen kriteret e vazhdimit: ${a.goCriteriaSq.join(' ')}`,
    stopCriterionSq: `Ndodh ndonjë nga kriteret e ndalimit: ${a.killCriteriaSq.join(' ')}`,
  };
}

const PHASE_BUILDERS: Record<PhaseId, (c: Ctx) => PhaseText> = {
  p00_10: phase00,
  p10_20: phase10,
  p20_30: phase20,
  p30_40: phase30,
  p40_50: phase40,
  p50_60: phase50,
  p60_70: phase60,
  p70_80: phase70,
  p80_90: phase80,
  p90_100: phase90,
};

// ─────────────────────────────────────────────────────────────────────────────
// Budgets and dependencies
// ─────────────────────────────────────────────────────────────────────────────

function phaseBudget(c: Ctx, id: PhaseId, currency: CurrencyCode): PlanPhase['budget'] {
  const categories = PHASE_BUDGET_CATEGORIES[id];
  if (!categories) {
    const operating = PHASE_IDS.indexOf(id) >= PHASE_IDS.indexOf('p70_80');
    const tail = operating ? '; kostot mujore të operimit ndiqen te modeli financiar' : '';
    return { amount: 0, currency, basisSq: `${TIME_ONLY_SQ}${tail}.` };
  }
  // Amounts come from the engine's own split, so the phases add up to its startup total.
  const amount = categories.reduce((sum, cat) => sum + c.p.capital.byCategory[cat], 0);
  const labels = enabledStartupLabels(c.inputs, categories);
  const replaceWith = id === 'p40_50' ? 'Zëvendësojeni me shumën nga burimi zyrtar.' : 'Zëvendësojeni me oferta reale.';
  const basisSq =
    labels.length > 0
      ? `Supozim nga modeli financiar (investimi fillestar): ${labels.join(', ')}. ${replaceWith}`
      : 'Modeli nuk ka zëra të aktivizuar për këtë fazë; verifikoni nëse ka kosto reale.';
  return { amount, currency, basisSq };
}

function dependenciesOf(index: number): PhaseId[] {
  if (index === 0) return [];
  const id = PHASE_IDS[index];
  return [...new Set([PHASE_IDS[index - 1], ...(EXTRA_DEPENDENCIES[id] ?? [])])];
}

// ─────────────────────────────────────────────────────────────────────────────
// Tasks (fixed count per phase → stable ids)
// ─────────────────────────────────────────────────────────────────────────────

function tasks00(c: Ctx): TaskText[] {
  return [
    { titleSq: 'Shkruani problemin dhe klientin që paguan', descriptionSq: `${c.a.problemSq} Klienti: ${c.a.payingCustomerSq}`, proofSq: 'Dokument një-faqësh i ruajtur te projekti.' },
    { titleSq: 'Inventarizoni aftësitë, kohën dhe asetet', descriptionSq: `Ideja kërkon të paktën ${formatNumber(c.a.minHoursPerWeek)} orë në javë. Shënoni aftësitë që keni dhe ato që mungojnë.`, proofSq: 'Lista e aftësive dhe orët javore të disponueshme.' },
    { titleSq: 'Vendosni kufirin e humbjes', descriptionSq: `Modeli bazë vlerëson kapital të nevojshëm prej ${c.money(c.p.capital.totalRequired)} (supozim). Vendosni sa mund të rrezikoni.`, proofSq: 'Shuma maksimale që pranoni të humbni, e shkruar.' },
  ];
}

function tasks10(c: Ctx): TaskText[] {
  return [
    { titleSq: 'Përgatitni pyetjet e intervistës', descriptionSq: `Nisuni nga pyetjet e idesë: ${quoted(c.a.interviewQuestionsSq.slice(0, 3))}`, proofSq: 'Lista e pyetjeve, pa pyetje sugjestive ose hipotetike.' },
    { titleSq: 'Gjeni 20 kandidatë për intervistë', descriptionSq: `Ku: ${c.a.firstCustomers.whereSq.join('; ')}. Kontaktojini personalisht dhe me respekt, pa mesazhe masive.`, proofSq: 'Listë me 20 kontakte të mundshme dhe statusin e secilit.' },
    { titleSq: 'Kryeni 8 intervistat e para', descriptionSq: 'Pyesni për sjelljen e kaluar dhe regjistroni çdo intervistë në ditarin e provave.', proofSq: '8 intervista në ditarin e provave.' },
    { titleSq: `Arrini të paktën ${INTERVIEW_TARGET} intervista`, descriptionSq: 'Vazhdoni derisa përgjigjet të fillojnë të përsëriten; përfshini edhe persona që nuk e kanë problemin.', proofSq: `≥${INTERVIEW_TARGET} intervista në ditarin e provave.` },
    { titleSq: 'Përmblidhni rezultatet e intervistave', descriptionSq: 'Numëroni sa e përshkruan problemin pa sugjerim, si e zgjidhin sot dhe sa paguajnë.', proofSq: 'Përmbledhje me numrat, e ruajtur te projekti.' },
  ];
}

function tasks20(c: Ctx): TaskText[] {
  return [
    { titleSq: 'Hartoni alternativat sipas llojit', descriptionSq: `Llojet: ${c.a.competitorTypesSq.join('; ')}.`, proofSq: 'Tabelë alternativash me vendndodhje ose kanal.' },
    { titleSq: 'Mblidhni çmimet e të paktën 10 alternativave', descriptionSq: `Për të njëjtën njësi («${c.inputs.unitLabelSq}»), me datë dhe burim.`, proofSq: 'Tabelë me ≥10 çmime.' },
    { titleSq: 'Zgjidhni dallimin tuaj', descriptionSq: `Mundësi: ${c.a.differentiationSq.join(' ')}`, proofSq: 'Një fjali që shpjegon pse klienti ju zgjedh ju.' },
    { titleSq: 'Shkruani ofertën me çmim', descriptionSq: c.a.offerSq, proofSq: 'Oferta e shkruar, me çmim dhe kushte.' },
  ];
}

function tasks30(c: Ctx): TaskText[] {
  return [
    { titleSq: 'Futni çmimet reale në modelin financiar', descriptionSq: 'Zëvendësoni supozimet me çmimet e anketës dhe me ofertat e marra.', proofSq: 'Zërat kryesorë kanë burim «ofertë» ose «verifikuar».' },
    { titleSq: 'Kontrolloni pikën e barazimit dhe skenarin konservator', descriptionSq: breakEvenSq(c), proofSq: 'Shënim me pikën e barazimit dhe rezultatin e skenarit konservator.' },
    { titleSq: 'Përcaktoni buxhetin e nisjes', descriptionSq: `Investimi fillestar sipas modelit: ${c.money(c.p.capital.startupTotal)} (supozim).`, proofSq: 'Buxheti i nisjes me kufirin maksimal të shpenzimit.' },
    { titleSq: 'Vendosni çmimin e ofertës së provës', descriptionSq: 'Çmimi i provës duhet të mbulojë të paktën koston variabël.', proofSq: 'Çmimi i provës i shkruar në ofertë.' },
  ];
}

function tasks40(c: Ctx): TaskText[] {
  const pros = c.a.licensedProfessionalsSq.length > 0 ? ` Profesionistë të licencuar: ${joinSq(c.a.licensedProfessionalsSq)}.` : '';
  return [
    { titleSq: 'Verifikoni formën e regjistrimit dhe faturimin', descriptionSq: `Në burimet zyrtare të vendit të operimit (${c.countryNameSq}). ${VERIFY}`, proofSq: 'Burimi zyrtar dhe data e verifikimit.' },
    { titleSq: 'Verifikoni lejet dhe licencat e aktivitetit', descriptionSq: withVerify(`${c.a.regulationNotesSq.join(' ')}${pros}`), proofSq: 'Lista e lejeve me burimin zyrtar.' },
    { titleSq: 'Verifikoni tatimet, kontributet dhe sigurimet', descriptionSq: `Pyesni administratën tatimore ose një profesionist të licencuar. ${VERIFY}`, proofSq: 'Shënim me detyrimet dhe burimin e tyre.' },
    { titleSq: 'Verifikoni rregullat për të dhënat personale dhe konsumatorin', descriptionSq: `Nëse ruani kontakte ose të dhëna pagese të klientëve, verifikoni pëlqimin dhe ruajtjen e sigurt. ${VERIFY}`, proofSq: 'Shënim me rregullat që zbatoni.' },
  ];
}

function tasks50(c: Ctx): TaskText[] {
  const equipment = enabledStartupLabels(c.inputs, PHASE_BUDGET_CATEGORIES.p50_60 ?? []);
  return [
    { titleSq: 'Merrni oferta nga furnitorët', descriptionSq: equipment.length > 0 ? `Për: ${joinSq(equipment)}.` : 'Për furnizimet e përsëritura dhe çdo mjet që mungon.', proofSq: '2–3 oferta me shkrim për zërat kryesorë.' },
    { titleSq: 'Siguroni mjetet e nevojshme për provën', descriptionSq: 'Blini ose huazoni vetëm atë që duhet për provën; pjesa tjetër pret rezultatet.', proofSq: 'Lista e mjeteve gati për provën.' },
    { titleSq: 'Shkruani procesin e punës hap pas hapi', descriptionSq: 'Porosia → realizimi → dorëzimi → faturimi → arkëtimi, me afatet.', proofSq: 'Procesi i shkruar dhe i ruajtur.' },
    { titleSq: 'Përgatitni faturimin dhe arkëtimin', descriptionSq: `Modeli supozon arkëtim pas ${formatNumber(c.inputs.collectionDays)} ditësh; vendosni si dhe kur paguajnë klientët.`, proofSq: 'Shabllon fature dhe mënyra e pagesës të gatshme.' },
  ];
}

function tasks60(c: Ctx): TaskText[] {
  return [
    { titleSq: 'Përcaktoni provën, afatin dhe kufirin e shpenzimit', descriptionSq: c.a.cheapestTestSq, proofSq: 'Plani i provës me afat dhe buxhet maksimal.' },
    { titleSq: 'Bëni 20 oferta konkrete me çmim', descriptionSq: `Oferta: ${c.a.firstCustomers.offerSq}`, proofSq: '20 oferta të regjistruara në ditarin e provave.' },
    { titleSq: 'Realizoni provën me klientët që pranojnë', descriptionSq: 'Matni kohën dhe kostot reale për secilin klient.', proofSq: 'Pagesat dhe orët e punës të regjistruara.' },
    { titleSq: 'Vlerësoni provën kundrejt kritereve', descriptionSq: `Vazhdoni nëse: ${c.a.goCriteriaSq[0] ?? '—'} Ndaloni nëse: ${c.a.killCriteriaSq[0] ?? '—'}`, proofSq: 'Vendim i shkruar pas provës.' },
  ];
}

function tasks70(c: Ctx): TaskText[] {
  const fc = c.a.firstCustomers;
  return [
    { titleSq: 'Kontaktoni klientët e mundshëm', descriptionSq: `${fc.howToContactSq.join('; ')}.`, proofSq: 'Kontaktet e regjistruara me datë dhe përgjigje.' },
    { titleSq: 'Ndiqni kontaktet', descriptionSq: fc.followUpSq, proofSq: 'Tabela e ndjekjes e përditësuar.' },
    { titleSq: 'Shërbeni klientët e parë sipas ofertës', descriptionSq: fc.offerSq, proofSq: 'Fatura ose pagesa për klientët e parë.' },
    { titleSq: 'Mblidhni reagimet e klientëve të parë', descriptionSq: quoted(c.a.feedbackQuestionsSq.slice(0, 3)), proofSq: 'Reagimet në ditarin e provave.' },
  ];
}

function tasks80(c: Ctx): TaskText[] {
  return [
    { titleSq: 'Ngrini panelin javor të metrikave', descriptionSq: `${c.a.firstCustomers.metricsSq.join('; ')}.`, proofSq: 'Paneli me të paktën 4 javë të dhëna.' },
    { titleSq: 'Krahasoni rezultatet reale me modelin', descriptionSq: 'Përditësoni çmimin, kostot dhe ritmin e klientëve me shifrat reale.', proofSq: 'Modeli financiar i përditësuar.' },
    { titleSq: 'Zbatoni 2–3 përmirësime dhe matni efektin', descriptionSq: 'Një ndryshim në një kohë, që të dini çfarë funksionoi.', proofSq: 'Lista e përmirësimeve me efektin e matur.' },
  ];
}

function tasks90(c: Ctx): TaskText[] {
  return [
    { titleSq: 'Vlerësoni kriteret e vazhdimit dhe të ndalimit', descriptionSq: `Vazhdim: ${c.a.goCriteriaSq.join(' ')} Ndalim: ${c.a.killCriteriaSq.join(' ')}`, proofSq: 'Tabelë me secilin kriter dhe provën përkatëse.' },
    { titleSq: 'Kontrolloni gatishmërinë për zgjerim', descriptionSq: 'Kostot fikse të mbuluara, para pozitive pa kapital shtesë, cilësi e qëndrueshme me më shumë klientë.', proofSq: 'Lista e kontrollit e plotësuar.' },
    { titleSq: 'Shkruani vendimin: vazhdo, ndrysho ose ndalo', descriptionSq: 'Vendimi bazohet te provat e mbledhura, jo te shpresat.', proofSq: 'Vendimi i ruajtur te projekti.' },
  ];
}

const TASK_BUILDERS: Record<PhaseId, (c: Ctx) => TaskText[]> = {
  p00_10: tasks00,
  p10_20: tasks10,
  p20_30: tasks20,
  p30_40: tasks30,
  p40_50: tasks40,
  p50_60: tasks50,
  p60_70: tasks60,
  p70_80: tasks70,
  p80_90: tasks80,
  p90_100: tasks90,
};

function phaseTasks(c: Ctx, id: PhaseId): PlanTask[] {
  const texts = TASK_BUILDERS[id](c);
  const { start, days } = PHASE_WINDOWS[id];
  const step = days / texts.length;
  return texts.map((t, i) => ({
    id: `${id}-t${i + 1}`,
    phaseId: id,
    titleSq: t.titleSq,
    descriptionSq: t.descriptionSq,
    dayOffset: start + Math.floor(i * step),
    durationDays: Math.max(1, Math.round(step)),
    weight: 1,
    status: 'per_tu_bere',
    proofSq: t.proofSq,
    completedAt: null,
    notesSq: null,
  }));
}

function horizonIds(tasks: PlanTask[], days: number): string[] {
  return tasks.filter((t) => t.dayOffset < days).map((t) => t.id);
}

/** The full 0–100 plan for one idea, place and financial model. */
export function generatePlan(args: GeneratePlanArgs): Plan {
  const { archetype, inputs, projection } = args;
  const countryNameSq = args.countryNameSq ?? getCountry(args.countryCode, { includeDemo: true })?.nameSq ?? args.countryCode;
  const city = args.city?.trim() ? args.city.trim() : null;
  const ctx: Ctx = {
    a: archetype,
    inputs,
    p: projection,
    area: city ? `${city} (${countryNameSq})` : countryNameSq,
    countryNameSq,
    money: (v) => formatMoney(v, inputs.currency),
  };

  const phases: PlanPhase[] = PHASE_IDS.map((id, index) => {
    const text = PHASE_BUILDERS[id](ctx);
    return {
      id,
      rangeLabel: PHASE_TITLES[id].range,
      titleSq: PHASE_TITLES[id].titleSq,
      actionsSq: withNotes(ctx, id, text.actionsSq),
      outputSq: text.outputSq,
      budget: phaseBudget(ctx, id, inputs.currency),
      dependencies: dependenciesOf(index),
      proofOfCompletionSq: text.proofOfCompletionSq,
      continueCriterionSq: text.continueCriterionSq,
      stopCriterionSq: text.stopCriterionSq,
    };
  });
  const tasks = PHASE_IDS.flatMap((id) => phaseTasks(ctx, id));

  return {
    phases,
    tasks,
    horizons: { d7: horizonIds(tasks, 7), d30: horizonIds(tasks, 30), d90: horizonIds(tasks, 90) },
    noteSq: PLAN_NOTE_SQ,
  };
}
