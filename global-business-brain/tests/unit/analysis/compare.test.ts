// SYNTHETIC — values are not real
// Country comparison: 2–5 countries, cited cells, warnings for mismatched years, missing values,
// nominal USD next to PPP, per-country currency units and demo economies.
import { describe, expect, it } from 'vitest';
import { compareCountries } from '@/lib/analysis/compare';
import { annual } from '../../fixtures/data/observations';
import { contextsFrom } from '../../fixtures/data/contexts';

const rows = [
  ...annual('gdp_growth', 'ALB', [['2024', 1.11]]),
  ...annual('gdp_growth', 'XKX', [['2023', 2.22]]),
  ...annual('inflation_cpi', 'ALB', [['2024', 3.33]]),
  ...annual('inflation_cpi', 'XKX', [['2024', 4.44]]),
  ...annual('inflation_cpi', 'DEU', [['2024', 5.55]]),
  ...annual('gdp_per_capita_usd', 'ALB', [['2024', 1111]]),
  ...annual('gdp_per_capita_usd', 'DEU', [['2024', 2222]]),
  ...annual('gdp_per_capita_ppp', 'ALB', [['2024', 3333]]),
  ...annual('gdp_per_capita_ppp', 'DEU', [['2024', 4444]]),
  ...annual('exchange_rate_lcu_usd', 'ALB', [['2024', 111.11]]),
  ...annual('exchange_rate_lcu_usd', 'DEU', [['2024', 0.88]]),
];

async function three() {
  return (await contextsFrom(['ALB', 'XKX', 'DEU'], rows)).contexts;
}

describe('compareCountries — bounds', () => {
  it('requires 2 to 5 countries', async () => {
    const ctx = await three();
    expect(() => compareCountries(ctx.slice(0, 1), ['gdp_growth'])).toThrow(RangeError);
    expect(() => compareCountries([...ctx, ...ctx], ['gdp_growth'])).toThrow(RangeError);
    expect(() => compareCountries([], ['gdp_growth'])).toThrow(RangeError);
    expect(() => compareCountries([...ctx, ctx[0], ctx[1]], ['gdp_growth'])).not.toThrow();
  });
});

describe('compareCountries — cells', () => {
  it('lists the countries with coverage and keeps unknown/duplicate indicator codes out', async () => {
    const table = compareCountries(await three(), ['gdp_growth', 'gdp_growth', 'nuk_ekziston']);
    expect(table.countries.map((c) => [c.code, c.nameSq, c.isDemo])).toEqual([
      ['ALB', 'Shqipëri', false],
      ['XKX', 'Kosova', false],
      ['DEU', 'Gjermani', false],
    ]);
    expect(table.countries[0].coverage).toBe('e_pamjaftueshme');
    expect(table.rows.map((r) => r.code)).toEqual(['gdp_growth']);
    expect(table.warningsSq).toEqual([]);
  });

  it('each available cell carries its period, status and a citation; a missing one stays null', async () => {
    const [row] = compareCountries(await three(), ['gdp_growth']).rows;
    const [alb, xkx, deu] = row.cells;
    expect(alb).toMatchObject({ countryCode: 'ALB', value: 1.11, period: '2024', status: 'i_fresket' });
    expect(alb.citation).toMatchObject({ indicatorCode: 'gdp_growth', countryCode: 'ALB', period: '2024', value: 1.11, isDemo: false });
    expect(alb.citation?.url).toMatch(/^https:\/\/api\.worldbank\.org\/v2\/country\/ALB\//);
    expect(alb.citation?.retrievedAt).toBeTruthy();
    expect(xkx).toMatchObject({ value: 2.22, period: '2023' });
    expect(deu).toEqual({ countryCode: 'DEU', value: null, period: null, status: 'mungon', citation: null });
  });
});

describe('compareCountries — warnings', () => {
  it('warns when years differ between countries and when a value is missing', async () => {
    const [row] = compareCountries(await three(), ['gdp_growth']).rows;
    expect(row.warningsSq).toContain('Mungon vlera për: Gjermani — mungesa nuk trajtohet si zero.');
    expect(row.warningsSq).toContain('Vitet ndryshojnë: Shqipëri 2024, Kosova 2023 — krahasimi është i përafërt.');
  });

  it('no warnings when every country has a value for the same year', async () => {
    const [row] = compareCountries(await three(), ['inflation_cpi']).rows;
    expect(row.comparable).toBe(true);
    expect(row.warningsSq).toEqual([]);
  });

  it('warns when nominal USD and PPP rows sit side by side', async () => {
    const ctx = await three();
    const table = compareCountries([ctx[0], ctx[2]], ['gdp_per_capita_usd', 'gdp_per_capita_ppp']);
    const [usd, ppp] = table.rows;
    expect(usd.warningsSq.some((w) => w.includes('USD nominale') && w.includes('PPP'))).toBe(true);
    expect(ppp.warningsSq.some((w) => w.includes('PPP') && w.includes('nominale'))).toBe(true);
    const alone = compareCountries([ctx[0], ctx[2]], ['gdp_per_capita_usd']).rows[0];
    expect(alone.warningsSq).toEqual([]);
  });

  it('local-currency exchange rates are never comparable across countries', async () => {
    const ctx = await three();
    const [row] = compareCountries([ctx[0], ctx[2]], ['exchange_rate_lcu_usd']).rows;
    expect(row.comparable).toBe(false);
    expect(row.warningsSq.some((w) => w.includes('monedhën e vet'))).toBe(true);
  });

  it('a row with fewer than two values is not comparable', async () => {
    const ctx = await three();
    const [row] = compareCountries([ctx[1], ctx[2]], ['gdp_per_capita_usd']).rows;
    expect(row.comparable).toBe(false);
    expect(row.warningsSq[0]).toContain('Kosova');
  });

  it('flags demo economies next to real ones and never marks such rows comparable', async () => {
    const { contexts } = await contextsFrom(['ALB', 'ZZA'], rows, { demoMode: true });
    const table = compareCountries(contexts, ['inflation_cpi']);
    expect(table.countries[1].isDemo).toBe(true);
    expect(table.warningsSq[0]).toContain('DEMO');
    expect(table.rows[0].comparable).toBe(false);
    expect(table.rows[0].cells[1].citation?.isDemo).toBe(true);
  });
});
