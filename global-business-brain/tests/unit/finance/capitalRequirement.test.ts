import { describe, expect, it } from 'vitest';
import { projectScenario } from '@/lib/finance/engine';
import { line, makeGrowthInputs, makeInputs, plain } from './helpers';

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

  it('has nothing to recover without startup costs and without an operating deficit', () => {
    const r = projectScenario(makeInputs({ startupCosts: [] }), 'baze');
    expect(r.payback).toEqual({
      recoveredInMonth: null,
      statementSq: 'Nuk ka investim fillestar dhe operimi nuk krijon deficit parash, prandaj nuk ka asgjë për t’u rikuperuar.',
    });
  });
});

describe('capital requirement — deficit cut off by the horizon (lower bound)', () => {
  // 0 customers, +1 per month, contribution 6, fixed 100 → net cash_m = 6(m − 1) − 100.
  // Cumulative at month 12 = 6·66 − 1200 = −804, but the true low point is month 17: 6·136 − 1700 = −884.
  const inputs = (horizonMonths: number) =>
    makeInputs({ monthlyFixedCosts: [line('qira', 'qira', 100)], ownCapital: 934, reserveMonths: 0.3, horizonMonths }, { startCustomers: 0, monthlyNewCustomers: 1 });
  const short = projectScenario(inputs(12), 'baze');
  const long = projectScenario(inputs(36), 'baze');

  it('keeps the in-horizon numbers, but never says the capital is enough while cash is still falling', () => {
    expect(short.capital.maxOperatingDeficit).toBeCloseTo(804, 9);
    expect(short.capital.totalRequired).toBeCloseTo(934, 9); // 100 + 804 + 0.3 × 100
    expect(short.capital.gap).toBe(0);
    const text = short.capital.explanationSq.join('\n');
    expect(text).toContain('Ky nuk është deficiti i plotë: në muajin e fundit (12) paraja kumulative është ende në rënie');
    expect(text).toContain('minimum, jo shuma e mjaftueshme');
    expect(text).not.toContain('e mbulon kapitalin e nevojshëm');
    expect(text).not.toContain('para se arkëtimet ta mbulojnë');
  });

  it('warns and names the deficit the same assumptions reach after the horizon (equal to a 36-month run)', () => {
    expect(long.capital.maxOperatingDeficit).toBeCloseTo(884, 9);
    const warning = short.warningsSq.find((w) => plain(w).startsWith('Kapitali i nevojshëm (934,00 €) është minimum'));
    expect(plain(warning ?? '')).toContain('deficiti arrin 884,00 € në muajin 17');
  });

  it('is not flagged once the horizon contains the low point', () => {
    expect(long.warningsSq.some((w) => w.includes('është minimum'))).toBe(false);
    expect(long.capital.explanationSq.join(' ')).not.toContain('Ky nuk është deficiti i plotë');
    expect(long.capital.gap).toBeCloseTo(80, 9);
  });

  it('is not flagged when the deficit peaks inside the horizon (growth example)', () => {
    const r = projectScenario(makeGrowthInputs(), 'baze');
    expect(r.capital.explanationSq.join(' ')).toContain('para se arkëtimet ta mbulojnë');
    expect(r.warningsSq.some((w) => w.includes('është minimum'))).toBe(false);
  });

  it('flags a deficit that only starts after the horizon (customers churn away, none added)', () => {
    // 30 customers, 20% churn, no new ones: net cash 180·0.8^(m−1) − 30 turns negative from month 10,
    // cumulative stays positive within 12 months but goes below zero later.
    const r = projectScenario(makeInputs({}, { startCustomers: 30, monthlyChurnPct: 20 }), 'baze');
    expect(r.capital.maxOperatingDeficit).toBe(0);
    expect(r.capital.explanationSq.join(' ')).toContain('nëse të njëjtat supozime vazhdojnë pas horizontit, paraja kumulative bie nën zero');
    expect(r.capital.explanationSq.join(' ')).not.toContain('e mbulon kapitalin e nevojshëm');
    // Payback (100) is reached and holds to month 12, but month 12 already loses cash.
    expect(r.payback.recoveredInMonth).toBe(1);
    expect(r.payback.statementSq).toContain('rikuperimi mund të humbasë pas horizontit');
  });

  it('says no amount of capital fixes a model with negative or zero contribution', () => {
    for (const pricePerUnit of [3, 4]) {
      const r = projectScenario(makeInputs({ pricePerUnit, ownCapital: 10_000 }), 'baze');
      const text = r.capital.explanationSq.join('\n');
      expect(text).toContain('Asnjë shumë kapitali nuk e rregullon këtë model');
      expect(text).toContain('arkëtimet nuk e mbulojnë kurrë');
      expect(text).not.toContain('e mbulon kapitalin e nevojshëm');
      expect(text).not.toContain('para se arkëtimet ta mbulojnë');
    }
  });
});

describe('capital requirement — explanation details', () => {
  it('names only fixed costs in the reserve when the owner salary is not included or is 0', () => {
    const reserveLine = (r: ReturnType<typeof projectScenario>) => plain(r.capital.explanationSq.find((e) => e.startsWith('Rezerva')) ?? '');
    expect(reserveLine(projectScenario(makeInputs(), 'baze'))).toBe(
      'Rezerva e sigurisë: 1 muaj × 30,00 € (vetëm kosto fikse; paga e pronarit nuk përfshihet) = 30,00 €.',
    );
    expect(reserveLine(projectScenario(makeInputs({ includeOwnerSalary: true, ownerSalaryMonthly: 0 }), 'baze'))).toContain(
      '(vetëm kosto fikse; paga e pronarit është 0)',
    );
    expect(reserveLine(projectScenario(makeInputs({ includeOwnerSalary: true, ownerSalaryMonthly: 40 }), 'baze'))).toBe(
      'Rezerva e sigurisë: 1 muaj × 70,00 € (kosto fikse + paga e pronarit) = 70,00 €.',
    );
  });

  it('mentions supplier bills and customer receivables still open at the horizon', () => {
    const r = projectScenario(makeGrowthInputs({ supplierPaymentDays: 180 }), 'baze');
    expect(r.rows[11].payablesEnd).toBeCloseTo(408, 9);
    expect(plain(r.capital.explanationSq.join(' '))).toContain('Në fund të horizontit mbeten 408,00 € të papaguara te furnitorët');
    const late = projectScenario(makeInputs({ collectionDays: 30 }), 'baze');
    expect(plain(late.capital.explanationSq.join(' '))).toContain('Në fund të horizontit mbeten 100,00 € të paarkëtuara nga klientët');
  });
});

describe('payback — must hold until the end of the horizon', () => {
  it('does not report a month that later months undo (seasonal case)', () => {
    // Cumulative net cash: 144, 336, 504, 504, 432, 336, 228, 144, 60, 0, −24, 0 against startup 450.
    const r = projectScenario(
      makeInputs(
        {
          seasonality: [0.3, 0.3, 0.5, 0.8, 1.2, 2.2, 2.6, 2.4, 1.0, 0.4, 0.2, 0.1],
          startMonth: 6,
          startupCosts: [line('s', 'pajisje', 450)],
          monthlyFixedCosts: [line('f', 'qira', 120)],
          ownCapital: 700,
        },
        { startCustomers: 20 },
      ),
      'baze',
    );
    expect(r.payback.recoveredInMonth).toBeNull();
    expect(plain(r.payback.statementSq)).toBe(
      'Me këto supozime, fluksi neto i parasë nga operimi e arrin investimin fillestar (450,00 €) vetëm përkohësisht, në muajin 3, dhe pastaj bie përsëri: në fund të horizontit (muaji 12) mbeten 450,00 € pa rikuperuar. Investimi nuk rikuperohet në mënyrë të qëndrueshme brenda horizontit prej 12 muajsh.',
    );
  });

  it('reports what is still unrecovered when the line is crossed and then lost', () => {
    // Cumulative 84 … 504 (m6) then −24/month → 360 at month 12, against startup 400 first reached in month 5.
    const r = projectScenario(
      makeInputs({ seasonality: [1.9, 1.9, 1.9, 1.9, 1.9, 1.9, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1], startupCosts: [line('s', 'pajisje', 400)], ownCapital: 1000 }),
      'baze',
    );
    expect(r.payback.recoveredInMonth).toBeNull();
    expect(r.payback.statementSq).toContain('vetëm përkohësisht, në muajin 5');
    expect(plain(r.payback.statementSq)).toContain('mbeten 40,00 € pa rikuperuar');
  });

  it('without startup costs, says when the owner cash consumed by the operating deficit is back', () => {
    // Growth example without startup: cumulative −50 … −130 (m5) … −18 (m9), +40 (m10) … +192.
    const r = projectScenario(makeGrowthInputs({ startupCosts: [] }), 'baze');
    // The field stays the startup payback month (null here); the month is in the statement.
    expect(r.payback.recoveredInMonth).toBeNull();
    expect(plain(r.payback.statementSq)).toContain('operimi konsumon deri në 130,00 € nga paraja juaj');
    expect(r.payback.statementSq).toContain('nuk është më negativ nga muaji 10 deri në fund të horizontit');
    expect(r.payback.statementSq).toContain('NUK është datë e garantuar');
    const notYet = projectScenario(makeGrowthInputs({ startupCosts: [], horizonMonths: 9 }), 'baze');
    expect(notYet.payback.recoveredInMonth).toBeNull();
    expect(notYet.payback.statementSq).toContain('kjo para nuk rikuperohet brenda horizontit prej 9 muajsh');
  });

  it('says when payback exists only thanks to unpaid supplier bills', () => {
    // 180 supplier days: cumulative 600 at month 12, but 408 is still owed → 192 < 200 after paying.
    const r = projectScenario(makeGrowthInputs({ supplierPaymentDays: 180 }), 'baze');
    expect(r.payback.recoveredInMonth).toBe(9);
    expect(plain(r.payback.statementSq)).toContain('vetëm falë kredisë nga furnitorët — në fund të horizontit u detyroheni ende 408,00 €');
  });
});
