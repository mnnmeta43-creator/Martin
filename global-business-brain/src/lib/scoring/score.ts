/**
 * Pikëzimi krahasues i një ideje dhe cilësia e provave (pure, deterministic, explainable).
 *
 * Six dimensions are scored 0–100, each with its basis and an Albanian reason. A dimension that
 * cannot be assessed is `null` and is left out of the weighted total — it is never treated as 0.
 * A real, computed 0 is allowed (e.g. contribution per unit ≤ 0) and is always explained.
 * Weights are visible integers that sum to 100. The score is an orientation tool to compare
 * ideas for one person, not a statistical probability of profit.
 */
import type {
  BusinessArchetype,
  Claim,
  CountryDataContext,
  DimensionScore,
  EvidenceEntry,
  EvidenceQuality,
  MoneyRange,
  ProfileFit,
  ProjectionResult,
  ScoreDimensionId,
  ScoreResult,
  ScoreWeights,
  UserProfile,
} from '@/lib/domain/types';
import { DEFAULT_SCORE_WEIGHTS, SCORE_DIMENSION_LABELS } from '@/lib/domain/taxonomy';
import { formatIndicatorValue, formatNumber, formatPercent, formatPeriod } from '@/lib/finance/format';
import { macroClaimStance } from '@/lib/ideas/claims';
import { sameCurrency } from '@/lib/ideas/fit';

export const SCORE_DIMENSION_IDS: readonly ScoreDimensionId[] = ['kerkesa', 'kapitali', 'aftesite', 'veshtiresia', 'ekonomia', 'rreziku'];

export const SCORE_NOTE_SQ = 'Pikëzimi është mjet orientimi, jo probabilitet statistikor fitimi.';

/** Points added to "kërkesa" per paying customer (payment or confirmed pre-order) and per interview. */
export const PAID_EVIDENCE_POINTS = 8;
export const PAID_EVIDENCE_CAP = 40;
export const INTERVIEW_POINTS = 1;
export const INTERVIEW_CAP = 10;

const PAID_TYPES: ReadonlySet<EvidenceEntry['type']> = new Set(['pagese', 'parapagim']);

// ─────────────────────────────────────────────────────────────────────────────
// Weights
// ─────────────────────────────────────────────────────────────────────────────

export function validateWeights(w: unknown): { ok: boolean; errorsSq: string[] } {
  const errorsSq: string[] = [];
  if (!w || typeof w !== 'object' || Array.isArray(w)) {
    return { ok: false, errorsSq: ['Peshat duhet të jenë një objekt me 6 dimensione.'] };
  }
  const record = w as Record<string, unknown>;
  const keys = Object.keys(record);
  const unknown = keys.filter((k) => !(SCORE_DIMENSION_IDS as readonly string[]).includes(k));
  const missing = SCORE_DIMENSION_IDS.filter((k) => !(k in record));
  if (unknown.length > 0) errorsSq.push(`Dimensione të panjohura: ${unknown.join(', ')}.`);
  if (missing.length > 0) errorsSq.push(`Mungojnë peshat për: ${missing.map((k) => SCORE_DIMENSION_LABELS[k]).join(', ')}.`);
  let sum = 0;
  for (const id of SCORE_DIMENSION_IDS) {
    if (!(id in record)) continue;
    const v = record[id];
    if (typeof v !== 'number' || !Number.isInteger(v) || v < 0 || v > 100) {
      errorsSq.push(`Pesha për «${SCORE_DIMENSION_LABELS[id]}» duhet të jetë numër i plotë nga 0 deri në 100.`);
    } else {
      sum += v;
    }
  }
  if (errorsSq.length === 0 && sum !== 100) errorsSq.push(`Shuma e peshave duhet të jetë saktësisht 100 (tani është ${sum}).`);
  return { ok: errorsSq.length === 0, errorsSq };
}

/**
 * Scales any non-negative weights to integers that sum to exactly 100 (largest-remainder method;
 * ties go to the earlier dimension so the result is deterministic). All-zero → defaults.
 */
export function normalizeWeights(partial: Partial<ScoreWeights>): ScoreWeights {
  const raw = SCORE_DIMENSION_IDS.map((id) => {
    const v = partial[id];
    return typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : 0;
  });
  const total = raw.reduce((s, v) => s + v, 0);
  if (total <= 0) return { ...DEFAULT_SCORE_WEIGHTS };
  const exact = raw.map((v) => (v / total) * 100);
  const floors = exact.map(Math.floor);
  let remaining = 100 - floors.reduce((s, v) => s + v, 0);
  const order = exact.map((v, i) => ({ i, rem: v - floors[i] })).sort((a, b) => b.rem - a.rem || a.i - b.i);
  for (const { i } of order) {
    if (remaining <= 0) break;
    floors[i] += 1;
    remaining -= 1;
  }
  return Object.fromEntries(SCORE_DIMENSION_IDS.map((id, i) => [id, floors[i]])) as ScoreWeights;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dimensions
// ─────────────────────────────────────────────────────────────────────────────

export interface ScoreInput {
  archetype: BusinessArchetype;
  profile: UserProfile;
  fit: ProfileFit;
  /** Base-scenario projection in the profile currency; null when the model could not be built. */
  projection: ProjectionResult | null;
  macroClaims: Claim[];
  ctx: CountryDataContext;
  weights: ScoreWeights;
  evidence?: EvidenceEntry[];
  /** Startup-cost range in the profile currency (for ease of start); null when unknown. */
  capitalRange?: MoneyRange | null;
}

function clamp(v: number, lo = 0, hi = 100): number {
  return Math.min(hi, Math.max(lo, v));
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

function dim(id: ScoreDimensionId, score: number | null, basis: DimensionScore['basis'], reasonSq: string): DimensionScore {
  return { id, labelSq: SCORE_DIMENSION_LABELS[id], score: score === null ? null : round1(clamp(score)), basis, reasonSq };
}

/** Albanian verb agreement: "1 tregues e mbështet", "2 tregues e mbështetin". */
function verb(n: number, singular: string, plural: string): string {
  return n === 1 ? singular : plural;
}

function quantity(e: EvidenceEntry): number {
  return typeof e.quantity === 'number' && Number.isFinite(e.quantity) && e.quantity > 0 ? e.quantity : 1;
}

interface DemandEvidence {
  paid: number;
  interviews: number;
}

function demandEvidence(evidence: EvidenceEntry[] = []): DemandEvidence {
  let paid = 0;
  let interviews = 0;
  for (const e of evidence) {
    if (PAID_TYPES.has(e.type)) paid += quantity(e);
    else if (e.type === 'interviste') interviews += quantity(e);
  }
  return { paid, interviews };
}

function demandDimension(macroClaims: Claim[], ctx: CountryDataContext, evidence?: EvidenceEntry[]): DimensionScore {
  let supports = 0;
  let contradicts = 0;
  let neutral = 0;
  for (const c of macroClaims) {
    const stance = macroClaimStance(c);
    if (stance === 'mbeshtet') supports += 1;
    else if (stance === 'kundershton') contradicts += 1;
    else if (stance === 'pa_vleresim') neutral += 1;
  }
  const assessed = supports + contradicts + neutral;
  const ev = demandEvidence(evidence);
  if (assessed === 0 && ev.paid === 0 && ev.interviews === 0) {
    return dim(
      'kerkesa',
      null,
      'mungon',
      'Asnjë tregues i lidhur me këtë ide nuk ka të dhëna për këtë vend dhe nuk keni regjistruar prova nga klientët — nuk vlerësohet (nuk trajtohet si 0).',
    );
  }
  // Macro part: neutral 50, moved towards 100/0 by the share of supporting/contradicting links.
  const macro = assessed > 0 ? 50 + (50 * (supports - contradicts)) / assessed : 50;
  const paidBoost = Math.min(PAID_EVIDENCE_CAP, ev.paid * PAID_EVIDENCE_POINTS);
  const interviewBoost = Math.min(INTERVIEW_CAP, ev.interviews * INTERVIEW_POINTS);
  const parts = [
    assessed > 0
      ? `${supports} tregues ${verb(supports, 'e mbështet', 'e mbështetin')}, ${contradicts} ${verb(contradicts, 'e kundërshton', 'e kundërshtojnë')} dhe ${neutral} ${verb(neutral, 'nuk mund të gjykohet', 'nuk mund të gjykohen')} (nga ${assessed} me të dhëna)${ctx.isDemo ? ' — të dhëna DEMO, fiktive' : ''}`
      : 'asnjë tregues i lidhur nuk ka të dhëna; nisja është neutrale (50)',
  ];
  if (ev.paid > 0) parts.push(`${formatNumber(ev.paid)} pagesa/parapagime të regjistruara (+${formatNumber(paidBoost)})`);
  if (ev.interviews > 0) parts.push(`${formatNumber(ev.interviews)} intervista (+${formatNumber(interviewBoost)}; fjalët nuk janë sjellje)`);
  if (ev.paid === 0) parts.push('pa pagesa nga klientë, kërkesa mbetet e paprovuar');
  return dim('kerkesa', macro + paidBoost + interviewBoost, 'te_dhena', `${parts.join('; ')}.`);
}

function capitalDimension(profile: UserProfile, projection: ProjectionResult | null): DimensionScore {
  if (!projection) {
    return dim('kapitali', null, 'mungon', 'Kapitali i nevojshëm nuk u llogarit (mungon kursi i këmbimit) — nuk vlerësohet.');
  }
  const total = projection.capital.totalRequired;
  const own = Math.max(0, profile.capital.amount);
  if (!(total > 0)) return dim('kapitali', 100, 'profil', 'Me këto supozime nuk nevojitet kapital fillestar.');
  const ratio = own / total;
  return dim(
    'kapitali',
    ratio * 100,
    'profil',
    `Kapitali juaj mbulon ${formatPercent(Math.min(ratio, 1) * 100, 0)} të kapitalit të nevojshëm në skenarin bazë (hapje + deficit operimi + rezervë, supozime).`,
  );
}

function skillsDimension(a: BusinessArchetype, profile: UserProfile): DimensionScore {
  const owned = new Set(profile.skills);
  const reqHave = a.requiredSkills.filter((s) => owned.has(s)).length;
  const helpHave = a.helpfulSkills.filter((s) => owned.has(s)).length;
  const reqShare = a.requiredSkills.length > 0 ? reqHave / a.requiredSkills.length : 1;
  const helpShare = a.helpfulSkills.length > 0 ? helpHave / a.helpfulSkills.length : 1;
  const sector = profile.experienceSectors.includes(a.sector) ? 1 : 0;
  const score = 60 * reqShare + 25 * helpShare + 15 * sector;
  return dim(
    'aftesite',
    score,
    'profil',
    `Aftësi të kërkuara: ${reqHave} nga ${a.requiredSkills.length} (60%); aftësi të dobishme: ${helpHave} nga ${a.helpfulSkills.length} (25%); përvojë në sektor: ${sector ? 'po' : 'jo'} (15%).`,
  );
}

function easeDimension(a: BusinessArchetype, profile: UserProfile, capitalRange: MoneyRange | null | undefined): DimensionScore {
  let score = 100;
  const notes: string[] = [];
  if (a.regulated) {
    score -= 25;
    notes.push('e rregulluar (−25)');
  }
  if (a.minTeam !== 'vetem') {
    const penalty = a.minTeam === 'ekip' ? 20 : 10;
    score -= penalty;
    notes.push(`kërkon ${a.minTeam === 'ekip' ? 'ekip' : 'partner'} (−${penalty})`);
  }
  if (!a.canStartFromHome) {
    score -= 15;
    notes.push('kërkon ambient (−15)');
  }
  if (capitalRange && sameCurrency(capitalRange.currency, profile.capital.currency)) {
    const own = Math.max(0, profile.capital.amount);
    const uncovered = capitalRange.low > own && capitalRange.low > 0 ? (capitalRange.low - own) / capitalRange.low : 0;
    if (uncovered > 0) {
      const penalty = 25 * uncovered;
      score -= penalty;
      notes.push(`kapitali juaj nuk mbulon ${formatPercent(uncovered * 100, 0)} të skajit të ulët të kostove të hapjes (−${formatNumber(penalty, 1)})`);
    }
  } else {
    notes.push('kostoja e hapjes nuk u krahasua me kapitalin (mungon kursi)');
  }
  if (profile.hoursPerWeek < a.minHoursPerWeek) {
    const penalty = (15 * (a.minHoursPerWeek - Math.max(0, profile.hoursPerWeek))) / a.minHoursPerWeek;
    score -= penalty;
    notes.push(`më pak orë se minimumi (−${formatNumber(penalty, 1)})`);
  }
  const reason = notes.length > 0 ? `Nga 100: ${notes.join('; ')}.` : 'Asnjë pengesë e veçantë për nisjen (nisje nga shtëpia, vetëm, pa licencë, kapital i mjaftueshëm).';
  return dim('veshtiresia', score, 'profil', reason);
}

function economicsDimension(projection: ProjectionResult | null): DimensionScore {
  if (!projection) {
    return dim('ekonomia', null, 'mungon', 'Modeli financiar nuk u ndërtua (mungon kursi i këmbimit) — ekonomia nuk vlerësohet.');
  }
  const ue = projection.unitEconomics;
  if (ue.status === 'kontribut_zero_ose_negativ') {
    return dim(
      'ekonomia',
      0,
      'supozim',
      'Pikë 0 e llogaritur (jo mungesë të dhënash): me supozimet bazë kontributi për njësi është zero ose negativ, prandaj biznesi nuk arrin kurrë barazimin pa ndryshuar çmimin ose kostot.',
    );
  }
  const horizon = projection.rows.length;
  const margin = ue.contributionMarginPct ?? 0;
  const marginScore = clamp((margin / 60) * 100);
  const endCustomers = projection.rows[horizon - 1]?.customers ?? 0;
  const breakEven = ue.breakEvenCustomersPerMonth;
  const coverage = breakEven === null ? null : breakEven <= 0 ? Infinity : endCustomers / breakEven;
  const breakEvenScore = coverage === null ? 0 : clamp((Math.min(coverage, 1.5) / 1.5) * 100);
  const recovered = projection.payback.recoveredInMonth;
  const paybackScore =
    projection.capital.startupTotal <= 0 ? 100 : recovered === null ? 0 : clamp(100 * (1 - (recovered - 1) / Math.max(1, horizon)));
  const minCash = projection.minCashBalance;
  const cashScore = minCash >= 0 ? 100 : clamp(100 * (1 - Math.abs(minCash) / Math.max(1, projection.capital.totalRequired)));
  const score = 0.3 * marginScore + 0.3 * breakEvenScore + 0.2 * paybackScore + 0.2 * cashScore;
  const coverageSq =
    coverage === null
      ? 'pika e barazimit në klientë nuk llogaritet'
      : coverage === Infinity
        ? 'pa kosto fikse, barazimi arrihet me çdo shitje'
        : `klientët në fund të horizontit ≈ ${formatPercent(coverage * 100, 0)} e pikës së barazimit`;
  const paybackSq =
    projection.capital.startupTotal <= 0
      ? 'pa investim fillestar'
      : recovered === null
        ? `investimi nuk rikuperohet brenda ${horizon} muajve`
        : `rikuperim i vlerësuar në muajin ${recovered} (jo i garantuar)`;
  return dim(
    'ekonomia',
    score,
    'supozim',
    `Skenari bazë (supozime): marzhi i kontributit ${formatPercent(margin, 0)} (30%); ${coverageSq} (30%); ${paybackSq} (20%); paraja minimale ${minCash >= 0 ? 'nuk bie nën zero' : 'bie nën zero'} (20%).`,
  );
}

function latestValue(ctx: CountryDataContext, code: string): { value: number; text: string } | null {
  const s = ctx.series.find((x) => x.definition.code === code);
  const v = s?.latest?.value;
  if (!s || !s.latest || typeof v !== 'number' || !Number.isFinite(v)) return null;
  return { value: v, text: `${s.definition.nameSq} ${formatIndicatorValue(v, s.definition)} (${formatPeriod(s.latest.period)})` };
}

function seasonalAmplitude(values: number[]): number {
  const valid = values.filter((v) => Number.isFinite(v) && v > 0);
  if (valid.length !== 12) return 0;
  const mean = valid.reduce((s, v) => s + v, 0) / valid.length;
  return mean > 0 ? (Math.max(...valid) - Math.min(...valid)) / mean : 0;
}

function riskDimension(a: BusinessArchetype, ctx: CountryDataContext): DimensionScore {
  let score = 100;
  const notes: string[] = [];
  let usedData = false;
  if (a.regulated) {
    score -= 20;
    notes.push('veprimtari e rregulluar (−20)');
  }
  const collection = Math.max(0, a.pricing.collectionDays);
  if (collection > 0) {
    const penalty = Math.min(20, (collection / 90) * 20);
    score -= penalty;
    notes.push(`klientët paguajnë pas ${collection} ditësh (−${formatNumber(penalty, 1)})`);
  }
  const amplitude = seasonalAmplitude(a.seasonality);
  if (amplitude > 0) {
    const penalty = Math.min(20, amplitude * 20);
    score -= penalty;
    notes.push(`luhatje sezonale ${formatPercent(amplitude * 100, 0)} e mesatares (−${formatNumber(penalty, 1)})`);
  }
  const inflation = latestValue(ctx, 'inflation_cpi') ?? latestValue(ctx, 'imf_inflation');
  if (inflation) {
    usedData = true;
    const penalty = inflation.value >= 10 ? 15 : inflation.value >= 6 ? 10 : inflation.value >= 4 ? 5 : 0;
    score -= penalty;
    notes.push(`${inflation.text}${penalty > 0 ? ` (−${penalty})` : ' (pa zbritje)'}`);
  }
  const lending = latestValue(ctx, 'lending_rate');
  if (lending) {
    usedData = true;
    const penalty = lending.value >= 15 ? 10 : lending.value >= 10 ? 5 : 0;
    score -= penalty;
    notes.push(`${lending.text}${penalty > 0 ? ` (−${penalty})` : ' (pa zbritje)'}`);
  }
  if (!inflation && !lending) notes.push('inflacioni dhe interesi i kredisë mungojnë për këtë vend — nuk u përdorën');
  const demo = usedData && ctx.isDemo ? ' Të dhënat makro janë DEMO (fiktive).' : '';
  return dim('rreziku', score, usedData ? 'te_dhena' : 'supozim', `Sa më e lartë pika, aq më i ulët rreziku. Nga 100: ${notes.join('; ')}.${demo}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Total
// ─────────────────────────────────────────────────────────────────────────────

function effectiveWeights(weights: ScoreWeights): ScoreWeights {
  return validateWeights(weights).ok ? { ...weights } : normalizeWeights(weights);
}

/** Weighted mean over assessable dimensions only (null dimensions are excluded, not zeroed). */
export function combineScore(dimensions: DimensionScore[], weights: ScoreWeights): { total: number | null; assessedWeightPct: number } {
  let weighted = 0;
  let assessed = 0;
  let all = 0;
  for (const d of dimensions) {
    const w = weights[d.id] ?? 0;
    all += w;
    if (d.score === null) continue;
    weighted += d.score * w;
    assessed += w;
  }
  return {
    total: assessed > 0 ? round1(weighted / assessed) : null,
    assessedWeightPct: all > 0 ? round1((assessed / all) * 100) : 0,
  };
}

export function scoreIdea(input: ScoreInput): ScoreResult {
  const { archetype: a, profile, projection, macroClaims, ctx, evidence } = input;
  const weights = effectiveWeights(input.weights);
  const dimensions: DimensionScore[] = [
    demandDimension(macroClaims, ctx, evidence),
    capitalDimension(profile, projection),
    skillsDimension(a, profile),
    easeDimension(a, profile, input.capitalRange),
    economicsDimension(projection),
    riskDimension(a, ctx),
  ];
  const { total, assessedWeightPct } = combineScore(dimensions, weights);
  const missing = dimensions.filter((d) => d.score === null);
  const missingSq =
    missing.length > 0
      ? ` ${missing.length} nga ${dimensions.length} dimensione nuk u vlerësuan (${missing.map((d) => d.labelSq).join(', ')}) dhe nuk u trajtuan si 0; totali llogaritet mbi ${formatNumber(assessedWeightPct, 0)}% të peshës.`
      : '';
  return { total, dimensions, weights, assessedWeightPct, noteSq: `${SCORE_NOTE_SQ}${missingSq}` };
}

// ─────────────────────────────────────────────────────────────────────────────
// Evidence quality
// ─────────────────────────────────────────────────────────────────────────────

const LEVELS: EvidenceQuality['level'][] = ['shume_e_ulet', 'e_ulet', 'mesatare', 'e_larte'];

/** Share of data-backed claims needed for each base level (macro data alone never reaches "e lartë"). */
export const EVIDENCE_SHARE_MEDIUM = 0.2;
export const EVIDENCE_SHARE_LOW = 0.1;
/** Paying customers recorded before evidence may be called "e lartë". */
export const PAID_FOR_HIGH_EVIDENCE = 3;

function lower(level: EvidenceQuality['level'], cap: EvidenceQuality['level']): EvidenceQuality['level'] {
  return LEVELS.indexOf(level) <= LEVELS.indexOf(cap) ? level : cap;
}

function downgrade(level: EvidenceQuality['level']): EvidenceQuality['level'] {
  return LEVELS[Math.max(0, LEVELS.indexOf(level) - 1)];
}

/** How much of what is said about an idea rests on data, and how good that data is. */
export function assessEvidenceQuality(allClaims: Claim[], ctx: CountryDataContext, evidence: EvidenceEntry[] = []): EvidenceQuality {
  const dataBacked = allClaims.filter((c) => c.label === 'mbeshtetet_nga_te_dhenat').length;
  const hypothesis = allClaims.filter((c) => c.label === 'hipoteze').length;
  const toTest = allClaims.filter((c) => c.label === 'duhet_testuar').length;
  const total = allClaims.length;
  const share = total > 0 ? dataBacked / total : 0;
  const cited = new Set(
    allClaims.filter((c) => c.label === 'mbeshtetet_nga_te_dhenat').flatMap((c) => c.citations.map((x) => x.indicatorCode ?? '')),
  );
  const staleIndicators = ctx.coverage.staleIndicators.filter((code) => cited.has(code));
  const paid = demandEvidence(evidence).paid;
  const notesSq: string[] = [
    `${dataBacked} nga ${total} pohime ${verb(dataBacked, 'mbështetet', 'mbështeten')} nga të dhënat; ${hypothesis} ${verb(hypothesis, 'është hipotezë', 'janë hipoteza')} dhe ${toTest} ${verb(toTest, 'duhet testuar', 'duhen testuar')} me klientë.`,
  ];

  let level: EvidenceQuality['level'] = share >= EVIDENCE_SHARE_MEDIUM ? 'mesatare' : share >= EVIDENCE_SHARE_LOW ? 'e_ulet' : 'shume_e_ulet';
  if (level === 'mesatare' && paid >= PAID_FOR_HIGH_EVIDENCE) level = 'e_larte';
  if (paid < PAID_FOR_HIGH_EVIDENCE) {
    notesSq.push(`Prova të forta kërkojnë sjellje reale: të paktën ${PAID_FOR_HIGH_EVIDENCE} pagesa ose parapagime nga klientë (tani: ${formatNumber(paid)}).`);
  }
  if (ctx.coverage.level === 'e_pamjaftueshme') {
    level = lower(level, 'e_ulet');
    notesSq.push(ctx.coverage.noteSq);
  } else if (ctx.coverage.level === 'e_pjesshme') {
    notesSq.push('Mbulimi i të dhënave për këtë vend është i pjesshëm.');
  }
  if (staleIndicators.length > 0) {
    if (staleIndicators.length * 2 >= cited.size) level = downgrade(level);
    notesSq.push(`Tregues të vjetër mes atyre të cituar: ${staleIndicators.join(', ')}.`);
  }
  if (ctx.isDemo) {
    level = lower(level, 'e_ulet');
    notesSq.push('Të dhënat DEMO janë fiktive: këto prova shërbejnë vetëm për demonstrim dhe nuk vlejnë për vendime reale.');
  }
  return {
    level,
    dataBackedClaims: dataBacked,
    hypothesisClaims: hypothesis,
    toTestClaims: toTest,
    coverage: ctx.coverage.level,
    staleIndicators,
    isDemo: ctx.isDemo,
    notesSq,
  };
}
