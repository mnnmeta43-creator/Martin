/**
 * "Ma shpjego në 6 hapa": a short, linear Albanian explanation of one idea.
 *
 * Text comes from the curated archetype; numbers come only from the evaluated recommendation
 * (capital ranges, fit) or from a deterministic projection, and every number is labelled as an
 * assumption. Nothing here claims that the idea will succeed.
 */
import { macroClaimStance } from '@/lib/ideas/claims';
import type { BusinessArchetype, Claim, IdeaRecommendation, MoneyRange, ProjectionResult, SixSteps } from '@/lib/domain/types';
import { BUSINESS_MODE_LABELS, MARKET_SCOPE_LABELS, skillLabel } from '@/lib/domain/taxonomy';
import { formatMoney, formatNumber } from '@/lib/finance/format';

const SEGMENT_LABELS: Record<BusinessArchetype['customerSegments'][number], string> = {
  b2b: 'biznese',
  b2c: 'individë dhe familje',
  b2g: 'institucione publike',
};

const EVIDENCE_LEVEL_SQ: Record<IdeaRecommendation['evidence']['level'], string> = {
  e_larte: 'e lartë',
  mesatare: 'mesatare',
  e_ulet: 'e ulët',
  shume_e_ulet: 'shumë e ulët',
};

const TEAM_SQ: Record<BusinessArchetype['minTeam'], string> = {
  vetem: 'Mund ta nisë një person i vetëm.',
  partner: 'Kërkon të paktën një partner.',
  ekip: 'Kërkon ekip që në nisje.',
};

const MAX_FACTS_QUOTED = 2;

function joinSq(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} dhe ${items[items.length - 1]}`;
}

function rangeSq(range: MoneyRange): string {
  return `${formatMoney(range.low, range.currency)} – ${formatMoney(range.high, range.currency)}`;
}

function whatItIs(a: BusinessArchetype): string {
  return `${a.nameSq}. ${a.offerSq} Si fitohen para: ${a.revenueModelSq}`;
}

function whoItServes(a: BusinessArchetype): string {
  const segments = joinSq(a.customerSegments.map((s) => SEGMENT_LABELS[s]));
  const modes = joinSq(a.modes.map((m) => BUSINESS_MODE_LABELS[m].toLowerCase()));
  const scopes = joinSq(a.marketScopes.map((s) => MARKET_SCOPE_LABELS[s].toLowerCase()));
  return `Paguan: ${a.payingCustomerSq} Problemi që i zgjidhet: ${a.problemSq} Klientët janë ${segments}; mënyra e punës: ${modes}; ${scopes}.`;
}

/** Facts that carry a value and a citation, quoted verbatim from the macro claims. */
function quotedFacts(macro: Claim[]): string[] {
  return macro
    .filter((c) => c.kind === 'fakt' && c.label === 'mbeshtetet_nga_te_dhenat' && c.citations.length > 0)
    .slice(0, MAX_FACTS_QUOTED)
    .map((c) => c.textSq);
}

function evidenceSentence(rec: IdeaRecommendation): string {
  const backed = rec.claims.macro.some((c) => macroClaimStance(c) === 'mbeshtet');
  const facts = quotedFacts(rec.claims.macro);
  const parts: string[] = [];
  if (rec.isDemoData) parts.push('[DEMO] Të dhënat e këtij vendi janë fiktive dhe shërbejnë vetëm për të provuar aplikacionin.');
  if (facts.length > 0) parts.push(`Të dhëna të disponueshme: ${facts.join(' ')}`);
  parts.push(
    backed
      ? 'Të paktën një tregues makro përputhet me ndryshimin (kontekst, jo provë); vetëm klientët që paguajnë e provojnë kërkesën.'
      : 'Asnjë tregues makro nuk përputhet ende me ndryshimin për këtë vend — trajtojeni si hipotezë.',
  );
  parts.push(`Cilësia e provave: ${EVIDENCE_LEVEL_SQ[rec.evidence.level]}.`);
  return parts.join(' ');
}

function whyItCouldWork(a: BusinessArchetype, rec: IdeaRecommendation | null): string {
  const w = a.whyItCouldWork;
  const chain = `Ndryshimi: ${w.changeSq} Problemi: ${w.problemSq} Arsyeja për të paguar: ${w.reasonToPaySq} Kushtet për fitim: ${w.profitConditionsSq}`;
  const tail = rec
    ? evidenceSentence(rec)
    : 'Ky zinxhir është hipotezë derisa ta konfirmoni me të dhëna dhe me klientë që paguajnë.';
  return `${chain} ${tail}`;
}

function capitalSentence(rec: IdeaRecommendation | null): string {
  if (!rec) return 'Kapitali: llogaritet në modelin financiar sipas monedhës dhe kursit të këmbimit të ruajtur.';
  if (!rec.capitalRange) {
    return 'Kapitali: nuk mund të vlerësohet në monedhën tuaj sepse mungon kursi i këmbimit — nuk e hamendësojmë.';
  }
  const parts = [`Investimi fillestar sipas supozimeve të bibliotekës: ${rangeSq(rec.capitalRange)} (supozim, jo çmim i verifikuar).`];
  if (rec.monthlyCostRange) parts.push(`Kostot fikse mujore: ${rangeSq(rec.monthlyCostRange)} (supozim).`);
  if (rec.fit.capitalGap !== null && rec.fit.capitalGap > 0) {
    parts.push(`Krahasuar me kapitalin tuaj, mungojnë rreth ${formatMoney(rec.fit.capitalGap, rec.capitalRange.currency)} edhe për skajin e ulët.`);
  }
  return parts.join(' ');
}

function whatItRequires(a: BusinessArchetype, rec: IdeaRecommendation | null): string {
  const skills = a.requiredSkills.length > 0 ? joinSq(a.requiredSkills.map(skillLabel)) : 'asnjë aftësi e detyrueshme nga lista';
  const parts = [
    `Aftësi: ${skills}.`,
    `Kohë: të paktën ${formatNumber(a.minHoursPerWeek)} orë në javë.`,
    TEAM_SQ[a.minTeam],
    a.canStartFromHome ? 'Mund të niset nga shtëpia.' : 'Kërkon ambient pune ose lokal.',
  ];
  if (a.regulated || a.licensedProfessionalsSq.length > 0) {
    const pros = a.licensedProfessionalsSq.length > 0 ? ` Profesionistë të licencuar: ${joinSq(a.licensedProfessionalsSq)}.` : '';
    const what = a.regulated ? 'Veprimtari e rregulluar: licencat dhe lejet duhen verifikuar para nisjes' : 'Disa punë kërkojnë profesionistë të licencuar';
    parts.push(`${what} (Kërkon verifikim lokal).${pros}`);
  }
  parts.push(capitalSentence(rec));
  if (rec && rec.fit.blockersSq.length > 0) parts.push(`Pengesa sipas profilit tuaj: ${rec.fit.blockersSq.join(' ')}`);
  return parts.join(' ');
}

function howToStart(a: BusinessArchetype): string {
  return `Testoni kërkesën para çdo shpenzimi (kjo nuk e nis biznesin): ${a.zeroCapitalTestSq} Pastaj testi më i lirë me para reale: ${a.cheapestTestSq} Para çdo blerjeje bëni të paktën 15 intervista me pyetje për sjelljen e kaluar, jo për mendime.`;
}

function breakEvenSentence(projection: ProjectionResult | null | undefined): string | null {
  if (!projection) return null;
  const ue = projection.unitEconomics;
  if (ue.status === 'kontribut_zero_ose_negativ') {
    return 'Sipas supozimeve të modelit bazë, çdo shitje nuk mbulon koston variabël — pa ndryshuar çmimin ose koston nuk ka pikë barazimi.';
  }
  if (ue.breakEvenCustomersPerMonth === null) return null;
  return `Sipas supozimeve të modelit bazë, pika e barazimit është rreth ${formatNumber(Math.ceil(ue.breakEvenCustomersPerMonth))} klientë në muaj (supozim, jo garanci).`;
}

function howToMeasure(a: BusinessArchetype, projection: ProjectionResult | null | undefined): string {
  const parts = [`Matni çdo javë: ${a.firstCustomers.metricsSq.join('; ')}.`];
  const breakEven = breakEvenSentence(projection);
  if (breakEven) parts.push(breakEven);
  if (a.goCriteriaSq[0]) parts.push(`Vazhdoni nëse: ${a.goCriteriaSq[0]}`);
  if (a.killCriteriaSq[0]) parts.push(`Ndaloni ose ndryshoni nëse: ${a.killCriteriaSq[0]}`);
  parts.push('Vetëm pagesat dhe parapagimet vlejnë si provë kërkese; interesi verbal jo.');
  return parts.join(' ');
}

/**
 * Six concrete steps. `rec` adds data, fit and capital context; `projection` (optional, base
 * scenario) adds the break-even figure. Without them the text stays purely descriptive.
 */
export function explainInSixSteps(
  a: BusinessArchetype,
  rec: IdeaRecommendation | null,
  projection?: ProjectionResult | null,
): SixSteps {
  return {
    whatItIsSq: whatItIs(a),
    whoItServesSq: whoItServes(a),
    whyItCouldWorkSq: whyItCouldWork(a, rec),
    whatItRequiresSq: whatItRequires(a, rec),
    howToStartSq: howToStart(a),
    howToMeasureSq: howToMeasure(a, projection),
  };
}
