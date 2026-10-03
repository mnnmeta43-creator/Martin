/**
 * Skemat zod për çdo hyrje të API-së (zod v4 schemas for every API input).
 *
 * Shapes mirror `src/lib/domain/types.ts`; limits are generous for real use but bounded so a
 * single request cannot store unbounded data. User-facing messages are Albanian. Both the
 * schema and its inferred type are exported. Objects strip unknown keys.
 */
import { z } from 'zod';
import type { MonthlyCategory, ScoreDimensionId, SectorId, StartupCategory } from '@/lib/domain/types';
import {
  ASSET_IDS,
  EVIDENCE_TYPE_LABELS,
  MONTHLY_CATEGORY_LABELS,
  SCORE_DIMENSION_LABELS,
  SECTORS,
  SKILL_IDS,
  STARTUP_CATEGORY_LABELS,
  TASK_STATUS_LABELS,
} from '@/lib/domain/taxonomy';

const MAX_MONEY = 1e12;
const MAX_LIST = 50;
const MAX_TEXT = 500;
const MAX_LINES = 60;

function keysOf<K extends string>(record: Record<K, unknown>): [K, ...K[]] {
  return Object.keys(record) as [K, ...K[]];
}

// ─── Primitives ─────────────────────────────────────────────────────────────

export const countryCodeSchema = z
  .string()
  .regex(/^[A-Z]{3}$/, { error: 'Kodi i vendit duhet të ketë 3 shkronja të mëdha (p.sh. ALB, XKX).' });
export const currencyCodeSchema = z
  .string()
  .regex(/^[A-Z]{3}$/, { error: 'Kodi i monedhës duhet të ketë 3 shkronja të mëdha (p.sh. EUR, ALL, USD).' });

function isValidCalendarDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'Data duhet të jetë në formatin VVVV-MM-DD.' })
  .refine(isValidCalendarDate, { error: 'Kjo datë nuk ekziston në kalendar.' });

const text = (max = MAX_TEXT) => z.string().trim().max(max);
const requiredText = (max = MAX_TEXT) => z.string().trim().min(1).max(max);
const money = z.number().min(0).max(MAX_MONEY);
const optionalText = (max = MAX_TEXT) => text(max).optional();

export const uuidSchema = z.uuid({ error: 'Identifikuesi nuk është i vlefshëm.' });

// ─── Profile ────────────────────────────────────────────────────────────────

const sectorSchema = z.enum(keysOf<SectorId>(SECTORS));
const skillIdSchema = z.string().refine((id) => SKILL_IDS.has(id), { error: 'Aftësi e panjohur.' });
const assetIdSchema = z.string().refine((id) => ASSET_IDS.has(id), { error: 'Aset i panjohur.' });

export const profileSchema = z.object({
  residenceCountry: countryCodeSchema,
  residenceCity: optionalText(),
  operableCountries: z.array(countryCodeSchema).max(MAX_LIST),
  targetCountries: z.array(countryCodeSchema).max(MAX_LIST),
  targetCity: optionalText(),
  capital: z.object({ amount: money, currency: currencyCodeSchema }),
  skills: z.array(skillIdSchema).max(MAX_LIST),
  otherSkills: optionalText(),
  experienceYears: z.number().min(0).max(80),
  experienceSectors: z.array(sectorSchema).max(MAX_LIST),
  hoursPerWeek: z.number().min(0).max(100),
  assets: z.array(assetIdSchema).max(MAX_LIST),
  otherAssets: optionalText(),
  teamMode: z.enum(['vetem', 'partner', 'ekip']),
  businessModes: z
    .array(z.enum(['fizik', 'online', 'kombinuar']))
    .min(1, { error: 'Zgjidhni të paktën një mënyrë biznesi (fizik, online ose i kombinuar).' })
    .max(3),
  marketScopes: z
    .array(z.enum(['lokal', 'nderkombetar']))
    .min(1, { error: 'Zgjidhni të paktën një treg (lokal ose ndërkombëtar).' })
    .max(2),
  startLocations: z
    .array(z.enum(['shtepi', 'ambient']))
    .min(1, { error: 'Zgjidhni të paktën një mënyrë nisjeje (nga shtëpia ose me ambient).' })
    .max(2),
  isAdult: z.boolean(),
  riskTolerance: z.enum(['e_ulet', 'mesatare', 'e_larte']),
  ownerIncomeNeedMonthly: money.nullable().optional(),
  updatedAt: z.string().max(40).optional(),
});
export type ProfileInput = z.infer<typeof profileSchema>;

// ─── Finance ────────────────────────────────────────────────────────────────

const startupCategorySchema = z.enum(keysOf<StartupCategory>(STARTUP_CATEGORY_LABELS));
const monthlyCategorySchema = z.enum(keysOf<MonthlyCategory>(MONTHLY_CATEGORY_LABELS));
const STARTUP_CATEGORIES: ReadonlySet<string> = new Set(Object.keys(STARTUP_CATEGORY_LABELS));
const MONTHLY_CATEGORIES: ReadonlySet<string> = new Set(Object.keys(MONTHLY_CATEGORY_LABELS));

export const moneyLineSchema = z.object({
  id: requiredText(100),
  labelSq: requiredText(200),
  category: z.union([startupCategorySchema, monthlyCategorySchema]),
  amount: money,
  low: money.nullable().optional(),
  high: money.nullable().optional(),
  sourceKind: z.enum(['supozim', 'oferte', 'verifikuar', 'perdoruesi']),
  sourceNoteSq: text(1000),
  date: isoDateSchema,
  enabled: z.boolean(),
  optional: z.boolean().optional(),
});
export type MoneyLineInput = z.infer<typeof moneyLineSchema>;

const multiplier = z.number().min(0.1).max(5);
const customerCount = z.number().min(0).max(1_000_000);
const days = z.number().int().min(0).max(365);

export const scenarioParamsSchema = z.object({
  startCustomers: customerCount,
  monthlyNewCustomers: customerCount,
  monthlyChurnPct: z.number().min(0).max(100),
  priceMultiplier: multiplier,
  variableCostMultiplier: multiplier,
  fixedCostMultiplier: multiplier,
  collectionDaysOverride: days.nullable().optional(),
});
export type ScenarioParamsInput = z.infer<typeof scenarioParamsSchema>;

function linesIn(categories: ReadonlySet<string>, messageSq: string) {
  return z
    .array(moneyLineSchema)
    .max(MAX_LINES)
    .refine((lines) => lines.every((l) => categories.has(l.category)), { error: messageSq });
}

export const financialInputsSchema = z.object({
  currency: currencyCodeSchema,
  startupCosts: linesIn(STARTUP_CATEGORIES, 'Kostot fillestare duhet të kenë vetëm kategori kostosh fillestare.'),
  monthlyFixedCosts: linesIn(MONTHLY_CATEGORIES, 'Kostot mujore duhet të kenë vetëm kategori kostosh mujore.'),
  includeOwnerSalary: z.boolean(),
  ownerSalaryMonthly: money,
  pricePerUnit: money,
  variableCostPerUnit: money,
  unitLabelSq: requiredText(100),
  unitsPerCustomerPerMonth: z.number().min(0).max(1_000_000),
  collectionDays: days,
  supplierPaymentDays: days,
  seasonality: z
    .array(z.number().positive({ error: 'Çdo koeficient sezonaliteti duhet të jetë më i madh se 0.' }).max(10))
    .length(12, { error: 'Sezonaliteti duhet të ketë saktësisht 12 vlera (janar–dhjetor).' }),
  startMonth: z.number().int().min(1).max(12),
  ownCapital: money,
  reserveMonths: z.number().min(0).max(24),
  profitTaxPct: z.number().min(0).max(100),
  horizonMonths: z.union([z.literal(12), z.literal(24), z.literal(36)], {
    error: 'Horizonti duhet të jetë 12, 24 ose 36 muaj.',
  }),
  scenarios: z.object({
    konservator: scenarioParamsSchema,
    baze: scenarioParamsSchema,
    optimist: scenarioParamsSchema,
  }),
  assumptionsNotesSq: z.array(text(1000)).max(MAX_LINES),
});
export type FinancialInputsInput = z.infer<typeof financialInputsSchema>;

// ─── Scoring ────────────────────────────────────────────────────────────────

const weight = z.number().int({ error: 'Pesha duhet të jetë numër i plotë.' }).min(0).max(100);
const SCORE_KEYS = keysOf<ScoreDimensionId>(SCORE_DIMENSION_LABELS);

export const scoreWeightsSchema = z
  .object({
    kerkesa: weight,
    kapitali: weight,
    aftesite: weight,
    veshtiresia: weight,
    ekonomia: weight,
    rreziku: weight,
  })
  .superRefine((w, ctx) => {
    const sum = SCORE_KEYS.reduce((acc, key) => acc + w[key], 0);
    if (sum !== 100) {
      ctx.addIssue({ code: 'custom', message: `Shuma e peshave duhet të jetë saktësisht 100 (tani është ${sum}).` });
    }
  });
export type ScoreWeightsInput = z.infer<typeof scoreWeightsSchema>;

// ─── Projects, tasks, evidence ──────────────────────────────────────────────

const archetypeIdSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { error: 'Identifikuesi i idesë nuk është i vlefshëm.' })
  .max(120);

export const manualFxSchema = z
  .object({
    base: currencyCodeSchema,
    quote: currencyCodeSchema,
    rate: z.number().positive({ error: 'Kursi duhet të jetë më i madh se 0.' }).max(1e9),
    rateDate: isoDateSchema,
  })
  .refine((r) => r.base !== r.quote, { error: 'Monedha bazë dhe monedha e kuotimit duhet të jenë të ndryshme.' });
export type ManualFxInput = z.infer<typeof manualFxSchema>;

export const createProjectSchema = z.object({
  archetypeId: archetypeIdSchema,
  countryCode: countryCodeSchema,
  city: text(120).nullable().optional(),
  registrationCountry: countryCodeSchema.nullable().optional(),
  customerCountries: z.array(countryCodeSchema).max(MAX_LIST).optional(),
  title: requiredText(200).optional(),
  financialInputs: financialInputsSchema.optional(),
  manualFxRates: z.array(manualFxSchema).max(20).optional(),
});
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z
  .object({
    title: requiredText(200),
    city: text(120).nullable(),
    registrationCountry: countryCodeSchema.nullable(),
    customerCountries: z.array(countryCodeSchema).max(MAX_LIST),
    notesSq: text(5000).nullable(),
    financialInputs: financialInputsSchema,
    scoreWeights: scoreWeightsSchema,
  })
  .partial()
  .refine((patch) => Object.values(patch).some((v) => v !== undefined), { error: 'Nuk u dërgua asnjë fushë për t’u ndryshuar.' });
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

const taskStatusSchema = z.enum(keysOf(TASK_STATUS_LABELS));

export const taskPatchSchema = z
  .object({
    status: taskStatusSchema.optional(),
    notesSq: text(2000).nullable().optional(),
  })
  .refine((p) => p.status !== undefined || p.notesSq !== undefined, { error: 'Nuk u dërgua asnjë ndryshim për detyrën.' });
export type TaskPatchInput = z.infer<typeof taskPatchSchema>;

export const evidenceInputSchema = z.object({
  type: z.enum(keysOf(EVIDENCE_TYPE_LABELS)),
  summarySq: requiredText(2000),
  quantity: z.number().min(0).max(1e9).nullable().optional(),
  amount: money.nullable().optional(),
  sourceSq: text(MAX_TEXT),
  collectedAt: isoDateSchema,
});
export type EvidenceInput = z.infer<typeof evidenceInputSchema>;

// ─── Assistant & auth ───────────────────────────────────────────────────────

export const assistantRequestSchema = z.object({
  projectId: uuidSchema.optional(),
  message: z
    .string()
    .trim()
    .min(1, { error: 'Shkruani një pyetje.' })
    .max(2000, { error: 'Pyetja mund të ketë deri në 2000 karaktere.' }),
});
export type AssistantRequestInput = z.infer<typeof assistantRequestSchema>;

/** Trimmed + lowercased before the format check, so "  Ana@Example.COM " is accepted and stored normalised. */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email({ error: 'Adresa e email-it nuk është e vlefshme.' }));

export const registerSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(10, { error: 'Fjalëkalimi duhet të ketë të paktën 10 karaktere.' })
    .max(200, { error: 'Fjalëkalimi mund të ketë deri në 200 karaktere.' }),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { error: 'Shkruani fjalëkalimin.' }).max(200),
});
export type LoginInput = z.infer<typeof loginSchema>;
