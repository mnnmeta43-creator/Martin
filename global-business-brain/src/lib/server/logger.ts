/**
 * Logger i strukturuar me fshehje sekretesh (structured logger with secret redaction).
 *
 * Every log line is one JSON object: { ts, level, message, meta }. Metadata is deep-cloned through
 * `redact()` first, so passwords, tokens, cookies, API keys and connection-string credentials never
 * reach the logs. By design there is no "log the request body" helper: route code logs method,
 * path and error only (auth bodies contain passwords).
 */

export type LogLevel = 'info' | 'warn' | 'error';

export const REDACTED = '[REDACTED]';

const SENSITIVE_KEY = /pass|secret|token|api[-_]?key|authorization|cookie|session/i;
const MAX_DEPTH = 8;
const MAX_STRING = 4000;
const MAX_ARRAY = 100;

/** String patterns that leak secrets even under innocent keys (error messages, URLs, headers). */
const STRING_MASKS: { pattern: RegExp; replace: string }[] = [
  { pattern: /sk-ant-[A-Za-z0-9_-]+/g, replace: `sk-ant-${REDACTED}` },
  { pattern: /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi, replace: `Bearer ${REDACTED}` },
  { pattern: /\bBasic\s+[A-Za-z0-9+/=]{8,}/g, replace: `Basic ${REDACTED}` },
  // scheme://user:pass@host → scheme://[REDACTED]@host (keeps the host for debugging)
  { pattern: /\b([a-z][a-z0-9+.-]*:\/\/)[^\s/@:]+(?::[^\s/@]*)?@/gi, replace: `$1${REDACTED}@` },
  // key=value pairs in query strings or messages
  {
    pattern: /\b((?:pass(?:word)?|secret|token|api[-_]?key|access[-_]?token|session)=)[^&\s"']+/gi,
    replace: `$1${REDACTED}`,
  },
];

export function maskString(input: string): string {
  let out = input.length > MAX_STRING ? `${input.slice(0, MAX_STRING)}…[shkurtuar]` : input;
  for (const { pattern, replace } of STRING_MASKS) out = out.replace(pattern, replace);
  return out;
}

function redactError(err: Error, seen: WeakSet<object>, depth: number): Record<string, unknown> {
  const out: Record<string, unknown> = { name: err.name, message: maskString(err.message) };
  const code = (err as { code?: unknown }).code;
  if (typeof code === 'string' || typeof code === 'number') out.code = code;
  if (err.stack) out.stack = maskString(err.stack.split('\n').slice(0, 8).join('\n'));
  if (err.cause !== undefined) out.cause = redactValue(err.cause, seen, depth + 1);
  return out;
}

function redactValue(value: unknown, seen: WeakSet<object>, depth: number): unknown {
  if (typeof value === 'string') return maskString(value);
  if (value === null || typeof value !== 'object') {
    return typeof value === 'bigint' ? value.toString() : typeof value === 'function' ? '[function]' : value;
  }
  if (depth > MAX_DEPTH) return '[thellësi e tepërt]';
  if (seen.has(value)) return '[Circular]';
  seen.add(value);
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString();
  if (value instanceof Error) return redactError(value, seen, depth);
  if (Array.isArray(value)) {
    const items = value.slice(0, MAX_ARRAY).map((v) => redactValue(v, seen, depth + 1));
    if (value.length > MAX_ARRAY) items.push(`…+${value.length - MAX_ARRAY}`);
    return items;
  }
  const out: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(value)) {
    out[key] = SENSITIVE_KEY.test(key) ? REDACTED : redactValue(v, seen, depth + 1);
  }
  return out;
}

/** Deep clone with sensitive keys replaced by "[REDACTED]" and secret-looking strings masked. */
export function redact<T>(value: T): unknown {
  return redactValue(value, new WeakSet(), 0);
}

export interface Logger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

export interface LoggerOptions {
  sink?: (level: LogLevel, line: string) => void;
  now?: () => Date;
}

const consoleSink = (level: LogLevel, line: string): void => {
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
};

export function createLogger(options: LoggerOptions = {}): Logger {
  const sink = options.sink ?? consoleSink;
  const now = options.now ?? (() => new Date());
  const write = (level: LogLevel, message: string, meta?: Record<string, unknown>): void => {
    const entry: Record<string, unknown> = { ts: now().toISOString(), level, message: maskString(message) };
    if (meta !== undefined) entry.meta = redact(meta);
    let line: string;
    try {
      line = JSON.stringify(entry);
    } catch {
      line = JSON.stringify({ ts: entry.ts, level, message: entry.message, meta: '[pa serializim]' });
    }
    sink(level, line);
  };
  return {
    info: (message, meta) => write('info', message, meta),
    warn: (message, meta) => write('warn', message, meta),
    error: (message, meta) => write('error', message, meta),
  };
}

export const logger: Logger = createLogger();
