import { describe, expect, it } from 'vitest';
import { ARCHETYPES } from '@/lib/ideas/archetypes';
import { BATCH_A } from '@/lib/ideas/archetypes/batchA';
import { BATCH_B } from '@/lib/ideas/archetypes/batchB';
import { BATCH_C } from '@/lib/ideas/archetypes/batchC';
import { validateArchetype, validateLibrary } from '@/lib/ideas/archetypes/validate';

describe('archetype library quality gate', () => {
  it.each([
    ['A', BATCH_A],
    ['B', BATCH_B],
    ['C', BATCH_C],
  ])('batch %s passes every rule', (_name, batch) => {
    expect(batch.flatMap(validateArchetype)).toEqual([]);
  });

  it('library has unique ids and passes all rules', () => {
    expect(validateLibrary(ARCHETYPES)).toEqual([]);
  });

  it('library includes both solo-feasible and team-required archetypes', () => {
    if (ARCHETYPES.length === 0) return;
    expect(ARCHETYPES.some((a) => a.minTeam === 'vetem')).toBe(true);
    expect(ARCHETYPES.some((a) => a.minTeam !== 'vetem')).toBe(true);
  });
});
