// SYNTHETIC — format mirrors the documented API; values are not real
// refreshAll with a fake fetch and an in-memory DataStore: provenance, skip-if-fresh, force,
// failures that keep stored data, the per-source circuit breaker, and "never writes demo data".
import { describe, expect, it } from 'vitest';
import type { Country } from '@/lib/domain/types';
import { getCountries, getCountry } from '@/lib/data/countries';
import { DEMO_COUNTRIES, DEMO_COUNTRY_CODES } from '@/lib/data/demo/dataset';
import { CIRCUIT_OPEN_SQ, refreshAll, type RefreshDeps, type RefreshLogger } from '@/lib/data/refresh';
import { createFakeFetch, jsonResponse, noSleep, textResponse, when, type FakeRoute } from '../../fixtures/data/fakeFetch';
import { MemoryDataStore } from '../../fixtures/data/memoryDataStore';
import { FRANKFURTER_LATEST, WB_COUNTRIES, imfResponse, wbPage, wbRow } from '../../fixtures/data/sources';

const NOW = new Date('2026-10-02T12:00:00.000Z');
const HOUR = 3_600_000;
const FX_BASE = 'https://fx.test/v1';
const CODES = ['gdp_growth', 'population', 'imf_gdp_growth'];

const real = ['ALB', 'XKX', 'DEU'].map((c) => getCountry(c)!);
const COUNTRIES: Country[] = [...real, ...DEMO_COUNTRIES];

function pageOf(url: string): number {
  return Number(new URL(url).searchParams.get('page') ?? '1');
}

/** Route for one WB indicator; `pages[i]` answers page i+1. */
function wbIndicator(sourceCode: string, pages: unknown[]): FakeRoute {
  return (url) => (url.includes(`/indicator/${sourceCode}?`) ? jsonResponse(pages[pageOf(url) - 1]) : undefined);
}

function failing(fragment: string, status: number): FakeRoute {
  return when(fragment, () => textResponse('unavailable', status));
}

const GDP_PAGES = (albValue = 1.11) => [
  wbPage(1, 2, [
    wbRow({ iso3: 'ALB', date: '2024', value: albValue }),
    wbRow({ iso3: 'ALB', date: '2023', value: null }),
    wbRow({ iso3: 'XKX', iso2: 'XK', date: '2024', value: 2.22 }),
    wbRow({ iso3: 'AFE', iso2: 'ZH', date: '2024', value: 3.33 }),
  ]),
  wbPage(2, 2, [wbRow({ iso3: 'DEU', date: '2024', value: 4.44 }), wbRow({ iso3: 'ZZA', iso2: 'QX', date: '2024', value: 7.77 })]),
];

const POP_PAGES = [wbPage(1, 1, [wbRow({ iso3: 'ALB', date: '2024', value: 12345, indicatorId: 'SP.POP.TOTL' })])];

const IMF_GDP = imfResponse('NGDP_RPCH', {
  ALB: { '2025': 1.11, '2026': 2.22 },
  UVK: { '2025': 3.33 },
  WEOWORLD: { '2025': 9.99 },
});

function happyRoutes(overrides: FakeRoute[] = []): FakeRoute[] {
  return [
    ...overrides,
    when('/v2/country?format=json', () => jsonResponse(WB_COUNTRIES)),
    wbIndicator('NY.GDP.MKTP.KD.ZG', GDP_PAGES()),
    wbIndicator('SP.POP.TOTL', POP_PAGES),
    when('/datamapper/api/v1/NGDP_RPCH/', () => jsonResponse(IMF_GDP)),
    when(`${FX_BASE}/latest?base=EUR`, () => jsonResponse(FRANKFURTER_LATEST)),
  ];
}

function deps(store: MemoryDataStore, fetchImpl: typeof fetch, extra: Partial<RefreshDeps> = {}): RefreshDeps {
  return {
    store,
    fetchImpl,
    now: NOW,
    sleep: noSleep,
    retries: 0,
    fxBaseUrl: FX_BASE,
    indicatorCodes: CODES,
    countries: COUNTRIES,
    ...extra,
  };
}

function recordingLogger(): RefreshLogger & { lines: string[] } {
  const lines: string[] = [];
  return { lines, info: (m) => lines.push(m), warn: (m) => lines.push(m), error: (m) => lines.push(m) };
}

describe('refreshAll — success path', () => {
  it('fetches every scope in order and stores observations with full provenance', async () => {
    const store = new MemoryDataStore();
    const fetchImpl = createFakeFetch(happyRoutes());
    const report = await refreshAll(deps(store, fetchImpl));

    expect(report.results.map((r) => [r.sourceId, r.scope, r.status])).toEqual([
      ['worldbank-countries', 'countries', 'ok'],
      ['worldbank-wdi', 'indicator:gdp_growth', 'ok'],
      ['worldbank-wdi', 'indicator:population', 'ok'],
      ['imf-datamapper', 'indicator:imf_gdp_growth', 'ok'],
      ['ecb-frankfurter', 'fx:EUR', 'ok'],
    ]);
    expect(report).toMatchObject({ okCount: 5, errorCount: 0, skippedCount: 0, startedAt: NOW.toISOString() });

    const gdp = store.observations.filter((o) => o.indicatorCode === 'gdp_growth');
    expect(gdp.map((o) => [o.countryCode, o.period, o.value])).toEqual([
      ['ALB', '2024', 1.11],
      ['XKX', '2024', 2.22],
      ['DEU', '2024', 4.44],
    ]);
    expect(gdp[0]).toMatchObject({
      sourceId: 'worldbank-wdi',
      unit: 'perqind',
      isDemo: false,
      isProjection: false,
      retrievedAt: NOW.toISOString(),
      sourceLastUpdated: '2026-07-01',
      sourceUrl: 'https://api.worldbank.org/v2/country/ALB/indicator/NY.GDP.MKTP.KD.ZG?format=json&date=2011:2026',
    });
  });

  it('requests the last 15 years for all economies, and IMF data only for catalogue countries', async () => {
    const store = new MemoryDataStore();
    const fetchImpl = createFakeFetch(happyRoutes());
    await refreshAll(deps(store, fetchImpl));
    const wbCalls = fetchImpl.calls.filter((u) => u.includes('/indicator/NY.GDP.MKTP.KD.ZG'));
    expect(wbCalls).toEqual([
      'https://api.worldbank.org/v2/country/all/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=1000&page=1&date=2011:2026',
      'https://api.worldbank.org/v2/country/all/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=1000&page=2&date=2011:2026',
    ]);
    expect(fetchImpl.calls).toContain('https://www.imf.org/external/datamapper/api/v1/NGDP_RPCH/ALB/UVK/DEU');
  });

  it('stores IMF projections flagged by `now`, country classification and FX reference rates', async () => {
    const store = new MemoryDataStore();
    await refreshAll(deps(store, createFakeFetch(happyRoutes())));

    const imf = store.observations.filter((o) => o.sourceId === 'imf-datamapper');
    expect(imf.map((o) => [o.countryCode, o.period, o.isProjection])).toEqual([
      ['ALB', '2025', false],
      ['ALB', '2026', true],
      ['XKX', '2025', false],
    ]);

    expect(Object.keys(store.countryMeta).sort()).toEqual(['ALB', 'DEU', 'XKX']);
    expect(store.countryMeta.ALB).toMatchObject({ incomeLevel: 'Të ardhura mesatare të larta', retrievedAt: NOW.toISOString() });

    expect(store.fxRates).toHaveLength(4);
    expect(store.fxRates.every((r) => r.base === 'EUR' && r.sourceId === 'ecb-frankfurter' && r.kind === 'reference_ditore')).toBe(true);
  });

  it('writes one "ok" fetch log per scope with the row count', async () => {
    const store = new MemoryDataStore();
    await refreshAll(deps(store, createFakeFetch(happyRoutes())));
    expect(store.fetchLogs.map((l) => [l.scope, l.status, l.rows])).toEqual([
      ['countries', 'ok', 3],
      ['indicator:gdp_growth', 'ok', 3],
      ['indicator:population', 'ok', 1],
      ['indicator:imf_gdp_growth', 'ok', 3],
      ['fx:EUR', 'ok', 4],
    ]);
  });

  it('honours the source filter (--source) and reports unknown sources as skipped', async () => {
    const store = new MemoryDataStore();
    const fetchImpl = createFakeFetch(happyRoutes());
    const report = await refreshAll(deps(store, fetchImpl, { sources: ['ecb-frankfurter', 'nuk-ekziston'] }));
    expect(fetchImpl.calls).toEqual([`${FX_BASE}/latest?base=EUR`]);
    expect(report.results.map((r) => [r.sourceId, r.status])).toEqual([
      ['nuk-ekziston', 'anashkaluar'],
      ['ecb-frankfurter', 'ok'],
    ]);
  });
});

describe('refreshAll — skip-if-fresh and force', () => {
  async function seeded(): Promise<MemoryDataStore> {
    const store = new MemoryDataStore();
    await refreshAll(deps(store, createFakeFetch(happyRoutes())));
    return store;
  }

  it('skips scopes whose last successful fetch is younger than refreshEveryHours, without new logs', async () => {
    const store = await seeded();
    const logsBefore = store.fetchLogs.length;
    const fetchImpl = createFakeFetch(happyRoutes());
    const report = await refreshAll(deps(store, fetchImpl, { now: new Date(NOW.getTime() + 2 * HOUR) }));
    expect(fetchImpl.calls).toEqual([]);
    expect(report.skippedCount).toBe(5);
    expect(report.results.every((r) => r.status === 'anashkaluar' && r.messageSq.startsWith('Ende i freskët'))).toBe(true);
    expect(store.fetchLogs).toHaveLength(logsBefore);
  });

  it('re-fetches each source on its own cadence (FX daily, World Bank weekly)', async () => {
    const store = await seeded();
    const fetchImpl = createFakeFetch(happyRoutes());
    const report = await refreshAll(deps(store, fetchImpl, { now: new Date(NOW.getTime() + 25 * HOUR) }));
    expect(fetchImpl.calls).toEqual([`${FX_BASE}/latest?base=EUR`]);
    expect(report.results.find((r) => r.scope === 'fx:EUR')?.status).toBe('ok');
    expect(report.skippedCount).toBe(4);
  });

  it('fetches everything again with force', async () => {
    const store = await seeded();
    const fetchImpl = createFakeFetch(happyRoutes());
    const report = await refreshAll(deps(store, fetchImpl, { now: new Date(NOW.getTime() + 2 * HOUR), force: true }));
    expect(report.okCount).toBe(5);
    expect(report.skippedCount).toBe(0);
    expect(fetchImpl.calls.length).toBeGreaterThanOrEqual(6);
  });

  it('retries a scope whose latest attempt failed, even within the refresh interval', async () => {
    const store = await seeded();
    const later = new Date(NOW.getTime() + HOUR);
    await refreshAll(deps(store, createFakeFetch(happyRoutes([failing('/indicator/SP.POP.TOTL', 500)])), { now: later, force: true }));
    const fetchImpl = createFakeFetch(happyRoutes());
    const report = await refreshAll(deps(store, fetchImpl, { now: new Date(later.getTime() + HOUR) }));
    expect(report.results.find((r) => r.scope === 'indicator:population')?.status).toBe('ok');
    expect(report.results.filter((r) => r.status === 'anashkaluar')).toHaveLength(4);
  });
});

describe('refreshAll — failures keep stored data', () => {
  it('a failed scope leaves earlier observations untouched and writes a "gabim" log in Albanian', async () => {
    const store = new MemoryDataStore();
    await refreshAll(deps(store, createFakeFetch(happyRoutes())));
    const before = store.observations.filter((o) => o.indicatorCode === 'gdp_growth').map((o) => ({ ...o }));

    const later = new Date(NOW.getTime() + 8 * 24 * HOUR);
    const logger = recordingLogger();
    const report = await refreshAll(
      deps(store, createFakeFetch(happyRoutes([failing('/indicator/NY.GDP.MKTP.KD.ZG', 500)])), { now: later, logger }),
    );

    expect(store.observations.filter((o) => o.indicatorCode === 'gdp_growth')).toEqual(before);
    const result = report.results.find((r) => r.scope === 'indicator:gdp_growth')!;
    expect(result.status).toBe('gabim');
    expect(report.errorCount).toBe(1);
    expect(report.okCount).toBe(4); // the other scopes carried on

    const log = (await store.getLatestFetchLogs()).find((l) => l.scope === 'indicator:gdp_growth')!;
    expect(log).toMatchObject({ status: 'gabim', httpStatus: 500, rows: 0, startedAt: later.toISOString() });
    expect(log.messageSq).toContain('HTTP 500');
    expect(log.messageSq).toContain('nuk u prekën');
    // No stack traces or raw error objects in what is stored or logged.
    for (const text of [log.messageSq ?? '', ...logger.lines]) {
      expect(text).not.toMatch(/\n\s+at\s/);
      expect(text).not.toContain('[object');
    }
  });

  it('a later page failing writes nothing from the earlier pages (no partial overwrite)', async () => {
    const store = new MemoryDataStore();
    await refreshAll(deps(store, createFakeFetch(happyRoutes())));
    const changedFirstPage: FakeRoute = (url) =>
      url.includes('/indicator/NY.GDP.MKTP.KD.ZG?')
        ? pageOf(url) === 1
          ? jsonResponse(GDP_PAGES(9.99)[0])
          : textResponse('unavailable', 503)
        : undefined;
    await refreshAll(deps(store, createFakeFetch(happyRoutes([changedFirstPage])), { force: true }));
    const alb = store.observations.find((o) => o.indicatorCode === 'gdp_growth' && o.countryCode === 'ALB');
    expect(alb?.value).toBe(1.11);
  });

  it('a 403 from a proxy/egress policy is logged as blocked with a clear Albanian message', async () => {
    const store = new MemoryDataStore();
    const report = await refreshAll(deps(store, createFakeFetch(happyRoutes([failing(FX_BASE, 403)])), { sources: ['ecb-frankfurter'] }));
    expect(report.results[0].status).toBe('gabim');
    expect(report.results[0].messageSq).toContain('u bllokua (HTTP 403)');
    expect(store.fxRates).toEqual([]);
  });

  it('marks a partially failed IMF run as "pjesshem" and keeps the successful batches', async () => {
    const store = new MemoryDataStore();
    const many = getCountries().filter((c) => c.sourceCodes.imf).slice(0, 45);
    let n = 0;
    const imfRoute: FakeRoute = (url) =>
      url.includes('/datamapper/api/v1/NGDP_RPCH/')
        ? ++n === 2
          ? textResponse('unavailable', 500)
          : jsonResponse(imfResponse('NGDP_RPCH', { [many[0].sourceCodes.imf!]: { '2025': 1.11 } }))
        : undefined;
    const report = await refreshAll(
      deps(store, createFakeFetch([imfRoute]), { sources: ['imf-datamapper'], indicatorCodes: ['imf_gdp_growth'], countries: many }),
    );
    expect(report.results[0].status).toBe('pjesshem');
    expect(report.results[0].messageSq).toContain('1 nga 2 grupe');
    expect(store.observations).toHaveLength(1);
  });

  it('keeps going when the fetch log itself cannot be written', async () => {
    const store = new MemoryDataStore();
    store.failOn.add('addFetchLog');
    const logger = recordingLogger();
    const report = await refreshAll(deps(store, createFakeFetch(happyRoutes()), { logger }));
    expect(report.okCount).toBe(5);
    expect(logger.lines.some((l) => l.includes('fetch log not written'))).toBe(true);
  });
});

describe('refreshAll — circuit breaker', () => {
  const FIVE = ['gdp_growth', 'inflation_cpi', 'lending_rate', 'unemployment', 'population', 'imf_gdp_growth'];

  it('after 3 consecutive failures of one source, its remaining scopes are skipped for this run', async () => {
    const store = new MemoryDataStore();
    const fetchImpl = createFakeFetch(happyRoutes([failing('/indicator/', 503)]));
    const report = await refreshAll(deps(store, fetchImpl, { indicatorCodes: FIVE, sources: ['worldbank-wdi', 'imf-datamapper'] }));

    const wb = report.results.filter((r) => r.sourceId === 'worldbank-wdi');
    expect(wb.map((r) => r.status)).toEqual(['gabim', 'gabim', 'gabim', 'anashkaluar', 'anashkaluar']);
    expect(wb[3].messageSq).toBe(CIRCUIT_OPEN_SQ);
    expect(CIRCUIT_OPEN_SQ).toContain('Burimi u çaktivizua përkohësisht pas 3 dështimeve');
    expect(fetchImpl.calls.filter((u) => u.includes('api.worldbank.org'))).toHaveLength(3);

    // Another source is unaffected.
    expect(report.results.find((r) => r.sourceId === 'imf-datamapper')?.status).toBe('ok');
    const wbLogs = store.fetchLogs.filter((l) => l.sourceId === 'worldbank-wdi');
    expect(wbLogs.map((l) => l.status)).toEqual(['gabim', 'gabim', 'gabim', 'anashkaluar', 'anashkaluar']);
  });

  it('a success in between resets the count (failures must be consecutive)', async () => {
    const store = new MemoryDataStore();
    const okInflation = wbIndicator('FP.CPI.TOTL.ZG', [wbPage(1, 1, [wbRow({ iso3: 'ALB', date: '2024', value: 2.22 })])]);
    const fetchImpl = createFakeFetch([okInflation, failing('/indicator/', 500)]);
    const report = await refreshAll(deps(store, fetchImpl, { indicatorCodes: FIVE.slice(0, 5), sources: ['worldbank-wdi'] }));
    expect(report.results.map((r) => [r.scope, r.status])).toEqual([
      ['indicator:gdp_growth', 'gabim'],
      ['indicator:inflation_cpi', 'ok'],
      ['indicator:lending_rate', 'gabim'],
      ['indicator:unemployment', 'gabim'],
      ['indicator:population', 'gabim'],
    ]);
  });
});

describe('refreshAll — never writes demo data', () => {
  it('ignores demo economies in the catalogue and demo-looking rows in payloads', async () => {
    const store = new MemoryDataStore();
    const fetchImpl = createFakeFetch(happyRoutes());
    await refreshAll(deps(store, fetchImpl, { countries: [...real, ...DEMO_COUNTRIES] }));

    expect(store.observations.length).toBeGreaterThan(0);
    expect(store.observations.every((o) => !o.isDemo && !DEMO_COUNTRY_CODES.has(o.countryCode) && o.sourceId !== 'demo')).toBe(true);
    expect(store.fxRates.every((r) => r.kind !== 'demo' && r.sourceId !== 'demo')).toBe(true);
    expect(Object.keys(store.countryMeta).some((c) => DEMO_COUNTRY_CODES.has(c))).toBe(false);
    expect(fetchImpl.calls.some((u) => /ZZ[ABC]/.test(u))).toBe(false);
  });
});
