import { describe, expect, it } from 'vitest';
import { suggestCapitalReductions } from '@/lib/finance/capital';
import { deepFreeze, line, makeInputs } from './helpers';

// Startup 650 = laptop 300 (optional) + test 50 (optional) + stock 100 + equipment 200.
// Fixed 50/month = rent 30 + accountant 20 (optional). Operating +10/month → no deficit.
// Initial capital need = 650 + 0 + 3 × 50 = 800.
const inputs = deepFreeze(
  makeInputs({
    startupCosts: [
      line('pajisje', 'pajisje', 200),
      line('stok', 'inventar', 100),
      line('testim', 'testim_tregu', 50, { optional: true }),
      line('laptop', 'pajisje', 300, { optional: true }),
    ],
    monthlyFixedCosts: [line('qira', 'qira', 30), line('kontabilist', 'kontabilitet', 20, { optional: true })],
    reserveMonths: 3,
  }),
);

describe('suggestCapitalReductions', () => {
  it('stops as soon as the target is met (optional startup lines, largest first)', () => {
    // −300 laptop → 500; −50 test → 450 = target
    const r = suggestCapitalReductions(inputs, 450);
    expect(r.changes.map((c) => [c.lineId, c.from, c.to])).toEqual([
      ['laptop', 300, 0],
      ['testim', 50, 0],
    ]);
    expect(r.resultingTotal).toBe(450);
    expect(r.reachesTarget).toBe(true);
    expect(r.noteSq).toContain('brenda objektivit');
  });

  it('then halves the initial stock and lowers the reserve to 1 month', () => {
    // 450 → stock 100 → 50: 400 → reserve 3 → 1 month: 250 + 50 = 300 = target
    const r = suggestCapitalReductions(inputs, 300);
    expect(r.changes.map((c) => [c.lineId, c.from, c.to])).toEqual([
      ['laptop', 300, 0],
      ['testim', 50, 0],
      ['stok', 100, 50],
      [null, 3, 1],
    ]);
    expect(r.resultingTotal).toBe(300);
    expect(r.reachesTarget).toBe(true);
    expect(r.changes.every((c) => c.reasonSq.length > 20)).toBe(true);
  });

  it('is honest when the target cannot be reached and never zeroes a required cost', () => {
    // After every step: startup 250, fixed 30 (accountant dropped), reserve 1 × 30 → 280 > 250
    const r = suggestCapitalReductions(inputs, 250);
    expect(r.reachesTarget).toBe(false);
    expect(r.resultingTotal).toBe(280);
    expect(r.changes.map((c) => c.lineId)).toEqual(['laptop', 'testim', 'stok', null, 'kontabilist']);
    expect(r.noteSq).toContain('Disa kosto nuk mund të hiqen');
    expect(r.noteSq).toContain('mund të mos jetë i realizueshëm');
    const equipment = r.inputs.startupCosts.find((l) => l.id === 'pajisje');
    expect(equipment).toMatchObject({ enabled: true, amount: 200 });
    expect(r.inputs.monthlyFixedCosts.find((l) => l.id === 'qira')).toMatchObject({ enabled: true, amount: 30 });
  });

  it('disables (rather than deletes) lines so the user can switch them back on', () => {
    const r = suggestCapitalReductions(inputs, 450);
    const laptop = r.inputs.startupCosts.find((l) => l.id === 'laptop');
    expect(laptop).toMatchObject({ enabled: false, amount: 300 });
    expect(laptop?.sourceNoteSq).toContain('Çaktivizuar si sugjerim');
  });

  it('changes nothing when already within the target', () => {
    const r = suggestCapitalReductions(inputs, 1000);
    expect(r.changes).toEqual([]);
    expect(r.resultingTotal).toBe(800);
    expect(r.reachesTarget).toBe(true);
    expect(r.noteSq).toContain('tashmë brenda objektivit');
  });

  it('does not mutate the caller inputs', () => {
    const before = JSON.stringify(inputs);
    const r = suggestCapitalReductions(inputs, 250);
    expect(JSON.stringify(inputs)).toBe(before);
    expect(r.inputs).not.toBe(inputs);
  });
});

describe('suggestCapitalReductions — best fit', () => {
  it('disables the smallest optional line that alone reaches the target, not the largest', () => {
    // Need 800 → 750: dropping the 50 test alone is enough; the 300 laptop is kept.
    const r = suggestCapitalReductions(inputs, 750);
    expect(r.changes.map((c) => [c.lineId, c.from, c.to])).toEqual([['testim', 50, 0]]);
    expect(r.resultingTotal).toBe(750);
    expect(r.inputs.startupCosts.find((l) => l.id === 'laptop')?.enabled).toBe(true);
  });

  it('says a removed optional cost is gone from the model, not postponed', () => {
    const r = suggestCapitalReductions(inputs, 750);
    expect(r.changes[0].reasonSq).toContain('hiqet plotësisht, jo shtyhet');
    expect(r.changes[0].reasonSq).not.toContain('shtyhet (');
  });
});
