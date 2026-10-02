/**
 * Mjetet e asistentit (tool use): skemat, përshkrimet për modelin dhe ekzekutimi i validuar.
 *
 * Each tool has a zod schema (the JSON schema sent to Claude is generated from it, so the two can
 * never drift) and a deterministic handler that reads the assistant context and returns
 * `{ data, citations }`. Citations are numbered reply-wide ([c1], [c2] …) by the registry, and
 * the handler's data references them by id. Inputs are validated before any handler runs; a
 * failed validation or an unknown tool becomes an error result the model can recover from.
 */
import { z } from 'zod';
import type { BetaTool } from '@anthropic-ai/sdk/resources/beta/messages/messages';
import type { Citation } from '@/lib/domain/types';
import { logger } from '@/lib/server/logger';
import type { AssistantContext } from '@/lib/ai/context';
import { CitationCollector, type CitationRegistry } from '@/lib/ai/citations';
import { wrapUntrusted } from '@/lib/ai/untrusted';
import { NO_PROJECT_SQ, ToolError, type AssistantCalculation, type ToolEnv } from '@/lib/ai/handlers/shared';
import { adaptToCapital, runFinancialScenario } from '@/lib/ai/handlers/finance';
import { compareCountry, getCountryIndicators } from '@/lib/ai/handlers/country';
import { getProfile, getProjectSummary, listTasksDue, listWeakestAssumptions } from '@/lib/ai/handlers/project';

const pct = (what: string) => z.number().min(-100).max(1000).optional().describe(`Percentage change of ${what}, e.g. 20 for +20%, -10 for -10%.`);

export const TOOL_SCHEMAS = {
  get_profile: z.object({}),
  get_project_summary: z.object({}),
  get_country_indicators: z.object({
    countryCode: z
      .string()
      .min(2)
      .max(80)
      .optional()
      .describe('ISO 3166-1 alpha-3 code (Kosovo = XKX) or the country name in Albanian or English. Defaults to the project country.'),
    indicatorCodes: z
      .array(z.string().min(2).max(60))
      .max(15)
      .optional()
      .describe("Internal indicator codes, e.g. 'gdp_growth', 'inflation_cpi'. Defaults to the indicators linked to the project's idea."),
  }),
  run_financial_scenario: z.object({
    scenario: z.enum(['konservator', 'baze', 'optimist']).optional().describe("Scenario to shock. Defaults to 'baze'."),
    shock: z
      .object({
        fixedCostPct: pct('every monthly fixed cost line'),
        variableCostPct: pct('the variable cost per unit'),
        pricePct: pct('the price per unit'),
        startupCostPct: pct('every startup cost line'),
        collectionDaysDelta: z.number().int().min(-365).max(365).optional().describe('Days added to the customer payment delay.'),
        newCustomersPct: pct('new customers per month'),
        churnPctPoints: z.number().min(-100).max(100).optional().describe('Percentage points added to monthly customer churn.'),
      })
      .describe('What changes compared with the saved project inputs. Omit fields that do not change.'),
  }),
  compare_country: z.object({
    countryCode: z.string().min(2).max(80).describe('The other economy: ISO alpha-3 code or the name in Albanian or English.'),
  }),
  adapt_to_capital: z.object({
    targetCapital: z.number().min(0).max(1e12).describe("Capital the user can put in, in the project's currency (0 = test demand only)."),
  }),
  list_weakest_assumptions: z.object({}),
  list_tasks_due: z.object({
    days: z.number().int().min(1).max(90).describe('Horizon in days from today (1 = today).'),
  }),
} as const;

export type ToolName = keyof typeof TOOL_SCHEMAS;
export type ToolInput<N extends ToolName> = z.infer<(typeof TOOL_SCHEMAS)[N]>;

const DESCRIPTIONS: Record<ToolName, string> = {
  get_profile:
    "Returns the user's self-declared profile: residence, countries where they say they can operate, capital and currency, skills, experience, hours per week, assets, team, accepted business modes and risk tolerance. Use it before advice that depends on the user's situation.",
  get_project_summary:
    "Returns the selected project: title, country, the business idea from the app's library (offer, paying customer, problem, regulation notes, licensed professionals), the idea engine's claims with citation ids (why it could work, why it could fail, macro links), the orientation score (not a probability), data coverage, plan completion and the user's notes and recorded evidence. Contains no financial projections — use run_financial_scenario for numbers.",
  get_country_indicators:
    "Returns the latest available stored values of macroeconomic indicators for one economy, each with period, data status (e.g. 'mungon' = missing, 'i_vjeter' = old), change versus the previous period and a citation id. Missing values stay null. Use it for any statement about a country's economy.",
  run_financial_scenario:
    "Runs the app's deterministic financial engine on the project's saved inputs with a what-if shock (costs, price, startup investment, payment delay, new customers, churn) and returns before/after values with formatted strings for total revenue, operating result, lowest cash balance and its month, capital required, break-even units per month and payback month. This is the ONLY source of financial numbers. It never changes the project.",
  compare_country:
    "Evaluates the project's business idea in another economy with the app's idea engine and returns both rows: orientation score (not a probability), capital range, number of macro claims supported/contradicted, purchasing power and price level with citation ids, whether the user can operate there, data coverage and warnings.",
  adapt_to_capital:
    "Proposes an ordered set of reductions (assets the user already owns, starting from home when the idea allows it, used/simpler equipment, then optional startup items, smaller initial inventory, smaller reserve, optional monthly costs) to bring the project's capital requirement down to a target, with the engine's resulting total, whether the target is reached, the trade-offs, and the idea's low-capital test. It never changes the project.",
  list_weakest_assumptions:
    "Ranks the financial assumptions by impact (deterministic sensitivity analysis on the base scenario, ±20%), lists cost lines that are still general assumptions versus verified/quoted, the unit price/cost and customer-ramp assumptions, macro links lacking data, and recorded evidence counts.",
  list_tasks_due:
    "Lists open plan tasks due within the given horizon (counted from the project start), the next tasks if none are due, and what to verify: regulation and licence notes (always 'Kërkon verifikim lokal'), cost lines that are still assumptions, missing customer evidence, macro data gaps, and official links with citation ids.",
};

type Handler = (input: never, env: ToolEnv) => unknown;

const HANDLERS: Record<ToolName, Handler> = {
  get_profile: getProfile,
  get_project_summary: getProjectSummary,
  get_country_indicators: getCountryIndicators,
  run_financial_scenario: runFinancialScenario,
  compare_country: compareCountry,
  adapt_to_capital: adaptToCapital,
  list_weakest_assumptions: listWeakestAssumptions,
  list_tasks_due: listTasksDue,
};

const NEEDS_PROJECT: ReadonlySet<ToolName> = new Set([
  'get_project_summary',
  'run_financial_scenario',
  'compare_country',
  'adapt_to_capital',
  'list_weakest_assumptions',
  'list_tasks_due',
]);

export const TOOL_NAMES = Object.keys(TOOL_SCHEMAS) as ToolName[];

export function isToolName(name: string): name is ToolName {
  return Object.prototype.hasOwnProperty.call(TOOL_SCHEMAS, name);
}

export function toolNeedsProject(name: ToolName): boolean {
  return NEEDS_PROJECT.has(name);
}

function inputSchemaOf(schema: z.ZodType): BetaTool['input_schema'] {
  const { $schema: _ignored, ...rest } = z.toJSONSchema(schema) as Record<string, unknown>;
  return { ...rest, type: 'object' } as BetaTool['input_schema'];
}

/** Tool definitions in a fixed order (a stable prefix keeps the prompt cache warm). */
export const TOOL_DEFINITIONS: BetaTool[] = TOOL_NAMES.map((name) => ({
  name,
  description: DESCRIPTIONS[name],
  input_schema: inputSchemaOf(TOOL_SCHEMAS[name]),
}));

export interface ToolExecution {
  name: string;
  ok: boolean;
  /** What the model sees: values, formatted strings and citation ids — or `{ error }`. */
  data: unknown;
  /** Citations referenced by `data`, aligned with `citationIds`. */
  citations: Citation[];
  citationIds: string[];
  calculations: AssistantCalculation[];
}

function failure(name: string, messageSq: string, extra: Record<string, unknown> = {}): ToolExecution {
  return { name, ok: false, data: { error: messageSq, ...extra }, citations: [], citationIds: [], calculations: [] };
}

/** Validates the input, runs the handler and collects its citations and calculations. */
export async function executeTool(
  name: string,
  rawInput: unknown,
  ctx: AssistantContext,
  registry: CitationRegistry,
): Promise<ToolExecution> {
  if (!isToolName(name)) return failure(name, `Mjet i panjohur: ${name.slice(0, 60)}.`);
  const parsed = TOOL_SCHEMAS[name].safeParse(rawInput ?? {});
  if (!parsed.success) {
    return failure(name, 'Hyrje e pavlefshme për mjetin.', {
      issues: parsed.error.issues.slice(0, 5).map((i) => `${i.path.join('.') || '(rrënja)'}: ${i.message}`),
    });
  }
  if (toolNeedsProject(name) && !ctx.project) return failure(name, NO_PROJECT_SQ);

  const collector = new CitationCollector(registry);
  const calculations: AssistantCalculation[] = [];
  const env: ToolEnv = { ctx, cite: (c) => collector.cite(c), addCalculation: (c) => calculations.push(c) };
  try {
    const data = await (HANDLERS[name] as (input: unknown, env: ToolEnv) => unknown)(parsed.data, env);
    const used = collector.list();
    return { name, ok: true, data, citations: used.map((u) => u.citation), citationIds: used.map((u) => u.id), calculations };
  } catch (error) {
    if (error instanceof ToolError) return failure(name, error.messageSq);
    logger.error('assistant.tool_failed', { tool: name, error });
    return failure(name, 'Mjeti nuk funksionoi për shkak të një gabimi të brendshëm. Mos e zëvendëso me vlerësime të tua.');
  }
}

/**
 * Tool output as the model receives it: wrapped as untrusted data, with the citation list the
 * answer may reference. URLs are left out on purpose — the app shows the links itself, so the
 * model has no reason to write one.
 */
export function toolResultContent(execution: ToolExecution): string {
  const citations = execution.citationIds.map((id, i) => {
    const c = execution.citations[i];
    return {
      id,
      sourceName: c.sourceName,
      indicatorCode: c.indicatorCode ?? null,
      countryCode: c.countryCode ?? null,
      period: c.period ?? null,
      isDemo: c.isDemo === true,
      isProjection: c.isProjection === true,
    };
  });
  return wrapUntrusted(`tool:${execution.name}`, { ok: execution.ok, data: execution.data, citations });
}
