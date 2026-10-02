/**
 * Pjesët e përbashkëta të mjeteve të asistentit: mjedisi i ekzekutimit, gabimet e lejuara për
 * modelin dhe formatuesit e vlerave.
 *
 * Handlers return plain JSON-serialisable data. Every value a handler shows comes from the
 * deterministic engines or from stored data; a handler never estimates. Formatted strings (`…Sq`)
 * are included next to raw numbers so the model can quote them instead of rounding by itself.
 */
import type { AssistantReply, Citation, CurrencyCode, Project, BusinessArchetype } from '@/lib/domain/types';
import { formatMoney, formatNumber } from '@/lib/finance/format';
import type { AssistantContext } from '@/lib/ai/context';

export type AssistantCalculation = NonNullable<AssistantReply['calculations']>[number];

export interface ToolEnv {
  ctx: AssistantContext;
  /** Registers a citation for this reply and returns its id ("c3"); null when there is nothing to cite. */
  cite: (citation: Citation | null | undefined) => string | null;
  addCalculation: (calculation: AssistantCalculation) => void;
}

/** An expected failure whose Albanian message is safe to show to the model and the user. */
export class ToolError extends Error {
  constructor(public readonly messageSq: string) {
    super(messageSq);
    this.name = 'ToolError';
  }
}

export const NO_PROJECT_SQ = 'Asnjë projekt nuk është zgjedhur. Zgjidhni ose ruani një projekt që të përdoret ky mjet.';

export function requireProject(ctx: AssistantContext): Project {
  if (!ctx.project) throw new ToolError(NO_PROJECT_SQ);
  return ctx.project;
}

export function requireArchetype(ctx: AssistantContext): BusinessArchetype {
  if (!ctx.archetype) throw new ToolError('Ideja e këtij projekti nuk gjendet më në bibliotekën e aplikacionit.');
  return ctx.archetype;
}

/** Whole currency units: enough precision for chat answers about totals. */
export function moneySq(value: number | null | undefined, currency: CurrencyCode): string {
  return formatMoney(value, currency, { decimals: 0 });
}

export function signedMoneySq(value: number | null | undefined, currency: CurrencyCode): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return formatMoney(null, currency);
  return `${value > 0 ? '+' : ''}${moneySq(value, currency)}`;
}

export function signedNumberSq(value: number, decimals?: number): string {
  return `${value > 0 ? '+' : ''}${formatNumber(value, decimals)}`;
}

/** Keeps a list short for the model while saying how many items were left out. */
export function capList<T>(items: readonly T[], max: number): { items: T[]; omitted: number } {
  return { items: items.slice(0, max), omitted: Math.max(0, items.length - max) };
}
