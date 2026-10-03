// HTTP client: retries with backoff, Retry-After, timeout, error classification, per-host limiter.
import { describe, expect, it, vi } from 'vitest';
import { fetchJson, HostRateLimiter, parseRetryAfter, probeUrl, safeUrl, SourceError, USER_AGENT } from '@/lib/data/http';
import { createFakeFetch, jsonResponse, textResponse } from '../../fixtures/data/fakeFetch';

const URL_A = 'https://example.test/api/data';

function recordingSleep() {
  const delays: number[] = [];
  const sleep = async (ms: number) => {
    delays.push(ms);
  };
  return { delays, sleep };
}

async function catchError(p: Promise<unknown>): Promise<SourceError> {
  try {
    await p;
  } catch (err) {
    expect(err).toBeInstanceOf(SourceError);
    return err as SourceError;
  }
  throw new Error('expected a SourceError');
}

describe('fetchJson', () => {
  it('returns parsed JSON and identifies itself with the app User-Agent', async () => {
    let headers: Headers | null = null;
    const fetchImpl = createFakeFetch([
      (_url, init) => {
        headers = new Headers(init?.headers);
        return jsonResponse({ ok: 1 });
      },
    ]);
    await expect(fetchJson(URL_A, { fetchImpl })).resolves.toEqual({ ok: 1 });
    expect(headers!.get('user-agent')).toBe(USER_AGENT);
    expect(USER_AGENT).toBe('GlobalBusinessBrain/0.1');
  });

  it('retries 5xx with exponential backoff (deterministic with an injected sleep)', async () => {
    let n = 0;
    const fetchImpl = createFakeFetch([() => (++n < 3 ? textResponse('down', 503) : jsonResponse([1]))]);
    const { delays, sleep } = recordingSleep();
    await expect(fetchJson(URL_A, { fetchImpl, sleep })).resolves.toEqual([1]);
    expect(fetchImpl.calls).toHaveLength(3);
    expect(delays).toEqual([500, 1000]);
  });

  it('adds jitter from the injected random source', async () => {
    let n = 0;
    const fetchImpl = createFakeFetch([() => (++n < 2 ? textResponse('down', 502) : jsonResponse({}))]);
    const { delays, sleep } = recordingSleep();
    await fetchJson(URL_A, { fetchImpl, sleep, random: () => 0.5 });
    expect(delays).toEqual([750]);
  });

  it('honours Retry-After in seconds on 429', async () => {
    let n = 0;
    const fetchImpl = createFakeFetch([() => (++n === 1 ? textResponse('slow down', 429, { 'Retry-After': '7' }) : jsonResponse({}))]);
    const { delays, sleep } = recordingSleep();
    await fetchJson(URL_A, { fetchImpl, sleep });
    expect(delays).toEqual([7000]);
  });

  it('honours Retry-After as an HTTP date and caps very long waits', async () => {
    const now = Date.parse('2026-10-02T12:00:00Z');
    let n = 0;
    const fetchImpl = createFakeFetch([
      () => {
        n++;
        if (n === 1) return textResponse('x', 503, { 'Retry-After': 'Fri, 02 Oct 2026 12:00:30 GMT' });
        if (n === 2) return textResponse('x', 503, { 'Retry-After': '3600' });
        return jsonResponse({});
      },
    ]);
    const { delays, sleep } = recordingSleep();
    await fetchJson(URL_A, { fetchImpl, sleep, nowMs: () => now, maxRetryAfterMs: 60_000 });
    expect(delays).toEqual([30_000, 60_000]);
  });

  it('gives up after the configured retries with an Albanian message', async () => {
    const fetchImpl = createFakeFetch([() => textResponse('boom', 500)]);
    const { sleep } = recordingSleep();
    const err = await catchError(fetchJson(URL_A, { fetchImpl, sleep, retries: 3 }));
    expect(fetchImpl.calls).toHaveLength(4);
    expect(err.kind).toBe('http');
    expect(err.status).toBe(500);
    expect(err.messageSq).toContain('gabim serveri');
    expect(err.messageSq).toContain('U provua 4 herë');
  });

  it('does not retry other 4xx responses', async () => {
    const fetchImpl = createFakeFetch([() => textResponse('nope', 404)]);
    const { delays, sleep } = recordingSleep();
    const err = await catchError(fetchJson(URL_A, { fetchImpl, sleep }));
    expect(fetchImpl.calls).toHaveLength(1);
    expect(delays).toEqual([]);
    expect(err.kind).toBe('http');
    expect(err.status).toBe(404);
  });

  it('classifies 403 (proxy / egress policy) as blocked, without retrying', async () => {
    const fetchImpl = createFakeFetch([() => textResponse('forbidden', 403)]);
    const { sleep } = recordingSleep();
    const err = await catchError(fetchJson('https://api.worldbank.org/v2/country', { fetchImpl, sleep }));
    expect(fetchImpl.calls).toHaveLength(1);
    expect(err.kind).toBe('blocked');
    expect(err.status).toBe(403);
    expect(err.messageSq).toContain('u bllokua');
    expect(err.messageSq).toContain('api.worldbank.org');
  });

  it('times out with AbortController and reports kind "timeout"', async () => {
    const fetchImpl = ((_url: string, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
      })) as typeof fetch;
    const err = await catchError(fetchJson(URL_A, { fetchImpl, timeoutMs: 20, retries: 0 }));
    expect(err.kind).toBe('timeout');
    expect(err.messageSq).toContain('nuk u përgjigj');
  });

  it('retries network errors and then reports kind "network"', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('fetch failed');
    }) as unknown as typeof fetch;
    const { delays, sleep } = recordingSleep();
    const err = await catchError(fetchJson(URL_A, { fetchImpl, sleep, retries: 2 }));
    expect(err.kind).toBe('network');
    expect(delays).toEqual([500, 1000]);
  });

  it('reports invalid JSON as "parse" and an empty body as "empty", without retrying', async () => {
    const bad = createFakeFetch([() => textResponse('<html>oops</html>')]);
    const empty = createFakeFetch([() => textResponse('  ')]);
    const { sleep } = recordingSleep();
    expect((await catchError(fetchJson(URL_A, { fetchImpl: bad, sleep }))).kind).toBe('parse');
    expect((await catchError(fetchJson(URL_A, { fetchImpl: empty, sleep }))).kind).toBe('empty');
    expect(bad.calls).toHaveLength(1);
  });
});

describe('parseRetryAfter', () => {
  it('reads seconds and HTTP dates, and ignores garbage', () => {
    const now = Date.parse('2026-10-02T12:00:00Z');
    expect(parseRetryAfter('120', now)).toBe(120_000);
    expect(parseRetryAfter('Fri, 02 Oct 2026 12:01:00 GMT', now)).toBe(60_000);
    expect(parseRetryAfter('Fri, 02 Oct 2026 11:00:00 GMT', now)).toBe(0);
    expect(parseRetryAfter('soon', now)).toBeNull();
    expect(parseRetryAfter(null, now)).toBeNull();
  });
});

describe('safeUrl', () => {
  it('redacts credential-like query parameters', () => {
    expect(safeUrl('https://x.test/a?api_key=SECRET&q=1')).toBe('https://x.test/a?api_key=REDACTED&q=1');
    expect(safeUrl('https://x.test/a?format=json')).toBe('https://x.test/a?format=json');
  });
});

describe('HostRateLimiter', () => {
  it('runs one request per host at a time and spaces starts by the minimum interval', async () => {
    let clock = 0;
    const waits: number[] = [];
    const limiter = new HostRateLimiter({
      minIntervalMs: 300,
      now: () => clock,
      sleep: async (ms) => {
        waits.push(ms);
        clock += ms;
      },
    });
    let active = 0;
    let maxActive = 0;
    const task = async () => {
      active++;
      maxActive = Math.max(maxActive, active);
      await Promise.resolve();
      clock += 10;
      active--;
    };
    await Promise.all([limiter.schedule('https://a.test/1', task), limiter.schedule('https://a.test/2', task), limiter.schedule('https://a.test/3', task)]);
    expect(maxActive).toBe(1);
    expect(waits).toEqual([290, 290]);
  });

  it('lets different hosts proceed independently', async () => {
    const limiter = new HostRateLimiter({ minIntervalMs: 300, sleep: async () => undefined });
    let active = 0;
    let maxActive = 0;
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const task = async () => {
      active++;
      maxActive = Math.max(maxActive, active);
      await gate;
      active--;
    };
    const both = Promise.all([limiter.schedule('https://a.test/x', task), limiter.schedule('https://b.test/x', task)]);
    await new Promise((r) => setTimeout(r, 5));
    release();
    await both;
    expect(maxActive).toBe(2);
  });
});

describe('probeUrl', () => {
  it('falls back to GET when HEAD is not allowed', async () => {
    const methods: string[] = [];
    const fetchImpl = createFakeFetch([
      (_url, init) => {
        methods.push(init?.method ?? 'GET');
        return init?.method === 'HEAD' ? textResponse('', 405) : textResponse('ok', 200);
      },
    ]);
    const r = await probeUrl('https://example.test', { fetchImpl });
    expect(methods).toEqual(['HEAD', 'GET']);
    expect(r.ok).toBe(true);
    expect(r.method).toBe('GET');
  });

  it('reports 403 as blocked with an Albanian explanation', async () => {
    const fetchImpl = createFakeFetch([() => textResponse('', 403)]);
    const r = await probeUrl('https://example.test', { fetchImpl });
    expect(r.kind).toBe('blocked');
    expect(r.messageSq).toContain('bllokua');
  });
});
