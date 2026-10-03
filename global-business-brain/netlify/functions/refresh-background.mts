/**
 * Rifreskimi i plotë i të dhënave (Netlify Background Function, deri në 15 minuta).
 * Called by the hourly scheduler below (or manually) with "Authorization: Bearer <CRON_SECRET>".
 * Sources whose data is still fresh are skipped, so most runs finish in seconds.
 */
import type { Context } from '@netlify/functions';
import { timingSafeEqual } from 'node:crypto';
import { refreshAll } from '../../src/lib/data/refresh';
import { getStore } from '../../src/lib/server/store';
import { logger } from '../../src/lib/server/logger';
import { purgeOldGuests } from '../../src/lib/server/maintenance';

function authorized(req: Request, secret: string): boolean {
  const given = Buffer.from((req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, ''));
  const expected = Buffer.from(secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export default async (req: Request, _context: Context) => {
  const secret = Netlify.env.get('CRON_SECRET');
  if (!secret || !authorized(req, secret)) {
    logger.warn('refresh.unauthorized', {});
    return;
  }
  const force = new URL(req.url).searchParams.get('force') === '1';
  const store = await getStore();
  const report = await refreshAll({ store: store.data, now: new Date(), force, clock: () => new Date() });
  const purgedGuests = await purgeOldGuests(store);
  logger.info('refresh.done', { ok: report.okCount, errors: report.errorCount, skipped: report.skippedCount, purgedGuests });
};
