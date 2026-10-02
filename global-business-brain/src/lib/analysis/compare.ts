/**
 * Krahasimi i 2–5 vendeve krah për krah, me paralajmërime kur krahasimi nuk është i drejtë.
 *
 * Pure. Each cell is the latest measured value of that country with its period, status and a
 * citation; a missing value stays null. Rows warn when periods differ between countries, when
 * values are missing, when nominal USD and PPP rows sit next to each other, and when units make
 * a cross-country comparison meaningless (e.g. local currency per USD).
 */
import type {
  Citation,
  CountryCode,
  CountryDataContext,
  CoverageLevel,
  DataStatus,
  IndicatorDefinition,
  Observation,
} from '@/lib/domain/types';
import { citationForObservation } from '@/lib/analysis/citations';
import { getIndicator } from '@/lib/data/indicators';
import { formatPeriod } from '@/lib/finance/format';

export const MIN_COMPARE_COUNTRIES = 2;
export const MAX_COMPARE_COUNTRIES = 5;

export interface ComparisonCountry {
  code: CountryCode;
  nameSq: string;
  isDemo: boolean;
  coverage: CoverageLevel;
  coverageNoteSq: string;
}

export interface ComparisonCell {
  countryCode: CountryCode;
  value: number | null;
  period: string | null;
  status: DataStatus;
  citation: Citation | null;
}

export interface ComparisonRow {
  code: string;
  labelSq: string;
  unitLabelSq: string;
  cells: ComparisonCell[];
  comparable: boolean;
  warningsSq: string[];
}

export interface ComparisonTable {
  countries: ComparisonCountry[];
  rows: ComparisonRow[];
  /** Table-level warnings (e.g. demo economies next to real ones). */
  warningsSq: string[];
}

function latestFor(ctx: CountryDataContext, def: IndicatorDefinition): { obs: Observation | null; status: DataStatus } {
  const series = ctx.series.find((s) => s.definition.code === def.code);
  const latest = series?.latest ?? null;
  return { obs: latest && typeof latest.value === 'number' ? latest : null, status: series?.status ?? 'mungon' };
}

function cellFor(ctx: CountryDataContext, def: IndicatorDefinition, obs: Observation | null, status: DataStatus): ComparisonCell {
  return {
    countryCode: ctx.country.code,
    value: obs ? (obs.value as number) : null,
    period: obs ? obs.period : null,
    status,
    citation: obs ? citationForObservation(def, obs) : null,
  };
}

function nameOf(contexts: CountryDataContext[], code: CountryCode): string {
  return contexts.find((c) => c.country.code === code)?.country.nameSq ?? code;
}

function isNominalUsd(def: IndicatorDefinition): boolean {
  return def.unit === 'monedhe' && def.currency === 'USD' && def.basis === 'nominal';
}

function isPpp(def: IndicatorDefinition): boolean {
  return def.unit === 'monedhe' && def.currency === 'INTL$';
}

function buildRow(contexts: CountryDataContext[], def: IndicatorDefinition, mixesNominalAndPpp: boolean, mixesDemo: boolean): ComparisonRow {
  const latest = contexts.map((ctx) => latestFor(ctx, def));
  const cells = contexts.map((ctx, i) => cellFor(ctx, def, latest[i].obs, latest[i].status));
  const available = cells.filter((c) => c.value !== null);
  const observed = latest.flatMap((l) => (l.obs ? [l.obs] : []));
  const warningsSq: string[] = [];
  let comparable = available.length >= MIN_COMPARE_COUNTRIES && !mixesDemo;

  const missing = cells.filter((c) => c.value === null).map((c) => nameOf(contexts, c.countryCode));
  if (missing.length > 0) warningsSq.push(`Mungon vlera për: ${missing.join(', ')} — mungesa nuk trajtohet si zero.`);

  const periods = new Set(available.map((c) => c.period));
  if (periods.size > 1) {
    const list = available.map((c) => `${nameOf(contexts, c.countryCode)} ${formatPeriod(c.period)}`).join(', ');
    warningsSq.push(`Vitet ndryshojnë: ${list} — krahasimi është i përafërt.`);
  }

  const units = new Set(observed.map((o) => `${o.unit}|${o.currency ?? ''}`));
  if (def.unit === 'mv_per_usd') {
    comparable = false;
    warningsSq.push('Secili vend e shpreh këtë kurs në monedhën e vet: vlerat nuk krahasohen drejtpërdrejt mes vendeve.');
  } else if (units.size > 1) {
    comparable = false;
    warningsSq.push('Njësitë ose monedhat ndryshojnë mes vendeve; vlerat nuk krahasohen drejtpërdrejt.');
  }

  if (mixesNominalAndPpp && isNominalUsd(def)) {
    warningsSq.push('USD nominale nuk rregullohen për nivelin e çmimeve: mos e krahasoni këtë rresht drejtpërdrejt me rreshtin PPP.');
  }
  if (mixesNominalAndPpp && isPpp(def)) {
    warningsSq.push('PPP rregullon për dallimet në çmime, ndërsa rreshtat në USD nominale jo: mos i përzieni të dy matjet.');
  }
  if (cells.some((c) => c.status === 'i_vjeter' || c.status === 'shume_i_vjeter')) {
    warningsSq.push('Disa vlera janë të vjetra; shikoni periudhën e secilës qelizë.');
  }
  if (mixesDemo) warningsSq.push('Rreshti përzien të dhëna fiktive DEMO me të dhëna reale; nuk krahasohet.');

  return { code: def.code, labelSq: def.nameSq, unitLabelSq: def.unitLabelSq, cells, comparable, warningsSq };
}

/** Side-by-side table for 2–5 economies. Unknown indicator codes are skipped. */
export function compareCountries(contexts: CountryDataContext[], indicatorCodes: string[]): ComparisonTable {
  if (contexts.length < MIN_COMPARE_COUNTRIES || contexts.length > MAX_COMPARE_COUNTRIES) {
    throw new RangeError(`Krahasimi kërkon ${MIN_COMPARE_COUNTRIES}–${MAX_COMPARE_COUNTRIES} vende; u dhanë ${contexts.length}.`);
  }
  const defs = [...new Set(indicatorCodes)].map((c) => getIndicator(c)).filter((d): d is IndicatorDefinition => Boolean(d));
  const mixesNominalAndPpp = defs.some(isNominalUsd) && defs.some(isPpp);
  const demoCount = contexts.filter((c) => c.isDemo).length;
  const mixesDemo = demoCount > 0 && demoCount < contexts.length;

  const warningsSq: string[] = [];
  if (mixesDemo) {
    warningsSq.push('Po krahasoni ekonomi fiktive DEMO me vende reale: vlerat DEMO janë të sajuara dhe nuk krahasohen me të dhëna reale.');
  }

  return {
    countries: contexts.map((ctx) => ({
      code: ctx.country.code,
      nameSq: ctx.country.nameSq,
      isDemo: ctx.isDemo,
      coverage: ctx.coverage.level,
      coverageNoteSq: ctx.coverage.noteSq,
    })),
    rows: defs.map((def) => buildRow(contexts, def, mixesNominalAndPpp, mixesDemo)),
    warningsSq,
  };
}
