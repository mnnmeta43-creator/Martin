/**
 * Kontrollon nëse faqet e burimeve dhe lidhjet zyrtare janë të arritshme (npm run sources:check).
 *
 * HEAD-checks (falling back to GET) every https homepage and API base in SOURCES and every
 * OFFICIAL_LINKS url, a few hosts at a time with per-host spacing. Meant for environments with
 * open internet access: where an egress policy or proxy blocks a host, the result is reported as
 * BLLOKUAR (HTTP 403/407) rather than as a broken link. It only reads; it changes nothing, and
 * OFFICIAL_LINKS.lastCheckedAt stays null until a person verifies the content of each page.
 */
import { HostRateLimiter, probeUrl, type ProbeResult } from '@/lib/data/http';
import { isExternalUrl, OFFICIAL_LINKS, SOURCES } from '@/lib/data/sources/registry';

interface Target {
  label: string;
  url: string;
}

const CONCURRENCY = 4;

const KIND_LABEL: Record<ProbeResult['kind'], string> = {
  ok: 'OK',
  blocked: 'BLLOKUAR',
  http: 'GABIM HTTP',
  timeout: 'PA PËRGJIGJE',
  network: 'GABIM RRJETI',
};

function targets(): Target[] {
  const list: Target[] = [];
  for (const s of SOURCES) {
    if (isExternalUrl(s.homepageUrl)) list.push({ label: `burim ${s.id} (faqja)`, url: s.homepageUrl });
    if (s.docsUrl && isExternalUrl(s.docsUrl)) list.push({ label: `burim ${s.id} (dokumentimi)`, url: s.docsUrl });
  }
  for (const l of OFFICIAL_LINKS) list.push({ label: `lidhje ${l.countryCode} · ${l.nameSq}`, url: l.url });
  // The same URL can appear under several labels; check it once.
  return [...new Map(list.map((t) => [t.url, t])).values()];
}

async function runPool<T, R>(items: T[], size: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function lane(): Promise<void> {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, lane));
  return results;
}

async function main(): Promise<void> {
  const list = targets();
  const limiter = new HostRateLimiter({ minIntervalMs: 500 });
  console.log(`Po kontrollohen ${list.length} adresa…`);
  const results = await runPool(list, CONCURRENCY, (t) => probeUrl(t.url, { limiter, timeoutMs: 15_000 }));
  results.forEach((r, i) => {
    console.log(`${KIND_LABEL[r.kind].padEnd(13)} ${String(r.status ?? '—').padStart(3)} ${r.method.padEnd(4)} ${list[i].label}\n${' '.repeat(23)}${r.url} — ${r.messageSq}`);
  });
  const count = (k: ProbeResult['kind']) => results.filter((r) => r.kind === k).length;
  console.log('');
  console.log(`OK: ${count('ok')} · Bllokuar: ${count('blocked')} · Gabim HTTP: ${count('http')} · Pa përgjigje: ${count('timeout')} · Gabim rrjeti: ${count('network')}`);
  if (count('blocked') > 0) {
    console.log('Shënim: “BLLOKUAR” zakonisht do të thotë që rrjeti/proxy i këtij mjedisi nuk lejon daljen drejt atij hosti; nuk është domosdoshmërisht lidhje e prishur.');
  }
  if (results.some((r) => r.kind === 'http' || r.kind === 'network')) process.exitCode = 1;
}

main().catch((err: unknown) => {
  console.error('Kontrolli dështoi:', err instanceof Error ? `${err.name}: ${err.message}` : 'gabim i panjohur');
  process.exitCode = 1;
});
