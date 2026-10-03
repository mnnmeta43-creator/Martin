// SYNTHETIC — format mirrors the documented API; values are not real
/**
 * zod schemas for API input: valid shapes pass, out-of-range or malformed input is rejected
 * with Albanian messages.
 */
import { describe, expect, it } from 'vitest';
import {
  assistantRequestSchema,
  countryCodeSchema,
  createProjectSchema,
  currencyCodeSchema,
  evidenceInputSchema,
  financialInputsSchema,
  loginSchema,
  manualFxSchema,
  moneyLineSchema,
  profileSchema,
  registerSchema,
  scenarioParamsSchema,
  scoreWeightsSchema,
  taskPatchSchema,
  updateProjectSchema,
} from '@/lib/validation/schemas';
import { issueMessageSq } from '@/lib/validation/messages';
import { makeFinancialInputs, WEIGHTS } from './helpers';

function messages(result: { success: boolean; error?: { issues: Parameters<typeof issueMessageSq>[0][] } }): string[] {
  return result.success ? [] : (result.error?.issues ?? []).map(issueMessageSq);
}

const validProfile = {
  residenceCountry: 'ALB',
  residenceCity: 'Qytet testimi',
  operableCountries: ['ALB', 'XKX'],
  targetCountries: ['XKX'],
  capital: { amount: 12345, currency: 'EUR' },
  skills: ['dizajn_web'],
  experienceYears: 2,
  experienceSectors: ['digjitale'],
  hoursPerWeek: 20,
  assets: ['kompjuter'],
  teamMode: 'vetem',
  businessModes: ['online'],
  marketScopes: ['lokal'],
  startLocations: ['shtepi'],
  isAdult: true,
  riskTolerance: 'mesatare',
  ownerIncomeNeedMonthly: null,
};

describe('codes', () => {
  it('accepts three upper-case letters only', () => {
    expect(countryCodeSchema.safeParse('ALB').success).toBe(true);
    expect(countryCodeSchema.safeParse('XKX').success).toBe(true);
    for (const bad of ['alb', 'AL', 'ALBA', 'A1B', '', ' ALB']) expect(countryCodeSchema.safeParse(bad).success).toBe(false);
    expect(currencyCodeSchema.safeParse('EUR').success).toBe(true);
    expect(messages(currencyCodeSchema.safeParse('eur'))[0]).toContain('3 shkronja të mëdha');
  });
});

describe('profileSchema', () => {
  it('accepts a complete profile and strips unknown keys', () => {
    const parsed = profileSchema.parse({ ...validProfile, admin: true });
    expect(parsed).not.toHaveProperty('admin');
    expect(parsed.capital.amount).toBe(12345);
  });

  it('requires at least one business mode, market scope and start location', () => {
    const result = profileSchema.safeParse({ ...validProfile, businessModes: [], marketScopes: [], startLocations: [] });
    expect(result.success).toBe(false);
    const msgs = messages(result);
    expect(msgs).toHaveLength(3);
    expect(msgs.join(' ')).toContain('të paktën një');
  });

  it('enforces limits on lists, text, capital and hours', () => {
    const many = Array.from({ length: 51 }, () => 'ALB');
    expect(profileSchema.safeParse({ ...validProfile, operableCountries: many }).success).toBe(false);
    expect(profileSchema.safeParse({ ...validProfile, otherSkills: 'x'.repeat(501) }).success).toBe(false);
    expect(profileSchema.safeParse({ ...validProfile, capital: { amount: -1, currency: 'EUR' } }).success).toBe(false);
    expect(profileSchema.safeParse({ ...validProfile, capital: { amount: 1e12 + 1, currency: 'EUR' } }).success).toBe(false);
    expect(profileSchema.safeParse({ ...validProfile, hoursPerWeek: 101 }).success).toBe(false);
    expect(profileSchema.safeParse({ ...validProfile, skills: ['aftesi_e_shpikur'] }).success).toBe(false);
    expect(profileSchema.safeParse({ ...validProfile, residenceCountry: 'al' }).success).toBe(false);
  });
});

describe('finance schemas', () => {
  it('accepts the shared synthetic financial inputs', () => {
    expect(financialInputsSchema.safeParse(makeFinancialInputs()).success).toBe(true);
  });

  it('requires exactly 12 positive seasonality factors', () => {
    const short = financialInputsSchema.safeParse(makeFinancialInputs({ seasonality: [1, 1, 1] }));
    expect(messages(short)).toContain('Sezonaliteti duhet të ketë saktësisht 12 vlera (janar–dhjetor).');
    const zero = financialInputsSchema.safeParse(makeFinancialInputs({ seasonality: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }));
    expect(zero.success).toBe(false);
  });

  it('checks horizon, start month, reserve, tax and list sizes', () => {
    expect(financialInputsSchema.safeParse(makeFinancialInputs({ horizonMonths: 18 })).success).toBe(false);
    expect(financialInputsSchema.safeParse(makeFinancialInputs({ horizonMonths: 36 })).success).toBe(true);
    expect(financialInputsSchema.safeParse(makeFinancialInputs({ startMonth: 13 })).success).toBe(false);
    expect(financialInputsSchema.safeParse(makeFinancialInputs({ reserveMonths: 25 })).success).toBe(false);
    expect(financialInputsSchema.safeParse(makeFinancialInputs({ profitTaxPct: 101 })).success).toBe(false);
    const line = makeFinancialInputs().monthlyFixedCosts[0];
    const lines = Array.from({ length: 61 }, (_, i) => ({ ...line, id: `l${i}` }));
    expect(financialInputsSchema.safeParse(makeFinancialInputs({ monthlyFixedCosts: lines })).success).toBe(false);
  });

  it('keeps startup and monthly categories apart', () => {
    const startup = makeFinancialInputs().startupCosts[0];
    const result = financialInputsSchema.safeParse(makeFinancialInputs({ monthlyFixedCosts: [startup] }));
    expect(messages(result)).toContain('Kostot mujore duhet të kenë vetëm kategori kostosh mujore.');
  });

  it('validates money lines and scenario parameters', () => {
    const line = makeFinancialInputs().startupCosts[0];
    expect(moneyLineSchema.safeParse(line).success).toBe(true);
    expect(moneyLineSchema.safeParse({ ...line, date: '2026-02-30' }).success).toBe(false);
    expect(moneyLineSchema.safeParse({ ...line, amount: -5 }).success).toBe(false);
    const scenario = makeFinancialInputs().scenarios.baze;
    expect(scenarioParamsSchema.safeParse(scenario).success).toBe(true);
    expect(scenarioParamsSchema.safeParse({ ...scenario, priceMultiplier: 0.05 }).success).toBe(false);
    expect(scenarioParamsSchema.safeParse({ ...scenario, fixedCostMultiplier: 5.5 }).success).toBe(false);
    expect(scenarioParamsSchema.safeParse({ ...scenario, monthlyChurnPct: 120 }).success).toBe(false);
  });
});

describe('scoreWeightsSchema', () => {
  it('accepts integer weights that sum to 100', () => {
    expect(scoreWeightsSchema.safeParse(WEIGHTS).success).toBe(true);
  });

  it('rejects a sum other than 100 with an Albanian message naming the sum', () => {
    const result = scoreWeightsSchema.safeParse({ ...WEIGHTS, kerkesa: 30 });
    expect(messages(result)).toEqual(['Shuma e peshave duhet të jetë saktësisht 100 (tani është 105).']);
  });

  it('rejects fractions, out-of-range values and missing keys', () => {
    expect(scoreWeightsSchema.safeParse({ ...WEIGHTS, kerkesa: 24.5, kapitali: 15.5 }).success).toBe(false);
    expect(scoreWeightsSchema.safeParse({ kerkesa: 120, kapitali: -20, aftesite: 0, veshtiresia: 0, ekonomia: 0, rreziku: 0 }).success).toBe(false);
    const { rreziku: _omitted, ...missing } = WEIGHTS;
    expect(scoreWeightsSchema.safeParse(missing).success).toBe(false);
  });
});

describe('project, task and evidence schemas', () => {
  it('createProjectSchema needs a valid archetype id and country code', () => {
    expect(createProjectSchema.safeParse({ archetypeId: 'ide-testimi', countryCode: 'ALB', customerCountries: ['XKX'] }).success).toBe(true);
    expect(createProjectSchema.safeParse({ archetypeId: 'Ide Testimi', countryCode: 'ALB' }).success).toBe(false);
    expect(createProjectSchema.safeParse({ archetypeId: 'ide-testimi', countryCode: 'alb' }).success).toBe(false);
  });

  it('updateProjectSchema is partial but not empty', () => {
    expect(updateProjectSchema.safeParse({ title: 'Titull i ri' }).success).toBe(true);
    expect(updateProjectSchema.safeParse({ scoreWeights: WEIGHTS }).success).toBe(true);
    expect(updateProjectSchema.safeParse({ scoreWeights: { ...WEIGHTS, kerkesa: 0 } }).success).toBe(false);
    expect(messages(updateProjectSchema.safeParse({}))[0]).toContain('Nuk u dërgua asnjë fushë');
  });

  it('taskPatchSchema accepts known statuses and needs at least one change', () => {
    expect(taskPatchSchema.safeParse({ status: 'perfunduar' }).success).toBe(true);
    expect(taskPatchSchema.safeParse({ notesSq: null }).success).toBe(true);
    expect(taskPatchSchema.safeParse({ status: 'fituar' }).success).toBe(false);
    expect(taskPatchSchema.safeParse({}).success).toBe(false);
  });

  it('evidenceInputSchema validates type, text and calendar date', () => {
    const entry = { type: 'interviste', summarySq: 'Intervistë', sourceSq: 'Takim', collectedAt: '2026-09-01', quantity: 3 };
    expect(evidenceInputSchema.safeParse(entry).success).toBe(true);
    expect(evidenceInputSchema.safeParse({ ...entry, type: 'thashetheme' }).success).toBe(false);
    expect(evidenceInputSchema.safeParse({ ...entry, summarySq: '   ' }).success).toBe(false);
    expect(messages(evidenceInputSchema.safeParse({ ...entry, collectedAt: '2026-13-01' }))[0]).toContain('nuk ekziston');
  });

  it('manualFxSchema needs a positive rate, a real date and two different currencies', () => {
    const rate = { base: 'EUR', quote: 'ALL', rate: 111.11, rateDate: '2026-09-30' };
    expect(manualFxSchema.safeParse(rate).success).toBe(true);
    expect(manualFxSchema.safeParse({ ...rate, rate: 0 }).success).toBe(false);
    expect(manualFxSchema.safeParse({ ...rate, quote: 'EUR' }).success).toBe(false);
    expect(manualFxSchema.safeParse({ ...rate, rateDate: '30.09.2026' }).success).toBe(false);
  });
});

describe('assistant and auth schemas', () => {
  it('assistantRequestSchema limits the message and checks the project id', () => {
    expect(assistantRequestSchema.safeParse({ message: 'Si llogaritet pika e barazimit?' }).success).toBe(true);
    expect(assistantRequestSchema.safeParse({ message: '  ' }).success).toBe(false);
    expect(assistantRequestSchema.safeParse({ message: 'x'.repeat(2001) }).success).toBe(false);
    expect(assistantRequestSchema.safeParse({ message: 'x', projectId: 'jo-uuid' }).success).toBe(false);
    expect(assistantRequestSchema.safeParse({ message: 'x', projectId: '00000000-0000-4000-8000-000000000000' }).success).toBe(true);
  });

  it('registerSchema normalises the email and enforces password length', () => {
    expect(registerSchema.parse({ email: '  Ana@Example.INVALID ', password: 'fjalekalim-i-gjate' }).email).toBe('ana@example.invalid');
    expect(messages(registerSchema.safeParse({ email: 'ana@example.invalid', password: 'shkurt' }))).toEqual([
      'Fjalëkalimi duhet të ketë të paktën 10 karaktere.',
    ]);
    expect(registerSchema.safeParse({ email: 'ana@example.invalid', password: 'x'.repeat(201) }).success).toBe(false);
    expect(registerSchema.safeParse({ email: 'jo-email', password: 'fjalekalim-i-gjate' }).success).toBe(false);
  });

  it('loginSchema needs an email and a non-empty password', () => {
    expect(loginSchema.safeParse({ email: 'ana@example.invalid', password: 'x' }).success).toBe(true);
    expect(loginSchema.safeParse({ email: 'ana@example.invalid', password: '' }).success).toBe(false);
  });
});
