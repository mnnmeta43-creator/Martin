import { describe, expect, it } from 'vitest';
import { projectScenario } from '@/lib/finance/engine';
import { line, makeGrowthInputs, makeInputs } from './helpers';

describe('capital requirement', () => {
  // Growth example: cumulative net cash −50, −88, −114, −128, −130 (min), −120, … , 192.
  // startup 200; reserve 2 months × 50 = 100 → total = 200 + 130 + 100 = 430; own 300 → gap 130.
  const r = projectScenario(makeGrowthInputs(), 'baze');

  it('adds startup, max operating deficit and reserve without double counting', () => {
    expect(r.capital.startupTotal).toBe(200);
    expect(r.capital.maxOperatingDeficit).toBeCloseTo(130, 10);
    expect(r.capital.reserve).toBe(100);
    expect(r.capital.totalRequired).toBeCloseTo(430, 10);
    expect(r.capital.ownCapital).toBe(300);
    expect(r.capital.gap).toBeCloseTo(130, 10);
  });

  it('explains the requirement in Albanian, incl. no double counting and no financing', () => {
    const text = r.capital.explanationSq.join('\n');
    expect(text).toContain('Kapitali i nevojshëm =');
    expect(text).toContain('Asgjë nuk numërohet dy herë');
    expect(text).toContain('Nuk supozohet asnjë kredi, grant apo financim tjetër');
    expect(text).toContain('Mungojnë');
  });

  it('has every startup category key, even when empty', () => {
    expect(Object.keys(r.capital.byCategory).sort()).toEqual(['depozita', 'hapje', 'inventar', 'pajisje', 'tarifa', 'testim_tregu']);
  });

  it('includes the owner salary in the reserve base when it is included', () => {
    // reserve = 2 × (50 fixed + 40 salary) = 180
    const withSalary = projectScenario(makeGrowthInputs({ includeOwnerSalary: true, ownerSalaryMonthly: 40 }), 'baze');
    expect(withSalary.capital.reserve).toBe(180);
  });

  it('has zero deficit and zero gap when operations are cash-positive from month 1', () => {
    // Base example: +30 every month; total = 100 startup + 0 + 30 reserve = 130 ≤ 200
    const ok = projectScenario(makeInputs(), 'baze');
    expect(ok.capital.maxOperatingDeficit).toBe(0);
    expect(ok.capital.totalRequired).toBe(130);
    expect(ok.capital.gap).toBe(0);
    expect(ok.capital.explanationSq.join(' ')).toContain('e mbulon kapitalin e nevojshëm');
  });

  it('ignores disabled startup lines', () => {
    const inputs = makeInputs({ startupCosts: [line('a', 'pajisje', 100), line('b', 'depozita', 900, { enabled: false })] });
    expect(projectScenario(inputs, 'baze').capital.startupTotal).toBe(100);
  });
});

describe('payback', () => {
  it('is not reached within 12 months in the growth example (cumulative 192 < 200)', () => {
    const r = projectScenario(makeGrowthInputs(), 'baze');
    expect(r.payback.recoveredInMonth).toBeNull();
    expect(r.payback.statementSq).toBe('Me këto supozime, investimi fillestar nuk rikuperohet brenda horizontit prej 12 muajsh.');
  });

  it('is reached in month 13 with a 24-month horizon (6·13·12 − 50·13 = 286 ≥ 200)', () => {
    const r = projectScenario(makeGrowthInputs({ horizonMonths: 24 }), 'baze');
    expect(r.payback.recoveredInMonth).toBe(13);
    expect(r.payback.statementSq).toContain('muajin 13');
    expect(r.payback.statementSq).toContain('NUK është datë e garantuar');
  });

  it('has nothing to recover without startup costs', () => {
    const r = projectScenario(makeInputs({ startupCosts: [] }), 'baze');
    expect(r.payback).toEqual({ recoveredInMonth: null, statementSq: 'Nuk ka investim fillestar për t’u rikuperuar.' });
  });
});
