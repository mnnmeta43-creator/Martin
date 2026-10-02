import { describe, expect, it } from 'vitest';
import { buildFinancialInputs, type BuildContext } from '@/lib/finance/build';
import { projectScenario } from '@/lib/finance/engine';
import { FINANCE_ARCHETYPE, FIXTURE_FX_RATES, FIXTURE_PRICE_LEVEL_CITATION } from '../../fixtures/financeArchetype';

// Fixture rate: 1 USD = 0.5 EUR (synthetic), dated 2026-10-01.
const CTX: BuildContext = {
  currency: 'EUR',
  fxRates: FIXTURE_FX_RATES,
  ownCapital: 1000,
  assets: [],
  startMonth: 3,
  today: '2026-10-02',
};

function build(overrides: Partial<BuildContext> = {}) {
  const result = buildFinancialInputs(FINANCE_ARCHETYPE, { ...CTX, ...overrides });
  if (!result.ok) throw new Error(result.reasonSq);
  return result;
}

const byId = <T extends { id: string }>(items: T[]) => Object.fromEntries(items.map((i) => [i.id, i]));

describe('buildFinancialInputs — conversion', () => {
  const result = build();
  const { inputs } = result;

  it('converts USD assumptions with the stored rate; amount = midpoint(low, high)', () => {
    const startup = byId(inputs.startupCosts);
    expect(startup['pajisje-baze']).toMatchObject({ low: 50, high: 150, amount: 100 }); // 100–300 USD × 0.5
    expect(startup['inventar-fillestar']).toMatchObject({ low: 25, high: 75, amount: 50 });
    expect(startup['regjistrim']).toMatchObject({ low: 0, high: 50, amount: 25 });
    const monthly = byId(inputs.monthlyFixedCosts);
    expect(monthly['qira']).toMatchObject({ low: 50, high: 100, amount: 75 });
    expect(monthly['software']).toMatchObject({ low: 5, high: 15, amount: 10 });
    expect(inputs.pricePerUnit).toBe(10); // 20 USD × 0.5
    expect(inputs.variableCostPerUnit).toBe(2); // 4 USD × 0.5
    expect(inputs.currency).toBe('EUR');
  });

  it('marks every line as an assumption with full provenance', () => {
    const line = byId(inputs.startupCosts)['pajisje-baze'];
    expect(line.sourceKind).toBe('supozim');
    expect(line.date).toBe('2026-10-02');
    expect(line.sourceNoteSq).toBe(
      'Shënim testi për pajisjet. Supozim i përgjithshëm i bibliotekës (2026-10-02), konvertuar nga USD me kursin 1 USD = 0,5 EUR të datës 1 tetor 2026 (ecb-frankfurter).',
    );
  });

  it('copies the optional flag and keeps lines enabled when no asset avoids them', () => {
    const startup = byId(inputs.startupCosts);
    expect(startup['laptop']).toMatchObject({ optional: true, enabled: true });
    expect(startup['pajisje-baze'].optional).toBeUndefined();
  });

  it('takes pricing timing, seasonality and defaults from the archetype and context', () => {
    expect(inputs).toMatchObject({
      unitLabelSq: 'vizitë shërbimi',
      unitsPerCustomerPerMonth: 2,
      collectionDays: 10,
      supplierPaymentDays: 0,
      startMonth: 3,
      ownCapital: 1000,
      reserveMonths: 3,
      profitTaxPct: 0,
      horizonMonths: 12,
      includeOwnerSalary: false,
      ownerSalaryMonthly: 0,
    });
    expect(inputs.seasonality).toEqual(FINANCE_ARCHETYPE.seasonality);
    expect(inputs.seasonality).not.toBe(FINANCE_ARCHETYPE.seasonality);
  });

  it('creates visible, editable scenario defaults', () => {
    expect(inputs.scenarios.konservator).toEqual({
      startCustomers: 0,
      monthlyNewCustomers: 1,
      monthlyChurnPct: 8,
      priceMultiplier: 0.9,
      variableCostMultiplier: 1.1,
      fixedCostMultiplier: 1.1,
      collectionDaysOverride: 25, // 10 + 15
    });
    expect(inputs.scenarios.baze).toEqual({
      startCustomers: 1,
      monthlyNewCustomers: 2,
      monthlyChurnPct: 5,
      priceMultiplier: 1,
      variableCostMultiplier: 1,
      fixedCostMultiplier: 1,
      collectionDaysOverride: null,
    });
    expect(inputs.scenarios.optimist).toEqual({
      startCustomers: 2,
      monthlyNewCustomers: 4,
      monthlyChurnPct: 3,
      priceMultiplier: 1.05,
      variableCostMultiplier: 0.95,
      fixedCostMultiplier: 1,
      collectionDaysOverride: null,
    });
  });

  it('states the tax and owner-salary assumptions', () => {
    expect(inputs.assumptionsNotesSq).toContain('Tatimi mbi fitimin: Kërkon verifikim lokal (vendosur 0%)');
    expect(inputs.assumptionsNotesSq).toContain('Paga e pronarit nuk përfshihet — rezultati operativ e mbivlerëson atë që ju mbetet.');
    expect(result.appliedPriceLevel).toBeNull();
    expect(result.warningsSq).toEqual([]);
  });

  it('produces inputs the engine accepts without corrections', () => {
    const projection = projectScenario(inputs, 'baze');
    expect(projection.warningsSq.some((w) => w.includes('u zëvendësua me 0') || w.includes('normalizuan'))).toBe(false);
    expect(projection.capital.startupTotal).toBe(100 + 250 + 50 + 25 + 20);
  });
});

describe('buildFinancialInputs — owner salary', () => {
  it('includes the owner salary when an income need is given', () => {
    const { inputs } = build({ ownerIncomeNeedMonthly: 800 });
    expect(inputs.includeOwnerSalary).toBe(true);
    expect(inputs.ownerSalaryMonthly).toBe(800);
    expect(inputs.assumptionsNotesSq.some((n) => n.startsWith('Paga e pronarit nuk përfshihet'))).toBe(false);
  });
});

describe('buildFinancialInputs — price level', () => {
  const priceLevel = { factor: 0.6, citation: FIXTURE_PRICE_LEVEL_CITATION };
  const result = build({ priceLevel });
  const { inputs } = result;

  it('scales only locally priced lines plus price and variable cost', () => {
    const startup = byId(inputs.startupCosts);
    const monthly = byId(inputs.monthlyFixedCosts);
    expect(monthly['qira']).toMatchObject({ low: 30, high: 60, amount: 45 }); // 100–200 × 0.5 × 0.6
    expect(startup['testim-tregu'].amount).toBeCloseTo(12, 10); // (20 + 60)/2 × 0.5 × 0.6
    expect(monthly['software'].amount).toBe(10); // traded good: not scaled
    expect(startup['pajisje-baze'].amount).toBe(100); // not scaled
    expect(inputs.pricePerUnit).toBeCloseTo(6, 10);
    expect(inputs.variableCostPerUnit).toBeCloseTo(1.2, 10);
  });

  it('never applies it silently: notes on each affected line and in the assumptions, with the period', () => {
    const monthly = byId(inputs.monthlyFixedCosts);
    expect(monthly['qira'].sourceNoteSq).toContain('faktorin e nivelit lokal të çmimeve 0,60');
    expect(monthly['qira'].sourceNoteSq).toContain('periudha 2023');
    expect(monthly['software'].sourceNoteSq).not.toContain('nivelit lokal');
    const note = inputs.assumptionsNotesSq.find((n) => n.startsWith('Niveli i çmimeve'));
    expect(note).toContain('periudha 2023');
    expect(note).toContain('supozim');
    expect(result.appliedPriceLevel).toEqual(priceLevel);
  });

  it('clamps extreme factors to [0.25, 1.5] with a warning', () => {
    const low = build({ priceLevel: { factor: 0.1, citation: FIXTURE_PRICE_LEVEL_CITATION } });
    expect(low.appliedPriceLevel?.factor).toBe(0.25);
    expect(low.warningsSq.some((w) => w.includes('u kufizua në 0,25'))).toBe(true);
    const high = build({ priceLevel: { factor: 3, citation: FIXTURE_PRICE_LEVEL_CITATION } });
    expect(high.appliedPriceLevel?.factor).toBe(1.5);
  });

  it('ignores an invalid factor with a warning', () => {
    const invalid = build({ priceLevel: { factor: Number.NaN, citation: FIXTURE_PRICE_LEVEL_CITATION } });
    expect(invalid.appliedPriceLevel).toBeNull();
    expect(invalid.inputs.pricePerUnit).toBe(10);
    expect(invalid.warningsSq[0]).toContain('nuk u aplikua');
  });
});

describe('buildFinancialInputs — assets the user already has', () => {
  it('disables lines avoided by an owned asset and says why', () => {
    const { inputs } = build({ assets: ['kompjuter'] });
    const laptop = byId(inputs.startupCosts)['laptop'];
    expect(laptop.enabled).toBe(false);
    expect(laptop.optional).toBe(true);
    expect(laptop.sourceNoteSq).toContain('Shmanget sepse keni: Kompjuter / laptop.');
    expect(projectScenario(inputs, 'baze').capital.startupTotal).toBe(100 + 50 + 25 + 20);
  });
});

describe('buildFinancialInputs — FX edge cases', () => {
  it('fails honestly when no rate exists for the currency', () => {
    const result = buildFinancialInputs(FINANCE_ARCHETYPE, { ...CTX, currency: 'JPY' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reasonSq).toContain('Nuk ka kurs këmbimi të ruajtur për USD→JPY');
    }
  });

  it('keeps USD amounts unconverted and says so', () => {
    const { inputs } = build({ currency: 'usd', fxRates: [] });
    expect(inputs.currency).toBe('USD');
    expect(inputs.pricePerUnit).toBe(20);
    expect(byId(inputs.startupCosts)['pajisje-baze'].sourceNoteSq).toContain('në USD (pa konvertim)');
  });

  it('passes stale-rate warnings on to the caller and the saved notes', () => {
    const result = build({ today: '2026-10-20' });
    expect(result.warningsSq.some((w) => w.includes('më i vjetër se 7 ditë'))).toBe(true);
    expect(result.inputs.assumptionsNotesSq.some((n) => n.startsWith('Kursi i këmbimit:'))).toBe(true);
  });
});
