// SYNTHETIC — format mirrors the documented API; values are not real
/**
 * Builders for stored Observations and fetch-log entries used by series, coverage, context and
 * analysis tests. Provenance (sourceUrl, retrievedAt) is filled the way the adapters fill it;
 * every value passed in by tests is a synthetic placeholder.
 */
import type { FetchLogEntry, Observation } from '@/lib/domain/types';
import { getIndicator } from '@/lib/data/indicators';
import { buildImfUrl } from '@/lib/data/sources/imf';

export const RETRIEVED_AT = '2026-09-01T08:00:00.000Z';

export interface ObsInput {
  code: string;
  country: string;
  period: string;
  value: number | null;
  isProjection?: boolean;
  isDemo?: boolean;
  retrievedAt?: string;
  unit?: Observation['unit'];
  currency?: string | null;
}

export function obs(input: ObsInput): Observation {
  const def = getIndicator(input.code);
  if (!def) throw new Error(`unknown indicator ${input.code}`);
  const sourceUrl =
    def.sourceId === 'imf-datamapper'
      ? buildImfUrl(def.sourceCode, [input.country === 'XKX' ? 'UVK' : input.country])
      : `https://api.worldbank.org/v2/country/${input.country}/indicator/${def.sourceCode}?format=json&date=2011:2026`;
  return {
    sourceId: input.isDemo ? 'demo' : def.sourceId,
    indicatorCode: def.code,
    countryCode: input.country,
    period: input.period,
    value: input.value,
    unit: input.unit ?? def.unit,
    currency: input.currency !== undefined ? input.currency : (def.currency ?? null),
    isProjection: input.isProjection ?? false,
    isDemo: input.isDemo ?? false,
    obsStatus: null,
    sourceUrl,
    sourceLastUpdated: def.sourceId === 'worldbank-wdi' ? '2026-07-01' : null,
    retrievedAt: input.retrievedAt ?? RETRIEVED_AT,
  };
}

/** A short annual series: one observation per [period, value] pair. */
export function annual(code: string, country: string, points: [string, number | null][], extra: Partial<ObsInput> = {}): Observation[] {
  return points.map(([period, value]) => obs({ code, country, period, value, ...extra }));
}

export function fetchLog(partial: Partial<FetchLogEntry> & Pick<FetchLogEntry, 'sourceId' | 'scope' | 'status'>): FetchLogEntry {
  const startedAt = partial.startedAt ?? '2026-09-01T08:00:00.000Z';
  return {
    startedAt,
    finishedAt: partial.finishedAt ?? startedAt,
    rows: 0,
    httpStatus: null,
    messageSq: null,
    ...partial,
  };
}
