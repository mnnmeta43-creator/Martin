import { describe, expect, it } from 'vitest';
import type { IndicatorDefinition } from '@/lib/domain/types';
import {
  formatDate,
  formatDateTime,
  formatIndicatorValue,
  formatMoney,
  formatNumber,
  formatPercent,
  formatPeriod,
} from '@/lib/finance/format';
import { plain } from './helpers';

// Intl (sq-AL) separates groups and units with non-breaking spaces; `plain` makes assertions readable.
describe('formatMoney', () => {
  it('uses Albanian separators and the currency minor units', () => {
    expect(plain(formatMoney(1234567.891, 'EUR'))).toBe('1 234 567,89 €');
    expect(plain(formatMoney(1234.5, 'JPY'))).toBe('1235 JP¥'); // JPY has no decimals; sq-AL does not group 4 digits
  });

  it('shows missing values as "—", never as 0', () => {
    expect(formatMoney(null, 'EUR')).toBe('—');
    expect(formatMoney(undefined, 'EUR')).toBe('—');
    expect(formatMoney(Number.NaN, 'EUR')).toBe('—');
  });

  it('supports compact notation with Albanian abbreviations and custom decimals', () => {
    expect(plain(formatMoney(1234567, 'EUR', { compact: true }))).toBe('1,2 mln €');
    expect(plain(formatMoney(99.999, 'EUR', { decimals: 0 }))).toBe('100 €');
  });

  it('never prints "-0" and falls back gracefully for unknown codes', () => {
    expect(plain(formatMoney(-0.001, 'EUR'))).toBe('0,00 €');
    expect(plain(formatMoney(12.5, 'XXXXX'))).toBe('12,50 XXXXX');
  });
});

describe('formatNumber / formatPercent', () => {
  it('formats numbers in sq-AL', () => {
    expect(formatNumber(1234.5)).toBe('1234,5');
    expect(plain(formatNumber(12345.678, 1))).toBe('12 345,7');
    expect(formatNumber(0.1 + 0.2)).toBe('0,3');
    expect(formatNumber(null)).toBe('—');
  });

  it('formats values that are already in percent units', () => {
    expect(formatPercent(12.345)).toBe('12,3%');
    expect(formatPercent(-3, 0)).toBe('-3%');
    expect(formatPercent(null)).toBe('—');
  });
});

function def(unit: IndicatorDefinition['unit'], currency: IndicatorDefinition['currency'] = null): IndicatorDefinition {
  return {
    code: 'test',
    sourceId: 'test',
    sourceCode: 'TEST',
    nameSq: 'Tregues testi',
    nameEn: 'Test indicator',
    unit,
    unitLabelSq: '',
    currency,
    basis: 'numer',
    periodicity: 'vjetore',
    category: 'rritja',
    explain: {
      whatItMeasuresSq: '',
      whyItMattersSq: '',
      affectedBusinessesSq: '',
      mechanismSq: '',
      extraEvidenceSq: '',
    },
  };
}

describe('formatIndicatorValue', () => {
  // Synthetic values only.
  it.each([
    ['perqind', null, 12.34, '12,3%'],
    ['monedhe', 'USD', 1234567890, '1,2 mld US$'],
    ['monedhe', 'USD', 1234567890123, '1,2 bln US$'],
    ['monedhe', 'USD', 5432.1, '5432 US$'],
    ['monedhe', 'INTL$', 15432.7, '15 433 $ ndërkomb.'],
    ['monedhe', 'MV', 2345678, '2,3 mln njësi të monedhës vendase'],
    ['monedhe', null, 12.5, '12,50'],
    ['numer', null, 2345678, '2,3 mln'],
    ['numer', null, 45678, '45 678'],
    ['per_100', null, 123.45, '123,5 për 100'],
    ['per_1000', null, 4.567, '4,57 për 1000'],
    ['indeks', null, 105.27, '105,3'],
    ['dite', null, 12, '12 ditë'],
    ['raport', null, 0.567, '0,57'],
    ['mv_per_usd', 'MV', 98.5, '98,50 njësi të monedhës vendase për 1 USD'],
    ['mv_per_usd', 'MV', 0.9234, '0,9234 njësi të monedhës vendase për 1 USD'],
    ['pike', null, 61.2, '61,2 pikë'],
  ] as const)('%s (%s) %d → %s', (unit, currency, value, expected) => {
    expect(plain(formatIndicatorValue(value, def(unit, currency)))).toBe(expected);
  });

  it('shows missing values as "—"', () => {
    expect(formatIndicatorValue(null, def('perqind'))).toBe('—');
  });
});

describe('formatPeriod', () => {
  it.each([
    ['2023', '2023'],
    ['2024-Q1', 'tremujori I 2024'],
    ['2024-Q4', 'tremujori IV 2024'],
    ['2024-05', 'maj 2024'],
    ['2024-05-17', '17 maj 2024'],
    ['2024-12', 'dhjetor 2024'],
    ['jo-periudhë', 'jo-periudhë'],
  ])('%s → %s', (period, expected) => {
    expect(formatPeriod(period)).toBe(expected);
  });
});

describe('formatDate / formatDateTime', () => {
  it('formats calendar dates with Albanian month names', () => {
    expect(formatDate('2026-10-02')).toBe('2 tetor 2026');
    expect(formatDate('2026-11-30')).toBe('30 nëntor 2026');
    expect(formatDate(null)).toBe('—');
    expect(formatDate('not a date')).toBe('—');
  });

  it('reads timestamps in UTC by default, or in a given time zone', () => {
    expect(formatDate('2026-10-02T23:30:00Z')).toBe('2 tetor 2026');
    expect(formatDate('2026-10-02T23:30:00Z', { timeZone: 'Europe/Tirane' })).toBe('3 tetor 2026');
  });

  it('formats date and time with a 24-hour clock and the zone named', () => {
    expect(formatDateTime('2026-10-02T09:04:00Z')).toBe('2 tetor 2026, 09:04 UTC');
    expect(formatDateTime('2026-10-02T21:04:00Z')).toBe('2 tetor 2026, 21:04 UTC');
    expect(formatDateTime('garbage')).toBe('—');
  });
});
