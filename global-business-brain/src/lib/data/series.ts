/**
 * Seritë kohore: renditja, vlera e fundit e matur dhe ndryshimi krahasuar me periudhën e mëparshme.
 *
 * Pure. Projections are kept in the series (flagged) so charts can show them, but they are
 * never the "latest" value and never enter a change calculation. Percent series change in
 * percentage points; everything else in relative %, with Albanian warnings for gaps between
 * periods and for nominal currency values that mix exchange-rate and price effects.
 */
import type { FetchLogEntry, IndicatorChange, IndicatorDefinition, IndicatorSeries, Observation } from '@/lib/domain/types';
import { assessStatus } from '@/lib/data/freshness';
import { comparePeriods, parsePeriod, periodGap, unitIsPercent, type PeriodGranularity } from '@/lib/data/units';
import { formatPeriod } from '@/lib/finance/format';

export interface BuildSeriesOptions {
  isDemo?: boolean;
}

function byPeriod(a: Observation, b: Observation): number {
  const c = comparePeriods(a.period, b.period);
  // Mixed granularities (e.g. "2023" vs "2023-Q4") have no natural order; keep it stable by text.
  return Number.isNaN(c) ? a.period.localeCompare(b.period) : c;
}

function preferred(a: Observation, b: Observation): Observation {
  if (a.isProjection !== b.isProjection) return a.isProjection ? b : a;
  return a.retrievedAt >= b.retrievedAt ? a : b;
}

/** One observation per period (measured beats projected, newer retrieval beats older), ascending. */
export function normalizeObservations(observations: Observation[]): Observation[] {
  const byKey = new Map<string, Observation>();
  for (const o of observations) {
    const existing = byKey.get(o.period);
    byKey.set(o.period, existing ? preferred(existing, o) : o);
  }
  return [...byKey.values()].sort(byPeriod);
}

function hasValue(o: Observation): o is Observation & { value: number } {
  return typeof o.value === 'number' && Number.isFinite(o.value);
}

function granularityOf(period: string): PeriodGranularity | null {
  return parsePeriod(period)?.granularity ?? null;
}

const NOT_CONSECUTIVE_SQ: Record<PeriodGranularity, string> = {
  vit: 'jo vite të njëpasnjëshme',
  tremujor: 'jo tremujorë të njëpasnjëshëm',
  muaj: 'jo muaj të njëpasnjëshëm',
  dite: 'jo ditë të njëpasnjëshme',
};

function emptyChange(latest: Observation | null, warningsSq: string[]): IndicatorChange {
  return {
    comparable: false,
    fromPeriod: null,
    toPeriod: latest?.period ?? null,
    fromValue: null,
    toValue: latest && hasValue(latest) ? latest.value : null,
    delta: null,
    deltaKind: null,
    warningsSq,
  };
}

function nominalWarning(def: IndicatorDefinition): string | null {
  if (def.unit !== 'monedhe' || def.basis !== 'nominal') return null;
  if (def.currency === 'INTL$') {
    return 'Vlerë nominale në dollarë ndërkombëtarë aktualë: ndryshimi përfshin edhe rritjen e çmimeve, jo vetëm rritje reale.';
  }
  const currency = def.currency && def.currency !== 'MV' ? ` në ${def.currency}` : '';
  return `Vlerë nominale${currency}: ndryshimi përfshin efektin e kursit të këmbimit dhe të inflacionit, jo rritje reale.`;
}

/** Latest measured value vs the previous measured value of the same granularity. */
export function computeChange(def: IndicatorDefinition, observations: Observation[]): IndicatorChange {
  const actual = normalizeObservations(observations).filter((o) => !o.isProjection && hasValue(o));
  const latest = actual[actual.length - 1] ?? null;
  const tooFew = 'Duhen të paktën dy vlera të matura për të llogaritur ndryshimin.';
  if (!latest) return emptyChange(null, [tooFew]);
  const granularity = granularityOf(latest.period);
  const previous = [...actual.slice(0, -1)].reverse().find((o) => granularityOf(o.period) === granularity) ?? null;
  if (!previous || !granularity || !hasValue(previous) || !hasValue(latest)) return emptyChange(latest, [tooFew]);

  if (previous.unit !== latest.unit || (previous.currency ?? null) !== (latest.currency ?? null)) {
    return emptyChange(latest, ['Njësitë ndryshojnë mes periudhave; ndryshimi nuk llogaritet.']);
  }

  const warningsSq: string[] = [];
  if (periodGap(previous.period, latest.period) > 1) {
    warningsSq.push(
      `Krahasim mes ${formatPeriod(previous.period)} dhe ${formatPeriod(latest.period)} — ${NOT_CONSECUTIVE_SQ[granularity]}.`,
    );
  }

  let delta: number;
  let deltaKind: IndicatorChange['deltaKind'];
  if (unitIsPercent(def.unit)) {
    delta = latest.value - previous.value;
    deltaKind = 'pike_perqindjeje';
  } else if (previous.value > 0) {
    delta = ((latest.value - previous.value) / previous.value) * 100;
    deltaKind = 'ndryshim_perqindjeje';
  } else {
    delta = latest.value - previous.value;
    deltaKind = 'ndryshim_absolut';
    warningsSq.push('Vlera e mëparshme është zero ose negative; ndryshimi jepet në vlerë absolute, jo në përqindje.');
  }

  const nominal = nominalWarning(def);
  if (nominal) warningsSq.push(nominal);

  return {
    comparable: true,
    fromPeriod: previous.period,
    toPeriod: latest.period,
    fromValue: previous.value,
    toValue: latest.value,
    delta,
    deltaKind,
    warningsSq,
  };
}

/**
 * Builds the series for one indicator × country. `latest` is the newest measured value; when
 * only projections exist the status becomes 'parashikim' and `latest` stays null.
 */
export function buildSeries(
  def: IndicatorDefinition,
  countryCode: string,
  observations: Observation[],
  now: Date,
  lastFetch?: FetchLogEntry | null,
  opts: BuildSeriesOptions = {},
): IndicatorSeries {
  const own = observations.filter((o) => o.indicatorCode === def.code && o.countryCode === countryCode);
  const sorted = normalizeObservations(own);
  const withValues = sorted.filter(hasValue);
  const latest = [...withValues].reverse().find((o) => !o.isProjection) ?? null;
  const latestProjection = latest ? null : ([...withValues].reverse().find((o) => o.isProjection) ?? null);
  const isDemo = opts.isDemo === true || own.some((o) => o.isDemo);
  const { status, reasonSq } = assessStatus(def, latest ?? latestProjection, now, lastFetch, { isDemo });
  return {
    definition: def,
    countryCode,
    observations: sorted,
    latest,
    change: computeChange(def, sorted),
    status,
    statusReasonSq: reasonSq,
    lastFetch: lastFetch ?? null,
  };
}
