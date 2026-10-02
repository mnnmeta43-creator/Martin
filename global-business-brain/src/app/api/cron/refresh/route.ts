import { timingSafeEqual } from 'node:crypto';
import { refreshAll } from '@/lib/data/refresh';
import { getEnv } from '@/lib/server/env';
import { handleRoute, jsonError, jsonOk } from '@/lib/server/http';
import { logger } from '@/lib/server/logger';
import { getStore } from '@/lib/server/store';

export const runtime = 'nodejs';
export const maxDuration = 300;

function authorized(request: Request, secret: string): boolean {
  const header = request.headers.get('authorization') ?? '';
  const given = Buffer.from(header.replace(/^Bearer\s+/i, ''));
  const expected = Buffer.from(secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/**
 * Server-side refresh, called by a scheduler (Vercel Cron, Netlify Scheduled Functions, system cron)
 * with "Authorization: Bearer <CRON_SECRET>". Without CRON_SECRET the endpoint is disabled.
 */
async function run(request: Request) {
  const secret = getEnv().CRON_SECRET;
  if (!secret) return jsonError(503, 'cron_disabled', 'CRON_SECRET mungon: rifreskimi automatik është i çaktivizuar.');
  if (!authorized(request, secret)) return jsonError(401, 'unauthorized', 'Autorizim i pavlefshëm.');
  const force = new URL(request.url).searchParams.get('force') === '1';
  const store = await getStore();
  const report = await refreshAll({ store: store.data, now: new Date(), force });
  logger.info('cron.refresh', { ok: report.okCount, errors: report.errorCount, skipped: report.skippedCount });
  return jsonOk(report);
}

export const POST = handleRoute(run);
export const GET = handleRoute(run);
