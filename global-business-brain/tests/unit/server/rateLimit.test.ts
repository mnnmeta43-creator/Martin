/**
 * Fixed-window rate limiting on top of the store counter.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Db } from '@/lib/server/db';
import { clientKey, enforceRateLimit, RATE_LIMITS, rateLimit, windowStartMs } from '@/lib/server/rateLimit';
import type { Store } from '@/lib/server/store/types';
import { createMemoryStore } from './helpers';

let ctx: { db: Db; store: Store };

beforeAll(async () => {
  ctx = await createMemoryStore();
});

afterAll(async () => {
  await ctx?.db.close();
});

describe('rateLimit', () => {
  const rule = { limit: 3, windowMs: 60_000 };

  it('allows up to the limit, then blocks with retryAfter until the window ends', async () => {
    const t = new Date('2026-10-02T10:00:15.000Z');
    const results = [];
    for (let i = 0; i < 4; i++) results.push(await rateLimit(ctx.store, 'k:a', rule, t));
    expect(results.map((r) => r.ok)).toEqual([true, true, true, false]);
    expect(results.map((r) => r.remaining)).toEqual([2, 1, 0, 0]);
    expect(results[3].retryAfterSec).toBe(45);
    expect(results[0].retryAfterSec).toBe(0);
  });

  it('starts a fresh window at the boundary and keeps keys independent', async () => {
    const t = new Date('2026-10-02T11:00:59.000Z');
    for (let i = 0; i < 3; i++) await rateLimit(ctx.store, 'k:b', rule, t);
    expect((await rateLimit(ctx.store, 'k:b', rule, t)).ok).toBe(false);
    expect((await rateLimit(ctx.store, 'k:c', rule, t)).ok).toBe(true);
    const next = await rateLimit(ctx.store, 'k:b', rule, new Date('2026-10-02T11:01:00.000Z'));
    expect(next).toEqual({ ok: true, remaining: 2, retryAfterSec: 0 });
  });

  it('aligns windows to the epoch', () => {
    expect(windowStartMs(new Date('2026-10-02T10:07:30.000Z'), 10 * 60_000)).toBe(Date.parse('2026-10-02T10:00:00.000Z'));
  });

  it('exports the documented default rules', () => {
    expect(RATE_LIMITS).toEqual({
      auth: { limit: 10, windowMs: 600_000 },
      loginEmail: { limit: 10, windowMs: 3_600_000 },
      guest: { limit: 20, windowMs: 600_000 },
      assistant: { limit: 30, windowMs: 600_000 },
      assistantIp: { limit: 60, windowMs: 600_000 },
      assistantGlobal: { limit: 3000, windowMs: 86_400_000 },
      export: { limit: 20, windowMs: 600_000 },
      write: { limit: 120, windowMs: 600_000 },
      refresh: { limit: 3, windowMs: 3_600_000 },
    });
  });

  it('enforceRateLimit returns an Albanian 429 with Retry-After once exceeded', async () => {
    const t = new Date('2026-10-02T12:00:00.000Z');
    for (let i = 0; i < RATE_LIMITS.refresh.limit; i++) expect(await enforceRateLimit(ctx.store, 'refresh', 'ip-1', t)).toBeNull();
    const res = await enforceRateLimit(ctx.store, 'refresh', 'ip-1', t);
    expect(res?.status).toBe(429);
    expect(res?.headers.get('Retry-After')).toBe('3600');
    const body = await res!.json();
    expect(body.error.code).toBe('shume_kerkesa');
    expect(body.error.messageSq).toContain('Shumë kërkesa');
  });
});

describe('clientKey', () => {
  const req = (headers: Record<string, string>) => new Request('https://app.example.invalid/api/x', { headers });

  it('uses x-real-ip, then the right-most (proxy-appended) x-forwarded-for address, then "unknown"', () => {
    expect(clientKey(req({ 'x-forwarded-for': ' 203.0.113.7 , 10.0.0.1', 'x-real-ip': '198.51.100.1' }))).toBe('198.51.100.1');
    expect(clientKey(req({ 'x-forwarded-for': ' 203.0.113.7 , 10.0.0.1' }))).toBe('10.0.0.1');
    expect(clientKey(req({ 'x-real-ip': '198.51.100.1' }))).toBe('198.51.100.1');
    expect(clientKey(req({}))).toBe('unknown');
    expect(clientKey(req({ 'x-forwarded-for': 'a'.repeat(500) }))).toHaveLength(64);
  });
});

describe('clientKey trusts only platform-set addresses', () => {
  it('prefers x-nf-client-connection-ip and ignores the client-chosen left-most x-forwarded-for entry', async () => {
    const { clientKey } = await import('@/lib/server/rateLimit');
    const spoofed = new Request('https://app.test/api/x', { headers: { 'x-forwarded-for': '1.2.3.4, 10.0.0.9' } });
    expect(clientKey(spoofed)).toBe('10.0.0.9');
    const netlify = new Request('https://app.test/api/x', {
      headers: { 'x-forwarded-for': '1.2.3.4, 10.0.0.9', 'x-nf-client-connection-ip': '203.0.113.7' },
    });
    expect(clientKey(netlify)).toBe('203.0.113.7');
  });
});
