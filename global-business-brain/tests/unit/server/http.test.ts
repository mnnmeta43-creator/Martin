/**
 * Route helpers: JSON responses, body parsing limits, same-origin checks and error mapping.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { ConfigError, EmailTakenError, UnauthorizedError } from '@/lib/server/errors';
import { assertSameOrigin, handleRoute, jsonError, jsonOk, MAX_BODY_BYTES, parseJsonBody } from '@/lib/server/http';
import { registerSchema, scoreWeightsSchema } from '@/lib/validation/schemas';

const URL_BASE = 'https://app.example.invalid';

function post(body: string | undefined, headers: Record<string, string> = {}, path = '/api/x'): Request {
  return new Request(`${URL_BASE}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: URL_BASE, ...headers },
    body,
  });
}

describe('jsonOk / jsonError', () => {
  it('returns JSON with no-store caching and the client error shape', async () => {
    const ok = jsonOk({ a: 1 }, { status: 201 });
    expect(ok.status).toBe(201);
    expect(ok.headers.get('cache-control')).toBe('no-store');
    expect(await ok.json()).toEqual({ a: 1 });

    const err = jsonError(404, 'nuk_u_gjet', 'Projekti nuk u gjet.');
    expect(err.status).toBe(404);
    expect(await err.json()).toEqual({ error: { code: 'nuk_u_gjet', messageSq: 'Projekti nuk u gjet.' } });
  });
});

describe('parseJsonBody', () => {
  const schema = z.object({ name: z.string().min(1) });

  it('parses a valid body', async () => {
    const result = await parseJsonBody(post(JSON.stringify({ name: 'Ana', extra: 1 })), schema);
    expect(result).toEqual({ ok: true, data: { name: 'Ana' } });
  });

  it('rejects a non-JSON content type with 415', async () => {
    const result = await parseJsonBody(post('name=Ana', { 'content-type': 'application/x-www-form-urlencoded' }), schema);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(415);
  });

  it('rejects malformed JSON with 400', async () => {
    const result = await parseJsonBody(post('{"name":'), schema);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(400);
      expect((await result.response.json()).error.code).toBe('json_i_pavlefshem');
    }
  });

  it('rejects bodies over 256 KB with 413, even without a content-length header', async () => {
    const big = JSON.stringify({ name: 'x'.repeat(MAX_BODY_BYTES) });
    const declared = await parseJsonBody(post(big, { 'content-length': String(big.length) }), schema);
    expect(declared.ok).toBe(false);
    if (!declared.ok) expect(declared.response.status).toBe(413);

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const chunk = new TextEncoder().encode('x'.repeat(64 * 1024));
        for (let i = 0; i < 5; i++) controller.enqueue(chunk);
        controller.close();
      },
    });
    const streamed = new Request(`${URL_BASE}/api/x`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: stream,
      duplex: 'half',
    } as RequestInit & { duplex: 'half' });
    const result = await parseJsonBody(streamed, schema);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(413);
  });

  it('summarises validation issues in Albanian', async () => {
    const result = await parseJsonBody(post(JSON.stringify({ email: 'jo-email', password: 'shkurt' })), registerSchema);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(400);
      const body = await result.response.json();
      expect(body.error.code).toBe('validim');
      expect(body.error.details.issues).toEqual([
        { path: 'email', messageSq: 'Adresa e email-it nuk është e vlefshme.' },
        { path: 'password', messageSq: 'Fjalëkalimi duhet të ketë të paktën 10 karaktere.' },
      ]);
    }
  });

  it('translates zod default messages too', async () => {
    const result = await parseJsonBody(post(JSON.stringify({})), schema);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const body = await result.response.json();
      expect(body.error.details.issues).toEqual([{ path: 'name', messageSq: 'Fusha është e detyrueshme.' }]);
    }
  });
});

describe('assertSameOrigin', () => {
  it('lets safe methods through', () => {
    expect(assertSameOrigin(new Request(`${URL_BASE}/api/x`, { headers: { origin: 'https://evil.invalid' } }))).toBeNull();
  });

  it('accepts a matching Origin (request URL, Host header or APP_URL)', () => {
    expect(assertSameOrigin(post('{}'))).toBeNull();
    const behindProxy = new Request('http://internal:3000/api/x', {
      method: 'POST',
      headers: { origin: 'https://public.example.invalid', host: 'public.example.invalid' },
    });
    expect(assertSameOrigin(behindProxy)).toBeNull();
    const viaAppUrl = new Request('http://internal:3000/api/x', { method: 'POST', headers: { origin: 'https://brand.example.invalid' } });
    expect(assertSameOrigin(viaAppUrl, { appUrl: 'https://brand.example.invalid' })).toBeNull();
  });

  it('rejects a foreign or "null" Origin with 403', async () => {
    const res = assertSameOrigin(post('{}', { origin: 'https://evil.invalid' }));
    expect(res?.status).toBe(403);
    expect((await res!.json()).error.messageSq).toContain('origjina');
    expect(assertSameOrigin(post('{}', { origin: 'null' }))?.status).toBe(403);
  });

  it('without Origin accepts only Sec-Fetch-Site same-origin / none', () => {
    const noOrigin = (site?: string) =>
      new Request(`${URL_BASE}/api/x`, { method: 'DELETE', headers: site ? { 'sec-fetch-site': site } : {} });
    expect(assertSameOrigin(noOrigin('same-origin'))).toBeNull();
    expect(assertSameOrigin(noOrigin('none'))).toBeNull();
    expect(assertSameOrigin(noOrigin('cross-site'))?.status).toBe(403);
    expect(assertSameOrigin(noOrigin('same-site'))?.status).toBe(403);
    expect(assertSameOrigin(noOrigin())?.status).toBe(403);
  });

  it('skips the check for requests carrying an Authorization header (not CSRF-able)', () => {
    const cron = new Request(`${URL_BASE}/api/cron/refresh`, { method: 'POST', headers: { authorization: 'Bearer x' } });
    expect(assertSameOrigin(cron)).toBeNull();
  });
});

describe('handleRoute', () => {
  afterEach(() => vi.restoreAllMocks());

  const run = (err: unknown, request = post('{}')) =>
    handleRoute(async (_request: Request) => {
      throw err;
    })(request);

  it('maps UnauthorizedError → 401, ConfigError → 503, EmailTakenError → 409', async () => {
    const unauthorized = await run(new UnauthorizedError());
    expect(unauthorized.status).toBe(401);
    expect((await unauthorized.json()).error.code).toBe('pa_autorizim');

    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const config = await run(new ConfigError('DATABASE_URL mungon.'));
    expect(config.status).toBe(503);
    expect((await config.json()).error.messageSq).toBe('DATABASE_URL mungon.');

    expect((await run(new EmailTakenError())).status).toBe(409);
  });

  it('maps ZodError → 400 with Albanian issues', async () => {
    const parsed = scoreWeightsSchema.safeParse({ kerkesa: 50, kapitali: 50, aftesite: 50, veshtiresia: 0, ekonomia: 0, rreziku: 0 });
    expect(parsed.success).toBe(false);
    const res = await run(parsed.error);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.details.issues[0].messageSq).toContain('100');
  });

  it('maps errors carrying messageSq to 400 and unknown errors to a generic 500 with a redacted log', async () => {
    class DomainInputError extends Error {
      constructor(public readonly messageSq: string) {
        super(messageSq);
      }
    }
    const domain = await run(new DomainInputError('Ideja nuk u gjet.'));
    expect(domain.status).toBe(400);
    expect((await domain.json()).error.messageSq).toBe('Ideja nuk u gjet.');

    const logged: string[] = [];
    vi.spyOn(console, 'error').mockImplementation((line: string) => {
      logged.push(line);
    });
    const res = await run(new Error('lidhja postgres://u:sekret@h/db dështoi'));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.code).toBe('gabim_i_brendshem');
    expect(body.error.messageSq).toContain('gabim i papritur');
    expect(JSON.stringify(body)).not.toContain('sekret');
    expect(logged).toHaveLength(1);
    expect(logged[0]).not.toContain('sekret');
    expect(JSON.parse(logged[0])).toMatchObject({ level: 'error', meta: { method: 'POST', path: '/api/x' } });
  });

  it('runs the same-origin check by default and can opt out', async () => {
    const handler = vi.fn(async (_request: Request) => jsonOk({ ok: true }));
    const foreign = post('{}', { origin: 'https://evil.invalid' });
    expect((await handleRoute(handler)(foreign)).status).toBe(403);
    expect(handler).not.toHaveBeenCalled();
    expect((await handleRoute(handler, { checkOrigin: false })(post('{}', { origin: 'https://evil.invalid' }))).status).toBe(200);
  });

  it('passes the request and the dynamic-route context through unchanged', async () => {
    type Ctx = { params: Promise<{ id: string; taskId: string }> };
    const seen: unknown[] = [];
    const handler = handleRoute(async (request: Request, ctx: Ctx) => {
      seen.push(request);
      const { id, taskId } = await ctx.params;
      return jsonOk({ id, taskId });
    });
    const request = new Request(`${URL_BASE}/api/projects/abc/tasks/t1`);
    const res = await handler(request, { params: Promise.resolve({ id: 'abc', taskId: 't1' }) });
    expect(await res.json()).toEqual({ id: 'abc', taskId: 't1' });
    expect(seen[0]).toBe(request);
  });

  it('works for handlers without arguments and still maps their errors', async () => {
    expect(await (await handleRoute(async () => jsonOk({ ok: 1 }))()).json()).toEqual({ ok: 1 });

    const logged: string[] = [];
    vi.spyOn(console, 'error').mockImplementation((line: string) => {
      logged.push(line);
    });
    const res = await handleRoute(async () => {
      throw new Error('pa kërkesë');
    })();
    expect(res.status).toBe(500);
    expect(JSON.parse(logged[0])).toMatchObject({ level: 'error', meta: { method: '?', path: '?' } });
    expect((await handleRoute(async () => {
      throw new UnauthorizedError();
    })()).status).toBe(401);
  });
});
