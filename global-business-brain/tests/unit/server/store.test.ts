/**
 * Store contract against an in-memory PGlite database (same suite the Postgres integration test runs).
 */
import { afterAll, beforeAll } from 'vitest';
import type { Db } from '@/lib/server/db';
import type { Store } from '@/lib/server/store/types';
import { createMemoryStore } from './helpers';
import { defineStoreContractSuite } from './storeSuite';

let ctx: { db: Db; store: Store };

beforeAll(async () => {
  ctx = await createMemoryStore();
});

afterAll(async () => {
  await ctx?.db.close();
});

defineStoreContractSuite('PGlite', () => ctx);
