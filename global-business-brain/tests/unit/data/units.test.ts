// Period parsing/ordering, unit helpers and value scaling.
import { describe, expect, it } from 'vitest';
import { comparePeriods, parsePeriod, periodGap, scaleValue, unitIsPercent, unitShortSq } from '@/lib/data/units';

describe('parsePeriod', () => {
  it('parses each granularity', () => {
    expect(parsePeriod('2023')).toEqual({ granularity: 'vit', year: 2023 });
    expect(parsePeriod('2024-Q1')).toEqual({ granularity: 'tremujor', year: 2024, quarter: 1 });
    expect(parsePeriod('2024Q4')).toEqual({ granularity: 'tremujor', year: 2024, quarter: 4 });
    expect(parsePeriod('2024-05')).toEqual({ granularity: 'muaj', year: 2024, month: 5 });
    expect(parsePeriod('2024M05')).toEqual({ granularity: 'muaj', year: 2024, month: 5 });
    expect(parsePeriod('2024-05-17')).toEqual({ granularity: 'dite', year: 2024, month: 5, day: 17 });
    expect(parsePeriod(' 2023 ')).toEqual({ granularity: 'vit', year: 2023 });
  });

  it('returns null for garbage and impossible dates', () => {
    for (const bad of ['', 'abc', '23', '2024-Q5', '2024-13', '2024-00', '2023-02-29', '2024-04-31', '2024/05', '20245']) {
      expect(parsePeriod(bad), bad).toBeNull();
    }
    expect(parsePeriod('2024-02-29')).not.toBeNull();
  });
});

describe('comparePeriods / periodGap', () => {
  it('orders periods of the same granularity', () => {
    expect(comparePeriods('2020', '2023')).toBeLessThan(0);
    expect(comparePeriods('2023', '2020')).toBeGreaterThan(0);
    expect(comparePeriods('2023', '2023')).toBe(0);
    expect(comparePeriods('2023-Q4', '2024-Q1')).toBeLessThan(0);
    expect(comparePeriods('2024-12', '2024-02')).toBeGreaterThan(0);
    expect(comparePeriods('2024-05-17', '2024-05-18')).toBeLessThan(0);
    expect(['2023', '2019', '2021'].sort(comparePeriods)).toEqual(['2019', '2021', '2023']);
  });

  it('returns NaN across granularities or for unparseable input', () => {
    expect(comparePeriods('2023', '2023-Q1')).toBeNaN();
    expect(comparePeriods('2023', 'x')).toBeNaN();
    expect(periodGap('2023-05', '2023')).toBeNaN();
  });

  it('counts periods between two points', () => {
    expect(periodGap('2018', '2024')).toBe(6);
    expect(periodGap('2024', '2018')).toBe(-6);
    expect(periodGap('2023-Q3', '2024-Q2')).toBe(3);
    expect(periodGap('2023-11', '2024-02')).toBe(3);
    expect(periodGap('2024-02-27', '2024-03-01')).toBe(3);
  });
});

describe('unit helpers', () => {
  it('detects percent units', () => {
    expect(unitIsPercent('perqind')).toBe(true);
    expect(unitIsPercent('raport')).toBe(false);
    expect(unitIsPercent('per_100')).toBe(false);
  });

  it('scales values between magnitudes and keeps null as null', () => {
    expect(scaleValue(1.5, 'milion', 'njesi')).toBe(1_500_000);
    expect(scaleValue(2_500, 'mije', 'milion')).toBe(2.5);
    expect(scaleValue(3, 'miliard', 'milion')).toBe(3000);
    expect(scaleValue(7, 'njesi', 'njesi')).toBe(7);
    expect(scaleValue(null, 'milion', 'njesi')).toBeNull();
    expect(scaleValue(Number.NaN, 'milion', 'njesi')).toBeNull();
  });

  it('gives short Albanian unit suffixes', () => {
    expect(unitShortSq({ unit: 'perqind' })).toBe('%');
    expect(unitShortSq({ unit: 'monedhe', currency: 'USD' })).toBe('USD');
    expect(unitShortSq({ unit: 'monedhe', currency: 'INTL$' })).toBe('$ ndërk.');
    expect(unitShortSq({ unit: 'mv_per_usd', currency: 'MV' })).toBe('MV/USD');
    expect(unitShortSq({ unit: 'per_1000' })).toBe('për 1.000');
    expect(unitShortSq({ unit: 'numer' })).toBe('');
  });
});
