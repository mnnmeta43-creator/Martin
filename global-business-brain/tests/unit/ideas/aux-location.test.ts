import { describe, expect, it } from 'vitest';
import { getOfficialLinks, OFFICIAL_LINKS } from '@/lib/data/sources/registry';
import { ARCHETYPES } from '@/lib/ideas/archetypes';
import { buildLocationAnalysis } from '@/lib/ideas/location';
import { makeProfile, PLAN_ARCHETYPE, PLAN_PROFILE, physicalRegulatedArchetype, remoteInternationalArchetype } from '../../fixtures/planFixtures';

const REGISTRY_URLS = new Set(OFFICIAL_LINKS.map((l) => l.url));

describe('buildLocationAnalysis', () => {
  const analysis = buildLocationAnalysis(PLAN_ARCHETYPE, PLAN_PROFILE, 'ALB', 'Qyteti Test');

  it('explains registration vs operation vs customers', () => {
    const r = analysis.registrationVsOperationSq;
    for (const text of [r.registrationSq, r.operationSq, r.customersSq]) expect(text.length).toBeGreaterThan(40);
    expect(r.customersSq).toContain('Qyteti Test');
    expect(r.operationSq).toContain('vetëdeklarim'); // ALB is in operableCountries
  });

  it('lists the required verification points, each phrased as something to verify', () => {
    const all = analysis.toVerifySq.join('\n');
    for (const needle of ['qëndruar dhe për të punuar', 'jo-rezidentët', 'Rezidenca juaj tatimore', 'pagesave', 'licencë', 'Sigurimet', 'të dhënave personale', 'TVSH']) {
      expect(all).toContain(needle);
    }
    for (const item of analysis.toVerifySq) expect(item).toMatch(/verifik/i);
    expect(new Set(analysis.toVerifySq).size).toBe(analysis.toVerifySq.length);
    expect(all).toContain('Mos supozoni se mund të regjistroheni, punoni ose zhvendoseni kudo');
  });

  it('never recommends relocating or registering abroad because of a tax figure', () => {
    const all = JSON.stringify(analysis);
    expect(analysis.noteSq).toContain('Mos vendosni të zhvendoseni');
    expect(all).not.toMatch(/(rekomandojmë|ju këshillojmë) (të )?(zhvendos|regjistro)/i);
  });

  it('has a 6–8 step field-research plan with how/output/cost for each step', () => {
    expect(analysis.fieldResearchPlan.length).toBeGreaterThanOrEqual(6);
    expect(analysis.fieldResearchPlan.length).toBeLessThanOrEqual(8);
    for (const step of analysis.fieldResearchPlan) {
      for (const text of [step.stepSq, step.howSq, step.outputSq, step.costSq]) expect(text.trim().length).toBeGreaterThan(3);
    }
    const all = analysis.fieldResearchPlan.map((s) => `${s.stepSq} ${s.howSq}`).join('\n');
    expect(all).toContain('hartat online');
    expect(all).toContain('të paktën 10 alternativa');
    expect(all).toContain('zyrën e licencimit');
    expect(all).toContain('të paktën 10 persona');
    expect(all).toContain('oferta me shkrim');
    expect(new Set(analysis.fieldResearchPlan.map((s) => s.stepSq)).size).toBe(analysis.fieldResearchPlan.length);
  });

  it('adds foot-traffic counts and rent quotes for a physical idea with premises', () => {
    const a = physicalRegulatedArchetype();
    const physical = buildLocationAnalysis(a, PLAN_PROFILE, 'ALB', null);
    const steps = physical.fieldResearchPlan.map((s) => `${s.stepSq} ${s.howSq}`).join('\n');
    expect(steps).toContain('3 orare');
    expect(steps).toContain('2 ditë');
    expect(steps).toContain('3 oferta reale qiraje');
    expect(physical.fieldResearchPlan.length).toBeLessThanOrEqual(8);
    const verify = physical.toVerifySq.join('\n');
    expect(verify).toContain(a.licensedProfessionalsSq[0]);
    expect(verify).toContain('Zonimi');
    expect(verify).toContain('importit/eksportit'); // goods sector
  });

  it('for a remote international idea, registration follows residence and customers abroad raise VAT questions', () => {
    const a = remoteInternationalArchetype();
    const profile = makeProfile({ targetCountries: ['ALB', 'ITA'] });
    const remote = buildLocationAnalysis(a, profile, 'ALB', null);
    expect(remote.registrationVsOperationSq.registrationSq).toContain('rezidencën tatimore');
    expect(remote.registrationVsOperationSq.registrationSq).toContain('Mos e zgjidhni vendin e regjistrimit vetëm sepse një tregues tatimor');
    expect(remote.registrationVsOperationSq.customersSq).toContain('TVSH');
    expect(remote.fieldResearchPlan.some((s) => s.stepSq.includes('kalimtarët'))).toBe(false);
    expect(remote.fieldResearchPlan.length).toBeGreaterThanOrEqual(6);
  });

  it('warns when the operating country is not declared as operable', () => {
    const elsewhere = buildLocationAnalysis(PLAN_ARCHETYPE, PLAN_PROFILE, 'DEU', null);
    expect(elsewhere.registrationVsOperationSq.operationSq).toContain('Nuk e keni deklaruar');
  });

  it('uses only official links from the registry', () => {
    expect(analysis.officialLinks).toEqual(getOfficialLinks('ALB'));
    expect(analysis.officialLinks.length).toBeGreaterThan(0);
    for (const link of analysis.officialLinks) expect(REGISTRY_URLS.has(link.url)).toBe(true);
    const eu = buildLocationAnalysis(PLAN_ARCHETYPE, PLAN_PROFILE, 'DEU', null);
    for (const link of eu.officialLinks) expect(REGISTRY_URLS.has(link.url)).toBe(true);
  });

  it('has no links and a demo note for a fictional economy; no links for an uncurated country', () => {
    const demo = buildLocationAnalysis(PLAN_ARCHETYPE, PLAN_PROFILE, 'ZZA', null);
    expect(demo.officialLinks).toEqual([]);
    expect(demo.noteSq).toContain('DEMO');
    const uncurated = buildLocationAnalysis(PLAN_ARCHETYPE, PLAN_PROFILE, 'NZL', null);
    expect(uncurated.officialLinks).toEqual([]);
  });

  it('says there is no verified city or neighbourhood data', () => {
    expect(analysis.noteSq).toContain('Nuk kemi të dhëna të verifikuara për qytete ose lagje');
    expect(analysis.noteSq).toContain('plan kërkimi në terren');
  });

  it('works for every archetype without broken text', () => {
    for (const a of ARCHETYPES) {
      const res = buildLocationAnalysis(a, PLAN_PROFILE, 'XKX', null);
      expect(JSON.stringify(res)).not.toMatch(/undefined|NaN/);
      expect(res.fieldResearchPlan.length).toBeGreaterThanOrEqual(6);
      expect(res.fieldResearchPlan.length).toBeLessThanOrEqual(8);
    }
  });
});
