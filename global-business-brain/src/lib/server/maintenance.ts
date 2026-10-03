/**
 * Mirëmbajtja periodike e databazës (run by the scheduled refresh).
 * Guest accounts are disposable: those older than 30 days with no live session are removed
 * together with their data (cascade), so anonymous use cannot grow the database forever.
 */
import type { Store } from '@/lib/server/store/types';

export const GUEST_RETENTION_DAYS = 30;

export async function purgeOldGuests(store: Store, now: Date = new Date()): Promise<number> {
  const cutoff = new Date(now.getTime() - GUEST_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  return store.users.purgeInactiveGuests(cutoff.toISOString(), now.toISOString());
}
