// SYNTHETIC — format mirrors the documented API; values are not real
/**
 * Payload builders for the World Bank v2, IMF DataMapper v1 and Frankfurter APIs. Shapes follow
 * the documented response formats; every number is an obviously synthetic placeholder
 * (1.11, 2.22, 12345, …) and none of them describes any real economy.
 */

// ── World Bank ────────────────────────────────────────────────────────────────

export interface WbRowInput {
  iso3: string;
  iso2?: string;
  name?: string;
  date: string;
  value: number | null;
  indicatorId?: string;
  obsStatus?: string;
}

export function wbRow(r: WbRowInput) {
  return {
    indicator: { id: r.indicatorId ?? 'NY.GDP.MKTP.KD.ZG', value: 'GDP growth (annual %)' },
    country: { id: r.iso2 ?? r.iso3.slice(0, 2), value: r.name ?? r.iso3 },
    countryiso3code: r.iso3,
    date: r.date,
    value: r.value,
    unit: '',
    obs_status: r.obsStatus ?? '',
    decimal: 1,
  };
}

export function wbMeta(page: number, pages: number, total: number, lastupdated = '2026-07-01') {
  return { page, pages, per_page: 1000, total, sourceid: '2', sourcename: 'World Development Indicators', lastupdated };
}

export function wbPage(page: number, pages: number, rows: ReturnType<typeof wbRow>[], lastupdated?: string) {
  return [wbMeta(page, pages, rows.length * Math.max(pages, 1), lastupdated), rows];
}

export const WB_NO_DATA = [{ page: 0, pages: 0, per_page: 50, total: 0, sourceid: null, lastupdated: '2026-07-01' }, null];

export const WB_ERROR = [{ message: [{ id: '120', key: 'Invalid value', value: 'The provided parameter value is not valid' }] }];

function wbLabel(id: string, value: string, iso2code = 'XX') {
  return { id, iso2code, value };
}

export const WB_COUNTRIES = [
  { page: 1, pages: 1, per_page: '400', total: 5 },
  [
    {
      id: 'ALB',
      iso2Code: 'AL',
      name: 'Albania',
      region: wbLabel('ECS', 'Europe & Central Asia', 'Z7'),
      adminregion: wbLabel('ECA', 'Europe & Central Asia (excluding high income)', '7E'),
      incomeLevel: wbLabel('UMC', 'Upper middle income', 'XT'),
      lendingType: wbLabel('IBD', 'IBRD', 'XF'),
      capitalCity: 'Tirane',
      longitude: '1.11',
      latitude: '2.22',
    },
    {
      id: 'XKX',
      iso2Code: 'XK',
      name: 'Kosovo',
      region: wbLabel('ECS', 'Europe & Central Asia', 'Z7'),
      adminregion: wbLabel('ECA', 'Europe & Central Asia (excluding high income)', '7E'),
      incomeLevel: wbLabel('UMC', 'Upper middle income', 'XT'),
      lendingType: wbLabel('IDX', 'IDA', 'XI'),
      capitalCity: 'Pristina',
      longitude: '1.11',
      latitude: '2.22',
    },
    {
      id: 'DEU',
      iso2Code: 'DE',
      name: 'Germany',
      region: wbLabel('ECS', 'Europe & Central Asia', 'Z7'),
      adminregion: wbLabel('', ''),
      incomeLevel: wbLabel('HIC', 'High income', 'XD'),
      lendingType: wbLabel('LNX', 'Not classified', 'XX'),
      capitalCity: 'Berlin',
      longitude: '1.11',
      latitude: '2.22',
    },
    {
      id: 'AFE',
      iso2Code: 'ZH',
      name: 'Africa Eastern and Southern',
      region: wbLabel('NA', 'Aggregates', 'NA'),
      adminregion: wbLabel('', ''),
      incomeLevel: wbLabel('NA', 'Aggregates', 'NA'),
      lendingType: wbLabel('', 'Aggregates'),
      capitalCity: '',
      longitude: '',
      latitude: '',
    },
    {
      id: 'WLD',
      iso2Code: '1W',
      name: 'World',
      region: wbLabel('NA', 'Aggregates', 'NA'),
      adminregion: wbLabel('', ''),
      incomeLevel: wbLabel('NA', 'Aggregates', 'NA'),
      lendingType: wbLabel('', 'Aggregates'),
      capitalCity: '',
      longitude: '',
      latitude: '',
    },
  ],
];

// ── IMF DataMapper ────────────────────────────────────────────────────────────

export function imfResponse(code: string, byCountry: Record<string, Record<string, number | null>>) {
  return { values: { [code]: byCountry }, api: { version: '1', 'output-method': 'json' } };
}

export const IMF_EMPTY = { values: {}, api: { version: '1', 'output-method': 'json' } };

// ── Frankfurter ───────────────────────────────────────────────────────────────

export const FRANKFURTER_LATEST = {
  amount: 1.0,
  base: 'EUR',
  date: '2026-09-30',
  rates: { USD: 1.11, GBP: 0.88, CHF: 0.99, JPY: 111.11 },
};
