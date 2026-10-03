/**
 * Environment parsing and the configuration status report (which must never leak values).
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConfigError } from '@/lib/server/errors';
import { configStatus, getEnv, parseEnv, resetEnvCache } from '@/lib/server/env';

describe('parseEnv', () => {
  it('applies defaults and treats blank values as missing', () => {
    const env = parseEnv({ DATABASE_URL: '', ANTHROPIC_API_KEY: '   ', NODE_ENV: undefined });
    expect(env).toMatchObject({ DATA_MODE: 'live', PGLITE_DATA_DIR: '.data/pglite', NODE_ENV: 'development' });
    expect(env.DATABASE_URL).toBeUndefined();
    expect(env.ANTHROPIC_API_KEY).toBeUndefined();
    expect(env.ALLOW_EMBEDDED_DB).toBeUndefined();
  });

  it('accepts valid values', () => {
    const env = parseEnv({
      DATABASE_URL: 'postgresql://u:p@h:5432/db',
      DATA_MODE: 'demo',
      APP_URL: 'https://app.example.invalid',
      ALLOW_EMBEDDED_DB: 'true',
      NODE_ENV: 'production',
    });
    expect(env).toMatchObject({ DATA_MODE: 'demo', ALLOW_EMBEDDED_DB: 'true', NODE_ENV: 'production' });
  });

  it('only the exact string "true" enables the embedded database', () => {
    expect(parseEnv({ ALLOW_EMBEDDED_DB: 'false' }).ALLOW_EMBEDDED_DB).toBeUndefined();
    expect(parseEnv({ ALLOW_EMBEDDED_DB: '1' }).ALLOW_EMBEDDED_DB).toBeUndefined();
  });

  it('treats an unknown NODE_ENV as production', () => {
    expect(parseEnv({ NODE_ENV: 'staging' }).NODE_ENV).toBe('production');
  });

  it('throws ConfigError naming invalid keys without their values', () => {
    let error: unknown;
    try {
      parseEnv({ DATA_MODE: 'Demo', DATABASE_URL: 'mysql://user:topsecret@h/db', APP_URL: 'not a url' });
    } catch (err) {
      error = err;
    }
    expect(error).toBeInstanceOf(ConfigError);
    const message = (error as ConfigError).messageSq;
    expect(message).toContain('DATA_MODE');
    expect(message).toContain('DATABASE_URL');
    expect(message).toContain('APP_URL');
    expect(message).not.toContain('topsecret');
    expect(message).not.toContain('Demo');
  });
});

describe('getEnv', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('caches until resetEnvCache()', () => {
    vi.stubEnv('DATA_MODE', 'demo');
    resetEnvCache();
    expect(getEnv().DATA_MODE).toBe('demo');
    vi.stubEnv('DATA_MODE', 'live');
    expect(getEnv().DATA_MODE).toBe('demo');
    resetEnvCache();
    expect(getEnv().DATA_MODE).toBe('live');
  });
});

describe('configStatus', () => {
  const secrets = {
    DATABASE_URL: 'postgres://user:db-secret-value@host/db',
    ANTHROPIC_API_KEY: 'sk-ant-secret-value',
    CRON_SECRET: 'cron-secret-value',
    ANTHROPIC_MODEL: 'model-value',
    FX_API_BASE_URL: 'https://fx.example.invalid',
    APP_URL: 'https://app.example.invalid',
  };

  it('reports presence only and never includes any value', () => {
    const status = configStatus({ ...secrets, NODE_ENV: 'production' });
    const serialized = JSON.stringify(status);
    for (const value of Object.values(secrets)) expect(serialized).not.toContain(value);
    for (const item of status) {
      expect(Object.keys(item).sort()).toEqual(['enablesSq', 'featureOffWhenMissing', 'impactIfMissingSq', 'key', 'present']);
      expect(typeof item.present).toBe('boolean');
      expect(typeof item.featureOffWhenMissing).toBe('boolean');
    }
    expect(status.find((s) => s.key === 'ANTHROPIC_API_KEY')?.present).toBe(true);
  });

  it('explains what stops working when keys are missing', () => {
    const status = configStatus({ NODE_ENV: 'production', ANTHROPIC_API_KEY: '' });
    const byKey = Object.fromEntries(status.map((s) => [s.key, s]));
    expect(byKey.ANTHROPIC_API_KEY.present).toBe(false);
    expect(byKey.ANTHROPIC_API_KEY.impactIfMissingSq).toContain('deterministe');
    expect(byKey.CRON_SECRET.impactIfMissingSq).toContain('Rifreskimi automatik është i çaktivizuar');
    expect(byKey.DATABASE_URL.impactIfMissingSq).toContain('NUK funksionojnë');
    expect(configStatus({ NODE_ENV: 'development' }).find((s) => s.key === 'DATABASE_URL')?.impactIfMissingSq).toContain('PGlite');
  });

  it('flags only keys whose absence switches a feature off', () => {
    const off = (source: Record<string, string>) =>
      configStatus(source)
        .filter((s) => s.featureOffWhenMissing)
        .map((s) => s.key);
    expect(off({ NODE_ENV: 'production' })).toEqual(['DATABASE_URL', 'ANTHROPIC_API_KEY', 'CRON_SECRET']);
    expect(off({ NODE_ENV: 'development' })).toEqual(['ANTHROPIC_API_KEY', 'CRON_SECRET']);
    expect(off({ NODE_ENV: 'production', ALLOW_EMBEDDED_DB: 'true' })).toEqual(['ANTHROPIC_API_KEY', 'CRON_SECRET']);
  });

  it('writes every explanation as a full Albanian sentence', () => {
    for (const item of configStatus({ NODE_ENV: 'production' })) {
      for (const text of [item.enablesSq, item.impactIfMissingSq]) {
        expect(text).toMatch(/^[A-ZÇË"]/);
        expect(text).toMatch(/[.)]$/);
      }
    }
  });
});
