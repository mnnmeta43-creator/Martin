/**
 * Konteksti i vizitorit për faqet (server components only).
 * Resolves storage, the signed-in user, their profile and the data mode in one place, and turns a
 * missing database configuration into a visible message instead of a crash.
 */
import type { UserProfile } from '@/lib/domain/types';
import { isDemoMode } from '@/lib/data/demo/dataset';
import { getStore } from '@/lib/server/store';
import { getCurrentUser } from '@/lib/server/session';
import type { Store, UserRecord } from '@/lib/server/store/types';
import { logger } from '@/lib/server/logger';
import { ConfigError } from '@/lib/server/errors';

export interface Viewer {
  store: Store | null;
  storeErrorSq: string | null;
  user: UserRecord | null;
  profile: UserProfile | null;
  demoMode: boolean;
  now: Date;
}

export async function getViewer(): Promise<Viewer> {
  const demoMode = isDemoMode();
  const now = new Date();
  let store: Store | null = null;
  let storeErrorSq: string | null = null;
  try {
    store = await getStore();
  } catch (err) {
    // Only our own configuration message is shown; driver errors may contain hosts or user names.
    storeErrorSq =
      err instanceof ConfigError && err.message
        ? err.message
        : 'Databaza nuk është e disponueshme për momentin. Llogaritë, profilet dhe projektet nuk mund të ruhen. Provoni sërish pak më vonë.';
    logger.error('viewer.store_unavailable', { error: err instanceof Error ? err.message : String(err) });
  }
  let user: UserRecord | null = null;
  let profile: UserProfile | null = null;
  if (store) {
    try {
      user = await getCurrentUser();
      profile = user ? await store.profiles.get(user.id) : null;
    } catch (err) {
      logger.error('viewer.session_failed', { error: err instanceof Error ? err.message : String(err) });
    }
  }
  return { store, storeErrorSq, user, profile, demoMode, now };
}

/** The economy a page should open on when none is given: first target market, then residence. */
export function defaultCountryCode(viewer: Viewer): string {
  return viewer.profile?.targetCountries[0] ?? viewer.profile?.residenceCountry ?? (viewer.demoMode ? 'ZZA' : 'ALB');
}

export function todayIso(now: Date): string {
  return now.toISOString().slice(0, 10);
}
