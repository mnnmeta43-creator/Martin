/**
 * Mbulimi i të dhënave për një vend: sa tregues kanë vlera, sa janë të freskët dhe çfarë mungon.
 *
 * Pure. Only measured-data indicators count (projection sources such as IMF WEO are excluded,
 * because a forecast is not coverage). Missing indicators are listed by code and never scored
 * as zero; the level only describes how much the macro picture can be trusted.
 */
import type { CountryCode, CountryCoverage, CoverageLevel, IndicatorSeries } from '@/lib/domain/types';
import { assessAge, type AgeStatus } from '@/lib/data/freshness';

const FULL_AVAILABLE = 0.8;
const FULL_FRESH = 0.6;
const PARTIAL_AVAILABLE = 0.4;

/**
 * Age of the latest value. Demo and source-error statuses hide the age, so with `now` the period
 * is re-assessed; without it their age is unknown (null) and they count neither fresh nor stale.
 */
function ageOf(s: IndicatorSeries, now?: Date): AgeStatus | null {
  if (!s.latest) return null;
  if (s.status === 'i_fresket' || s.status === 'i_vjeter' || s.status === 'shume_i_vjeter') return s.status;
  if ((s.status === 'demo' || s.status === 'gabim_burimi') && now) return assessAge(s.definition, s.latest.period, now);
  return null;
}

function levelFor(available: number, fresh: number, total: number): CoverageLevel {
  if (total === 0) return 'e_pamjaftueshme';
  if (available / total >= FULL_AVAILABLE && fresh / total >= FULL_FRESH) return 'e_plote';
  if (available / total >= PARTIAL_AVAILABLE) return 'e_pjesshme';
  return 'e_pamjaftueshme';
}

const LEVEL_NOTE_SQ: Record<CoverageLevel, string> = {
  e_plote: 'Mjafton për një pamje të përgjithshme makro, por nuk zëvendëson provat nga klientët dhe kostot lokale.',
  e_pjesshme: 'Pamja makro është e pjesshme: përfundimet duhen trajtuar me kujdes dhe plotësuar me burime zyrtare kombëtare.',
  e_pamjaftueshme:
    'Të dhënat nuk mjaftojnë për një analizë makro të besueshme; mbështetuni te burimet zyrtare kombëtare dhe te provat lokale.',
};

function noteSq(level: CoverageLevel, available: number, fresh: number, total: number, missing: number): string {
  if (total === 0) return 'Nuk ndiqet asnjë tregues për këtë vend.';
  const pct = Math.round((available / total) * 100);
  const missingText =
    missing > 0 ? ` Mungojnë ${missing} tregues; ato shfaqen si mungesë, jo si zero.` : ' Nuk mungon asnjë tregues.';
  return `${available} nga ${total} tregues kanë vlera (${pct}%), prej tyre ${fresh} të freskët.${missingText} ${LEVEL_NOTE_SQ[level]}`;
}

export function computeCoverage(countryCode: CountryCode, series: IndicatorSeries[], now?: Date): CountryCoverage {
  const tracked = series.filter((s) => !s.definition.isProjectionSource);
  const available = tracked.filter((s) => s.latest !== null);
  const fresh = available.filter((s) => ageOf(s, now) === 'i_fresket');
  const missingIndicators = tracked.filter((s) => s.latest === null).map((s) => s.definition.code);
  const staleIndicators = available
    .filter((s) => {
      const age = ageOf(s, now);
      return age === 'i_vjeter' || age === 'shume_i_vjeter';
    })
    .map((s) => s.definition.code);
  const level = levelFor(available.length, fresh.length, tracked.length);
  return {
    countryCode,
    level,
    availableCount: available.length,
    totalTracked: tracked.length,
    freshCount: fresh.length,
    missingIndicators,
    staleIndicators,
    noteSq: noteSq(level, available.length, fresh.length, tracked.length, missingIndicators.length),
  };
}
