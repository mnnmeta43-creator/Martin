// SYNTHETIC — values are not real
// Coverage: levels from availability and freshness; projection sources excluded; missing listed.
import { describe, expect, it } from 'vitest';
import type { IndicatorSeries } from '@/lib/domain/types';
import { computeCoverage } from '@/lib/data/coverage';
import { INDICATORS } from '@/lib/data/indicators';
import { buildSeries } from '@/lib/data/series';
import { obs } from '../../fixtures/data/observations';

const NOW = new Date('2026-10-02T12:00:00.000Z');
const TRACKED = INDICATORS.filter((d) => !d.isProjectionSource);

/** Series for every indicator: the first `available` tracked ones get a value in `period`. */
function seriesWith(available: number, periodFor: (i: number) => string, opts: { isDemo?: boolean } = {}): IndicatorSeries[] {
  return INDICATORS.map((def) => {
    const i = TRACKED.indexOf(def);
    const rows = i >= 0 && i < available ? [obs({ code: def.code, country: 'ALB', period: periodFor(i), value: 1.11, isDemo: opts.isDemo })] : [];
    return buildSeries(def, 'ALB', rows, NOW, null, opts);
  });
}

describe('computeCoverage', () => {
  it('counts only measured-data indicators (projection sources excluded)', () => {
    const c = computeCoverage('ALB', seriesWith(0, () => '2025'), NOW);
    expect(c.totalTracked).toBe(TRACKED.length);
    expect(c.totalTracked).toBeLessThan(INDICATORS.length);
  });

  it('no data → e_pamjaftueshme, every tracked indicator listed as missing', () => {
    const c = computeCoverage('ALB', seriesWith(0, () => '2025'), NOW);
    expect(c.level).toBe('e_pamjaftueshme');
    expect(c.availableCount).toBe(0);
    expect(c.freshCount).toBe(0);
    expect(c.missingIndicators).toEqual(TRACKED.map((d) => d.code));
    expect(c.noteSq).toContain('jo si zero');
  });

  it('≥80% available and ≥60% fresh → e_plote', () => {
    const c = computeCoverage('ALB', seriesWith(Math.ceil(TRACKED.length * 0.85), () => '2025'), NOW);
    expect(c.level).toBe('e_plote');
    expect(c.staleIndicators).toEqual([]);
  });

  it('available but mostly stale → e_pjesshme, stale ones listed', () => {
    const n = TRACKED.length;
    const c = computeCoverage('ALB', seriesWith(n, (i) => (i < Math.floor(n * 0.5) ? '2025' : '2018')), NOW);
    expect(c.availableCount).toBe(n);
    expect(c.level).toBe('e_pjesshme');
    expect(c.staleIndicators.length).toBe(n - Math.floor(n * 0.5));
  });

  it('40–80% available → e_pjesshme; below 40% → e_pamjaftueshme', () => {
    const n = TRACKED.length;
    expect(computeCoverage('ALB', seriesWith(Math.ceil(n * 0.45), () => '2025'), NOW).level).toBe('e_pjesshme');
    expect(computeCoverage('ALB', seriesWith(Math.floor(n * 0.3), () => '2025'), NOW).level).toBe('e_pamjaftueshme');
  });

  it('demo series are re-assessed by age when `now` is given', () => {
    const n = TRACKED.length;
    const c = computeCoverage('ZZA', seriesWith(n, () => '2024', { isDemo: true }), NOW);
    expect(c.freshCount).toBe(n);
    expect(c.level).toBe('e_plote');
    expect(computeCoverage('ZZA', seriesWith(n, () => '2024', { isDemo: true })).freshCount).toBe(0);
  });

  it('handles an empty list', () => {
    const c = computeCoverage('ALB', []);
    expect(c.level).toBe('e_pamjaftueshme');
    expect(c.totalTracked).toBe(0);
  });
});
