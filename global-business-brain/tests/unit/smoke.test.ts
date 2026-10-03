import { describe, expect, it } from 'vitest';
import { DEFAULT_SCORE_WEIGHTS, PHASE_IDS } from '@/lib/domain/taxonomy';

describe('taxonomy', () => {
  it('default score weights sum to 100', () => {
    expect(Object.values(DEFAULT_SCORE_WEIGHTS).reduce((a, b) => a + b, 0)).toBe(100);
  });
  it('has 10 plan phases', () => {
    expect(PHASE_IDS).toHaveLength(10);
  });
});
