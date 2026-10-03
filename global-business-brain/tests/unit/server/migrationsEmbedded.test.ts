import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { EMBEDDED_MIGRATIONS } from '@/lib/server/migrations.generated';

describe('embedded migrations', () => {
  it('match db/migrations/*.sql exactly (run `npx tsx scripts/embed-migrations.ts` after editing SQL)', () => {
    const dir = path.join(process.cwd(), 'db', 'migrations');
    const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
    expect(EMBEDDED_MIGRATIONS.map((m) => m.id)).toEqual(files);
    for (const m of EMBEDDED_MIGRATIONS) expect(m.sql).toBe(readFileSync(path.join(dir, m.id), 'utf8'));
  });
});
