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
  /** Full Albanian sentence describing what works because the key is set. */
  enablesSq: string;
  /** Full Albanian sentence describing what happens while the key is missing. */
  impactIfMissingSq: string;
  /**
   * True when the missing key switches a feature off (AI chat, automatic refresh, accounts in
   * production). False for keys that simply fall back to a sensible default.
   */
  featureOffWhenMissing: boolean;
}

function isPresent(source: RawEnv, key: string): boolean {
  return blankToUndefined(source[key]) !== undefined;
}

function isProductionEnv(source: RawEnv): boolean {
  const nodeEnv = blankToUndefined(source.NODE_ENV) ?? 'development';
  // Mirrors parseEnv: anything other than development/test is treated as production.
  return nodeEnv !== 'development' && nodeEnv !== 'test';
}

function databaseImpact(source: RawEnv): { impactIfMissingSq: string; featureOffWhenMissing: boolean } {
  if (!isProductionEnv(source)) {
    return {
      impactIfMissingSq:
        'Në zhvillim përdoret databaza e brendshme PGlite (dosja PGLITE_DATA_DIR). Në prodhim, pa DATABASE_URL, llogaritë, profilet dhe projektet nuk funksionojnë.',
      featureOffWhenMissing: false,
    };
  }
  if (blankToUndefined(source.ALLOW_EMBEDDED_DB) === 'true') {
    return {
      impactIfMissingSq:
        'Përdoret databaza e brendshme PGlite sepse ALLOW_EMBEDDED_DB=true. Kjo është vetëm për demonstrim ose teste, jo për përdorim real.',
      featureOffWhenMissing: false,
    };
  }
  return {
    impactIfMissingSq:
      'Llogaritë, profilet, projektet, plani 0–100, provat nga klientët, historia e bisedës dhe ruajtja e të dhënave makroekonomike NUK funksionojnë.',
    featureOffWhenMissing: true,
  };
}

/**
 * Which optional features are configured. Reads raw presence (so it works even when a value is
 * invalid) and never returns any value, only `present: boolean` and fixed Albanian explanations.
 */
export function configStatus(source: RawEnv = process.env): ConfigStatusItem[] {
  const item = (key: string, enablesSq: string, impactIfMissingSq: string, featureOffWhenMissing: boolean): ConfigStatusItem => ({
    key,
    present: isPresent(source, key),
    enablesSq,
    impactIfMissingSq,
    featureOffWhenMissing,
  });
  const database = databaseImpact(source);
  return [
    item(
      'DATABASE_URL',
      'Llogaritë, profilet, projektet, planet dhe të dhënat makroekonomike ruhen në PostgreSQL.',
      database.impactIfMissingSq,
      database.featureOffWhenMissing,
    ),
    item(
      'DATA_MODE',
      'Modaliteti i të dhënave është zgjedhur shprehimisht: "live" (burime reale) ose "demo" (ekonomitë fiktive ZZA, ZZB, ZZC, të shënuara DEMO).',
      'Përdoret modaliteti "live": vetëm të dhëna reale nga burimet e regjistruara.',
      false,
    ),
    item(
      'ANTHROPIC_API_KEY',
      'Biseda e lirë me asistentin AI (Claude) është aktive. Shifrat financiare vijnë gjithmonë nga motori determinist i aplikacionit.',
      'Biseda me AI është e çaktivizuar. Përgjigjet deterministe (kalkulatori, plani, të dhënat e ruajtura) vazhdojnë të funksionojnë.',
      true,
    ),
    item(
      'ANTHROPIC_MODEL',
      'Asistenti përdor modelin e Claude të zgjedhur në konfigurim.',
      'Përdoret modeli i parazgjedhur i aplikacionit.',
      false,
    ),
    item(
      'CRON_SECRET',
      'Rifreskimi automatik i të dhënave është aktiv: një planifikues mund të thërrasë POST /api/cron/refresh me këtë sekret.',
      'Rifreskimi automatik është i çaktivizuar. Të dhënat mund të rifreskohen me "npm run data:refresh" në server.',
      true,
    ),
    item(
      'FX_API_BASE_URL',
      'Kurset e këmbimit merren nga adresa alternative e konfiguruar.',
      'Përdoret adresa e parazgjedhur e burimit të kurseve të këmbimit.',
      false,
    ),
    item(
      'APP_URL',
      'Kontrolli i origjinës pranon edhe URL-në publike të aplikacionit (e dobishme kur aplikacioni është pas një proxy).',
      'Origjina kontrollohet me hostin e kërkesës; kjo mjafton në shumicën e rasteve.',
      false,
    ),
    item(
      'ALLOW_EMBEDDED_DB',
      'Databaza e brendshme PGlite lejohet edhe në prodhim (vetëm për demonstrim ose teste).',
      'Në prodhim kërkohet DATABASE_URL; databaza e brendshme përdoret vetëm gjatë zhvillimit.',
      false,
    ),
    item(
      'PGLITE_DATA_DIR',
      'PGlite i ruan të dhënat në dosjen e zgjedhur (ose vetëm në memorie me "memory://").',
      'PGlite përdor dosjen e parazgjedhur ".data/pglite".',
      false,
    ),
  ];
}
