/**
 * Ndihmës për rrugët API (route handler helpers on the web Request/Response APIs).
 *
 * - JSON responses with the error shape the browser client expects:
 *   { error: { code, messageSq, details? } }.
 * - `parseJsonBody`: Content-Type check, 256 KB streaming limit, JSON parse, zod validation with
 *   Albanian issue summaries.
 * - `assertSameOrigin`: CSRF defence for state-changing requests.
 * - `handleRoute`: maps thrown errors to responses and logs unexpected ones (method + path +
 *   redacted error only; request bodies are never logged).
 */
import { ZodError, type z } from 'zod';
import { getEnv } from '@/lib/server/env';
import { HttpError } from '@/lib/server/errors';
import { logger } from '@/lib/server/logger';
import { summarizeZodIssues } from '@/lib/validation/messages';

export const MAX_BODY_BYTES = 256 * 1024;

const NO_STORE = { 'Cache-Control': 'no-store' };

function withNoStore(init?: ResponseInit): ResponseInit {
  const headers = new Headers(init?.headers);
  if (!headers.has('Cache-Control')) headers.set('Cache-Control', NO_STORE['Cache-Control']);
  return { ...init, headers };
}

export function jsonOk<T>(data: T, init?: ResponseInit): Response {
  return Response.json(data, withNoStore(init));
}

export function jsonError(status: number, code: string, messageSq: string, details?: unknown, init?: ResponseInit): Response {
  const error: { code: string; messageSq: string; details?: unknown } = { code, messageSq };
  if (details !== undefined) error.details = details;
  return Response.json({ error }, withNoStore({ ...init, status }));
}

export const MESSAGES_SQ = {
  internal: 'Ndodhi një gabim i papritur në server. Provoni sërish pas pak.',
  invalidJson: 'Të dhënat e dërguara nuk janë JSON i vlefshëm.',
  tooLarge: 'Kërkesa është shumë e madhe (kufiri është 256 KB).',
  unsupportedMediaType: 'Kërkesa duhet të dërgohet si JSON (Content-Type: application/json).',
  validation: 'Disa fusha nuk janë të vlefshme. Kontrolloni të dhënat dhe provoni sërish.',
  origin: 'Kërkesa u refuzua: origjina e saj nuk përputhet me aplikacionin.',
} as const;

type BodyRead = { ok: true; text: string } | { ok: false; tooLarge: true };

/** Reads the body as text but stops (and cancels the stream) as soon as it exceeds `limit` bytes. */
async function readBodyLimited(request: Request, limit: number): Promise<BodyRead> {
  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > limit) return { ok: false, tooLarge: true };
  if (!request.body) return { ok: true, text: '' };
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel().catch(() => undefined);
      return { ok: false, tooLarge: true };
    }
    chunks.push(value);
  }
  return { ok: true, text: Buffer.concat(chunks).toString('utf8') };
}

export type ParseResult<T> = { ok: true; data: T } | { ok: false; response: Response };

export function validationErrorResponse(error: ZodError): Response {
  return jsonError(400, 'validim', MESSAGES_SQ.validation, { issues: summarizeZodIssues(error.issues) });
}

export async function parseJsonBody<S extends z.ZodType>(
  request: Request,
  schema: S,
  options: { maxBytes?: number } = {},
): Promise<ParseResult<z.output<S>>> {
  const contentType = request.headers.get('content-type') ?? '';
  if (!/^application\/([a-z0-9.+-]+\+)?json\b/i.test(contentType.trim())) {
    return { ok: false, response: jsonError(415, 'lloj_i_pambeshtetur', MESSAGES_SQ.unsupportedMediaType) };
  }
  const body = await readBodyLimited(request, options.maxBytes ?? MAX_BODY_BYTES);
  if (!body.ok) return { ok: false, response: jsonError(413, 'shume_e_madhe', MESSAGES_SQ.tooLarge) };
  let raw: unknown;
  try {
    raw = JSON.parse(body.text);
  } catch {
    return { ok: false, response: jsonError(400, 'json_i_pavlefshem', MESSAGES_SQ.invalidJson) };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, response: validationErrorResponse(parsed.error) };
  return { ok: true, data: parsed.data };
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function hostOf(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).host.toLowerCase();
  } catch {
    return null;
  }
}

function allowedHosts(request: Request, appUrl: string | undefined): Set<string> {
  const hosts = new Set<string>();
  const add = (h: string | null | undefined) => {
    if (h) hosts.add(h.trim().toLowerCase());
  };
  add(hostOf(request.url));
  add(request.headers.get('host'));
  // A browser cannot set X-Forwarded-Host cross-site without a CORS preflight, so trusting it is safe here.
  add(request.headers.get('x-forwarded-host')?.split(',')[0]);
  add(hostOf(appUrl));
  return hosts;
}

function configuredAppUrl(): string | undefined {
  try {
    return getEnv().APP_URL;
  } catch {
    return undefined;
  }
}

/**
 * CSRF check for state-changing requests. Returns a 403 Response to send, or null when allowed.
 * - Safe methods (GET/HEAD/OPTIONS) pass.
 * - Requests with an Authorization header pass: browsers cannot attach one cross-site without a
 *   CORS preflight (which this app never grants); the route must still verify the credential
 *   (e.g. the cron endpoint checks CRON_SECRET).
 * - Otherwise the Origin host must equal the request host or APP_URL's host. Without Origin,
 *   only Sec-Fetch-Site 'same-origin' or 'none' (typed URL / bookmark) is accepted.
 */
export function assertSameOrigin(request: Request, options: { appUrl?: string } = {}): Response | null {
  if (SAFE_METHODS.has(request.method.toUpperCase())) return null;
  if (request.headers.get('authorization')) return null;
  const origin = request.headers.get('origin');
  if (origin && origin !== 'null') {
    const originHost = hostOf(origin);
    const hosts = allowedHosts(request, options.appUrl ?? configuredAppUrl());
    if (originHost && hosts.has(originHost)) return null;
    return jsonError(403, 'origjine_e_ndaluar', MESSAGES_SQ.origin);
  }
  if (origin === 'null') return jsonError(403, 'origjine_e_ndaluar', MESSAGES_SQ.origin);
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite === 'same-origin' || fetchSite === 'none') return null;
  return jsonError(403, 'origjine_e_ndaluar', MESSAGES_SQ.origin);
}

export interface HandleRouteOptions {
  /** Run `assertSameOrigin` before the handler (default true; it is a no-op for GET/HEAD/OPTIONS). */
  checkOrigin?: boolean;
}

/** Errors carrying an Albanian user-facing message (e.g. domain input errors) are client errors. */
function userFacingError(err: unknown): { status: number; messageSq: string } | null {
  if (typeof err !== 'object' || err === null) return null;
  const { messageSq, status } = err as { messageSq?: unknown; status?: unknown };
  if (typeof messageSq !== 'string' || messageSq.length === 0) return null;
  const clientStatus = typeof status === 'number' && status >= 400 && status < 500 ? status : 400;
  return { status: clientStatus, messageSq };
}

function pathOf(request: Request): string {
  try {
    return new URL(request.url).pathname;
  } catch {
    return '?';
  }
}

export function errorToResponse(err: unknown, request: Request): Response {
  if (err instanceof HttpError) {
    if (err.status >= 500) logger.warn('route.http_error', { method: request.method, path: pathOf(request), code: err.code });
    return jsonError(err.status, err.code, err.messageSq, err.details);
  }
  if (err instanceof ZodError) return validationErrorResponse(err);
  const userFacing = userFacingError(err);
  if (userFacing) return jsonError(userFacing.status, 'kerkese_e_pavlefshme', userFacing.messageSq);
  logger.error('route.unhandled_error', { method: request.method, path: pathOf(request), error: err });
  return jsonError(500, 'gabim_i_brendshem', MESSAGES_SQ.internal);
}

/**
 * Wraps a route handler: optional same-origin check, then error mapping —
 * UnauthorizedError → 401, ConfigError → 503 (Albanian explanation), any HttpError → its status,
 * ZodError → 400 with Albanian issues, other errors → 500 generic message + redacted log.
 */
export function handleRoute<Ctx = unknown>(
  fn: (request: Request, ctx: Ctx) => Promise<Response> | Response,
  options: HandleRouteOptions = {},
): (request: Request, ctx: Ctx) => Promise<Response> {
  const checkOrigin = options.checkOrigin ?? true;
  return async (request: Request, ctx: Ctx) => {
    try {
      if (checkOrigin) {
        const rejected = assertSameOrigin(request);
        if (rejected) return rejected;
      }
      return await fn(request, ctx);
    } catch (err) {
      return errorToResponse(err, request);
    }
  };
}
