/**
 * Freskia e të dhënave: statusi dhe arsyeja shqip për një seri tregues × vend.
 *
 * Pure: `now` is a parameter. Periodic indicators are judged against the publication lag that
 * is normal for their cadence, so a 2024 value read in 2026 is "the latest available", not
 * stale, for a series that is always published two years late. Nothing here ever calls data
 * "live". A failed refresh never hides stored values: they are shown with both dates.
 */
import type { DataStatus, FetchLogEntry, IndicatorDefinition, Observation } from '@/lib/domain/types';
import { formatDate, formatPeriod } from '@/lib/finance/format';
import { parsePeriod, type ParsedPeriod, type PeriodGranularity } from '@/lib/data/units';

export interface StatusAssessment {
  status: DataStatus;
  reasonSq: string;
}

export interface AssessOptions {
  /** The series belongs to a fictional demo economy. */
  isDemo?: boolean;
}

/** Status by age only: the subset of DataStatus that depends on how old the latest period is. */
export type AgeStatus = Extract<DataStatus, 'i_fresket' | 'i_vjeter' | 'shume_i_vjeter'>;

interface Cadence {
  /** Periods of delay that are normal for this cadence. */
  lag: number;
  /** Further periods tolerated before the data counts as very old. */
  extra: number;
}

// Annual series: lag from the definition (WB ≈ 2 years) and two more years before "very old".
// Shorter cadences scale the same idea to their own period length.
const SUB_ANNUAL_CADENCE: Record<Exclude<PeriodGranularity, 'vit'>, Cadence> = {
  tremujor: { lag: 2, extra: 2 },
  muaj: { lag: 2, extra: 4 },
  dite: { lag: 7, extra: 21 },
};

function cadenceFor(def: IndicatorDefinition, granularity: PeriodGranularity): Cadence {
  if (granularity !== 'vit') return SUB_ANNUAL_CADENCE[granularity];
  const fallback = def.periodicity === 'e_parregullt' ? 3 : 2;
  return { lag: def.expectedLagYears ?? fallback, extra: 2 };
}

/** How many periods (of the period's own granularity) `now` is past the given period. */
function periodsBehind(p: ParsedPeriod, now: Date): number {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth() + 1;
  switch (p.granularity) {
    case 'vit':
      return y - p.year;
    case 'tremujor':
      return y * 4 + Math.ceil(m / 3) - (p.year * 4 + p.quarter!);
    case 'muaj':
      return y * 12 + m - (p.year * 12 + p.month!);
    case 'dite':
      return Math.floor((Date.UTC(y, m - 1, now.getUTCDate()) - Date.UTC(p.year, p.month! - 1, p.day!)) / 86_400_000);
  }
}

function durationSq(n: number, granularity: PeriodGranularity): string {
  switch (granularity) {
    case 'vit':
      return n === 1 ? '1 vit' : `${n} vjet`;
    case 'tremujor':
      return n === 1 ? '1 tremujor' : `${n} tremujorë`;
    case 'muaj':
      return `${n} muaj`;
    case 'dite':
      return `${n} ditë`;
  }
}

function latestAvailableSq(period: string): string {
  return `Të dhënat më të fundit të disponueshme: ${formatPeriod(period)}.`;
}

/** Age-only status of a period for this indicator; null when the period cannot be read. */
export function assessAge(def: IndicatorDefinition, period: string, now: Date): AgeStatus | null {
  const parsed = parsePeriod(period);
  if (!parsed) return null;
  const behind = periodsBehind(parsed, now);
  const { lag, extra } = cadenceFor(def, parsed.granularity);
  if (behind <= lag) return 'i_fresket';
  if (behind <= lag + extra) return 'i_vjeter';
  return 'shume_i_vjeter';
}

function ageAssessment(def: IndicatorDefinition, latest: Observation, now: Date): StatusAssessment {
  const parsed = parsePeriod(latest.period);
  const age = assessAge(def, latest.period, now);
  if (!parsed || !age) {
    return { status: 'i_vjeter', reasonSq: `Periudha e vlerës së fundit (“${latest.period}”) nuk mund të lexohet; trajtojeni me kujdes.` };
  }
  const period = formatPeriod(latest.period);
  const { lag } = cadenceFor(def, parsed.granularity);
  if (age === 'i_fresket') return { status: age, reasonSq: latestAvailableSq(latest.period) };
  if (age === 'i_vjeter') {
    return {
      status: age,
      reasonSq: `Vlera e fundit i përket periudhës ${period}. Ky tregues zakonisht publikohet me vonesë deri në ${durationSq(lag, parsed.granularity)}, ndaj të dhënat janë më të vjetra se sa pritet.`,
    };
  }
  return {
    status: age,
    reasonSq: `Vlera e fundit i përket periudhës ${period} — shumë e vjetër; mund të mos e pasqyrojë më gjendjen e sotme.`,
  };
}

function fetchDate(log: FetchLogEntry): string {
  return formatDate(log.finishedAt ?? log.startedAt);
}

function noDataAssessment(lastFetch: FetchLogEntry | null | undefined, isDemo: boolean): StatusAssessment {
  if (isDemo) {
    return { status: 'mungon', reasonSq: 'Kjo ekonomi DEMO nuk ka vlerë për këtë tregues (mungesë e qëllimshme për demonstrim).' };
  }
  if (lastFetch?.status === 'gabim') {
    return { status: 'gabim_burimi', reasonSq: `Burimi nuk u përgjigj më ${fetchDate(lastFetch)}; nuk ka të dhëna të ruajtura.` };
  }
  if (!lastFetch) return { status: 'mungon', reasonSq: 'Burimi nuk është sinkronizuar ende.' };
  if (lastFetch.status === 'anashkaluar') {
    return { status: 'mungon', reasonSq: 'Rifreskimi i fundit u anashkalua; nuk ka të dhëna të ruajtura për këtë vend.' };
  }
  return { status: 'mungon', reasonSq: 'Burimi nuk publikon vlerë për këtë vend.' };
}

/**
 * Status of a series given its latest observation (latest non-null, non-projection value; pass
 * the latest projection only when the series has no measured value at all).
 */
export function assessStatus(
  def: IndicatorDefinition,
  latest: Observation | null,
  now: Date,
  lastFetch?: FetchLogEntry | null,
  opts: AssessOptions = {},
): StatusAssessment {
  const isDemo = opts.isDemo === true || latest?.isDemo === true;
  if (!latest || latest.value === null) return noDataAssessment(lastFetch, isDemo);

  if (isDemo) return { status: 'demo', reasonSq: `DEMO — të dhëna fiktive. Periudha e fundit: ${formatPeriod(latest.period)}.` };

  const failed = lastFetch?.status === 'gabim' ? lastFetch : null;
  if (latest.isProjection) {
    const failure = failed ? ` Rifreskimi i fundit dështoi më ${fetchDate(failed)}.` : '';
    return {
      status: 'parashikim',
      reasonSq: `Ka vetëm parashikim të burimit (periudha ${formatPeriod(latest.period)}), jo vlerë të matur.${failure}`,
    };
  }
  if (failed) {
    return {
      status: 'gabim_burimi',
      reasonSq: `Burimi nuk u përgjigj më ${fetchDate(failed)}; po shfaqen të dhënat e ruajtura më ${formatDate(latest.retrievedAt)} (periudha e fundit: ${formatPeriod(latest.period)}).`,
    };
  }
  return ageAssessment(def, latest, now);
}
