/**
 * Pohimet e një ideje: lidhjet makro, zinxhiri "pse mund të funksionojë" dhe "pse mund të dështojë".
 *
 * Pure. Every statement is a typed Claim (fakt / interpretim / supozim / parashikim) with an
 * evidence label. Only a statement that rests on a stored Observation is labelled
 * 'mbeshtetet_nga_te_dhenat', and it always carries the citation of that observation. A missing
 * indicator becomes an explicit "mungon" assumption — never a value, never 0. Interpretations of
 * macro data are hypotheses: macro context can make an idea plausible, only customers prove it.
 *
 * The stance of each macro interpretation (supports / contradicts / not assessable) is encoded
 * in its claim id so scoring and the country comparison read exactly what the user sees.
 */
import type {
  BusinessArchetype,
  Citation,
  Claim,
  CountryDataContext,
  CurrencyCode,
  DataStatus,
  EvidenceLabel,
  FailureKind,
  IndicatorChange,
  IndicatorDefinition,
  IndicatorSeries,
  MacroLink,
  Observation,
  ProfileFit,
  ProjectionResult,
} from '@/lib/domain/types';
import { FAILURE_KIND_LABELS } from '@/lib/domain/taxonomy';
import { citationForObservation } from '@/lib/analysis/citations';
import { getIndicator } from '@/lib/data/indicators';
import { formatIndicatorValue, formatMoney, formatNumber, formatPeriod } from '@/lib/finance/format';

export type MacroStance = 'mbeshtet' | 'kundershton' | 'pa_vleresim' | 'mungon' | 'parashikim';

export interface MacroLinkAssessment {
  link: MacroLink;
  nameSq: string;
  stance: MacroStance;
  status: DataStatus;
  /** Latest measured observation, or the nearest projection when only projections exist. */
  observation: Observation | null;
  citation: Citation | null;
  /** Albanian sentence explaining the verdict (value vs reference, or direction of change). */
  verdictSq: string;
}

/** Heuristic signal thresholds (same spirit as analysis/macro.ts): they flag a risk to check, never a verdict. */
export const HIGH_INFLATION_PCT = 6;
export const HIGH_LENDING_RATE_PCT = 10;
/** Share of an idea's macro links that may be missing/stale before we flag an evidence risk. */
export const WEAK_EVIDENCE_SHARE = 0.5;

// Below these magnitudes a change counts as "almost unchanged" (matches analysis/macro.ts).
const FLAT_PP = 0.05;
const FLAT_PCT = 0.5;
const MINUS = '−';

const ASSESSABLE_STANCES: ReadonlySet<MacroStance> = new Set(['mbeshtet', 'kundershton', 'pa_vleresim']);

/** Failure kinds that can be checked directly with customers (the rest are risks to plan for). */
const TESTABLE_FAILURES: ReadonlySet<FailureKind> = new Set(['kerkese_e_pamjaftueshme', 'cmim', 'konkurrence']);

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function demoPrefix(ctx: CountryDataContext): string {
  return ctx.isDemo ? '[DEMO] ' : '';
}

function hasValue(o: Observation | null | undefined): o is Observation & { value: number } {
  return !!o && typeof o.value === 'number' && Number.isFinite(o.value);
}

function seriesFor(ctx: CountryDataContext, code: string): IndicatorSeries | undefined {
  return ctx.series.find((s) => s.definition.code === code);
}

function nearestProjection(series: IndicatorSeries): Observation | null {
  return series.observations.find((o) => o.isProjection && hasValue(o)) ?? null;
}

function signed(n: number, decimals: number): string {
  const abs = formatNumber(Math.abs(n), decimals);
  if (abs === formatNumber(0, decimals)) return abs;
  return `${n > 0 ? '+' : MINUS}${abs}`;
}

function deltaTextSq(change: IndicatorChange): string {
  if (change.delta === null) return '';
  if (change.deltaKind === 'pike_perqindjeje') return `${signed(change.delta, 1)} pikë përqindjeje`;
  if (change.deltaKind === 'ndryshim_perqindjeje') return `${signed(change.delta, 1)}%`;
  return `${signed(change.delta, 2)}, ndryshim absolut`;
}

function isFlat(change: IndicatorChange): boolean {
  if (change.delta === null) return true;
  return change.deltaKind === 'pike_perqindjeje' ? Math.abs(change.delta) < FLAT_PP : Math.abs(change.delta) < FLAT_PCT;
}

function isStale(status: DataStatus): boolean {
  return status === 'i_vjeter' || status === 'shume_i_vjeter';
}

/** A citation is traceable when it names the stored source URL, period and retrieval time. */
export function isTraceableCitation(c: Citation): boolean {
  return Boolean(c.url && c.period && c.retrievedAt);
}

function dedupeCitations(list: Citation[]): Citation[] {
  const seen = new Set<string>();
  return list.filter((c) => {
    const key = `${c.sourceId}|${c.indicatorCode ?? ''}|${c.countryCode ?? ''}|${c.period ?? ''}|${c.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function claim(id: string, textSq: string, kind: Claim['kind'], label: EvidenceLabel, citations: Citation[] = []): Claim {
  // Defensive: a data-backed label without a traceable citation is downgraded, never emitted.
  const traceable = citations.filter(isTraceableCitation);
  const safeLabel = label === 'mbeshtetet_nga_te_dhenat' && traceable.length === 0 ? 'hipoteze' : label;
  return { id, textSq, kind, label: safeLabel, citations: label === 'mbeshtetet_nga_te_dhenat' ? traceable : citations };
}

// ─────────────────────────────────────────────────────────────────────────────
// Macro links
// ─────────────────────────────────────────────────────────────────────────────

const STANCE_ID_PATTERN = /:makro:[^:]+:interpretim:(mbeshtet|kundershton|pa_vleresim)$/;

function macroId(a: BusinessArchetype, code: string, suffix: string): string {
  return `${a.id}:makro:${code}:${suffix}`;
}

/** Stance of a macro interpretation claim, read from its id; null for any other claim. */
export function macroClaimStance(c: Claim): Extract<MacroStance, 'mbeshtet' | 'kundershton' | 'pa_vleresim'> | null {
  const m = STANCE_ID_PATTERN.exec(c.id);
  return m ? (m[1] as 'mbeshtet' | 'kundershton' | 'pa_vleresim') : null;
}

function levelVerdict(link: MacroLink, def: IndicatorDefinition, value: number): { stance: MacroStance; verdictSq: string } {
  if (link.referenceValue === undefined || !Number.isFinite(link.referenceValue)) {
    return {
      stance: 'pa_vleresim',
      verdictSq:
        'Pa një nivel referimi të shprehur nuk gjykojmë nëse kjo vlerë është «e lartë» apo «e ulët»; krahasojeni me vende ose rajone të ngjashme.',
    };
  }
  const ref = link.referenceValue;
  const wantsHigh = link.direction === 'me_i_larte_mbeshtet';
  const supports = wantsHigh ? value >= ref : value <= ref;
  const position = value > ref ? 'mbi' : value < ref ? 'nën' : 'e barabartë me';
  return {
    stance: supports ? 'mbeshtet' : 'kundershton',
    verdictSq: `Vlera (${formatIndicatorValue(value, def)}) është ${position} nivelin referues ${formatIndicatorValue(ref, def)} — ky nivel është supozim i shprehur i bibliotekës, jo ligj ekonomik.`,
  };
}

function changeVerdict(link: MacroLink, change: IndicatorChange, def: IndicatorDefinition): { stance: MacroStance; verdictSq: string } {
  if (!change.comparable || change.delta === null || change.fromPeriod === null) {
    return { stance: 'pa_vleresim', verdictSq: 'Nuk ka dy vlera të matura e të krahasueshme, prandaj drejtimi i ndryshimit nuk vlerësohet.' };
  }
  const span = `Nga ${formatPeriod(change.fromPeriod)} në ${formatPeriod(change.toPeriod)}`;
  const values = `${formatIndicatorValue(change.fromValue, def)} → ${formatIndicatorValue(change.toValue, def)}`;
  const caveat = change.warningsSq.length > 0 ? ` ${change.warningsSq.join(' ')}` : '';
  if (isFlat(change)) {
    return { stance: 'pa_vleresim', verdictSq: `${span} treguesi mbeti pothuajse i pandryshuar (${values}).${caveat}` };
  }
  const up = change.delta > 0;
  const supports = link.direction === 'rritja_mbeshtet' ? up : !up;
  return {
    stance: supports ? 'mbeshtet' : 'kundershton',
    verdictSq: `${span} treguesi ${up ? 'u rrit' : 'ra'} (${deltaTextSq(change)}; ${values}).${caveat}`,
  };
}

function assessLink(link: MacroLink, ctx: CountryDataContext): MacroLinkAssessment {
  const series = seriesFor(ctx, link.indicatorCode);
  const def = series?.definition ?? getIndicator(link.indicatorCode);
  const nameSq = def?.nameSq ?? link.indicatorCode;
  const status: DataStatus = series?.status ?? 'mungon';
  const base = { link, nameSq, status };
  if (series && def && hasValue(series.latest)) {
    const obs = series.latest;
    const isLevel = link.direction === 'me_i_larte_mbeshtet' || link.direction === 'me_i_ulet_mbeshtet';
    const verdict = isLevel ? levelVerdict(link, def, obs.value) : changeVerdict(link, series.change, def);
    return { ...base, ...verdict, observation: obs, citation: citationForObservation(def, obs) };
  }
  const projection = series && def ? nearestProjection(series) : null;
  if (projection && def) {
    return {
      ...base,
      stance: 'parashikim',
      observation: projection,
      citation: citationForObservation(def, projection),
      verdictSq: 'Ka vetëm parashikim, jo matje; parashikimi nuk përdoret për të mbështetur ose kundërshtuar idenë.',
    };
  }
  return { ...base, stance: 'mungon', observation: null, citation: null, verdictSq: series?.statusReasonSq ?? 'Treguesi nuk ndiqet për këtë vend.' };
}

/** Structured verdict for every macro link of the archetype (single source for claims and scoring). */
export function assessMacroLinks(a: BusinessArchetype, ctx: CountryDataContext): MacroLinkAssessment[] {
  return a.macroLinks.map((link) => assessLink(link, ctx));
}

function stanceSentenceSq(m: MacroLinkAssessment): string {
  if (m.stance === 'mbeshtet') return `Kjo e mbështet lidhjen me idenë (hipotezë). ${m.link.ifSupportsSq}`;
  if (m.stance === 'kundershton') return `Kjo e kundërshton lidhjen me idenë (hipotezë). ${m.link.ifContradictsSq}`;
  return 'Nga ky tregues lidhja nuk mund të gjykohet.';
}

function claimsForLink(a: BusinessArchetype, ctx: CountryDataContext, m: MacroLinkAssessment): Claim[] {
  const prefix = demoPrefix(ctx);
  const code = m.link.indicatorCode;
  const def = getIndicator(code);
  if (m.stance === 'mungon' || !m.observation || !m.citation || !def) {
    return [
      claim(
        macroId(a, code, 'mungon'),
        `${prefix}Mungon treguesi «${m.nameSq}» për këtë vend — nuk mund ta vlerësojmë; mblidhni prova lokale. Arsyeja: ${m.verdictSq} Lidhja që do të kontrollonim: ${m.link.mechanismSq}`,
        'supozim',
        'hipoteze',
      ),
    ];
  }
  const valueSq = `${formatIndicatorValue(m.observation.value, def)} (${formatPeriod(m.observation.period)}, ${m.citation.sourceName})`;
  if (m.stance === 'parashikim') {
    return [
      claim(
        macroId(a, code, 'parashikim'),
        `${prefix}Për «${m.nameSq}» ka vetëm parashikim të burimit: ${valueSq}. Parashikimi rishikohet dhe nuk është matje, prandaj nuk përdoret për të mbështetur idenë. Lidhja që do të kontrollonim: ${m.link.mechanismSq}`,
        'parashikim',
        'hipoteze',
        [m.citation],
      ),
    ];
  }
  const staleSq = isStale(m.status) ? ` Kujdes: ${seriesFor(ctx, code)?.statusReasonSq ?? 'vlerë e vjetër.'}` : '';
  return [
    claim(macroId(a, code, 'fakt'), `${prefix}${m.nameSq}: ${valueSq}.${staleSq}`, 'fakt', 'mbeshtetet_nga_te_dhenat', [m.citation]),
    claim(
      macroId(a, code, `interpretim:${m.stance}`),
      `${prefix}${m.verdictSq} ${stanceSentenceSq(m)} Mekanizmi: ${m.link.mechanismSq}`,
      'interpretim',
      'hipoteze',
      [m.citation],
    ),
  ];
}

/** Facts and hypotheses for each macro link of the idea, in the archetype's order. */
export function buildMacroClaims(a: BusinessArchetype, ctx: CountryDataContext): Claim[] {
  return assessMacroLinks(a, ctx).flatMap((m) => claimsForLink(a, ctx, m));
}

/** Macro links that have a measured value and an assessable verdict. */
export function isAssessedStance(stance: MacroStance): boolean {
  return ASSESSABLE_STANCES.has(stance);
}

// ─────────────────────────────────────────────────────────────────────────────
// Why it could work (6-step chain)
// ─────────────────────────────────────────────────────────────────────────────

function moneyFn(currency: CurrencyCode | undefined): (v: number) => string {
  return (v) => (currency ? formatMoney(v, currency) : formatNumber(v, 2));
}

function profitNumbersSq(a: BusinessArchetype, projection: ProjectionResult | null, currency?: CurrencyCode): string {
  if (!projection) {
    return ' Numrat nuk u llogaritën, sepse modeli financiar nuk u ndërtua (zakonisht mungon kursi i këmbimit).';
  }
  const m = moneyFn(currency);
  const ue = projection.unitEconomics;
  const cap = projection.capital;
  if (ue.status === 'kontribut_zero_ose_negativ') {
    return ` Me supozimet e skenarit bazë kontributi për njësi është zero ose negativ (çmimi ${m(ue.pricePerUnit)} kundrejt kostos variabël ${m(ue.variableCostPerUnit)}): në këtë formë biznesi nuk arrin barazimin.`;
  }
  const breakEven =
    ue.breakEvenCustomersPerMonth === null
      ? 'pika e barazimit në klientë nuk llogaritet'
      : `pika e barazimit ≈ ${formatNumber(ue.breakEvenCustomersPerMonth, 1)} klientë në muaj (≈ ${formatNumber(ue.breakEvenUnitsPerMonth, 1)} × «${a.pricing.unitLabelSq}», me çmim ${m(ue.pricePerUnit)})`;
  const capital = `kapitali i nevojshëm ≈ ${m(cap.totalRequired)} (hapja ${m(cap.startupTotal)} + deficiti i operimit ${m(cap.maxOperatingDeficit)} + rezerva ${m(cap.reserve)})`;
  return ` Supozime të skenarit bazë, jo premtime: ${breakEven}; ${capital}. Fitimi varet nga arritja e këtyre numrave me klientë realë.`;
}

function indicatorNames(citations: Citation[]): string {
  const names = [...new Set(citations.map((c) => getIndicator(c.indicatorCode ?? '')?.nameSq ?? c.indicatorCode ?? c.sourceName))];
  return names.join(', ');
}

/**
 * The chain change → problem → customer → offer → reason to pay → profit conditions.
 * Only "change" can be data-backed, and only when at least one macro interpretation supports it.
 */
export function buildWhyWorkClaims(
  a: BusinessArchetype,
  ctx: CountryDataContext,
  macroClaims: Claim[],
  projection: ProjectionResult | null,
  currency?: CurrencyCode,
): Claim[] {
  const prefix = demoPrefix(ctx);
  const w = a.whyItCouldWork;
  const supporting = macroClaims.filter((c) => macroClaimStance(c) === 'mbeshtet');
  const contradicting = macroClaims.filter((c) => macroClaimStance(c) === 'kundershton');
  const support = dedupeCitations(supporting.flatMap((c) => c.citations)).filter(isTraceableCitation);
  const against = dedupeCitations(contradicting.flatMap((c) => c.citations));
  const againstSq = against.length > 0 ? ` Por këta tregues e kundërshtojnë: ${indicatorNames(against)}.` : '';
  const changeSq =
    support.length > 0
      ? `${prefix}Ndryshimi: ${w.changeSq} Të dhënat që e mbështetin: ${indicatorNames(support)}.${againstSq}`
      : `${prefix}Ndryshimi: ${w.changeSq} Asnjë tregues i lidhur nuk e mbështet me të dhëna për këtë vend — trajtojeni si hipotezë.${againstSq}`;
  const id = (step: string) => `${a.id}:pse-funksionon:${step}`;
  return [
    claim(id('ndryshimi'), changeSq, 'interpretim', support.length > 0 ? 'mbeshtetet_nga_te_dhenat' : 'hipoteze', support),
    claim(id('problemi'), `Problemi: ${w.problemSq}`, 'interpretim', 'hipoteze'),
    claim(id('klienti'), `Klienti: ${w.customerSq}`, 'supozim', 'duhet_testuar'),
    claim(id('oferta'), `Oferta: ${w.offerSq}`, 'supozim', 'hipoteze'),
    claim(id('arsyeja'), `Arsyeja për të paguar: ${w.reasonToPaySq}`, 'supozim', 'duhet_testuar'),
    claim(id('fitimi'), `Kushtet për fitim: ${w.profitConditionsSq}${profitNumbersSq(a, projection, currency)}`, 'supozim', 'hipoteze'),
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Why it could fail
// ─────────────────────────────────────────────────────────────────────────────

interface Measured {
  def: IndicatorDefinition;
  obs: Observation & { value: number };
  citation: Citation;
  valueSq: string;
}

function measured(ctx: CountryDataContext, code: string): Measured | null {
  const series = seriesFor(ctx, code);
  if (!series || !hasValue(series.latest)) return null;
  const citation = citationForObservation(series.definition, series.latest);
  return {
    def: series.definition,
    obs: series.latest,
    citation,
    valueSq: `${formatIndicatorValue(series.latest.value, series.definition)} (${formatPeriod(series.latest.period)}, ${citation.sourceName})`,
  };
}

function dataRiskClaims(a: BusinessArchetype, ctx: CountryDataContext): Claim[] {
  const prefix = demoPrefix(ctx);
  const id = (key: string) => `${a.id}:pse-deshton:te-dhena:${key}`;
  const out: Claim[] = [];
  const inflation = measured(ctx, 'inflation_cpi') ?? measured(ctx, 'imf_inflation');
  if (inflation && inflation.obs.value >= HIGH_INFLATION_PCT) {
    out.push(
      claim(
        id('inflacioni'),
        `${prefix}Rrezik kostoje: ${inflation.def.nameSq} ${inflation.valueSq} është mbi pragun orientues ${HIGH_INFLATION_PCT}%. Kostot e furnizimit, qiraja dhe pagat mund të rriten më shpejt se çmimet që mund të vendosni; rishikoni ofertat e furnitorëve më shpesh.`,
        'interpretim',
        'mbeshtetet_nga_te_dhenat',
        [inflation.citation],
      ),
    );
  }
  const lending = measured(ctx, 'lending_rate');
  if (lending && lending.obs.value >= HIGH_LENDING_RATE_PCT) {
    out.push(
      claim(
        id('kredia'),
        `${prefix}Kredia është e shtrenjtë: ${lending.def.nameSq} ${lending.valueSq} është mbi pragun orientues ${HIGH_LENDING_RATE_PCT}%. Modeli nuk supozon kredi; nëse mungesën e kapitalit e mbuloni me borxh, interesi e rëndon ndjeshëm rezultatin.`,
        'interpretim',
        'mbeshtetet_nga_te_dhenat',
        [lending.citation],
      ),
    );
  }
  const growth = measured(ctx, 'gdp_growth');
  if (growth && growth.obs.value < 0) {
    out.push(
      claim(
        id('tkurrja'),
        `${prefix}Rrezik kërkese: ${growth.def.nameSq} ${growth.valueSq} është negative. Në tkurrje klientët shpesh shtyjnë blerjet jo-thelbësore dhe pagesat vonohen.`,
        'interpretim',
        'mbeshtetet_nga_te_dhenat',
        [growth.citation],
      ),
    );
  }
  out.push(...evidenceRiskClaims(a, ctx));
  return out;
}

function evidenceRiskClaims(a: BusinessArchetype, ctx: CountryDataContext): Claim[] {
  const links = assessMacroLinks(a, ctx);
  const weak = links.filter((m) => m.stance === 'mungon' || m.stance === 'parashikim' || m.status === 'shume_i_vjeter');
  const insufficient = ctx.coverage.level === 'e_pamjaftueshme';
  const weakShare = links.length > 0 ? weak.length / links.length : 0;
  if (!insufficient && weakShare < WEAK_EVIDENCE_SHARE) return [];
  const parts: string[] = [];
  if (weak.length > 0) {
    parts.push(`${weak.length} nga ${links.length} tregues të lidhur me këtë ide mungojnë, janë vetëm parashikime ose janë shumë të vjetër`);
  }
  if (insufficient) parts.push('mbulimi i të dhënave për këtë vend është i pamjaftueshëm');
  const stale = weak.filter((m) => m.stance !== 'mungon' && m.citation).map((m) => m.citation as Citation);
  return [
    claim(
      `${a.id}:pse-deshton:te-dhena:prova`,
      `${demoPrefix(ctx)}Rrezik provash: ${parts.join('; ')}. Vlerësimi mbështetet më shumë te supozimet — mblidhni prova lokale para çdo shpenzimi.`,
      'interpretim',
      'hipoteze',
      stale,
    ),
  ];
}

function engineRiskClaims(a: BusinessArchetype, projection: ProjectionResult | null, currency?: CurrencyCode): Claim[] {
  if (!projection) return [];
  const m = moneyFn(currency);
  const id = (key: string) => `${a.id}:pse-deshton:modeli:${key}`;
  const out: Claim[] = [];
  if (projection.unitEconomics.status === 'kontribut_zero_ose_negativ') {
    out.push(
      claim(
        id('kontributi'),
        'Me supozimet e skenarit bazë kontributi për njësi është zero ose negativ: çdo shitje humbet para ose nuk mbulon asgjë, dhe më shumë shitje e përkeqësojnë situatën.',
        'supozim',
        'hipoteze',
      ),
    );
  }
  if (projection.minCashBalance < 0) {
    const when = projection.minCashMonth === 0 ? 'që para muajit të parë' : `në muajin ${projection.minCashMonth}`;
    out.push(
      claim(
        id('paraja'),
        `Me supozimet e skenarit bazë paraja bie nën zero (minimumi ${m(projection.minCashBalance)} ${when}); pa kapital shtesë ose ndryshim plani biznesi mund të ndalet para se të fitojë.`,
        'supozim',
        'hipoteze',
      ),
    );
  }
  if (projection.capital.startupTotal > 0 && projection.payback.recoveredInMonth === null) {
    out.push(claim(id('rikuperimi'), `Skenari bazë: ${projection.payback.statementSq}`, 'supozim', 'hipoteze'));
  }
  if (projection.capital.gap > 0) {
    out.push(
      claim(
        id('mungesa-kapitali'),
        `Mungesa e kapitalit në skenarin bazë: ${m(projection.capital.gap)} (kapitali i nevojshëm ${m(projection.capital.totalRequired)} kundrejt ${m(projection.capital.ownCapital)} tuajve). Modeli nuk supozon kredi apo grante.`,
        'supozim',
        'hipoteze',
      ),
    );
  }
  return out;
}

/** Failure modes, data-driven risks, model warnings, profile mismatches and falsifiers. */
export function buildWhyFailClaims(
  a: BusinessArchetype,
  ctx: CountryDataContext,
  projection: ProjectionResult | null,
  fit: ProfileFit,
  currency?: CurrencyCode,
): Claim[] {
  const id = (key: string) => `${a.id}:pse-deshton:${key}`;
  const failures = a.failureModes.map((f, i) =>
    claim(id(`menyra-${i + 1}`), `${FAILURE_KIND_LABELS[f.kind]}: ${f.textSq}`, 'supozim', TESTABLE_FAILURES.has(f.kind) ? 'duhet_testuar' : 'hipoteze'),
  );
  const profile = [
    ...fit.blockersSq.map((b, i) => claim(id(`pengese-${i + 1}`), `Pengesë nga profili: ${b}`, 'interpretim', 'hipoteze')),
    ...fit.mismatchesSq.map((t, i) => claim(id(`profili-${i + 1}`), `Mospërputhje me profilin: ${t}`, 'interpretim', 'hipoteze')),
  ];
  const falsifiers = a.falsifiersSq.map((f, i) => claim(id(`rrezuese-${i + 1}`), `Ideja rrëzohet nëse: ${f}`, 'supozim', 'duhet_testuar'));
  return [...failures, ...dataRiskClaims(a, ctx), ...engineRiskClaims(a, projection, currency), ...profile, ...falsifiers];
}
