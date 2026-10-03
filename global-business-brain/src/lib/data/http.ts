/**
 * Klienti HTTP për burimet e të dhënave: JSON me timeout, riprovime dhe kufizim sipas hostit.
 *
 * Every source adapter goes through `fetchJson` so retries, backoff, Retry-After handling and
 * error classification behave the same for every source. Errors are `SourceError`s that carry
 * an Albanian message safe to store in the fetch log (no secrets, no stack traces).
 * Tests inject `fetchImpl` and `sleep`, so nothing here ever needs the real network or clock.
 */

export const USER_AGENT = 'GlobalBusinessBrain/0.1';

export type SourceErrorKind = 'http' | 'timeout' | 'parse' | 'network' | 'blocked' | 'empty';

export interface SourceErrorInit {
  kind: SourceErrorKind;
  url: string;
  messageSq: string;
  status?: number;
  message?: string;
  cause?: unknown;
}

/** A failed request or an unusable payload from a data source. */
export class SourceError extends Error {
  readonly kind: SourceErrorKind;
  readonly status?: number;
  readonly url: string;
  readonly messageSq: string;

  constructor(init: SourceErrorInit) {
    super(init.message ?? `${init.kind}${init.status ? ` ${init.status}` : ''}: ${safeUrl(init.url)}`, {
      cause: init.cause,
    });
    this.name = 'SourceError';
    this.kind = init.kind;
    this.url = safeUrl(init.url);
    this.messageSq = init.messageSq;
    if (init.status !== undefined) this.status = init.status;
  }
}

export function isSourceError(err: unknown): err is SourceError {
  return err instanceof SourceError;
}

// Query parameters that could carry credentials; stripped before a URL reaches a log or message.
const SENSITIVE_PARAMS = /^(api[-_]?key|key|token|access[-_]?token|secret|signature|subscription-key)$/i;

/** URL with credential-like query parameters redacted, for logs and error messages. */
export function safeUrl(url: string): string {
  try {
    const u = new URL(url);
    for (const name of [...u.searchParams.keys()]) {
      if (SENSITIVE_PARAMS.test(name)) u.searchParams.set(name, 'REDACTED');
    }
    return u.toString();
  } catch {
    return url;
  }
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

const realSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// ─────────────────────────────────────────────────────────────────────────────
// Per-host rate limiting
// ─────────────────────────────────────────────────────────────────────────────

export interface HostRateLimiterOptions {
  /** Minimum time between the starts of two requests to the same host (default 300 ms). */
  minIntervalMs?: number;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
}

/**
 * Serialises requests per host (max 1 in flight) and spaces their starts by `minIntervalMs`,
 * so a refresh of dozens of indicators stays polite towards public APIs without hard limits.
 */
export class HostRateLimiter {
  private readonly minIntervalMs: number;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly now: () => number;
  private readonly tails = new Map<string, Promise<void>>();
  private readonly lastStart = new Map<string, number>();

  constructor(opts: HostRateLimiterOptions = {}) {
    this.minIntervalMs = opts.minIntervalMs ?? 300;
    this.sleep = opts.sleep ?? realSleep;
    this.now = opts.now ?? Date.now;
  }

  async schedule<T>(url: string, task: () => Promise<T>): Promise<T> {
    const host = hostOf(url);
    const previous = this.tails.get(host) ?? Promise.resolve();
    let release!: () => void;
    const done = new Promise<void>((resolve) => {
      release = resolve;
    });
    const tail = previous.then(() => done);
    this.tails.set(host, tail);
    await previous;
    try {
      const last = this.lastStart.get(host);
      const wait = last === undefined ? 0 : last + this.minIntervalMs - this.now();
      if (wait > 0) await this.sleep(wait);
      this.lastStart.set(host, this.now());
      return await task();
    } finally {
      release();
      if (this.tails.get(host) === tail) this.tails.delete(host);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// fetchJson
// ─────────────────────────────────────────────────────────────────────────────

export interface FetchJsonOptions {
  fetchImpl?: typeof fetch;
  timeoutMs?: number; // default 20000
  retries?: number; // default 3 (so up to 4 attempts)
  sleep?: (ms: number) => Promise<void>;
  limiter?: HostRateLimiter;
  headers?: Record<string, string>;
  /** First backoff step (default 500 ms); doubles on every retry. */
  baseDelayMs?: number;
  /** Upper bound for a server-requested Retry-After wait (default 60 s). */
  maxRetryAfterMs?: number;
  /** Jitter source in [0, 1). Defaults to 0 when `sleep` is injected, so tests get exact delays. */
  random?: () => number;
  /** Clock (epoch ms) used to interpret an HTTP-date Retry-After. */
  nowMs?: () => number;
}

const DEFAULT_TIMEOUT_MS = 20_000;
const DEFAULT_RETRIES = 3;
const DEFAULT_BASE_DELAY_MS = 500;
const DEFAULT_MAX_RETRY_AFTER_MS = 60_000;

type Attempt<T> = { ok: true; value: T } | { ok: false; error: SourceError; retryable: boolean; retryAfterMs: number | null };

/** Parses Retry-After as delta-seconds or an HTTP date; null when absent or unreadable. */
export function parseRetryAfter(value: string | null, nowMs: number): number | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) return Number(trimmed) * 1000;
  const at = Date.parse(trimmed);
  if (!Number.isFinite(at)) return null;
  return Math.max(0, at - nowMs);
}

function httpError(url: string, status: number): SourceError {
  const host = hostOf(url);
  if (status === 403 || status === 407) {
    return new SourceError({
      kind: 'blocked',
      url,
      status,
      messageSq: `Qasja te burimi (${host}) u bllokua (HTTP ${status}). Ka gjasa që rrjeti, proxy-ja ose politika e daljes së këtij mjedisi ta bllokojë këtë adresë; provojeni nga një mjedis me qasje të lirë në internet.`,
    });
  }
  if (status === 429) {
    return new SourceError({
      kind: 'http',
      url,
      status,
      messageSq: `Burimi (${host}) kufizoi numrin e kërkesave (HTTP 429). Provoni përsëri më vonë.`,
    });
  }
  if (status >= 500) {
    return new SourceError({
      kind: 'http',
      url,
      status,
      messageSq: `Burimi (${host}) ktheu gabim serveri (HTTP ${status}).`,
    });
  }
  return new SourceError({
    kind: 'http',
    url,
    status,
    messageSq: `Burimi (${host}) e refuzoi kërkesën (HTTP ${status}).`,
  });
}

function isAbortError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { name?: string }).name === 'AbortError';
}

async function attemptOnce<T>(url: string, opts: FetchJsonOptions, nowMs: () => number): Promise<Attempt<T>> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const host = hostOf(url);
  try {
    const res = await fetchImpl(url, {
      method: 'GET',
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json', ...opts.headers },
      signal: controller.signal,
    });
    if (!res.ok) {
      const retryable = res.status === 429 || res.status >= 500;
      const retryAfterMs = retryable ? parseRetryAfter(res.headers.get('retry-after'), nowMs()) : null;
      return { ok: false, error: httpError(url, res.status), retryable, retryAfterMs };
    }
    const text = await res.text();
    if (text.trim() === '') {
      const error = new SourceError({ kind: 'empty', url, status: res.status, messageSq: `Burimi (${host}) ktheu përgjigje bosh.` });
      return { ok: false, error, retryable: false, retryAfterMs: null };
    }
    try {
      return { ok: true, value: JSON.parse(text) as T };
    } catch (cause) {
      const error = new SourceError({
        kind: 'parse',
        url,
        status: res.status,
        cause,
        messageSq: `Përgjigjja e burimit (${host}) nuk ishte JSON i vlefshëm.`,
      });
      return { ok: false, error, retryable: false, retryAfterMs: null };
    }
  } catch (cause) {
    if (controller.signal.aborted || isAbortError(cause)) {
      const error = new SourceError({
        kind: 'timeout',
        url,
        cause,
        messageSq: `Burimi (${host}) nuk u përgjigj brenda ${Math.round(timeoutMs / 1000)} sekondave.`,
      });
      return { ok: false, error, retryable: true, retryAfterMs: null };
    }
    const error = new SourceError({
      kind: 'network',
      url,
      cause,
      messageSq: `Lidhja me burimin (${host}) dështoi (gabim rrjeti).`,
    });
    return { ok: false, error, retryable: true, retryAfterMs: null };
  } finally {
    clearTimeout(timer);
  }
}

function withAttemptCount(error: SourceError, attempts: number): SourceError {
  if (attempts <= 1) return error;
  return new SourceError({
    kind: error.kind,
    url: error.url,
    status: error.status,
    cause: error.cause,
    message: error.message,
    messageSq: `${error.messageSq} U provua ${attempts} herë.`,
  });
}

/**
 * GET a JSON document. Retries network errors, timeouts, 429 and 5xx with exponential backoff
 * plus jitter (honouring Retry-After); never retries other 4xx. Throws `SourceError`.
 */
export async function fetchJson<T = unknown>(url: string, opts: FetchJsonOptions = {}): Promise<T> {
  const retries = Math.max(0, opts.retries ?? DEFAULT_RETRIES);
  const sleep = opts.sleep ?? realSleep;
  const random = opts.random ?? (opts.sleep ? () => 0 : Math.random);
  const nowMs = opts.nowMs ?? Date.now;
  const baseDelay = opts.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
  const maxRetryAfter = opts.maxRetryAfterMs ?? DEFAULT_MAX_RETRY_AFTER_MS;

  for (let attempt = 0; ; attempt++) {
    const run = () => attemptOnce<T>(url, opts, nowMs);
    const result = opts.limiter ? await opts.limiter.schedule(url, run) : await run();
    if (result.ok) return result.value;
    if (!result.retryable || attempt >= retries) throw withAttemptCount(result.error, attempt + 1);
    const backoff = baseDelay * 2 ** attempt + Math.floor(random() * baseDelay);
    const delay = result.retryAfterMs !== null ? Math.min(result.retryAfterMs, maxRetryAfter) : backoff;
    // Sleep outside the limiter so a long wait does not hold the host slot for other scopes.
    await sleep(delay);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Reachability probe (used by scripts/check-sources.ts)
// ─────────────────────────────────────────────────────────────────────────────

export interface ProbeResult {
  url: string;
  ok: boolean;
  status: number | null;
  kind: 'ok' | 'blocked' | 'http' | 'timeout' | 'network';
  method: 'HEAD' | 'GET';
  messageSq: string;
}

export interface ProbeOptions {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  limiter?: HostRateLimiter;
}

async function probeOnce(url: string, method: 'HEAD' | 'GET', opts: ProbeOptions): Promise<ProbeResult> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 15_000);
  try {
    const res = await fetchImpl(url, {
      method,
      headers: { 'User-Agent': USER_AGENT },
      redirect: 'follow',
      signal: controller.signal,
    });
    // Do not download page bodies: only the status matters here.
    await res.body?.cancel().catch(() => undefined);
    if (res.ok) return { url, ok: true, status: res.status, kind: 'ok', method, messageSq: `Në rregull (HTTP ${res.status}).` };
    const err = httpError(url, res.status);
    return { url, ok: false, status: res.status, kind: err.kind === 'blocked' ? 'blocked' : 'http', method, messageSq: err.messageSq };
  } catch (cause) {
    if (controller.signal.aborted || isAbortError(cause)) {
      return { url, ok: false, status: null, kind: 'timeout', method, messageSq: 'Faqja nuk u përgjigj në kohë.' };
    }
    return { url, ok: false, status: null, kind: 'network', method, messageSq: 'Lidhja dështoi (gabim rrjeti ose DNS).' };
  } finally {
    clearTimeout(timer);
  }
}

/** HEAD-checks a URL, falling back to GET when the server does not support HEAD. */
export async function probeUrl(url: string, opts: ProbeOptions = {}): Promise<ProbeResult> {
  const run = (method: 'HEAD' | 'GET') => {
    const task = () => probeOnce(url, method, opts);
    return opts.limiter ? opts.limiter.schedule(url, task) : task();
  };
  const head = await run('HEAD');
  if (head.ok || head.kind === 'blocked' || head.kind === 'timeout') return head;
  // Many sites answer HEAD with 404/405/501 while GET works; only then is a second request worth it.
  if (head.status === 404 || head.status === 405 || head.status === 501 || head.kind === 'network') return run('GET');
  return head;
}
