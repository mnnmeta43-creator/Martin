// SYNTHETIC — format mirrors the documented API; values are not real
// FX: Frankfurter latest parser/fetcher and annual WB-derived rates (one per currency).
import { describe, expect, it } from 'vitest';
import { getCountries } from '@/lib/data/countries';
import { SourceError } from '@/lib/data/http';
import {
  buildFrankfurterLatestUrl,
  fetchFrankfurterLatest,
  fxRatesFromWbAnnual,
  parseFrankfurterLatest,
  resolveFxBaseUrl,
} from '@/lib/data/sources/fx';
import { createFakeFetch, jsonResponse, noSleep } from '../../fixtures/data/fakeFetch';
import { annual, obs } from '../../fixtures/data/observations';
import { FRANKFURTER_LATEST } from '../../fixtures/data/sources';

const RETRIEVED = '2026-10-02T12:00:00.000Z';

describe('Frankfurter', () => {
  it('resolves the base URL from FX_API_BASE_URL or the default', () => {
    expect(resolveFxBaseUrl({})).toBe('https://api.frankfurter.dev/v1');
    expect(resolveFxBaseUrl({ FX_API_BASE_URL: 'https://fx.internal.test/v1/' })).toBe('https://fx.internal.test/v1');
    expect(resolveFxBaseUrl({ FX_API_BASE_URL: 'not a url' })).toBe('https://api.frankfurter.dev/v1');
    expect(buildFrankfurterLatestUrl()).toBe('https://api.frankfurter.dev/v1/latest?base=EUR');
  });

  it('parses latest rates as daily reference rates', () => {
    const rates = parseFrankfurterLatest(FRANKFURTER_LATEST, { retrievedAt: RETRIEVED, url: buildFrankfurterLatestUrl() });
    expect(rates).toHaveLength(4);
    expect(rates[0]).toEqual({
      base: 'EUR',
      quote: 'USD',
      rate: 1.11,
      rateDate: '2026-09-30',
      sourceId: 'ecb-frankfurter',
      kind: 'reference_ditore',
      retrievedAt: RETRIEVED,
    });
  });

  it('rejects malformed payloads and an empty rate list', () => {
    const url = buildFrankfurterLatestUrl();
    expect(() => parseFrankfurterLatest({ base: 'EUR' }, { retrievedAt: RETRIEVED, url })).toThrow(SourceError);
    expect(() => parseFrankfurterLatest({ ...FRANKFURTER_LATEST, date: 'today' }, { retrievedAt: RETRIEVED, url })).toThrow(SourceError);
    try {
      parseFrankfurterLatest({ ...FRANKFURTER_LATEST, rates: { USD: -1, XX: 2 } }, { retrievedAt: RETRIEVED, url });
      throw new Error('expected error');
    } catch (err) {
      expect((err as SourceError).kind).toBe('empty');
    }
  });

  it('fetches from the configured base URL', async () => {
    const fetchImpl = createFakeFetch([() => jsonResponse(FRANKFURTER_LATEST)]);
    const res = await fetchFrankfurterLatest({ fetchImpl, sleep: noSleep, baseUrl: 'https://fx.internal.test/v1', retrievedAt: RETRIEVED });
    expect(fetchImpl.calls).toEqual(['https://fx.internal.test/v1/latest?base=EUR']);
    expect(res.rates.map((r) => r.quote)).toEqual(['USD', 'GBP', 'CHF', 'JPY']);
  });
});

describe('fxRatesFromWbAnnual', () => {
  const countries = getCountries();

  it('derives one USD rate per currency from the latest year', () => {
    const rates = fxRatesFromWbAnnual(
      annual('exchange_rate_lcu_usd', 'ALB', [
        ['2023', 111.1],
        ['2024', 122.2],
      ]),
      countries,
    );
    expect(rates).toEqual([
      { base: 'USD', quote: 'ALL', rate: 122.2, rateDate: '2024-12-31', sourceId: 'worldbank-wdi', kind: 'mesatare_vjetore', retrievedAt: expect.any(String) },
    ]);
  });

  it('collapses shared currencies to a single rate (latest year, median reporter)', () => {
    const rows = [
      ...annual('exchange_rate_lcu_usd', 'DEU', [['2024', 0.91]]),
      ...annual('exchange_rate_lcu_usd', 'FRA', [['2024', 0.92]]),
      ...annual('exchange_rate_lcu_usd', 'ITA', [['2024', 0.93]]),
      // A member whose older figure is in a legacy currency must not win.
      ...annual('exchange_rate_lcu_usd', 'HRV', [['2022', 7.77]]),
    ];
    const rates = fxRatesFromWbAnnual(rows, countries);
    expect(rates).toHaveLength(1);
    expect(rates[0]).toMatchObject({ quote: 'EUR', rate: 0.92, rateDate: '2024-12-31' });
  });

  it('skips USD itself, demo rows, projections and non-positive values', () => {
    const rows = [
      obs({ code: 'exchange_rate_lcu_usd', country: 'USA', period: '2024', value: 1 }),
      obs({ code: 'exchange_rate_lcu_usd', country: 'ALB', period: '2025', value: 1.11, isDemo: true }),
      obs({ code: 'exchange_rate_lcu_usd', country: 'ALB', period: '2026', value: 2.22, isProjection: true }),
      obs({ code: 'exchange_rate_lcu_usd', country: 'MKD', period: '2024', value: 0 }),
      obs({ code: 'gdp_growth', country: 'SRB', period: '2024', value: 3.33 }),
    ];
    expect(fxRatesFromWbAnnual(rows, countries)).toEqual([]);
  });
});
