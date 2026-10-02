// SYNTHETIC — format mirrors the documented API; values are not real
// World Bank v2 adapter: URL builder, page parser, paging, country classification.
import { describe, expect, it } from 'vitest';
import { getIndicator } from '@/lib/data/indicators';
import { SourceError } from '@/lib/data/http';
import {
  buildWbIndicatorUrl,
  canonicalPeriod,
  fetchWbCountries,
  fetchWbIndicator,
  parseWbCountries,
  parseWbIndicatorPage,
  wbCountryUrlFrom,
} from '@/lib/data/sources/worldbank';
import { createFakeFetch, jsonResponse, noSleep, textResponse, when } from '../../fixtures/data/fakeFetch';
import { WB_COUNTRIES, WB_ERROR, WB_NO_DATA, wbPage, wbRow } from '../../fixtures/data/sources';

const GDP = getIndicator('gdp_growth')!;
const FX = getIndicator('exchange_rate_lcu_usd')!;
const RETRIEVED = '2026-10-02T12:00:00.000Z';
const URL = buildWbIndicatorUrl(GDP.sourceCode, 'all', { from: 2011, to: 2026 });
const KNOWN = new Set(['ALB', 'XKX', 'DEU']);

function catchSourceError(fn: () => unknown): SourceError {
  try {
    fn();
  } catch (err) {
    expect(err).toBeInstanceOf(SourceError);
    return err as SourceError;
  }
  throw new Error('expected SourceError');
}

describe('buildWbIndicatorUrl', () => {
  it('builds the documented indicator URL for all economies', () => {
    expect(URL).toBe(
      'https://api.worldbank.org/v2/country/all/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=1000&page=1&date=2011:2026',
    );
  });

  it('joins several countries with ";" and honours paging options', () => {
    expect(buildWbIndicatorUrl('SP.POP.TOTL', ['alb', 'XKX'], { from: 2020, to: 2024, perPage: 50, page: 3 })).toBe(
      'https://api.worldbank.org/v2/country/ALB;XKX/indicator/SP.POP.TOTL?format=json&per_page=50&page=3&date=2020:2024',
    );
  });

  it('derives a single-country citation URL without paging parameters', () => {
    expect(wbCountryUrlFrom(URL, 'ALB')).toBe(
      'https://api.worldbank.org/v2/country/ALB/indicator/NY.GDP.MKTP.KD.ZG?format=json&date=2011:2026',
    );
  });
});

describe('parseWbIndicatorPage', () => {
  const page = wbPage(1, 1, [
    wbRow({ iso3: 'ALB', date: '2023', value: 1.11 }),
    wbRow({ iso3: 'ALB', date: '2022', value: null }),
    wbRow({ iso3: 'XKX', iso2: 'XK', date: '2023', value: 2.22, obsStatus: 'E' }),
    wbRow({ iso3: 'AFE', iso2: 'ZH', date: '2023', value: 3.33 }),
    wbRow({ iso3: 'WLD', iso2: '1W', date: '2023', value: 4.44 }),
    wbRow({ iso3: '', iso2: 'XC', date: '2023', value: 5.55 }),
    wbRow({ iso3: 'CHI', iso2: 'JG', date: '2023', value: 6.66 }),
    wbRow({ iso3: 'ZZA', iso2: 'QX', date: '2023', value: 7.77 }),
  ]);

  it('keeps real economies, skips nulls, aggregates and unknown codes', () => {
    const res = parseWbIndicatorPage(page, GDP, { retrievedAt: RETRIEVED, url: URL, knownCodes: KNOWN });
    expect(res.observations.map((o) => [o.countryCode, o.period, o.value])).toEqual([
      ['ALB', '2023', 1.11],
      ['XKX', '2023', 2.22],
    ]);
    expect(res.page).toBe(1);
    expect(res.pages).toBe(1);
    expect(res.lastUpdated).toBe('2026-07-01');
  });

  it('records full provenance and the unit from the definition', () => {
    const [alb, xkx] = parseWbIndicatorPage(page, GDP, { retrievedAt: RETRIEVED, url: URL, knownCodes: KNOWN }).observations;
    expect(alb).toMatchObject({
      sourceId: 'worldbank-wdi',
      indicatorCode: 'gdp_growth',
      unit: 'perqind',
      currency: null,
      isProjection: false,
      isDemo: false,
      obsStatus: null,
      sourceLastUpdated: '2026-07-01',
      retrievedAt: RETRIEVED,
      sourceUrl: 'https://api.worldbank.org/v2/country/ALB/indicator/NY.GDP.MKTP.KD.ZG?format=json&date=2011:2026',
    });
    expect(xkx.obsStatus).toBe('E');
    expect(xkx.sourceUrl).toContain('/country/XKX/');
  });

  it('maps Kosovo XKX and fills the local currency for MV series', () => {
    const fxPage = wbPage(1, 1, [
      wbRow({ iso3: 'ALB', date: '2024', value: 111.1, indicatorId: FX.sourceCode }),
      wbRow({ iso3: 'XKX', date: '2024', value: 0.99, indicatorId: FX.sourceCode }),
    ]);
    const res = parseWbIndicatorPage(fxPage, FX, { retrievedAt: RETRIEVED, url: URL, knownCodes: KNOWN });
    expect(res.observations.map((o) => [o.countryCode, o.currency, o.unit])).toEqual([
      ['ALB', 'ALL', 'mv_per_usd'],
      ['XKX', 'EUR', 'mv_per_usd'],
    ]);
  });

  it('only accepts codes in knownCodes', () => {
    const res = parseWbIndicatorPage(page, GDP, { retrievedAt: RETRIEVED, url: URL, knownCodes: new Set(['ALB']) });
    expect(res.observations.map((o) => o.countryCode)).toEqual(['ALB']);
  });

  it('turns the documented error payload into a parse SourceError', () => {
    const err = catchSourceError(() => parseWbIndicatorPage(WB_ERROR, GDP, { retrievedAt: RETRIEVED, url: URL, knownCodes: KNOWN }));
    expect(err.kind).toBe('parse');
    expect(err.messageSq).toContain('kodi 120');
    expect(err.messageSq).toContain('Invalid value');
  });

  it('treats the documented no-data payload as an empty, successful page', () => {
    const res = parseWbIndicatorPage(WB_NO_DATA, GDP, { retrievedAt: RETRIEVED, url: URL, knownCodes: KNOWN });
    expect(res.observations).toEqual([]);
    expect(res.pages).toBe(0);
  });

  it('rejects empty and malformed payloads', () => {
    expect(catchSourceError(() => parseWbIndicatorPage([], GDP, { retrievedAt: RETRIEVED, url: URL, knownCodes: KNOWN })).kind).toBe('empty');
    expect(catchSourceError(() => parseWbIndicatorPage({ a: 1 }, GDP, { retrievedAt: RETRIEVED, url: URL, knownCodes: KNOWN })).kind).toBe('parse');
    expect(catchSourceError(() => parseWbIndicatorPage([{ page: 1 }, 'x'], GDP, { retrievedAt: RETRIEVED, url: URL, knownCodes: KNOWN })).kind).toBe('parse');
  });
});

describe('canonicalPeriod', () => {
  it('normalises WB monthly/quarterly forms to the Observation contract', () => {
    expect(canonicalPeriod('2023')).toBe('2023');
    expect(canonicalPeriod('2023M01')).toBe('2023-01');
    expect(canonicalPeriod('2023Q4')).toBe('2023-Q4');
    expect(canonicalPeriod('n/a')).toBeNull();
  });
});

describe('fetchWbIndicator', () => {
  it('follows every page and concatenates the observations', async () => {
    const fetchImpl = createFakeFetch([
      when('page=1&', () => jsonResponse(wbPage(1, 2, [wbRow({ iso3: 'ALB', date: '2024', value: 1.11 })]))),
      when('page=2&', () => jsonResponse(wbPage(2, 2, [wbRow({ iso3: 'DEU', date: '2024', value: 2.22 })]))),
    ]);
    const res = await fetchWbIndicator(GDP, { fetchImpl, sleep: noSleep, from: 2011, to: 2026, retrievedAt: RETRIEVED, knownCodes: KNOWN });
    expect(fetchImpl.calls).toHaveLength(2);
    expect(res.observations.map((o) => o.countryCode)).toEqual(['ALB', 'DEU']);
    expect(res.pages).toBe(2);
    expect(res.lastUpdated).toBe('2026-07-01');
  });

  it('fails as a whole when a later page fails (no partial result)', async () => {
    const fetchImpl = createFakeFetch([
      when('page=1&', () => jsonResponse(wbPage(1, 2, [wbRow({ iso3: 'ALB', date: '2024', value: 1.11 })]))),
      when('page=2&', () => textResponse('down', 503)),
    ]);
    await expect(
      fetchWbIndicator(GDP, { fetchImpl, sleep: noSleep, retries: 1, from: 2011, to: 2026, retrievedAt: RETRIEVED, knownCodes: KNOWN }),
    ).rejects.toMatchObject({ kind: 'http', status: 503 });
  });
});

describe('parseWbCountries', () => {
  it('skips aggregates and translates classifications to Albanian', () => {
    const rows = parseWbCountries(WB_COUNTRIES, { retrievedAt: RETRIEVED });
    expect(rows.map((r) => r.code)).toEqual(['ALB', 'XKX', 'DEU']);
    expect(rows[0].wb).toEqual({
      regionSq: 'Evropa dhe Azia Qendrore',
      incomeLevel: 'Të ardhura mesatare të larta',
      lendingType: 'IBRD',
      retrievedAt: RETRIEVED,
    });
    expect(rows[1].wb.lendingType).toBe('IDA');
    expect(rows[2].wb.incomeLevel).toBe('Të ardhura të larta');
    expect(rows[2].wb.lendingType).toBe('Pa klasifikim');
  });

  it('is fetched from the documented countries endpoint', async () => {
    const fetchImpl = createFakeFetch([when('/v2/country?format=json&per_page=400', () => jsonResponse(WB_COUNTRIES))]);
    const res = await fetchWbCountries({ fetchImpl, sleep: noSleep, retrievedAt: RETRIEVED });
    expect(res.rows).toHaveLength(3);
    expect(res.url).toBe('https://api.worldbank.org/v2/country?format=json&per_page=400');
  });
});
