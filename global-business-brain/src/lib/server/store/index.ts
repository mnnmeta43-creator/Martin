/**
 * Hyrja e vetme në ruajtje për faqet dhe rrugët API (store entry point).
 * `getStore()` wraps the `getDb()` singleton; one Store object is reused per Db instance, and a
 * missing database configuration surfaces as a ConfigError with an Albanian message.
 */
import { getDb, type Db } from '@/lib/server/db';
import { createSqlStore } from '@/lib/server/store/sqlStore';
import type { Store } from '@/lib/server/store/types';

const stores = new WeakMap<Db, Store>();

export async function getStore(): Promise<Store> {
  const db = await getDb();
  let store = stores.get(db);
  if (!store) {
    store = createSqlStore(db);
    stores.set(db, store);
  }
  return store;
}

export { createSqlStore } from '@/lib/server/store/sqlStore';
export type { Store, UserRecord, SessionRecord, NewProjectInput, ProjectPatch, ObservationQuery } from '@/lib/server/store/types';
