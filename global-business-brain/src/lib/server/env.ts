/**
 * Variablat e mjedisit të serverit, të validuara me zod (server environment).
 *
 * `getEnv()` parses `process.env` once and caches the result; tests call `resetEnvCache()`.
 * Blank values (e.g. `DATABASE_URL=` copied from .env.example) count as missing.
 * `configStatus()` tells the UI which features are enabled; it reports presence only, never values.
 */
import { z } from 'zod';
import { ConfigError } from '@/lib/server/errors';

type RawEnv = Record<string, string | undefined>;

/** Trim strings and turn blank ones into `undefined`, so "KEY=" behaves like an unset key. */
function blankToUndefined(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

const optionalText = z.preprocess(blankToUndefined, z.string().optional());
const optionalHttpUrl = z.preprocess(blankToUndefined, z.url({ protocol: /^https?$/ }).optional());
const optionalPostgresUrl = z.preprocess(
  blankToUndefined,
  z
    .string()
    .regex(/^postgres(ql)?:\/\//)
    .optional(),
);

const envSchema = z.object({
  DATABASE_URL: optionalPostgresUrl,
  DATA_MODE: z.preprocess(blankToUndefined, z.enum(['live', 'demo']).default('live')),
  ANTHROPIC_API_KEY: optionalText,
  ANTHROPIC_MODEL: optionalText,
  CRON_SECRET: optionalText,
  FX_API_BASE_URL: optionalHttpUrl,
  APP_URL: optionalHttpUrl,
  // Only the exact string "true" enables the embedded database in production; anything else is ignored.
  ALLOW_EMBEDDED_DB: z.preprocess(blankToUndefined, z.string().optional()).transform((v) => (v === 'true' ? ('true' as const) : undefined)),
  PGLITE_DATA_DIR: z.preprocess(blankToUndefined, z.string().default('.data/pglite')),
  // An unknown NODE_ENV is treated as production: the safe side (secure cookies, no embedded DB).
  NODE_ENV: z.preprocess(blankToUndefined, z.enum(['development', 'production', 'test']).default('development').catch('production')),
});

export type AppEnv = z.infer<typeof envSchema>;

let cached: AppEnv | null = null;

/** Pure parser (no caching). Throws ConfigError naming the invalid keys, never their values. */
export function parseEnv(source: RawEnv): AppEnv {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const keys = [...new Set(result.error.issues.map((i) => String(i.path[0] ?? '?')))];
    throw new ConfigError(
      `Konfigurimi i serverit ka vlera të pavlefshme për: ${keys.join(', ')}. Kontrolloni variablat e mjedisit (shih .env.example).`,
      { keys },
    );
  }
  return result.data;
}

export function getEnv(): AppEnv {
  if (!cached) cached = parseEnv(process.env);
  return cached;
}

export function resetEnvCache(): void {
  cached = null;
}

export interface ConfigStatusItem {
  key: string;
  present: boolean;
  enablesSq: string;
  impactIfMissingSq: string;
}

function isPresent(source: RawEnv, key: string): boolean {
  return blankToUndefined(source[key]) !== undefined;
}

function databaseImpactSq(source: RawEnv): string {
  const nodeEnv = blankToUndefined(source.NODE_ENV) ?? 'development';
  const production = nodeEnv !== 'development' && nodeEnv !== 'test';
  const embeddedAllowed = blankToUndefined(source.ALLOW_EMBEDDED_DB) === 'true';
  if (!production) {
    return 'Në zhvillim përdoret databaza e brendshme PGlite (PGLITE_DATA_DIR). Në prodhim, pa DATABASE_URL llogaritë, profilet dhe projektet nuk funksionojnë.';
  }
  if (embeddedAllowed) {
    return 'Përdoret databaza e brendshme PGlite sepse ALLOW_EMBEDDED_DB=true. Kjo është vetëm për demonstrim ose teste; të dhënat nuk janë të përshtatshme për përdorim real.';
  }
  return 'Llogaritë, profilet, projektet, plani, provat nga klientët, historia e bisedës dhe ruajtja e të dhënave makroekonomike NUK funksionojnë.';
}

/**
 * Which optional features are configured. Reads raw presence (so it works even when a value is
 * invalid) and never returns any value, only `present: boolean`.
 */
export function configStatus(source: RawEnv = process.env): ConfigStatusItem[] {
  const item = (key: string, enablesSq: string, impactIfMissingSq: string): ConfigStatusItem => ({
    key,
    present: isPresent(source, key),
    enablesSq,
    impactIfMissingSq,
  });
  return [
    item(
      'DATABASE_URL',
      'Ruajtjen e llogarive, profileve, projekteve, planeve dhe të dhënave në PostgreSQL.',
      databaseImpactSq(source),
    ),
    item(
      'DATA_MODE',
      'Zgjedh modalitetin: "live" (burime reale) ose "demo" (ekonomitë fiktive ZZA, ZZB, ZZC, të shënuara DEMO).',
      'Përdoret "live": vetëm të dhëna reale nga burimet e regjistruara.',
    ),
    item(
      'ANTHROPIC_API_KEY',
      'Bisedën e lirë me asistentin AI (Claude).',
      'Biseda me AI është e çaktivizuar. Përgjigjet deterministe (kalkulatori, plani, të dhënat e ruajtura) vazhdojnë të funksionojnë.',
    ),
    item('ANTHROPIC_MODEL', 'Zgjedh modelin e Claude për asistentin.', 'Përdoret modeli i parazgjedhur i aplikacionit.'),
    item(
      'CRON_SECRET',
      'Endpoint-in e rifreskimit automatik të të dhënave (POST /api/cron/refresh).',
      'Rifreskimi automatik është i çaktivizuar. Të dhënat mund të rifreskohen me "npm run data:refresh".',
    ),
    item(
      'FX_API_BASE_URL',
      'Një adresë alternative për API-në e kurseve të këmbimit.',
      'Përdoret adresa e parazgjedhur e burimit të kurseve të këmbimit.',
    ),
    item(
      'APP_URL',
      'Kontrollin e origjinës me URL-në publike të aplikacionit (kur aplikacioni është pas një proxy).',
      'Origjina kontrollohet me hostin e kërkesës; kjo mjafton në shumicën e rasteve.',
    ),
    item(
      'ALLOW_EMBEDDED_DB',
      'Lejon databazën e brendshme PGlite edhe në prodhim (vetëm për demonstrim ose teste).',
      'Në prodhim kërkohet DATABASE_URL.',
    ),
    item('PGLITE_DATA_DIR', 'Dosjen ku PGlite ruan të dhënat gjatë zhvillimit.', 'Përdoret dosja ".data/pglite".'),
  ];
}
