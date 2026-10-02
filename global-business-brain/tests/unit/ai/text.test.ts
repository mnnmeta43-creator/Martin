import { describe, expect, it } from 'vitest';
import { normalizeQuery, parseAmount, parseDays, parsePercent, resolveCountry } from '@/lib/ai/text';

describe('normalizeQuery', () => {
  it('drops diacritics, case, quotes and extra spaces', () => {
    expect(normalizeQuery('  Çfarë   duhet të VERIFIKOJ „sot”? ')).toBe('cfare duhet te verifikoj sot ?');
  });
});

describe('parsePercent', () => {
  it('reads % and "përqind", with decimal commas', () => {
    expect(parsePercent('Nëse kostot rriten 15%?')).toBe(15);
    expect(parsePercent('me 12,5 përqind')).toBe(12.5);
    expect(parsePercent('pa numra')).toBeNull();
  });
});

describe('parseAmount', () => {
  it('reads plain, separated and abbreviated amounts', () => {
    expect(parseAmount('me kapital 3000')).toBe(3000);
    expect(parseAmount('kam vetëm 5 000 euro')).toBe(5000);
    expect(parseAmount('5.000 lekë')).toBe(5000);
    expect(parseAmount('2,5k')).toBe(2500);
    expect(parseAmount('1.5 mln')).toBe(1_500_000);
  });

  it('skips percentages and durations', () => {
    expect(parseAmount('rriten 20% në 3 muaj')).toBeNull();
    expect(parseAmount('20% dhe kapital 4000')).toBe(4000);
    expect(parseAmount('më të vogël')).toBeNull();
  });
});

describe('parseDays', () => {
  it('understands days, weeks and "sot"', () => {
    expect(parseDays('për 3 ditë')).toBe(3);
    expect(parseDays('këtë javë')).toBe(7);
    expect(parseDays('2 javë')).toBe(14);
    expect(parseDays('Çfarë duhet të verifikoj sot?')).toBe(1);
    expect(parseDays('çfarë duhet')).toBeNull();
  });
});

describe('resolveCountry', () => {
  it('resolves codes and Albanian/English names in different grammatical cases', () => {
    expect(resolveCountry('XKX')?.code).toBe('XKX');
    expect(resolveCountry('Kosova')?.code).toBe('XKX');
    expect(resolveCountry('Kosovën')?.code).toBe('XKX');
    expect(resolveCountry('Kosovo')?.code).toBe('XKX');
    expect(resolveCountry('nje shtet tjeter, p.sh. kosova')?.code).toBe('XKX');
    expect(resolveCountry('Italinë')?.code).toBe('ITA');
    expect(resolveCountry('Germany')?.code).toBe('DEU');
    expect(resolveCountry('Maqedoninë e Veriut')?.code).toBe('MKD');
  });

  it('returns null instead of guessing', () => {
    expect(resolveCountry('Atlantida')).toBeNull();
    expect(resolveCountry('një shtet tjetër')).toBeNull();
    expect(resolveCountry('')).toBeNull();
  });

  it('finds demo economies only in demo mode', () => {
    expect(resolveCountry('ZZB')).toBeNull();
    expect(resolveCountry('ZZB', { includeDemo: true })?.code).toBe('ZZB');
  });
});
