import { configStatus } from '@/lib/server/env';
import { isDemoMode } from '@/lib/data/demo/dataset';
import { jsonOk } from '@/lib/server/http';
import { getStore } from '@/lib/server/store';
import { ConfigError } from '@/lib/server/errors';
import { logger } from '@/lib/server/logger';

export const dynamic = 'force-dynamic';

/** Liveness + configuration overview (names and presence only — never values). */
export async function GET() {
  let storage: { ok: boolean; kind?: string; messageSq?: string };
  try {
    const store = await getStore();
    storage = { ok: true, kind: store.kind };
  } catch (err) {
    logger.error('health.store_unavailable', { error: err instanceof Error ? err.message : String(err) });
    storage = { ok: false, messageSq: err instanceof ConfigError ? err.message : 'Databaza nuk është e disponueshme.' };
  }
  return jsonOk({ ok: storage.ok, storage, dataMode: isDemoMode() ? 'demo' : 'live', config: configStatus() }, { status: storage.ok ? 200 : 503 });
}
