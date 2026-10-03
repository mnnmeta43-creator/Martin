// SYNTHETIC — format mirrors the documented API; values are not real
import { beforeAll, describe, expect, it } from 'vitest';
import type { CountryDataContext } from '@/lib/domain/types';
import {
  compareCountriesForIdea,
  OPERABILITY_DECLARED_SQ,
  OPERABILITY_VERIFY_SQ,
} from '@/lib/ideas/compareForIdea';
import { macroClaimStance } from '@/lib/ideas/claims';
import { evaluateIdea } from '@/lib/ideas/engine';
import { IDEAS_ARCHETYPE, testProfile } from '../../fixtures/ideasArchetype';
import { demoContext, emptyRealContext, NOW, syntheticContext } from '../../fixtures/contexts';

let zza: CountryDataContext;
let zzb: CountryDataContext;
let zzc: CountryDataContext;
let empty: CountryDataContext;
let synthetic: CountryDataContext;

beforeAll(async () => {
  [zza, zzb, zzc, empty, synthetic] = await Promise.all([
    demoContext('ZZA'),
    demoContext('ZZB'),
    demoContext('ZZC'),
    emptyRealContext('ALB'),
    syntheticContext({ code: 'MKD' }),
  ]);
});

describe('compareCountriesForIdea', () => {
  it('returns one row per country with the same score and macro verdicts as the idea page', () => {
    const profile = testProfile({ operableCountries: ['ZZA'] });
    const r = compareCountriesForIdea(IDEAS_ARCHETYPE, profile, [zza, zzb, zzc], { now: NOW });
    expect(r.rows.map((x) => x.countryCode)).toEqual(['ZZA', 'ZZB', 'ZZC']);
    for (const [row, ctx] of r.rows.map((x, i) => [x, [zza, zzb, zzc][i]] as const)) {
      const rec = evaluateIdea(IDEAS_ARCHETYPE, profile, ctx, { now: NOW });
      expect(row.score).toEqual(rec.score);
      expect(row.capitalRange).toEqual(rec.capitalRange);
      expect(row.supportedMacroClaims).toBe(rec.claims.macro.filter((c) => macroClaimStance(c) === 'mbeshtet').length);
      expect(row.contradictedMacroClaims).toBe(rec.claims.macro.filter((c) => macroClaimStance(c) === 'kundershton').length);
      expect(row.isDemo).toBe(true);
      expect(row.coverage).toBe(ctx.coverage.level);
    }
    expect(r.noteSq).toContain('nuk është probabilitet fitimi');
  });

  it('marks only self-declared countries as operable; all others need verification', () => {
    const r = compareCountriesForIdea(IDEAS_ARCHETYPE, testProfile({ operableCountries: ['ZZA'] }), [zza, zzb], { now: NOW });
    expect(r.rows[0].operabilitySq).toBe(OPERABILITY_DECLARED_SQ);
    expect(r.rows[1].operabilitySq).toBe(OPERABILITY_VERIFY_SQ);
  });

  it('purchasing power and price level carry value, period and citation', () => {
    const r = compareCountriesForIdea(IDEAS_ARCHETYPE, testProfile(), [zza, zzb], { now: NOW });
    for (const row of r.rows) {
      expect(row.purchasingPower.value).not.toBeNull();
      expect(row.purchasingPower.period).toBeTruthy();
      expect(row.purchasingPower.citation?.indicatorCode).toBe('gdp_per_capita_ppp');
      expect(row.purchasingPower.citation?.isDemo).toBe(true);
      expect(row.priceLevel.citation?.indicatorCode).toBe('price_level_ratio');
    }
  });

  it('a country without data shows "mungon" (null) and no capital for a non-USD profile', () => {
    const r = compareCountriesForIdea(IDEAS_ARCHETYPE, testProfile(), [zza, empty], { now: NOW });
    const alb = r.rows[1];
    expect(alb.purchasingPower).toEqual({ value: null, period: null, citation: null });
    expect(alb.priceLevel.value).toBeNull();
    expect(alb.capitalRange).toBeNull();
    expect(alb.supportedMacroClaims).toBe(0);
    expect(alb.isDemo).toBe(false);
    expect(alb.warningsSq.some((w) => w.includes('PPP'))).toBe(true);
    expect(r.warningsSq.some((w) => w.includes('DEMO') && w.includes('reale'))).toBe(true);
    expect(r.warningsSq.some((w) => w.includes('nuk krahasohen me zero'))).toBe(true);
  });

  it('warns when the periods of a compared indicator differ', () => {
    // The synthetic PPP value is for 2023; the demo series ends in 2024.
    const r = compareCountriesForIdea(IDEAS_ARCHETYPE, testProfile(), [zza, synthetic], { now: NOW });
    expect(r.warningsSq.some((w) => w.startsWith('Fuqia blerëse (PPP): periudhat ndryshojnë'))).toBe(true);
  });

  it('deduplicates repeated countries and enforces the 2–5 range with warnings', () => {
    const dup = compareCountriesForIdea(IDEAS_ARCHETYPE, testProfile(), [zza, zza, zzb], { now: NOW });
    expect(dup.rows).toHaveLength(2);
    expect(dup.warningsSq.some((w) => w.includes('më shumë se një herë'))).toBe(true);
    const one = compareCountriesForIdea(IDEAS_ARCHETYPE, testProfile(), [zza], { now: NOW });
    expect(one.warningsSq.some((w) => w.includes('të paktën 2'))).toBe(true);
    const many = compareCountriesForIdea(IDEAS_ARCHETYPE, testProfile(), [zza, zzb, zzc, empty, synthetic, zza], { now: NOW });
    expect(many.rows).toHaveLength(5);
  });

  it('team-blocked ideas show the blocker in the row warnings', () => {
    const team = { ...IDEAS_ARCHETYPE, id: 'ide-ekip', minTeam: 'ekip' as const };
    const r = compareCountriesForIdea(team, testProfile(), [zza, zzb], { now: NOW });
    expect(r.rows.every((row) => row.warningsSq.some((w) => w.startsWith('Pengesë nga profili')))).toBe(true);
  });
});
