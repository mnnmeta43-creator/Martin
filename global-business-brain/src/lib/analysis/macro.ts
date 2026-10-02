/**
 * Analiza makro e një vendi: vlera, ndryshimi, si lexohet, cilat biznese ndikohen dhe çfarë prove duhet.
 *
 * Pure and deterministic: it only rearranges a CountryDataContext. Facts carry a citation to
 * the observation they state; interpretations are always hypotheses ("hipotezë"); projections
 * are kind 'parashikim'. The text never turns a macro trend into a promise about a business —
 * macro data is context, and only local customer evidence can validate an idea.
 */
import type {
  Citation,
  Claim,
  CountryDataContext,
  IndicatorCategory,
  IndicatorChange,
  IndicatorSeries,
  Observation,
} from '@/lib/domain/types';
import { citationForObservation } from '@/lib/analysis/citations';
import { formatIndicatorValue, formatNumber, formatPeriod } from '@/lib/finance/format';

export interface MacroItem {
  code: string;
  series: IndicatorSeries;
  valueTextSq: string;
  changeTextSq: string;
  interpretationSq: string;
  businessImplicationsSq: string;
  extraEvidenceSq: string;
  analogySq?: string;
  cautionSq?: string;
}

export interface MacroSection {
  category: IndicatorCategory;
  titleSq: string;
  items: MacroItem[];
}

export interface MacroAnalysis {
  countryCode: string;
  isDemo: boolean;
  sections: MacroSection[];
  highlights: Claim[];
  limitationsSq: string[];
}

export const CATEGORY_ORDER: IndicatorCategory[] = [
  'rritja',
  'te_ardhurat',
  'cmimet',
  'financa',
  'puna',
  'popullsia',
  'tregtia',
  'sektoret',
  'remitancat',
  'turizmi',
  'digjitale',
  'infrastruktura',
];

export const CATEGORY_TITLES_SQ: Record<IndicatorCategory, string> = {
  rritja: 'Rritja ekonomike dhe konsumi',
  te_ardhurat: 'Të ardhurat dhe fuqia blerëse',
  cmimet: 'Çmimet',
  financa: 'Financa, kredia dhe kursi i këmbimit',
  puna: 'Tregu i punës',
  popullsia: 'Popullsia',
  tregtia: 'Tregtia e jashtme',
  sektoret: 'Struktura e ekonomisë dhe sipërmarrja',
  remitancat: 'Remitancat',
  turizmi: 'Turizmi',
  digjitale: 'Digjitalizimi',
  infrastruktura: 'Infrastruktura',
};

/** Limitations stated on every analysis, whatever the data says. */
export const ALWAYS_LIMITATIONS_SQ: readonly string[] = [
  'Qiratë, çmimet e energjisë dhe pagat nuk kanë një burim global të integruar në aplikacion: mblidhni oferta dhe çmime lokale (të paktën tri) para çdo llogaritjeje.',
  'Mesataret kombëtare fshehin dallimet mes qyteteve, rajoneve dhe lagjeve: kërkesa, konkurrenca dhe kostot në zonën tuaj mund të jenë shumë të ndryshme.',
  'Konteksti makro nuk e vërteton një biznes: vetëm provat nga klientët lokalë (intervista, parapagime, pagesa) tregojnë nëse ka kërkesë të mjaftueshme.',
];

/** Indicators stated as headline facts when they have a measured value. */
const HIGHLIGHT_CODES = [
  'gdp_growth',
  'household_consumption_growth',
  'inflation_cpi',
  'gdp_per_capita_ppp',
  'unemployment',
  'lending_rate',
  'population',
  'urban_population_pct',
  'internet_users_pct',
  'remittances_gdp',
  'tourism_arrivals',
];

const PROJECTION_CODES = ['imf_gdp_growth', 'imf_inflation', 'imf_unemployment'];

// Below these magnitudes a change is described as "almost unchanged" rather than up or down.
const FLAT_PP = 0.05;
const FLAT_PCT = 0.5;

const MINUS = '−';

function signed(n: number, decimals: number): string {
  const abs = formatNumber(Math.abs(n), decimals);
  if (abs === formatNumber(0, decimals)) return abs;
  return `${n > 0 ? '+' : MINUS}${abs}`;
}

function isFlat(change: IndicatorChange): boolean {
  if (change.delta === null) return true;
  return change.deltaKind === 'pike_perqindjeje' ? Math.abs(change.delta) < FLAT_PP : Math.abs(change.delta) < FLAT_PCT;
}

function latestProjection(series: IndicatorSeries): Observation | null {
  const withValue = series.observations.filter((o) => o.isProjection && typeof o.value === 'number');
  return withValue[withValue.length - 1] ?? null;
}

function firstProjection(series: IndicatorSeries): Observation | null {
  return series.observations.find((o) => o.isProjection && typeof o.value === 'number') ?? null;
}

function valueTextSq(series: IndicatorSeries): string {
  const def = series.definition;
  if (series.latest) return `${formatIndicatorValue(series.latest.value, def)} (${formatPeriod(series.latest.period)})`;
  const projection = series.status === 'parashikim' ? latestProjection(series) : null;
  if (projection) return `Vetëm parashikim: ${formatIndicatorValue(projection.value, def)} (${formatPeriod(projection.period)})`;
  return `Mungojnë të dhënat. ${series.statusReasonSq}`;
}

function deltaTextSq(change: IndicatorChange): string {
  if (change.delta === null) return '';
  switch (change.deltaKind) {
    case 'pike_perqindjeje':
      return `${signed(change.delta, 1)} pikë përqindjeje`;
    case 'ndryshim_perqindjeje':
      return `${signed(change.delta, 1)}%`;
    default:
      return `${signed(change.delta, 2)} (ndryshim absolut)`;
  }
}

function changeTextSq(series: IndicatorSeries): string {
  const { change, definition: def } = series;
  if (!series.latest) return 'Nuk ka vlera të matura për të treguar ndryshimin.';
  if (!change.comparable || change.fromPeriod === null) {
    return change.warningsSq[0]?.startsWith('Njësitë')
      ? 'Ndryshimi nuk llogaritet, sepse njësitë ndryshojnë mes periudhave.'
      : 'Ka vetëm një vlerë të matur; ndryshimi nuk mund të llogaritet.';
  }
  const from = formatPeriod(change.fromPeriod);
  const to = formatPeriod(change.toPeriod);
  if (isFlat(change)) {
    return `Nga ${from} në ${to}: pothuajse pa ndryshim (${formatIndicatorValue(change.fromValue, def)} → ${formatIndicatorValue(change.toValue, def)}).`;
  }
  return `Nga ${from} në ${to}: ${deltaTextSq(change)} (${formatIndicatorValue(change.fromValue, def)} → ${formatIndicatorValue(change.toValue, def)}).`;
}

function interpretationSq(series: IndicatorSeries, isDemo: boolean): string {
  const def = series.definition;
  const demo = isDemo ? ' (Të dhëna fiktive DEMO — vetëm për demonstrim.)' : '';
  if (!series.latest) {
    if (series.status === 'parashikim') return `Ka vetëm parashikim, jo matje. ${def.explain.whyItMattersSq}${demo}`;
    return 'Pa të dhëna nuk nxirret asnjë interpretim; mungesa nuk duhet zëvendësuar me supozime.';
  }
  const parts: string[] = [];
  const { change } = series;
  if (change.comparable && change.delta !== null) {
    if (isFlat(change)) parts.push('Në periudhën e fundit treguesi mbeti pothuajse i pandryshuar.');
    else parts.push(`Në periudhën e fundit treguesi ${change.delta > 0 ? 'u rrit' : 'ra'}.`);
  }
  parts.push(def.explain.whyItMattersSq);
  if (series.status === 'i_vjeter' || series.status === 'shume_i_vjeter') {
    parts.push('Vlera është e vjetër, ndaj mund të mos e pasqyrojë gjendjen e sotme.');
  }
  return `${parts.join(' ')}${demo}`;
}

function toItem(series: IndicatorSeries, isDemo: boolean): MacroItem {
  const ex = series.definition.explain;
  const item: MacroItem = {
    code: series.definition.code,
    series,
    valueTextSq: valueTextSq(series),
    changeTextSq: changeTextSq(series),
    interpretationSq: interpretationSq(series, isDemo),
    businessImplicationsSq: ex.affectedBusinessesSq,
    extraEvidenceSq: ex.extraEvidenceSq,
  };
  if (ex.analogySq) item.analogySq = ex.analogySq;
  if (ex.cautionSq) item.cautionSq = ex.cautionSq;
  return item;
}

function buildSections(ctx: CountryDataContext): MacroSection[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    titleSq: CATEGORY_TITLES_SQ[category],
    items: ctx.series.filter((s) => s.definition.category === category).map((s) => toItem(s, ctx.isDemo)),
  })).filter((s) => s.items.length > 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// Highlights
// ─────────────────────────────────────────────────────────────────────────────

function seriesFor(ctx: CountryDataContext, code: string): IndicatorSeries | undefined {
  return ctx.series.find((s) => s.definition.code === code);
}

function demoPrefix(ctx: CountryDataContext): string {
  return ctx.isDemo ? 'DEMO — ' : '';
}

function factClaim(ctx: CountryDataContext, series: IndicatorSeries, obs: Observation): Claim {
  const def = series.definition;
  return {
    id: `macro-${ctx.country.code}-fakt-${def.code}`,
    textSq: `${demoPrefix(ctx)}${def.nameSq}: ${formatIndicatorValue(obs.value, def)} (${formatPeriod(obs.period)}).`,
    kind: 'fakt',
    label: 'mbeshtetet_nga_te_dhenat',
    citations: [citationForObservation(def, obs)],
  };
}

function projectionClaim(ctx: CountryDataContext, series: IndicatorSeries, obs: Observation): Claim {
  const def = series.definition;
  return {
    id: `macro-${ctx.country.code}-parashikim-${def.code}`,
    textSq: `${demoPrefix(ctx)}Parashikim i burimit për ${formatPeriod(obs.period)} — ${def.nameSq}: ${formatIndicatorValue(obs.value, def)}. Parashikimet rishikohen disa herë në vit dhe nuk janë matje.`,
    kind: 'parashikim',
    label: 'hipoteze',
    citations: [citationForObservation(def, obs)],
  };
}

interface Measured {
  series: IndicatorSeries;
  obs: Observation & { value: number };
  value: string; // formatted value
  period: string; // formatted period
}

function measured(ctx: CountryDataContext, code: string): Measured | null {
  const series = seriesFor(ctx, code);
  const obs = series?.latest;
  if (!series || !obs || typeof obs.value !== 'number') return null;
  return {
    series,
    obs: obs as Observation & { value: number },
    value: formatIndicatorValue(obs.value, series.definition),
    period: formatPeriod(obs.period),
  };
}

function hypothesis(ctx: CountryDataContext, key: string, textSq: string, basis: Measured[]): Claim {
  return {
    id: `macro-${ctx.country.code}-hipoteze-${key}`,
    textSq: `${demoPrefix(ctx)}${textSq}`,
    kind: 'interpretim',
    label: 'hipoteze',
    citations: basis.map((m) => citationForObservation(m.series.definition, m.obs)),
  };
}

// Heuristic thresholds for hedged interpretations. They trigger a hypothesis to test, never a verdict.
const HIGH_INFLATION_PCT = 6;
const HIGH_LENDING_RATE_PCT = 10;
const HIGH_REMITTANCES_PCT_GDP = 10;
const HIGH_YOUTH_UNEMPLOYMENT_PCT = 25;

function interpretationClaims(ctx: CountryDataContext): Claim[] {
  const out: Claim[] = [];
  const growth = measured(ctx, 'gdp_growth');
  if (growth && growth.obs.value < 0) {
    out.push(
      hypothesis(
        ctx,
        'tkurrje',
        `PBB-ja reale u tkurr me ${formatIndicatorValue(Math.abs(growth.obs.value), growth.series.definition)} në ${growth.period}. Në periudha të tilla klientët shpesh shtyjnë blerjet jo-thelbësore dhe pagesat mund të vonohen; verifikoni kërkesën në segmentin tuaj.`,
        [growth],
      ),
    );
  }
  const inflation = measured(ctx, 'inflation_cpi');
  if (inflation && inflation.obs.value >= HIGH_INFLATION_PCT) {
    out.push(
      hypothesis(
        ctx,
        'inflacion',
        `Me inflacion ${inflation.value} në vit (${inflation.period}), kostot e furnizimit, qiratë dhe pagat mund të ndryshojnë shpejt; çmimet dhe ofertat e furnitorëve duhen rishikuar më shpesh.`,
        [inflation],
      ),
    );
  }
  const lending = measured(ctx, 'lending_rate');
  if (lending && lending.obs.value >= HIGH_LENDING_RATE_PCT) {
    out.push(
      hypothesis(
        ctx,
        'kredi',
        `Me normë interesi për kreditë ${lending.value} (${lending.period}), borxhi është i kushtueshëm për një biznes të ri; idetë me kapital fillestar të ulët dhe arkëtim të shpejtë mund të jenë më të përballueshme.`,
        [lending],
      ),
    );
  }
  const remittances = measured(ctx, 'remittances_gdp');
  if (remittances && remittances.obs.value >= HIGH_REMITTANCES_PCT_GDP) {
    out.push(
      hypothesis(
        ctx,
        'remitanca',
        `Remitancat arrijnë ${remittances.value} të PBB-së (${remittances.period}), çka tregon lidhje të forta me diasporën; shërbimet për diasporën ose për familjet që marrin remitanca mund të kenë kërkesë, por kjo duhet testuar me klientë.`,
        [remittances],
      ),
    );
  }
  const youth = measured(ctx, 'youth_unemployment');
  if (youth && youth.obs.value >= HIGH_YOUTH_UNEMPLOYMENT_PCT) {
    out.push(
      hypothesis(
        ctx,
        'te-rinj',
        `Papunësia e të rinjve 15–24 vjeç, ${youth.value} (${youth.period}), mund të nënkuptojë më shumë kandidatë për punë, por edhe fuqi blerëse më të ulët te të rinjtë; verifikoni lokalisht pagat dhe aftësitë.`,
        [youth],
      ),
    );
  }
  return out;
}

function buildHighlights(ctx: CountryDataContext): Claim[] {
  const facts: Claim[] = [];
  for (const code of HIGHLIGHT_CODES) {
    const series = seriesFor(ctx, code);
    if (series?.latest && typeof series.latest.value === 'number') facts.push(factClaim(ctx, series, series.latest));
  }
  const projections: Claim[] = [];
  for (const code of PROJECTION_CODES) {
    const series = seriesFor(ctx, code);
    const obs = series ? firstProjection(series) : null;
    if (series && obs) projections.push(projectionClaim(ctx, series, obs));
  }
  return [...facts, ...interpretationClaims(ctx), ...projections];
}

// ─────────────────────────────────────────────────────────────────────────────
// Limitations
// ─────────────────────────────────────────────────────────────────────────────

function buildLimitations(ctx: CountryDataContext): string[] {
  const out = [...ALWAYS_LIMITATIONS_SQ];
  out.push(
    'Treguesit vjetorë publikohen me vonesë (zakonisht 1–2 vjet): këto janë të dhënat më të fundit të disponueshme, jo të dhëna “live”.',
  );
  if (ctx.isDemo) out.push('Të gjitha vlerat janë fiktive (DEMO) dhe nuk përfaqësojnë asnjë vend real; mos i përdorni për vendime.');
  if (ctx.coverage.level !== 'e_plote') out.push(ctx.coverage.noteSq);
  if (ctx.sourceErrors.length > 0) {
    out.push('Rifreskimi i fundit i disa burimeve dështoi; për to po shfaqen të dhënat e ruajtura më parë, me datën e marrjes.');
  }
  if (ctx.series.some((s) => s.observations.some((o) => o.isProjection))) {
    out.push('Vlerat e FMN-së për vitin aktual dhe vitet në vijim janë parashikime: rishikohen rregullisht dhe nuk janë matje.');
  }
  return out;
}

export function buildMacroAnalysis(ctx: CountryDataContext): MacroAnalysis {
  return {
    countryCode: ctx.country.code,
    isDemo: ctx.isDemo,
    sections: buildSections(ctx),
    highlights: buildHighlights(ctx),
    limitationsSq: buildLimitations(ctx),
  };
}

/** Every citation used by the highlights, deduplicated (for "Burimet" lists and exports). */
export function macroCitations(analysis: MacroAnalysis): Citation[] {
  const seen = new Set<string>();
  const out: Citation[] = [];
  for (const claim of analysis.highlights) {
    for (const c of claim.citations) {
      const key = `${c.sourceId}|${c.indicatorCode}|${c.countryCode}|${c.period}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(c);
    }
  }
  return out;
}
