// SYNTHETIC — format mirrors the documented API; values are not real
// Country data context: real country without data, with stored data, after a failed refresh,
// demo economies only in demo mode, batched store reads for the whole catalogue.
import { describe, expect, it } from 'vitest';
import type { FxRate, Observation } from '@/lib/domain/types';
import type { ObservationQuery } from '@/lib/server/store/types';
import { FULL_READ_MIN_COUNTRIES, getCountryDataContext, getCountryDataContexts } from '@/lib/data/context';
import { getCountries } from '@/lib/data/countries';
import { INDICATORS } from '@/lib/data/indicators';
import { MemoryDataStore } from '../../fixtures/data/memoryDataStore';
import { annual, fetchLog, obs } from '../../fixtures/data/observations';

const NOW = new Date('2026-10-02T12:00:00.000Z');
const RETRIEVED = '2026-09-01T08:00:00.000Z';

/** Counts reads so tests can assert the number of queries, not just the result. */
class CountingStore extends MemoryDataStore {
  observationQueries: ObservationQuery[] = [];
  latestLogCalls = 0;

  override async getObservations(q: ObservationQuery): Promise<Observation[]> {
    this.observationQueries.push(q);
    return super.getObservations(q);
  }

  override async getLatestFetchLogs() {
    this.latestLogCalls++;
    return super.getLatestFetchLogs();
  }
}

const ecbRate: FxRate = {
  base: 'EUR',
  quote: 'USD',
  rate: 1.11,
  rateDate: '2026-09-30',
  sourceId: 'ecb-frankfurter',
  kind: 'reference_ditore',
  retrievedAt: RETRIEVED,
};

function allValues(o: { series: { observations: Observation[]; latest: Observation | null }[] }): (number | null)[] {
  return o.series.flatMap((s) => [...s.observations.map((x) => x.value), s.latest?.value ?? null]);
}

describe('getCountryDataContext — real country without data', () => {
  it('every indicator is "mungon", coverage is insufficient and nothing is zero', async () => {
    const ctx = (await getCountryDataContext(new MemoryDataStore(), 'ALB', NOW))!;
    expect(ctx.country.code).toBe('ALB');
    expect(ctx.isDemo).toBe(false);
    expect(ctx.series).toHaveLength(INDICATORS.length);
    expect(ctx.series.map((s) => s.definition.code)).toEqual(INDICATORS.map((d) => d.code));
    expect(ctx.series.every((s) => s.status === 'mungon' && s.latest === null && s.observations.length === 0)).toBe(true);
    expect(ctx.series.every((s) => s.statusReasonSq === 'Burimi nuk është sinkronizuar ende.')).toBe(true);
    expect(ctx.series.every((s) => s.change.toValue === null && s.change.delta === null)).toBe(true);
    expect(allValues(ctx).every((v) => v === null)).toBe(true);
    expect(ctx.coverage).toMatchObject({ level: 'e_pamjaftueshme', availableCount: 0, freshCount: 0 });
    expect(ctx.coverage.missingIndicators).toHaveLength(ctx.coverage.totalTracked);
    expect(ctx).toMatchObject({ lastRefreshAt: null, sourceErrors: [], fxRates: [], generatedAt: NOW.toISOString() });
  });

  it('after a successful refresh without a value: "the source publishes no value for this country"', async () => {
    const store = new MemoryDataStore();
    await store.addFetchLog(fetchLog({ sourceId: 'worldbank-wdi', scope: 'indicator:gdp_growth', status: 'ok', rows: 12 }));
    const ctx = (await getCountryDataContext(store, 'ALB', NOW))!;
    const gdp = ctx.series.find((s) => s.definition.code === 'gdp_growth')!;
    expect(gdp.status).toBe('mungon');
    expect(gdp.statusReasonSq).toBe('Burimi nuk publikon vlerë për këtë vend.');
    expect(ctx.lastRefreshAt).toBe('2026-09-01T08:00:00.000Z');
  });

  it('returns null for unknown codes', async () => {
    expect(await getCountryDataContext(new MemoryDataStore(), 'XXX', NOW)).toBeNull();
  });
});

describe('getCountryDataContext — stored data', () => {
  async function storeWithData(): Promise<MemoryDataStore> {
    const store = new MemoryDataStore();
    await store.upsertObservations([
      ...annual('gdp_growth', 'ALB', [['2023', 1.11], ['2024', 2.22]]),
      ...annual('exchange_rate_lcu_usd', 'ALB', [['2024', 111.11]]),
      ...annual('exchange_rate_lcu_usd', 'DEU', [['2024', 0.88]]),
      ...annual('gdp_growth', 'DEU', [['2024', 9.99]]),
      obs({ code: 'imf_gdp_growth', country: 'ALB', period: '2025', value: 3.33 }),
      obs({ code: 'imf_gdp_growth', country: 'ALB', period: '2026', value: 4.44, isProjection: true }),
    ]);
    await store.addFetchLog(fetchLog({ sourceId: 'worldbank-wdi', scope: 'indicator:gdp_growth', status: 'ok', startedAt: '2026-09-01T08:00:00.000Z' }));
    await store.addFetchLog(fetchLog({ sourceId: 'ecb-frankfurter', scope: 'fx:EUR', status: 'ok', startedAt: '2026-10-01T16:00:00.000Z' }));
    await store.upsertFxRates([ecbRate]);
    await store.upsertCountryMeta([
      { code: 'ALB', wb: { regionSq: 'Evropa dhe Azia Qendrore', incomeLevel: 'Të ardhura mesatare të larta', lendingType: 'IBRD', retrievedAt: RETRIEVED } },
    ]);
    return store;
  }

  it('builds series from the stored values of this country only', async () => {
    const ctx = (await getCountryDataContext(await storeWithData(), 'ALB', NOW))!;
    const gdp = ctx.series.find((s) => s.definition.code === 'gdp_growth')!;
    expect(gdp.status).toBe('i_fresket');
    expect(gdp.latest).toMatchObject({ period: '2024', value: 2.22, countryCode: 'ALB' });
    expect(gdp.change).toMatchObject({ comparable: true, deltaKind: 'pike_perqindjeje' });
    expect(gdp.lastFetch?.status).toBe('ok');
    expect(ctx.series.flatMap((s) => s.observations).every((o) => o.countryCode === 'ALB')).toBe(true);
  });

  it('keeps IMF projections flagged and out of `latest`', async () => {
    const ctx = (await getCountryDataContext(await storeWithData(), 'ALB', NOW))!;
    const imf = ctx.series.find((s) => s.definition.code === 'imf_gdp_growth')!;
    expect(imf.latest?.period).toBe('2025');
    expect(imf.observations.find((o) => o.period === '2026')?.isProjection).toBe(true);
  });

  it('merges World Bank classification, stored FX rates and WB-derived annual rates for every currency', async () => {
    const ctx = (await getCountryDataContext(await storeWithData(), 'ALB', NOW))!;
    expect(ctx.country.wb?.incomeLevel).toBe('Të ardhura mesatare të larta');
    expect(ctx.fxRates).toContainEqual(ecbRate);
    expect(ctx.fxRates).toContainEqual(
      expect.objectContaining({ base: 'USD', quote: 'ALL', rate: 111.11, kind: 'mesatare_vjetore', sourceId: 'worldbank-wdi', rateDate: '2024-12-31' }),
    );
    // Derived from another country's series: conversions may need any currency.
    expect(ctx.fxRates).toContainEqual(expect.objectContaining({ base: 'USD', quote: 'EUR', rate: 0.88 }));
    expect(ctx.lastRefreshAt).toBe('2026-10-01T16:00:00.000Z');
    expect(ctx.coverage.availableCount).toBe(2); // gdp_growth + exchange rate (projection source excluded)
  });

  it('never uses a demo row stored against a real country', async () => {
    const store = await storeWithData();
    store.observations.push(obs({ code: 'population', country: 'ALB', period: '2024', value: 12345, isDemo: true }));
    const ctx = (await getCountryDataContext(store, 'ALB', NOW))!;
    expect(ctx.series.find((s) => s.definition.code === 'population')?.status).toBe('mungon');
  });
});

describe('getCountryDataContext — failed last fetch', () => {
  it('shows stored values with status gabim_burimi and lists the failure', async () => {
    const store = new MemoryDataStore();
    await store.upsertObservations(annual('gdp_growth', 'ALB', [['2023', 1.11], ['2024', 2.22]]));
    await store.addFetchLog(fetchLog({ sourceId: 'worldbank-wdi', scope: 'indicator:gdp_growth', status: 'ok', startedAt: '2026-09-01T08:00:00.000Z' }));
    const failed = fetchLog({
      sourceId: 'worldbank-wdi',
      scope: 'indicator:gdp_growth',
      status: 'gabim',
      startedAt: '2026-10-01T06:00:00.000Z',
      httpStatus: 503,
      messageSq: 'Burimi ktheu gabim serveri (HTTP 503).',
    });
    await store.addFetchLog(failed);
    await store.addFetchLog(fetchLog({ sourceId: 'worldbank-wdi', scope: 'indicator:population', status: 'gabim', startedAt: '2026-10-01T06:05:00.000Z' }));

    const ctx = (await getCountryDataContext(store, 'ALB', NOW))!;
    const gdp = ctx.series.find((s) => s.definition.code === 'gdp_growth')!;
    expect(gdp.status).toBe('gabim_burimi');
    expect(gdp.latest?.value).toBe(2.22);
    expect(gdp.statusReasonSq).toContain('1 tetor 2026');
    expect(gdp.statusReasonSq).toContain('po shfaqen të dhënat e ruajtura më 1 shtator 2026');

    const pop = ctx.series.find((s) => s.definition.code === 'population')!;
    expect(pop.status).toBe('gabim_burimi');
    expect(pop.latest).toBeNull();
    expect(pop.statusReasonSq).toContain('nuk ka të dhëna të ruajtura');

    expect(ctx.sourceErrors.map((l) => l.scope)).toEqual(['indicator:population', 'indicator:gdp_growth']);
    expect(ctx.coverage.availableCount).toBe(1);
    expect(ctx.coverage.freshCount).toBe(1); // re-assessed by age despite the failed refresh
  });

  it('an error fixed by a later successful refresh is no longer reported', async () => {
    const store = new MemoryDataStore();
    await store.addFetchLog(fetchLog({ sourceId: 'worldbank-wdi', scope: 'indicator:gdp_growth', status: 'gabim', startedAt: '2026-09-01T06:00:00.000Z' }));
    await store.addFetchLog(fetchLog({ sourceId: 'worldbank-wdi', scope: 'indicator:gdp_growth', status: 'ok', startedAt: '2026-09-02T06:00:00.000Z' }));
    const ctx = (await getCountryDataContext(store, 'ALB', NOW))!;
    expect(ctx.sourceErrors).toEqual([]);
  });
});

describe('getCountryDataContext — demo economies', () => {
  it('do not exist unless demo mode is on', async () => {
    const store = new MemoryDataStore();
    expect(await getCountryDataContext(store, 'ZZA', NOW)).toBeNull();
    expect(await getCountryDataContext(store, 'ZZA', NOW, { demoMode: false })).toBeNull();
  });

  it('in demo mode are generated in memory, flagged, and never touch the store', async () => {
    const store = new CountingStore();
    store.failOn.add('getObservations');
    const ctx = (await getCountryDataContext(store, 'ZZA', NOW, { demoMode: true }))!;
    expect(ctx.isDemo).toBe(true);
    expect(ctx.country.isDemo).toBe(true);
    expect(ctx.series.flatMap((s) => s.observations).every((o) => o.isDemo && o.countryCode === 'ZZA')).toBe(true);
    expect(ctx.series.filter((s) => s.latest).every((s) => s.status === 'demo')).toBe(true);
    expect(ctx.fxRates.length).toBeGreaterThan(0);
    expect(ctx.fxRates.every((r) => r.kind === 'demo')).toBe(true);
    expect(ctx).toMatchObject({ lastRefreshAt: null, sourceErrors: [] });
    expect(store.observationQueries).toEqual([]);
    expect(store.writes).toEqual([]);
  });

  it('demo mode does not mix demo data into real countries', async () => {
    const store = new MemoryDataStore();
    const [alb, zzb] = await getCountryDataContexts(store, ['ALB', 'ZZB'], NOW, { demoMode: true });
    expect(alb?.isDemo).toBe(false);
    expect(alb?.series.every((s) => s.status === 'mungon')).toBe(true);
    expect(alb?.fxRates).toEqual([]);
    expect(zzb?.isDemo).toBe(true);
    expect(store.writes).toEqual([]);
  });
});

describe('getCountryDataContexts — batching', () => {
  it('keeps the order of the codes, with null for unknown and disabled demo codes', async () => {
    const out = await getCountryDataContexts(new MemoryDataStore(), ['DEU', 'XXX', 'ZZA', 'XKX'], NOW);
    expect(out.map((c) => c?.country.code ?? null)).toEqual(['DEU', null, null, 'XKX']);
  });

  it('a few countries: two batched observation reads and one fetch-log read', async () => {
    const store = new CountingStore();
    await getCountryDataContexts(store, ['ALB', 'XKX', 'DEU'], NOW);
    expect(store.observationQueries).toHaveLength(2);
    expect(store.observationQueries[0]).toMatchObject({ countryCodes: ['ALB', 'XKX', 'DEU'], includeDemo: false });
    expect(store.latestLogCalls).toBe(1);
  });

  it('the whole catalogue: one observation read and one fetch-log read, not one per country', async () => {
    const store = new CountingStore();
    await store.upsertObservations([
      ...annual('gdp_growth', 'ALB', [['2024', 1.11]]),
      ...annual('exchange_rate_lcu_usd', 'ALB', [['2024', 111.11]]),
      ...annual('gdp_growth', 'XKX', [['2024', 2.22]]),
    ]);
    const codes = getCountries().map((c) => c.code);
    expect(codes.length).toBeGreaterThanOrEqual(FULL_READ_MIN_COUNTRIES);
    const out = await getCountryDataContexts(store, codes, NOW);
    expect(store.observationQueries).toEqual([{ includeDemo: false }]);
    expect(store.latestLogCalls).toBe(1);
    expect(out.every((c) => c !== null)).toBe(true);
    const byCode = new Map(out.map((c) => [c!.country.code, c!]));
    expect(byCode.get('ALB')!.coverage.availableCount).toBe(2);
    expect(byCode.get('XKX')!.coverage.availableCount).toBe(1);
    expect(byCode.get('DEU')!.coverage.availableCount).toBe(0);
    expect(byCode.get('XKX')!.fxRates).toContainEqual(expect.objectContaining({ quote: 'ALL', rate: 111.11 }));
    expect(byCode.get('XKX')!.series.flatMap((s) => s.observations).every((o) => o.countryCode === 'XKX')).toBe(true);
  });
});
