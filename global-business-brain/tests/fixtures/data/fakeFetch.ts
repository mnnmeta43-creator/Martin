/**
 * Fake `fetch` for adapter and refresh tests: routes are tried in order and the first one that
 * returns a Response wins; unmatched URLs get a 404 so a wrong URL fails loudly instead of
 * silently reaching the network. Every requested URL is recorded in `calls`.
 */
export type FakeRoute = (url: string, init?: RequestInit) => Response | Promise<Response> | undefined;

export type FakeFetch = typeof fetch & { calls: string[] };

export function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });
}

export function textResponse(body: string, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(body, { status, headers });
}

export function createFakeFetch(routes: FakeRoute[]): FakeFetch {
  const calls: string[] = [];
  const impl = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    calls.push(url);
    for (const route of routes) {
      const res = await route(url, init);
      if (res) return res;
    }
    return textResponse('not found', 404);
  };
  return Object.assign(impl, { calls }) as FakeFetch;
}

/** Route helper: respond when the URL contains `fragment`. */
export function when(fragment: string, respond: (url: string) => Response | Promise<Response>): FakeRoute {
  return (url) => (url.includes(fragment) ? respond(url) : undefined);
}

export const noSleep = async (): Promise<void> => undefined;
