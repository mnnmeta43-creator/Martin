import { describe, expect, it } from 'vitest';
import type { FxRate } from '@/lib/domain/types';
import { convert, convertInputs, currencyMinorUnits, roundMoney, SAME_CURRENCY_SOURCE_ID } from '@/lib/finance/currency';
import { line, makeInputs } from './helpers';

// SYNTHETIC — format mirrors the documented API; values are not real
function rate(base: string, quote: string, value: number, rateDate: string, kind: FxRate['kind'] = 'reference_ditore', sourceId = 'ecb-frankfurter'): FxRate {
  return { base, quote, rate: value, rateDate, sourceId, kind, retrievedAt: `${rateDate}T16:00:00.000Z` };
}

const NOW = new Date('2026-10-02T12:00:00.000Z');

// SYNTHETIC — format mirrors the documented API; values are not real
const RATES: FxRate[] = [
  rate('EUR', 'USD', 1.11, '2026-10-01'),
  rate('EUR', 'ALL', 3.33, '2026-10-01'),
  rate('EUR', 'JPY', 4.44, '2026-10-01'),
  rate('USD', 'CHF', 2.22, '2026-10-01', 'reference_ditore', 'other-source'),
];

function ok(result: ReturnType<typeof convert>) {
  if (!result.ok) throw new Error(result.reasonSq);
  return result;
}

describe('convert', () => {
  it('returns the amount unchanged for the same currency', () => {
    const r = ok(convert(123.45, 'eur', 'EUR', [], { now: NOW }));
    expect(r).toMatchObject({ value: 123.45, rate: 1, sourceId: SAME_CURRENCY_SOURCE_ID, warningsSq: [] });
    expect(r.rateDate).toBe('2026-10-02');
  });

  it('uses a direct rate', () => {
    const r = ok(convert(10, 'EUR', 'USD', RATES, { now: NOW }));
    expect(r.value).toBeCloseTo(11.1, 10);
    expect(r.rate).toBe(1.11);
    expect(r).toMatchObject({ rateDate: '2026-10-01', sourceId: 'ecb-frankfurter', kind: 'reference_ditore', warningsSq: [] });
    expect(r.viaCurrency).toBeUndefined();
  });

  it('uses the inverse of a stored rate', () => {
    const r = ok(convert(11.1, 'USD', 'EUR', RATES, { now: NOW }));
    expect(r.value).toBeCloseTo(10, 10);
    expect(r.rate).toBeCloseTo(1 / 1.11, 12);
  });

  it('triangulates via EUR when no direct or inverse rate exists', () => {
    // ALL → JPY = (1 / 3.33) × 4.44
    const r = ok(convert(3.33, 'ALL', 'JPY', RATES, { now: NOW }));
    expect(r.viaCurrency).toBe('EUR');
    expect(r.value).toBeCloseTo(4.44, 10);
    expect(r.warningsSq[0]).toContain('Kurs i llogaritur përmes EUR');
  });

  it('triangulates via USD when EUR cannot bridge the pair', () => {
    // CHF and GBP only have USD legs, so EUR cannot bridge them: CHF→GBP = (1 / 2.22) × 1.11.
    // SYNTHETIC — format mirrors the documented API; values are not real
    const rates = [rate('USD', 'CHF', 2.22, '2026-10-01'), rate('USD', 'GBP', 1.11, '2026-09-30')];
    const r = ok(convert(2.22, 'CHF', 'GBP', rates, { now: NOW }));
    expect(r.viaCurrency).toBe('USD');
    expect(r.value).toBeCloseTo(1.11, 10);
    expect(r.rateDate).toBe('2026-09-30'); // the older leg defines the date
    expect(r.warningsSq[0]).toContain('Kurs i llogaritur përmes USD');
  });

  it('fails honestly when no rate exists', () => {
    expect(convert(1, 'EUR', 'XYZ', RATES)).toEqual({
      ok: false,
      reasonSq: 'Nuk ka kurs këmbimi të ruajtur për EUR→XYZ. Vendosni kursin manualisht ose rifreskoni burimin.',
    });
  });

  it('warns when a daily rate is older than the maximum age, naming its date', () => {
    const r = ok(convert(1, 'EUR', 'USD', [rate('EUR', 'USD', 1.11, '2026-09-01')], { now: NOW }));
    expect(r.warningsSq).toHaveLength(1);
    expect(r.warningsSq[0]).toContain('1 shtator 2026');
    expect(r.warningsSq[0]).toContain('31 ditë më parë');
    // Within a custom maximum age there is no warning.
    expect(ok(convert(1, 'EUR', 'USD', [rate('EUR', 'USD', 1.11, '2026-09-01')], { now: NOW, maxAgeDaysDaily: 40 })).warningsSq).toEqual([]);
  });

  it('does not check staleness without a reference date', () => {
    expect(ok(convert(1, 'EUR', 'USD', [rate('EUR', 'USD', 1.11, '2020-01-01')])).warningsSq).toEqual([]);
  });

  it('labels annual averages and flags them stale only after the annual maximum age', () => {
    const recent = ok(convert(1, 'USD', 'ALL', [rate('USD', 'ALL', 2.22, '2025-12-31', 'mesatare_vjetore', 'worldbank-wdi')], { now: NOW }));
    expect(recent.warningsSq).toEqual(['Kurs mesatar vjetor i periudhës 2025, jo kurs i ditës.']);
    const old = ok(convert(1, 'USD', 'ALL', [rate('USD', 'ALL', 2.22, '2023-12-31', 'mesatare_vjetore', 'worldbank-wdi')], { now: NOW }));
    expect(old.warningsSq).toHaveLength(2);
    expect(old.warningsSq[1]).toContain('më i vjetër se 550 ditë');
  });

  it('labels demo rates', () => {
    const r = ok(convert(1, 'EUR', 'ZZZ', [rate('EUR', 'ZZZ', 12345, '2026-10-01', 'demo', 'demo')], { now: NOW }));
    expect(r.kind).toBe('demo');
    expect(r.warningsSq).toEqual(['Kurs DEMO — jo për vendime.']);
  });

  it('prefers manual > most recent daily > most recent annual > demo', () => {
    const all = [
      rate('EUR', 'USD', 9.99, '2026-10-01', 'demo', 'demo'),
      rate('EUR', 'USD', 3.33, '2025-12-31', 'mesatare_vjetore', 'worldbank-wdi'),
      rate('EUR', 'USD', 2.22, '2026-09-29'),
      rate('EUR', 'USD', 2.23, '2026-10-01'),
      rate('EUR', 'USD', 1.11, '2026-09-15', 'manuale', 'manual'),
    ];
    expect(ok(convert(1, 'EUR', 'USD', all, { now: NOW })).rate).toBe(1.11);
    expect(ok(convert(1, 'EUR', 'USD', all.slice(0, 4), { now: NOW })).rate).toBe(2.23);
    expect(ok(convert(1, 'EUR', 'USD', all.slice(0, 2), { now: NOW })).rate).toBe(3.33);
    expect(ok(convert(1, 'EUR', 'USD', all.slice(0, 1), { now: NOW })).rate).toBe(9.99);
  });

  it('ignores unusable stored rates (0, negative, NaN)', () => {
    const r = convert(1, 'EUR', 'USD', [rate('EUR', 'USD', 0, '2026-10-01'), rate('EUR', 'USD', Number.NaN, '2026-10-01')]);
    expect(r.ok).toBe(false);
  });
});

describe('minor units and rounding', () => {
  it('reads minor units from Intl (JPY 0, EUR 2) with a fallback of 2', () => {
    expect(currencyMinorUnits('JPY')).toBe(0);
    expect(currencyMinorUnits('EUR')).toBe(2);
    expect(currencyMinorUnits('USD')).toBe(2);
    expect(currencyMinorUnits('not-a-code')).toBe(2);
  });

  it('rounds half away from zero without binary artefacts', () => {
    expect(roundMoney(1.005, 'EUR')).toBe(1.01);
    expect(roundMoney(-2.345, 'EUR')).toBe(-2.35);
    expect(roundMoney(123.5, 'JPY')).toBe(124);
    expect(roundMoney(-0.001, 'EUR')).toBe(0);
    expect(roundMoney(Number.NaN, 'EUR')).toBeNaN();
  });
});

describe('convertInputs', () => {
  // SYNTHETIC — format mirrors the documented API; values are not real
  const rates = [rate('USD', 'EUR', 0.5, '2026-10-01')];
  const inputs = makeInputs({
    currency: 'USD',
    startupCosts: [line('pajisje', 'pajisje', 100, { low: 80, high: 120 })],
    monthlyFixedCosts: [line('qira', 'qira', 30, { low: null, high: 40 })],
    includeOwnerSalary: true,
    ownerSalaryMonthly: 60,
    ownCapital: 1000,
  });

  it('converts every money field and annotates every line', () => {
    const r = convertInputs(inputs, 'EUR', rates, { now: NOW });
    if (!r.ok) throw new Error(r.reasonSq);
    const out = r.inputs;
    expect(out.currency).toBe('EUR');
    expect(out.startupCosts[0]).toMatchObject({ amount: 50, low: 40, high: 60 });
    expect(out.monthlyFixedCosts[0]).toMatchObject({ amount: 15, low: null, high: 20 });
    expect(out.ownerSalaryMonthly).toBe(30);
    expect(out.pricePerUnit).toBe(5);
    expect(out.variableCostPerUnit).toBe(2);
    expect(out.ownCapital).toBe(500);
    // Non-money fields are untouched.
    expect(out.unitsPerCustomerPerMonth).toBe(inputs.unitsPerCustomerPerMonth);
    expect(out.scenarios).toEqual(inputs.scenarios);
    for (const l of [...out.startupCosts, ...out.monthlyFixedCosts]) {
      expect(l.sourceNoteSq).toContain('Konvertuar nga USD në EUR me kursin 1 USD = 0,5 EUR të datës 1 tetor 2026 (ecb-frankfurter).');
    }
    expect(r.conversion.rate).toBe(0.5);
    expect(inputs.currency).toBe('USD'); // original untouched
  });

  it('returns a copy without notes for the same currency', () => {
    const r = convertInputs(inputs, 'usd', rates);
    if (!r.ok) throw new Error(r.reasonSq);
    expect(r.inputs).toEqual(inputs);
    expect(r.inputs).not.toBe(inputs);
  });

  it('fails with the Albanian reason when no rate exists', () => {
    const r = convertInputs(inputs, 'JPY', rates);
    expect(r).toEqual({ ok: false, reasonSq: 'Nuk ka kurs këmbimi të ruajtur për USD→JPY. Vendosni kursin manualisht ose rifreskoni burimin.' });
  });
});

describe('roundMoney — values JavaScript prints in exponent form', () => {
  it('returns 0 for float noise and tiny values instead of NaN', () => {
    expect(roundMoney(0.1 + 0.2 - 0.3, 'EUR')).toBe(0);
    expect(roundMoney(1e-7, 'EUR')).toBe(0);
    expect(Object.is(roundMoney(-1e-7, 'EUR'), 0)).toBe(true); // +0, never −0
    expect(roundMoney(-3.5e-15, 'EUR')).toBe(0);
    expect(roundMoney(1e-7, 'JPY')).toBe(0);
    expect(roundMoney(0.004, 'EUR')).toBe(0);
  });

  it('still rounds half a minor unit away from zero at the threshold', () => {
    expect(roundMoney(0.005, 'EUR')).toBe(0.01);
    expect(roundMoney(-0.005, 'EUR')).toBe(-0.01);
    expect(roundMoney(0.5, 'JPY')).toBe(1);
    expect(roundMoney(12345678.905, 'EUR')).toBe(12345678.91);
  });

  it('returns very large values unchanged (no fractional precision left) instead of NaN', () => {
    expect(roundMoney(1e21, 'EUR')).toBe(1e21);
    expect(roundMoney(-1.2e21, 'JPY')).toBe(-1.2e21);
    expect(roundMoney(2 ** 60, 'EUR')).toBe(2 ** 60);
  });
});
