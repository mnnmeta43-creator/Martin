// SYNTHETIC — format mirrors the documented API; values are not real
/**
 * Country data contexts for analysis tests, built through the real context pipeline
 * (MemoryDataStore → getCountryDataContexts) so citations point at stored observations.
 */
import type { CountryDataContext, FetchLogEntry, Observation } from '@/lib/domain/types';
import { getCountryDataContexts } from '@/lib/data/context';
import { MemoryDataStore } from './memoryDataStore';

export const NOW = new Date('2026-10-02T12:00:00.000Z');

export interface ContextFixture {
  store: MemoryDataStore;
  contexts: CountryDataContext[];
}

export async function contextsFrom(
  codes: string[],
  observations: Observation[],
  opts: { logs?: FetchLogEntry[]; demoMode?: boolean } = {},
): Promise<ContextFixture> {
  const store = new MemoryDataStore();
  await store.upsertObservations(observations);
  for (const log of opts.logs ?? []) await store.addFetchLog(log);
  const list = await getCountryDataContexts(store, codes, NOW, { demoMode: opts.demoMode });
  const contexts = list.map((c, i) => {
    if (!c) throw new Error(`no context for ${codes[i]}`);
    return c;
  });
  return { store, contexts };
}
