/**
 * In-memory DataStore for data-layer tests. Mirrors the contract in src/lib/server/store/types.ts:
 * upserts replace by natural key, getObservations hides demo rows unless asked, latest-log and
 * latest-rate queries return one row per key. `failOn` makes a method throw, to test failures.
 */
import type { Country, CountryCode, FetchLogEntry, FxRate, Observation } from '@/lib/domain/types';
import type { DataStore, ObservationQuery } from '@/lib/server/store/types';

type Meta = NonNullable<Country['wb']>;

export class MemoryDataStore implements DataStore {
  observations: Observation[] = [];
  fetchLogs: FetchLogEntry[] = [];
  fxRates: FxRate[] = [];
  countryMeta: Record<CountryCode, Meta> = {};
  failOn = new Set<keyof DataStore>();
  /** Every write call, in order, for assertions about what was (not) written. */
  writes: { method: keyof DataStore; count: number }[] = [];

  private check(method: keyof DataStore): void {
    if (this.failOn.has(method)) throw new Error(`memory store: ${method} failed`);
  }

  async upsertObservations(observations: Observation[]): Promise<number> {
    this.check('upsertObservations');
    for (const o of observations) {
      const i = this.observations.findIndex(
        (x) => x.sourceId === o.sourceId && x.indicatorCode === o.indicatorCode && x.countryCode === o.countryCode && x.period === o.period,
      );
      if (i >= 0) this.observations[i] = { ...o };
      else this.observations.push({ ...o });
    }
    this.writes.push({ method: 'upsertObservations', count: observations.length });
    return observations.length;
  }

  async getObservations(q: ObservationQuery): Promise<Observation[]> {
    this.check('getObservations');
    return this.observations.filter(
      (o) =>
        (q.includeDemo === true || !o.isDemo) &&
        (!q.countryCodes || q.countryCodes.includes(o.countryCode)) &&
        (!q.indicatorCodes || q.indicatorCodes.includes(o.indicatorCode)) &&
        (!q.sourceIds || q.sourceIds.includes(o.sourceId)),
    );
  }

  async addFetchLog(entry: FetchLogEntry): Promise<void> {
    this.check('addFetchLog');
    this.fetchLogs.push({ ...entry, id: entry.id ?? String(this.fetchLogs.length + 1) });
    this.writes.push({ method: 'addFetchLog', count: 1 });
  }

  async getRecentFetchLogs(limit = 50): Promise<FetchLogEntry[]> {
    return [...this.fetchLogs].reverse().sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, limit);
  }

  async getLatestFetchLogs(): Promise<FetchLogEntry[]> {
    this.check('getLatestFetchLogs');
    const latest = new Map<string, FetchLogEntry>();
    for (const log of this.fetchLogs) {
      const key = `${log.sourceId}|${log.scope}`;
      const prev = latest.get(key);
      // Later insertion wins ties, like an auto-increment id would.
      if (!prev || log.startedAt >= prev.startedAt) latest.set(key, log);
    }
    return [...latest.values()];
  }

  async upsertFxRates(rates: FxRate[]): Promise<number> {
    this.check('upsertFxRates');
    for (const r of rates) {
      const i = this.fxRates.findIndex((x) => x.base === r.base && x.quote === r.quote && x.sourceId === r.sourceId && x.rateDate === r.rateDate);
      if (i >= 0) this.fxRates[i] = { ...r };
      else this.fxRates.push({ ...r });
    }
    this.writes.push({ method: 'upsertFxRates', count: rates.length });
    return rates.length;
  }

  async getFxRates(): Promise<FxRate[]> {
    const latest = new Map<string, FxRate>();
    for (const r of this.fxRates) {
      const key = `${r.base}|${r.quote}|${r.sourceId}`;
      const prev = latest.get(key);
      if (!prev || r.rateDate >= prev.rateDate) latest.set(key, r);
    }
    return [...latest.values()];
  }

  async upsertCountryMeta(rows: { code: CountryCode; wb: Meta }[]): Promise<number> {
    this.check('upsertCountryMeta');
    for (const row of rows) this.countryMeta[row.code] = { ...row.wb };
    this.writes.push({ method: 'upsertCountryMeta', count: rows.length });
    return rows.length;
  }

  async getCountryMeta(): Promise<Record<CountryCode, Meta>> {
    return { ...this.countryMeta };
  }
}
