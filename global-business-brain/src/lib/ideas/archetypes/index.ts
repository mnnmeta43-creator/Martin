/**
 * Biblioteka e arketipeve të biznesit (curated, country-agnostic business archetypes).
 * Each batch file is owned and reviewed separately; `validateArchetype` enforces the rules.
 */
import type { BusinessArchetype } from '@/lib/domain/types';
import { BATCH_A } from './batchA';
import { BATCH_B } from './batchB';
import { BATCH_C } from './batchC';

export const ARCHETYPES: BusinessArchetype[] = [...BATCH_A, ...BATCH_B, ...BATCH_C];

const byId = new Map(ARCHETYPES.map((a) => [a.id, a]));

export function getArchetype(id: string): BusinessArchetype | undefined {
  return byId.get(id);
}
