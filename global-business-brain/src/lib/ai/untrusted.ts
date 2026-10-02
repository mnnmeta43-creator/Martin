/**
 * Mbështjellja e të dhënave të pabesueshme (untrusted-data wrapper) për promptin e modelit.
 *
 * Tool results, source metadata and anything the user typed into a project (title, notes,
 * evidence) are data, never instructions. They reach the model only inside
 * <untrusted_data source="…">…</untrusted_data>, serialised as JSON with "<", ">" and "&"
 * escaped as \u003c, \u003e, \u0026. The JSON stays valid, but no text inside it can close the
 * wrapper or open a new tag, so injected "instructions" cannot escape the data block.
 */

export const UNTRUSTED_TAG = 'untrusted_data';

function escapeJson(json: string): string {
  return json.replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

function safeSourceLabel(source: string): string {
  return source.replace(/[^a-z0-9_:.-]/gi, '').slice(0, 64) || 'unknown';
}

/** Serialises `payload` inside a delimited block that the system prompt marks as untrusted. */
export function wrapUntrusted(source: string, payload: unknown): string {
  const json = JSON.stringify(payload ?? null) ?? 'null';
  return `<${UNTRUSTED_TAG} source="${safeSourceLabel(source)}">\n${escapeJson(json)}\n</${UNTRUSTED_TAG}>`;
}
