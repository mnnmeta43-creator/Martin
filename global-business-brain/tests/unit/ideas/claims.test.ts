// SYNTHETIC — format mirrors the documented API; values are not real
import { beforeAll, describe, expect, it } from 'vitest';
import type { Claim, CountryDataContext, ProfileFit } from '@/lib/domain/types';
import { buildFinancialInputs } from '@/lib/finance/build';
import { projectScenario } from '@/lib/finance/engine';
import { formatMoney } from '@/lib/finance/format';
import {
  assessMacroLinks,
  buildMacroClaims,
  buildWhyFailClaims,
  buildWhyWorkClaims,
  isTraceableCitation,
  macroClaimStance,
} from '@/lib/ideas/claims';
import { archetypeVariant, IDEAS_ARCHETYPE } from '../../fixtures/ideasArchetype';
import {
  demoContext,
  emptyRealContext,
  projectionOnlyObservations,
  SYNTHETIC_FX_RATES,
  syntheticContext,
  syntheticObservations,
} from '../../fixtures/contexts';

const FIT_OK: ProfileFit = { matchesSq: [], mismatchesSq: [], blockersSq: [], capitalGap: 0, eligible: true };

function expectTraceable(claims: Claim[]): void {
  for (const c of claims.filter((x) => x.label === 'mbeshtetet_nga_te_dhenat')) {
    expect(c.citations.length, c.id).toBeGreaterThan(0);
    for (const cit of c.citations) {
      expect(cit.url, c.id).toBeTruthy();
      expect(cit.period, c.id).toBeTruthy();
      expect(cit.retrievedAt, c.id).toBeTruthy();
      expect(isTraceableCitation(cit)).toBe(true);
    }
  }
}

function byId(claims: Claim[], suffix: string): Claim | undefined {
  return claims.find((c) => c.id.endsWith(suffix));
}

function baseProjection(ownCapital = 5000) {
  const built = buildFinancialInputs(IDEAS_ARCHETYPE, {
    currency: 'EUR',
    fxRates: SYNTHETIC_FX_RATES,
    ownCapital,
    assets: [],
    startMonth: 10,
    today: '2026-10-02',
  });
  if (!built.ok) throw new Error(built.reasonSq);
  return projectScenario(built.inputs, 'baze');
}

let synthetic: CountryDataContext;
let empty: CountryDataContext;
let demo: CountryDataContext;

beforeAll(async () => {
  [synthetic, empty, demo] = await Promise.all([syntheticContext(), emptyRealContext(), demoContext('ZZA')]);
});

describe('buildMacroClaims', () => {
  it('every data-backed claim carries a traceable citation', () => {
    for (const ctx of [synthetic, empty, demo]) expectTraceable(buildMacroClaims(IDEAS_ARCHETYPE, ctx));
  });

  it('states the value, period and source in the fact claim', () => {
    const claims = buildMacroClaims(IDEAS_ARCHETYPE, synthetic);
    const fact = byId(claims, ':internet_users_pct:fakt');
    expect(fact?.kind).toBe('fakt');
    expect(fact?.label).toBe('mbeshtetet_nga_te_dhenat');
    expect(fact?.textSq).toContain('2024');
    expect(fact?.textSq).toContain('66,7%');
    expect(fact?.textSq).toContain(fact?.citations[0].sourceName ?? '∅');
    expect(fact?.citations[0]).toMatchObject({ indicatorCode: 'internet_users_pct', countryCode: 'ALB', period: '2024', value: 66.66, isDemo: false });
  });

  it('level rule with an explicit reference: above → supports, and says the reference is an assumption', () => {
    const claims = buildMacroClaims(IDEAS_ARCHETYPE, synthetic);
    const interp = claims.find((c) => c.id.includes(':internet_users_pct:interpretim'));
    expect(interp && macroClaimStance(interp)).toBe('mbeshtet');
    expect(interp?.kind).toBe('interpretim');
    expect(interp?.label).toBe('hipoteze');
    expect(interp?.textSq).toContain('supozim i shprehur');
  });

  it('level rule without a reference is not assessed', () => {
    const interp = buildMacroClaims(IDEAS_ARCHETYPE, synthetic).find((c) => c.id.includes(':services_va_gdp:interpretim'));
    expect(interp && macroClaimStance(interp)).toBe('pa_vleresim');
    expect(interp?.textSq).toContain('nivel referimi');
  });

  it('"lower supports" with a value above the reference contradicts', () => {
    const interp = buildMacroClaims(IDEAS_ARCHETYPE, synthetic).find((c) => c.id.includes(':lending_rate:interpretim'));
    expect(interp && macroClaimStance(interp)).toBe('kundershton');
  });

  it('direction rules use the comparable change: a rise supports "rritja" and contradicts "renia"', () => {
    const rise = buildMacroClaims(IDEAS_ARCHETYPE, synthetic).find((c) => c.id.includes(':tourism_arrivals:interpretim'));
    expect(rise && macroClaimStance(rise)).toBe('mbeshtet');
    const falling = archetypeVariant('ide-renia', {
      macroLinks: IDEAS_ARCHETYPE.macroLinks.map((l) => (l.indicatorCode === 'tourism_arrivals' ? { ...l, direction: 'renia_mbeshtet' as const } : l)),
    });
    const fall = buildMacroClaims(falling, synthetic).find((c) => c.id.includes(':tourism_arrivals:interpretim'));
    expect(fall && macroClaimStance(fall)).toBe('kundershton');
  });

  it('a single observation gives no direction verdict', () => {
    const ctxPromise = syntheticContext({ observations: syntheticObservations().filter((o) => !(o.indicatorCode === 'tourism_arrivals' && o.period === '2023')) });
    return ctxPromise.then((ctx) => {
      const interp = buildMacroClaims(IDEAS_ARCHETYPE, ctx).find((c) => c.id.includes(':tourism_arrivals:interpretim'));
      expect(interp && macroClaimStance(interp)).toBe('pa_vleresim');
    });
  });

  it('a missing indicator becomes an explicit assumption without any value', () => {
    const missing = byId(buildMacroClaims(IDEAS_ARCHETYPE, synthetic), ':new_business_density:mungon');
    expect(missing?.kind).toBe('supozim');
    expect(missing?.label).toBe('hipoteze');
    expect(missing?.citations).toEqual([]);
    expect(missing?.textSq).toContain('Mungon treguesi');
    expect(missing?.textSq).toContain('nuk mund ta vlerësojmë; mblidhni prova lokale');
    expect(missing?.textSq).not.toMatch(/(^|\s)0([,.]0+)?(\s|%|$)/);
  });

  it('with no data at all every link is "mungon" and nothing is data-backed', () => {
    const claims = buildMacroClaims(IDEAS_ARCHETYPE, empty);
    expect(claims).toHaveLength(IDEAS_ARCHETYPE.macroLinks.length);
    expect(claims.every((c) => c.id.endsWith(':mungon') && c.citations.length === 0)).toBe(true);
    expect(claims.some((c) => c.label === 'mbeshtetet_nga_te_dhenat')).toBe(false);
  });

  it('a projection-only series yields a "parashikim" claim, never a fact', async () => {
    const ctx = await syntheticContext({ observations: projectionOnlyObservations() });
    const a = archetypeVariant('ide-parashikim', {
      macroLinks: [{ ...IDEAS_ARCHETYPE.macroLinks[0], indicatorCode: 'imf_gdp_growth', direction: 'rritja_mbeshtet' }],
    });
    const [only] = buildMacroClaims(a, ctx);
    expect(only.kind).toBe('parashikim');
    expect(only.label).toBe('hipoteze');
    expect(only.citations[0].isProjection).toBe(true);
    expect(assessMacroLinks(a, ctx)[0].stance).toBe('parashikim');
  });

  it('demo data is flagged in text and citations', () => {
    const claims = buildMacroClaims(IDEAS_ARCHETYPE, demo);
    expect(claims.every((c) => c.textSq.startsWith('[DEMO] '))).toBe(true);
    const cited = claims.flatMap((c) => c.citations);
    expect(cited.length).toBeGreaterThan(0);
    expect(cited.every((c) => c.isDemo === true)).toBe(true);
  });

  it('ids are unique and stable', () => {
    const a = buildMacroClaims(IDEAS_ARCHETYPE, synthetic).map((c) => c.id);
    expect(new Set(a).size).toBe(a.length);
    expect(buildMacroClaims(IDEAS_ARCHETYPE, synthetic).map((c) => c.id)).toEqual(a);
  });
});

describe('buildWhyWorkClaims', () => {
  it('builds the 6-step chain with the required labels', () => {
    const macro = buildMacroClaims(IDEAS_ARCHETYPE, synthetic);
    const chain = buildWhyWorkClaims(IDEAS_ARCHETYPE, synthetic, macro, baseProjection(), 'EUR');
    expect(chain.map((c) => c.id.split(':').pop())).toEqual(['ndryshimi', 'problemi', 'klienti', 'oferta', 'arsyeja', 'fitimi']);
    // A matching macro indicator is context, not proof of the narrative: always a hypothesis.
    expect(chain[0].label).toBe('hipoteze');
    expect(chain[2].label).toBe('duhet_testuar');
    expect(chain[4].label).toBe('duhet_testuar');
    expect(chain[5].kind).toBe('supozim');
    expectTraceable(chain);
  });

  it('copies only the citations of supporting macro claims into "change"', () => {
    const macro = buildMacroClaims(IDEAS_ARCHETYPE, synthetic);
    const [change] = buildWhyWorkClaims(IDEAS_ARCHETYPE, synthetic, macro, null);
    const codes = change.citations.map((c) => c.indicatorCode).sort();
    expect(codes).toEqual(['internet_users_pct', 'tourism_arrivals']);
    expect(change.textSq).toContain('kundërshtojnë');
  });

  it('"change" stays a hypothesis without supporting data', () => {
    const [change] = buildWhyWorkClaims(IDEAS_ARCHETYPE, empty, buildMacroClaims(IDEAS_ARCHETYPE, empty), null);
    expect(change.label).toBe('hipoteze');
    expect(change.citations).toEqual([]);
  });

  it('profit conditions quote break-even and capital from the base projection as assumptions', () => {
    const projection = baseProjection();
    const chain = buildWhyWorkClaims(IDEAS_ARCHETYPE, synthetic, [], projection, 'EUR');
    const profit = chain[5].textSq;
    expect(profit).toContain(formatMoney(projection.capital.totalRequired, 'EUR'));
    expect(profit).toContain('pika e barazimit');
    expect(profit).toContain('jo premtime');
  });

  it('says honestly when the numbers could not be computed', () => {
    const chain = buildWhyWorkClaims(IDEAS_ARCHETYPE, empty, [], null);
    expect(chain[5].textSq).toContain('nuk u llogaritën');
  });
});

describe('buildWhyFailClaims', () => {
  it('includes every failure mode and every falsifier', () => {
    const claims = buildWhyFailClaims(IDEAS_ARCHETYPE, synthetic, baseProjection(), FIT_OK, 'EUR');
    for (const f of IDEAS_ARCHETYPE.failureModes) expect(claims.some((c) => c.textSq.includes(f.textSq))).toBe(true);
    const falsifiers = claims.filter((c) => c.textSq.startsWith('Ideja rrëzohet nëse: '));
    expect(falsifiers).toHaveLength(IDEAS_ARCHETYPE.falsifiersSq.length);
    expect(falsifiers.every((c) => c.label === 'duhet_testuar')).toBe(true);
    expect(claims.filter((c) => c.id.includes(':menyra-')).every((c) => c.label === 'hipoteze' || c.label === 'duhet_testuar')).toBe(true);
    expectTraceable(claims);
  });

  it('adds cited data risks for high inflation and expensive credit', () => {
    const claims = buildWhyFailClaims(IDEAS_ARCHETYPE, synthetic, null, FIT_OK);
    const inflation = byId(claims, ':te-dhena:inflacioni');
    const credit = byId(claims, ':te-dhena:kredia');
    expect(inflation?.citations[0].indicatorCode).toBe('inflation_cpi');
    expect(credit?.citations[0].indicatorCode).toBe('lending_rate');
    expect(byId(claims, ':te-dhena:tkurrja')).toBeUndefined();
  });

  it('flags an evidence risk when the linked data is missing', () => {
    const claims = buildWhyFailClaims(IDEAS_ARCHETYPE, empty, null, FIT_OK);
    const risk = byId(claims, ':te-dhena:prova');
    expect(risk?.label).toBe('hipoteze');
    expect(byId(claims, ':te-dhena:inflacioni')).toBeUndefined();
  });

  it('turns engine warnings into claims (negative contribution, cash shortfall, no payback, capital gap)', () => {
    const losing = archetypeVariant('ide-humbje', { pricing: { ...IDEAS_ARCHETYPE.pricing, priceUSD: { low: 1, base: 2, high: 3 } } });
    const built = buildFinancialInputs(losing, { currency: 'EUR', fxRates: SYNTHETIC_FX_RATES, ownCapital: 0, assets: [], startMonth: 10, today: '2026-10-02' });
    if (!built.ok) throw new Error(built.reasonSq);
    const claims = buildWhyFailClaims(losing, synthetic, projectScenario(built.inputs, 'baze'), FIT_OK, 'EUR');
    expect(byId(claims, ':modeli:kontributi')).toBeDefined();
    expect(byId(claims, ':modeli:paraja')?.textSq).toContain('nën zero para muajit të parë');
    expect(byId(claims, ':modeli:rikuperimi')).toBeDefined();
    expect(byId(claims, ':modeli:mungesa-kapitali')).toBeDefined();
  });

  it('includes profile blockers and mismatches', () => {
    const fit: ProfileFit = { matchesSq: [], mismatchesSq: ['Mospërputhje testi'], blockersSq: ['Pengesë testi'], capitalGap: null, eligible: false };
    const claims = buildWhyFailClaims(IDEAS_ARCHETYPE, synthetic, null, fit);
    expect(claims.some((c) => c.textSq === 'Pengesë nga profili: Pengesë testi')).toBe(true);
    expect(claims.some((c) => c.textSq === 'Mospërputhje me profilin: Mospërputhje testi')).toBe(true);
  });

  it('claim ids are unique across the three lists', () => {
    const macro = buildMacroClaims(IDEAS_ARCHETYPE, synthetic);
    const all = [...macro, ...buildWhyWorkClaims(IDEAS_ARCHETYPE, synthetic, macro, baseProjection(), 'EUR'), ...buildWhyFailClaims(IDEAS_ARCHETYPE, synthetic, baseProjection(), FIT_OK, 'EUR')];
    expect(new Set(all.map((c) => c.id)).size).toBe(all.length);
  });

});
