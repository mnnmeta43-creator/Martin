/**
 * Ekzekuton migrimet e databazës (npm run db:migrate).
 * Loads .env.local / .env when present (existing environment variables win), opens the configured
 * database through getDb() exactly like the app does (which applies pending db/migrations/*.sql)
 * and prints a summary. Never prints connection strings or other secret values.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { closeDb, getDb, getLastMigrationResult } from '@/lib/server/db';
import { getEnv } from '@/lib/server/env';
import { ConfigError } from '@/lib/server/errors';
import { maskString } from '@/lib/server/logger';

function loadEnvFiles(): void {
  for (const file of ['.env.local', '.env']) {
    const full = path.join(process.cwd(), file);
    // process.loadEnvFile does not overwrite variables that are already set.
    if (existsSync(full)) process.loadEnvFile(full);
  }
}

async function main(): Promise<void> {
  loadEnvFiles();
  const env = getEnv();
  const db = await getDb();
  const result = getLastMigrationResult() ?? { applied: [], alreadyApplied: [] };
  const target = db.kind === 'postgres' ? 'PostgreSQL (DATABASE_URL)' : `PGlite (${env.PGLITE_DATA_DIR})`;
  console.log(`Databaza: ${target}`);
  console.log(`Migrime të aplikuara tani: ${result.applied.length}`);
  for (const id of result.applied) console.log(`  + ${id}`);
  console.log(`Migrime të aplikuara më parë: ${result.alreadyApplied.length}`);
  for (const id of result.alreadyApplied) console.log(`  ✓ ${id}`);
  await closeDb();
}

main().catch(async (err: unknown) => {
  if (err instanceof ConfigError) {
    console.error(err.messageSq);
  } else {
    console.error('Migrimi dështoi:', err instanceof Error ? maskString(`${err.name}: ${err.message}`) : 'gabim i panjohur');
  }
  await closeDb().catch(() => undefined);
  process.exitCode = 1;
});
