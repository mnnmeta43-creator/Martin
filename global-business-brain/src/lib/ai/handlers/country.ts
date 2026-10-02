/**
 * Mjetet e të dhënave të vendit: treguesit makro me citime dhe krahasimi i idesë me një ekonomi tjetër.
 *
 * Values come only from stored observations (or the flagged demo dataset). A missing series stays
 * missing (value null, status "mungon") and gets no citation. Countries are resolved from the app
 * catalogue by code or by Albanian/English name; an unknown name is reported, never guessed.
 */
import type { CountryDataContext, IndicatorSeries } from '@/lib/domain/types';
import { COVERAGE_LABELS, DATA_STATUS_LABELS } from '@/lib/domain/taxonomy';
import { INDICATOR_CODE_SET } from '@/lib/data/indicatorCodes';
import { getIndicator } from '@/lib/data/indicators';
import { getCountryDataContext } from '@/lib/data/context';
import { citationForObservation } from '@/lib/analysis/citations';
import { formatIndicatorValue, formatPeriod } from '@/lib/finance/format';
import { compareCountriesForIdea } from '@/lib/ideas/compareForIdea';
import { effectiveProfile } from '@/lib/ai/context';
import type { AssistantContext } from '@/lib/ai/context';
import { resolveCountry } from '@/lib/ai/text';
import { moneySq, requireArchetype, requireProject, signedNumberSq, ToolError, type ToolEnv } from '@/lib/ai/handlers/shared';

/** Shown when no project narrows the choice: broad, commonly used indicators. */
export const DEFAULT_INDICATOR_CODES = [
  'gdp_growth',
  'gdp_per_capita_ppp',
  'inflation_cpi',
  'unemployment',
  'price_level_ratio',
  'internet_users_pct',
] as const;

const MAX_INDICATORS = 15;
const LATEST_NOTE_SQ =
  'Vlerat janë “të dhënat më të fundit të disponueshme” për periudhën e treguar — jo të drejtpërdrejta. “mungon” do të thotë që nuk ka vlerë; nuk është zero.';

/** Context for `code`: the project's own context when it matches, otherwise loaded once per turn. */
export async function contextFor(ctx: AssistantContext, code: string): Promise<CountryDataContext | null> {
  if (ctx.countryCtx && ctx.countryCtx.country.code === code) return ctx.countryCtx;
  const key = `ctx:${code}`;
  if (!ctx.memo.has(key)) {
    ctx.memo.set(key, await getCountryDataContext(ctx.store.data, code, ctx.now, { demoMode: ctx.demoMode }));
  }
  return ctx.memo.get(key) as CountryDataContext | null;
}

function resolveOrFail(ctx: AssistantContext, query: string) {
  const country = resolveCountry(query, { includeDemo: ctx.demoMode });
  if (!country) {
    throw new ToolError(
      `Shteti „${query.slice(0, 60)}” nuk u gjet në katalogun e aplikacionit. Përdorni emrin në shqip ose anglisht, ose kodin ISO me 3 shkronja.`,
    );
  }
  return country;
}

function deltaSq(series: IndicatorSeries): string | null {
  const { delta, deltaKind } = series.change;
  if (delta === null || deltaKind === null) return null;
  if (deltaKind === 'pike_perqindjeje') return `${signedNumberSq(delta, 1)} pikë përqindjeje`;
  if (deltaKind === 'ndryshim_perqindjeje') return `${signedNumberSq(delta, 1)}%`;
  return signedNumberSq(delta);
}

function indicatorRow(series: IndicatorSeries, env: ToolEnv) {
  const def = series.definition;
  const latest = series.latest;
  // The first projection after the latest measurement (e.g. IMF WEO), clearly labelled as a forecast.
  const projection = series.observations.find((o) => o.isProjection && o.value !== null && (!latest || o.period > latest.period)) ?? null;
  return {
    code: def.code,
    nameSq: def.nameSq,
    unitLabelSq: def.unitLabelSq,
    status: series.status,
    statusSq: DATA_STATUS_LABELS[series.status],
    statusReasonSq: series.statusReasonSq,
    latest: latest
      ? {
          value: latest.value,
          valueSq: formatIndicatorValue(latest.value, def),
          period: latest.period,
          periodSq: formatPeriod(latest.period),
          isDemo: latest.isDemo,
          citation: env.cite(citationForObservation(def, latest)),
        }
      : null,
    change: series.change.comparable
      ? { fromPeriod: series.change.fromPeriod, toPeriod: series.change.toPeriod, delta: series.change.delta, deltaSq: deltaSq(series) }
      : null,
    nextProjection: projection
      ? {
          kind: 'parashikim',
          value: projection.value,
          valueSq: formatIndicatorValue(projection.value, def),
          period: projection.period,
          citation: env.cite(citationForObservation(def, projection)),
        }
      : null,
  };
}

function defaultCodes(ctx: AssistantContext): string[] {
  const linked = ctx.archetype?.macroLinks.map((l) => l.indicatorCode) ?? [];
  return linked.length > 0 ? [...new Set(linked)] : [...DEFAULT_INDICATOR_CODES];
}

export async function getCountryIndicators(input: { countryCode?: string; indicatorCodes?: string[] }, env: ToolEnv) {
  const { ctx } = env;
  const query = input.countryCode?.trim() || ctx.project?.countryCode || ctx.profile?.residenceCountry;
  if (!query) throw new ToolError('Nuk ka vend të zgjedhur: jepni një shtet ose zgjidhni një projekt.');
  const country = resolveOrFail(ctx, query);
  const data = await contextFor(ctx, country.code);
  if (!data) throw new ToolError(`Të dhënat për ${country.nameSq} nuk janë të disponueshme në këtë modalitet.`);

  const requested = input.indicatorCodes?.length ? [...new Set(input.indicatorCodes.map((c) => c.trim()))] : defaultCodes(ctx);
  const unknownIndicatorCodes = requested.filter((c) => !INDICATOR_CODE_SET.has(c));
  const codes = requested.filter((c) => INDICATOR_CODE_SET.has(c)).slice(0, MAX_INDICATORS);
  const indicators = codes
    .map((code) => data.series.find((s) => s.definition.code === code))
    .filter((s): s is IndicatorSeries => Boolean(s))
    .map((s) => indicatorRow(s, env));

  return {
    countryCode: data.country.code,
    countryNameSq: data.country.nameSq,
    isDemo: data.isDemo,
    demoNoteSq: data.isDemo ? 'DEMO — ekonomi fiktive; vlerat nuk janë reale dhe nuk përdoren për rekomandime reale.' : null,
    coverage: { level: data.coverage.level, levelSq: COVERAGE_LABELS[data.coverage.level], noteSq: data.coverage.noteSq },
    lastRefreshAt: data.lastRefreshAt,
    failedSourcesCount: data.sourceErrors.length,
    indicators,
    unknownIndicatorCodes,
    noteSq: LATEST_NOTE_SQ,
  };
}

interface ValueWithCitation {
  value: number | null;
  period: string | null;
  citation: Parameters<ToolEnv['cite']>[0];
}

function citedValue(v: ValueWithCitation | null | undefined, indicatorCode: string, env: ToolEnv) {
  const def = getIndicator(indicatorCode);
  const value = v?.value ?? null;
  return {
    value,
    valueSq: def ? formatIndicatorValue(value, def) : value === null ? 'mungon' : String(value),
    period: v?.period ?? null,
    citation: value === null ? null : env.cite(v?.citation ?? null),
  };
}

export async function compareCountry(input: { countryCode: string }, env: ToolEnv) {
  const { ctx } = env;
  const project = requireProject(ctx);
  const archetype = requireArchetype(ctx);
  const profile = effectiveProfile(ctx);
  const target = resolveOrFail(ctx, input.countryCode);
  const base = ctx.countryCtx;
  if (!base || !profile) throw new ToolError('Të dhënat për vendin e projektit nuk janë të disponueshme në këtë modalitet.');
  if (target.code === base.country.code) {
    throw new ToolError(`${target.nameSq} është vetë vendi i projektit; zgjidhni një shtet tjetër për krahasim.`);
  }
  const other = await contextFor(ctx, target.code);
  if (!other) throw new ToolError(`Të dhënat për ${target.nameSq} nuk janë të disponueshme në këtë modalitet.`);

  const result = compareCountriesForIdea(archetype, profile, [base, other], { weights: project.scoreWeights, now: ctx.now });
  return {
    archetypeNameSq: archetype.nameSq,
    projectCountryCode: base.country.code,
    comparedCountryCode: other.country.code,
    profileNoteSq: ctx.profile ? null : 'Profili nuk është plotësuar; u përdor një profil neutral nga projekti.',
    rows: result.rows.map((row) => ({
      countryCode: row.countryCode,
      nameSq: row.nameSq,
      isDemo: row.isDemo,
      score: {
        total: row.score.total,
        assessedWeightPct: row.score.assessedWeightPct,
        noteSq: row.score.noteSq,
      },
      capitalRange: row.capitalRange
        ? {
            low: row.capitalRange.low,
            high: row.capitalRange.high,
            currency: row.capitalRange.currency,
            rangeSq: `${moneySq(row.capitalRange.low, row.capitalRange.currency)} – ${moneySq(row.capitalRange.high, row.capitalRange.currency)}`,
            basisSq: row.capitalRange.basisSq,
          }
        : null,
      supportedMacroClaims: row.supportedMacroClaims,
      contradictedMacroClaims: row.contradictedMacroClaims,
      purchasingPower: { indicator: 'gdp_per_capita_ppp', ...citedValue(row.purchasingPower, 'gdp_per_capita_ppp', env) },
      priceLevel: { indicator: 'price_level_ratio', ...citedValue(row.priceLevel, 'price_level_ratio', env) },
      operabilitySq: row.operabilitySq,
      coverage: row.coverage,
      coverageSq: COVERAGE_LABELS[row.coverage],
      warningsSq: row.warningsSq,
    })),
    warningsSq: result.warningsSq,
    noteSq: result.noteSq,
    scoreNoteSq: 'Pikët janë mjet orientimi, jo probabilitet suksesi.',
  };
}
