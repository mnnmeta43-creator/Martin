// SYNTHETIC — format mirrors the documented API; values are not real
// IMF DataMapper adapter: URL builder, UVK ↔ XKX mapping, projection flag, batching.
import { describe, expect, it } from 'vitest';
import { getCountries } from '@/lib/data/countries';
import { getIndicator } from '@/lib/data/indicators';
import { SourceError } from '@/lib/data/http';
import { buildImfUrl, fetchImfIndicator, IMF_BATCH_SIZE, parseImfResponse } from '@/lib/data/sources/imf';
import { createFakeFetch, jsonResponse, noSleep, textResponse } from '../../fixtures/data/fakeFetch';
import { IMF_EMPTY, imfResponse } from '../../fixtures/data/sources';

const DEF = getIndicator('imf_gdp_growth')!;
const NOW = new Date('2026-10-02T12:00:00.000Z');
const RETRIEVED = NOW.toISOString();
const URL = buildImfUrl(DEF.sourceCode, ['ALB', 'UVK']);

describe('buildImfUrl', () => {
  it('joins IMF country codes with "/"', () => {
    expect(URL).toBe('https://www.imf.org/external/datamapper/api/v1/NGDP_RPCH/ALB/UVK');
    expect(buildImfUrl('PCPIPCH')).toBe('https://www.imf.org/external/datamapper/api/v1/PCPIPCH');
  });
});

describe('parseImfResponse', () => {
  const json = imfResponse('NGDP_RPCH', {
    ALB: { '2024': 1.11, '2025': 2.22, '2026': 3.33, '2027': 4.44 },
    UVK: { '2025': -2.22, '2026': null },
    WEOWORLD: { '2025': 9.99 },
  });

  it('maps UVK to XKX, skips nulls and aggregates', () => {
    const out = parseImfResponse(json, DEF, { retrievedAt: RETRIEVED, url: URL, now: NOW });
    expect(out.map((o) => [o.countryCode, o.period, o.value])).toEqual([
      ['ALB', '2024', 1.11],
      ['ALB', '2025', 2.22],
      ['ALB', '2026', 3.33],
      ['ALB', '2027', 4.44],
      ['XKX', '2025', -2.22],
    ]);
  });

  it('flags every year from the current calendar year of `now` as a projection', () => {
    const out = parseImfResponse(json, DEF, { retrievedAt: RETRIEVED, url: URL, now: NOW });
    const flags = Object.fromEntries(out.filter((o) => o.countryCode === 'ALB').map((o) => [o.period, o.isProjection]));
    expect(flags).toEqual({ '2024': false, '2025': false, '2026': true, '2027': true });
    const earlier = parseImfResponse(json, DEF, { retrievedAt: RETRIEVED, url: URL, now: new Date('2025-03-01T00:00:00Z') });
    expect(earlier.find((o) => o.countryCode === 'ALB' && o.period === '2025')?.isProjection).toBe(true);
  });

  it('records provenance with a per-country URL', () => {
    const [first] = parseImfResponse(json, DEF, { retrievedAt: RETRIEVED, url: URL, now: NOW });
    expect(first).toMatchObject({
      sourceId: 'imf-datamapper',
      indicatorCode: 'imf_gdp_growth',
      unit: 'perqind',
      isDemo: false,
      retrievedAt: RETRIEVED,
      sourceUrl: 'https://www.imf.org/external/datamapper/api/v1/NGDP_RPCH/ALB',
    });
    const xkx = parseImfResponse(json, DEF, { retrievedAt: RETRIEVED, url: URL, now: NOW }).find((o) => o.countryCode === 'XKX');
    expect(xkx?.sourceUrl).toBe('https://www.imf.org/external/datamapper/api/v1/NGDP_RPCH/UVK');
  });

  it('treats empty / missing keys as no data and rejects non-objects', () => {
    expect(parseImfResponse(IMF_EMPTY, DEF, { retrievedAt: RETRIEVED, url: URL, now: NOW })).toEqual([]);
    expect(parseImfResponse(imfResponse('OTHER', { ALB: { '2024': 1.11 } }), DEF, { retrievedAt: RETRIEVED, url: URL, now: NOW })).toEqual([]);
    expect(() => parseImfResponse('nope', DEF, { retrievedAt: RETRIEVED, url: URL, now: NOW })).toThrow(SourceError);
  });
});

describe('fetchImfIndicator', () => {
  const codes = getCountries()
    .filter((c) => c.sourceCodes.imf)
    .slice(0, 85)
    .map((c) => c.code);

  it(`requests at most ${IMF_BATCH_SIZE} countries per call`, async () => {
    const fetchImpl = createFakeFetch([() => jsonResponse(IMF_EMPTY)]);
    const res = await fetchImfIndicator(DEF, codes, { fetchImpl, sleep: noSleep, now: NOW, retrievedAt: RETRIEVED });
    expect(fetchImpl.calls).toHaveLength(3);
    const sizes = fetchImpl.calls.map((u) => u.replace('https://www.imf.org/external/datamapper/api/v1/NGDP_RPCH/', '').split('/').length);
    expect(sizes).toEqual([40, 40, 5]);
    expect(res.errors).toEqual([]);
  });

  it('requests Kosovo as UVK', async () => {
    const fetchImpl = createFakeFetch([() => jsonResponse(imfResponse('NGDP_RPCH', { UVK: { '2025': 1.11 } }))]);
    const res = await fetchImfIndicator(DEF, ['XKX'], { fetchImpl, sleep: noSleep, now: NOW, retrievedAt: RETRIEVED });
    expect(fetchImpl.calls).toEqual(['https://www.imf.org/external/datamapper/api/v1/NGDP_RPCH/UVK']);
    expect(res.observations[0].countryCode).toBe('XKX');
  });

  it('reports a failed batch while keeping the others', async () => {
    let n = 0;
    const fetchImpl = createFakeFetch([() => (++n === 2 ? textResponse('down', 500) : jsonResponse(IMF_EMPTY))]);
    const res = await fetchImfIndicator(DEF, codes, { fetchImpl, sleep: noSleep, retries: 0, now: NOW, retrievedAt: RETRIEVED });
    expect(res.errors).toHaveLength(1);
    expect(res.urls).toHaveLength(3);
  });

  it('throws when every batch fails, and stops at the first policy block', async () => {
    const failing = createFakeFetch([() => textResponse('down', 500)]);
    await expect(fetchImfIndicator(DEF, codes, { fetchImpl: failing, sleep: noSleep, retries: 0, now: NOW, retrievedAt: RETRIEVED })).rejects.toBeInstanceOf(SourceError);
    const blocked = createFakeFetch([() => textResponse('forbidden', 403)]);
    await expect(fetchImfIndicator(DEF, codes, { fetchImpl: blocked, sleep: noSleep, now: NOW, retrievedAt: RETRIEVED })).rejects.toMatchObject({ kind: 'blocked' });
    expect(blocked.calls).toHaveLength(1);
  });
});
