// Country catalog: counts, UN status corrections, Kosovo handling, Albanian names/regions, search.
import worldCountries from 'world-countries';
import { describe, expect, it } from 'vitest';
import {
  REGION_LABELS_SQ,
  SUBREGION_LABELS_SQ,
  getCountries,
  getCountry,
  hasEconomyData,
  listRegionsSq,
  normalizeSearchText,
  searchCountries,
  withWbMeta,
} from '@/lib/data/countries';

const all = getCountries();
const codes = (list: { code: string }[]) => list.map((c) => c.code);

describe('country catalog', () => {
  it('includes every package entry exactly once (world-countries 5.1.0 has 250)', () => {
    expect(all.length).toBe(worldCountries.length);
    expect(all.length).toBe(250);
    expect(new Set(codes(all)).size).toBe(all.length);
  });

  it('counts exactly 193 UN member states (package reports 194; the Holy See is corrected)', () => {
    expect(worldCountries.filter((c) => c.unMember).length).toBe(194);
    expect(all.filter((c) => c.kind === 'shtet_anetar_okb').length).toBe(193);
  });

  it('marks the Holy See and Palestine as UN observer states', () => {
    const observers = all.filter((c) => c.kind === 'shtet_vezhgues_okb');
    expect(codes(observers).sort()).toEqual(['PSE', 'VAT']);
    for (const c of observers) expect(c.kindNoteSq).toMatch(/vëzhgues/);
  });

  it('maps Kosovo to XKX with Albanian name "Kosova" and the right source codes', () => {
    const k = getCountry('XKX')!;
    expect(k).toMatchObject({ code: 'XKX', iso2: 'XK', nameSq: 'Kosova', kind: 'njohje_e_pjesshme', currencies: ['EUR'] });
    expect(k.sourceCodes).toEqual({ worldbank: 'XKX', imf: 'UVK' });
    expect(k.kindNoteSq).toMatch(/OKB/);
    expect(getCountry('UNK')?.code).toBe('XKX');
    expect(getCountry('xk')?.code).toBe('XKX');
    expect(all.some((c) => c.code === 'UNK')).toBe(false);
  });

  it('treats Taiwan as partially recognised without a World Bank code, and Western Sahara as disputed territory', () => {
    const t = getCountry('TWN')!;
    expect(t.kind).toBe('njohje_e_pjesshme');
    expect(t.sourceCodes.worldbank).toBeNull();
    expect(t.kindNoteSq).toMatch(/Banka Botërore/);
    const e = getCountry('ESH')!;
    expect(e.kind).toBe('territor');
    expect(e.kindNoteSq).toMatch(/kontestuar/);
  });

  it('gives Albania its Albanian name, region, currency and capital', () => {
    expect(getCountry('ALB')).toMatchObject({
      nameSq: 'Shqipëri',
      nameEn: 'Albania',
      regionSq: 'Evropë',
      subregionSq: 'Evropa Juglindore',
      currencies: ['ALL'],
      capital: 'Tirana',
      kind: 'shtet_anetar_okb',
      isDemo: false,
      sourceCodes: { worldbank: 'ALB', imf: 'ALB' },
    });
    expect(getCountry('MKD')?.nameSq).toBe('Maqedonia e Veriut');
  });

  it('translates every region and subregion present in the package', () => {
    for (const c of worldCountries) {
      expect(REGION_LABELS_SQ[c.region], c.region).toBeDefined();
      if (c.subregion) expect(SUBREGION_LABELS_SQ[c.subregion], c.subregion).toBeDefined();
    }
    const englishRegions = new Set(worldCountries.map((c) => c.region));
    for (const c of all) expect(englishRegions.has(c.regionSq), c.code).toBe(false);
    expect(listRegionsSq(all)).toContain('Evropë');
  });

  it('gives every country a non-empty, unique Albanian name and only non-UN entries a territory kind', () => {
    const names = all.map((c) => c.nameSq);
    expect(names.every((n) => n.trim().length > 0)).toBe(true);
    expect(new Set(names).size).toBe(names.length);
    for (const c of all.filter((x) => x.kind === 'territor')) expect(c.kindNoteSq, c.code).toBeTruthy();
  });

  it('excludes demo economies by default and includes them with the flag', () => {
    expect(all.some((c) => c.isDemo)).toBe(false);
    expect(getCountry('ZZA')).toBeUndefined();
    const withDemo = getCountries({ includeDemo: true });
    expect(withDemo.length).toBe(all.length + 3);
    expect(codes(withDemo.filter((c) => c.isDemo)).sort()).toEqual(['ZZA', 'ZZB', 'ZZC']);
    expect(getCountry('ZZB', { includeDemo: true })?.kind).toBe('demo');
  });
});

describe('searchCountries', () => {
  it('normalizes accents and case', () => {
    expect(normalizeSearchText('Shqipëri ÇAD')).toBe('shqiperi cad');
  });

  it('is accent-insensitive for Albanian names', () => {
    expect(codes(searchCountries(all, { query: 'shqiperi' }))[0]).toBe('ALB');
    expect(codes(searchCountries(all, { query: 'SHQIPËRIA' }))).toContain('ALB');
    expect(codes(searchCountries(all, { query: 'kosove' }))).toContain('XKX');
    expect(codes(searchCountries(all, { query: 'kosova' }))[0]).toBe('XKX');
    expect(codes(searchCountries(all, { query: 'cad' }))).toContain('TCD');
  });

  it('matches English names and codes', () => {
    expect(codes(searchCountries(all, { query: 'Germany' }))).toContain('DEU');
    expect(codes(searchCountries(all, { query: 'deu' }))[0]).toBe('DEU');
    expect(codes(searchCountries(all, { query: 'it' }))[0]).toBe('ITA');
  });

  it('filters by region, kind and economy data', () => {
    const europe = searchCountries(all, { regionSq: 'Evropë' });
    expect(europe.length).toBeGreaterThan(40);
    expect(europe.every((c) => c.regionSq === 'Evropë')).toBe(true);
    expect(codes(searchCountries(all, { kind: 'shtet_vezhgues_okb' })).sort()).toEqual(['PSE', 'VAT']);
    expect(searchCountries(all, { kind: ['njohje_e_pjesshme'], query: 'tajvan' }).map((c) => c.code)).toEqual(['TWN']);
    expect(searchCountries(all, { onlyWithEconomyData: true })).toEqual([]);
    expect(codes(searchCountries(all, { onlyWithEconomyData: true, economyCodes: new Set(['ALB', 'XKX']) })).sort()).toEqual([
      'ALB',
      'XKX',
    ]);
    expect(searchCountries(all, { query: 'zzzz-nuk-ekziston' })).toEqual([]);
  });
});

describe('withWbMeta', () => {
  it('attaches World Bank classification without mutating the catalog', () => {
    const meta = { ALB: { regionSq: 'Evropa dhe Azia Qendrore', incomeLevel: 'UMC', lendingType: 'IBD', retrievedAt: '2026-01-01T00:00:00.000Z' } };
    const enriched = withWbMeta(all, meta);
    const alb = enriched.find((c) => c.code === 'ALB')!;
    expect(alb.wb).toEqual(meta.ALB);
    expect(hasEconomyData(alb)).toBe(true);
    expect(getCountry('ALB')?.wb).toBeNull();
    expect(codes(searchCountries(enriched, { onlyWithEconomyData: true }))).toEqual(['ALB']);
  });
});
