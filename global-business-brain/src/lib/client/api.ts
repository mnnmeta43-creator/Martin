/**
 * Klienti i API-së për komponentët e shfletuesit (browser-side API client).
 * All mutations go through same-origin JSON routes under /api. Error bodies have the shape
 * { error: { code: string, messageSq: string, details?: unknown } }.
 */
export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; code: string; messageSq: string };

export async function apiFetch<T>(path: string, init: { method?: string; body?: unknown; signal?: AbortSignal } = {}): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: init.method ?? (init.body === undefined ? 'GET' : 'POST'),
      headers: init.body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      credentials: 'same-origin',
      signal: init.signal,
    });
  } catch {
    return {
      ok: false,
      status: 0,
      code: 'network',
      messageSq: 'Nuk u arrit lidhja me serverin. Kontrolloni internetin dhe provoni sërish.',
    };
  }
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  if (!res.ok) {
    const err = (body as { error?: { code?: string; messageSq?: string } } | null)?.error;
    return {
      ok: false,
      status: res.status,
      code: err?.code ?? `http_${res.status}`,
      messageSq: err?.messageSq ?? (res.status === 429 ? 'Shumë kërkesa. Prisni pak dhe provoni sërish.' : 'Ndodhi një gabim. Provoni sërish.'),
    };
  }
  return { ok: true, data: body as T };
}
