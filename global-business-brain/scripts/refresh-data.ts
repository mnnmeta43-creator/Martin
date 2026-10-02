/**
 * Rifreskon të dhënat nga burimet publike (npm run data:refresh).
 *
 * Usage: tsx scripts/refresh-data.ts [--force] [--source=<id>[,<id>…]] [--indicator=<code>[,<code>…]]
 * Loads .env.local / .env when present, opens the configured store exactly like the app, runs
 * refreshAll and prints one line per (source, scope). Never writes demo data and never prints
 * secrets. Exit code 1 when every attempted scope failed or the store is unavailable.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { refreshAll, REFRESHABLE_SOURCES, type RefreshReport } from '@/lib/data/refresh';
import { resolveFxBaseUrl } from '@/lib/data/sources/fx';
import { closeDb } from '@/lib/server/db';
import { ConfigError } from '@/lib/server/errors';
import { maskString } from '@/lib/server/logger';
import { getStore } from '@/lib/server/store';

interface Args {
  force: boolean;
  sources?: string[];
  indicatorCodes?: string[];
}

function loadEnvFiles(): void {
  for (const file of ['.env.local', '.env']) {
    const full = path.join(process.cwd(), file);
    // process.loadEnvFile does not overwrite variables that are already set.
    if (existsSync(full)) process.loadEnvFile(full);
  }
}

function listArg(argv: string[], name: string): string[] | undefined {
  const values = argv
    .filter((a) => a.startsWith(`--${name}=`))
    .flatMap((a) => a.slice(name.length + 3).split(','))
    .map((v) => v.trim())
    .filter(Boolean);
  return values.length > 0 ? values : undefined;
}

function parseArgs(argv: string[]): Args {
  return { force: argv.includes('--force'), sources: listArg(argv, 'source'), indicatorCodes: listArg(argv, 'indicator') };
}

const STATUS_LABEL: Record<string, string> = { ok: 'OK', pjesshem: 'PJESËRISHT', gabim: 'GABIM', anashkaluar: 'ANASHKALUAR' };

function printReport(report: RefreshReport): void {
  for (const r of report.results) {
    console.log(`${(STATUS_LABEL[r.status] ?? r.status).padEnd(12)} ${r.sourceId.padEnd(20)} ${r.scope.padEnd(40)} ${String(r.rows).padStart(6)}  ${r.messageSq}`);
  }
  console.log('');
  console.log(`Nisur: ${report.startedAt} · Përfunduar: ${report.finishedAt}`);
  console.log(`Me sukses: ${report.okCount} · Gabime: ${report.errorCount} · Anashkaluar: ${report.skippedCount}`);
}

async function main(): Promise<void> {
  loadEnvFiles();
  const args = parseArgs(process.argv.slice(2));
  console.log(`Burimet: ${(args.sources ?? REFRESHABLE_SOURCES).join(', ')}${args.force ? ' (--force)' : ''}`);
  const store = await getStore();
  const report = await refreshAll({
    store: store.data,
    now: new Date(),
    clock: () => new Date(),
    force: args.force,
    sources: args.sources,
    indicatorCodes: args.indicatorCodes,
    fxBaseUrl: resolveFxBaseUrl(),
    logger: {
      info: () => undefined,
      warn: (m) => console.warn(maskString(m)),
      error: (m) => console.error(maskString(m)),
    },
  });
  printReport(report);
  const attempted = report.okCount + report.errorCount;
  if (attempted > 0 && report.okCount === 0) process.exitCode = 1;
  await closeDb();
}

main().catch(async (err: unknown) => {
  if (err instanceof ConfigError) {
    console.error(err.messageSq);
  } else {
    console.error('Rifreskimi dështoi:', err instanceof Error ? maskString(`${err.name}: ${err.message}`) : 'gabim i panjohur');
  }
  await closeDb().catch(() => undefined);
  process.exitCode = 1;
});
