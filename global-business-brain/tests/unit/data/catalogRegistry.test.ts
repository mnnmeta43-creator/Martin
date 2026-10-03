// Source registry and official links: completeness, honesty of statuses, URL hygiene.
import { describe, expect, it } from 'vitest';
import {
  EU_MEMBER_CODES,
  OFFICIAL_LINKS,
  OFFICIAL_LINKS_SOURCE_ID,
  SOURCES,
  getOfficialLinks,
  getSource,
  isExternalUrl,
} from '@/lib/data/sources/registry';

const EU_URLS = [
  'https://europa.eu/youreurope/business/index_en.htm',
  'https://ec.europa.eu/eurostat',
  'https://www.ecb.europa.eu',
];

describe('SOURCES', () => {
  it('has unique ids and every entry has homepage, status, coverage and cadence', () => {
    const ids = SOURCES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of SOURCES) {
      expect(s.homepageUrl, s.id).toBeTruthy();
      expect(s.status, s.id).toBeTruthy();
      expect(s.coverageSq.trim(), s.id).not.toBe('');
      expect(s.cadenceSq.trim(), s.id).not.toBe('');
      expect(s.nameSq.trim(), s.id).not.toBe('');
    }
  });

  it('contains every required source', () => {
    for (const id of [
      'worldbank-wdi',
      'worldbank-countries',
      'imf-datamapper',
      'ecb-frankfurter',
      'oecd-sdmx',
      'ilostat',
      'un-comtrade',
      'undata',
      'world-countries-pkg',
      'i18n-iso-countries-pkg',
      'manual',
      'demo',
    ]) {
      expect(getSource(id), id).toBeDefined();
    }
    expect(getSource('nuk-ekziston')).toBeUndefined();
  });

  it('does not duplicate homepage or API base URLs', () => {
    const homepages = SOURCES.map((s) => s.homepageUrl);
    expect(new Set(homepages).size).toBe(homepages.length);
    const apis = SOURCES.flatMap((s) => (s.apiBaseUrl ? [s.apiBaseUrl] : []));
    expect(new Set(apis).size).toBe(apis.length);
  });

  it('uses https for every real URL and pseudo-URLs only for internal sources', () => {
    for (const s of SOURCES) {
      for (const url of [s.homepageUrl, s.apiBaseUrl, s.docsUrl, s.termsUrl].filter(Boolean) as string[]) {
        if (!isExternalUrl(url)) expect(['manual', 'demo', OFFICIAL_LINKS_SOURCE_ID], `${s.id} ${url}`).toContain(s.id);
      }
    }
  });

  it('is honest about integration status: nothing claims a verified live connection', () => {
    expect(SOURCES.filter((s) => s.access === 'api_publike_falas' && s.status === 'integruar')).toEqual([]);
    expect(getSource('worldbank-wdi')?.status).toBe('integruar_pa_verifikim_live');
    expect(getSource('imf-datamapper')?.status).toBe('integruar_pa_verifikim_live');
    expect(getSource('ecb-frankfurter')?.status).toBe('integruar_pa_verifikim_live');
    expect(getSource('oecd-sdmx')?.status).toBe('vleresuar_jo_integruar');
    expect(getSource('un-comtrade')?.status).toBe('kerkon_celes');
    expect(getSource('demo')).toMatchObject({ status: 'demo', access: 'demo' });
    expect(getSource('manual')?.status).toBe('integruar');
  });

  it('documents projections for IMF and the missing ALL/MKD/RSD coverage for ECB rates', () => {
    expect(getSource('imf-datamapper')?.notesSq.join(' ')).toMatch(/parashikim/);
    const ecb = getSource('ecb-frankfurter')!;
    expect(ecb.coverageSq).toMatch(/ALL/);
    expect(ecb.coverageSq).toMatch(/MKD/);
    expect(ecb.coverageSq).toMatch(/RSD/);
    expect(ecb.coverageSq).toMatch(/PA\.NUS\.FCRF/);
    expect(ecb.refreshEveryHours).toBe(24);
    expect(ecb.requiresEnv ?? []).toEqual([]);
  });
});

describe('OFFICIAL_LINKS', () => {
  it('uses only https URLs, without duplicates, each with the verification note', () => {
    const urls = OFFICIAL_LINKS.map((l) => l.url);
    expect(new Set(urls).size).toBe(urls.length);
    for (const l of OFFICIAL_LINKS) {
      expect(l.url.startsWith('https://'), l.url).toBe(true);
      expect(l.noteSq).toMatch(/Kërkon verifikim lokal/);
      expect(l.lastCheckedAt).toBeNull();
      expect(l.nameSq.trim()).not.toBe('');
    }
  });

  it('does not list global data portals (those belong in SOURCES)', () => {
    const portals = /(worldbank|imf\.org|oecd|ilo\.org|comtrade|data\.un\.org)/;
    for (const l of OFFICIAL_LINKS) expect(l.url).not.toMatch(portals);
  });

  it('getOfficialLinks returns citations for Albania without EU links', () => {
    const links = getOfficialLinks('ALB');
    expect(links.map((l) => l.url)).toContain('https://qkb.gov.al');
    expect(links.map((l) => l.url)).not.toContain(EU_URLS[0]);
    for (const c of links) {
      expect(c.sourceId).toBe(OFFICIAL_LINKS_SOURCE_ID);
      expect(c.noteSq).toMatch(/Kërkon verifikim lokal/);
    }
    expect(getSource(OFFICIAL_LINKS_SOURCE_ID)?.status).toBe('lidhje_zyrtare');
  });

  it('getOfficialLinks adds EU-wide links for EU members such as Italy', () => {
    const urls = getOfficialLinks('ITA').map((l) => l.url);
    expect(urls).toContain('https://www.istat.it');
    for (const u of EU_URLS) expect(urls).toContain(u);
    expect(getOfficialLinks('ita').length).toBe(urls.length);
  });

  it('returns only EU links for an EU member without curated national links, and none for unknown codes', () => {
    expect(EU_MEMBER_CODES.size).toBe(27);
    expect(getOfficialLinks('ESP').map((l) => l.url).sort()).toEqual([...EU_URLS].sort());
    expect(getOfficialLinks('ZZZ')).toEqual([]);
  });

  it('covers Kosovo with its own registry and keeps non-EU countries free of EU links', () => {
    expect(getOfficialLinks('XKX').map((l) => l.url)).toContain('https://arbk.rks-gov.net');
    expect(getOfficialLinks('CHE').map((l) => l.url)).not.toContain(EU_URLS[1]);
  });
});
