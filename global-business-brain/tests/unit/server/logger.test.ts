/**
 * Secret redaction and the single-line JSON log format.
 */
import { describe, expect, it } from 'vitest';
import { createLogger, maskString, redact, REDACTED } from '@/lib/server/logger';

describe('redact', () => {
  it('replaces values of sensitive keys at any depth without mutating the input', () => {
    const input = {
      user: 'ana',
      password: 'p4ss',
      nested: { apiKey: 'k', api_key: 'k2', 'api-key': 'k3', deeper: [{ sessionId: 's', Authorization: 'a', note: 'ok' }] },
      CRON_SECRET: 'c',
      cookie: 'gbb_session=abc',
      refreshToken: 't',
      count: 3,
    };
    const out = redact(input) as typeof input;
    expect(out.user).toBe('ana');
    expect(out.password).toBe(REDACTED);
    expect(out.nested.apiKey).toBe(REDACTED);
    expect(out.nested.api_key).toBe(REDACTED);
    expect(out.nested['api-key']).toBe(REDACTED);
    expect(out.nested.deeper[0]).toEqual({ sessionId: REDACTED, Authorization: REDACTED, note: 'ok' });
    expect(out.CRON_SECRET).toBe(REDACTED);
    expect(out.cookie).toBe(REDACTED);
    expect(out.refreshToken).toBe(REDACTED);
    expect(out.count).toBe(3);
    expect(input.password).toBe('p4ss');
  });

  it('masks secrets inside strings under innocent keys', () => {
    const out = redact({
      message: 'Thirrja me sk-ant-api03-AbC_dEf-123 dështoi',
      header: 'Bearer eyJhbGciOiJIUzI1NiJ9.payload.sig',
      url: 'postgres://admin:hunter2@db.example.invalid:5432/app',
      query: 'https://x.invalid/cb?token=abc123&page=2',
    }) as Record<string, string>;
    expect(out.message).toBe(`Thirrja me sk-ant-${REDACTED} dështoi`);
    expect(out.header).toBe(`Bearer ${REDACTED}`);
    expect(out.url).toBe(`postgres://${REDACTED}@db.example.invalid:5432/app`);
    expect(out.url).not.toContain('hunter2');
    expect(out.url).not.toContain('admin');
    expect(out.query).toBe(`https://x.invalid/cb?token=${REDACTED}&page=2`);
  });

  it('serialises errors safely and handles cycles', () => {
    const err = new Error('lidhja me postgresql://u:secretpw@h/db dështoi');
    const cyclic: Record<string, unknown> = { name: 'cikël' };
    cyclic.self = cyclic;
    const out = redact({ error: err, cyclic }) as { error: { name: string; message: string; stack?: string }; cyclic: Record<string, unknown> };
    expect(out.error.name).toBe('Error');
    expect(out.error.message).not.toContain('secretpw');
    expect(out.error.stack ?? '').not.toContain('secretpw');
    expect(out.cyclic.self).toBe('[Circular]');
  });

  it('maskString leaves ordinary text alone', () => {
    expect(maskString('Asgjë sekrete këtu: 12345')).toBe('Asgjë sekrete këtu: 12345');
  });
});

describe('createLogger', () => {
  it('writes one JSON line with ts, level, message and redacted meta', () => {
    const lines: { level: string; line: string }[] = [];
    const log = createLogger({ sink: (level, line) => lines.push({ level, line }), now: () => new Date('2026-10-02T00:00:00.000Z') });
    log.info('hyrje', { email: 'a@example.invalid', password: 'x' });
    log.warn('kujdes Bearer abc.def');
    log.error('gabim', { error: new Error('sk-ant-zzz') });
    expect(lines.map((l) => l.level)).toEqual(['info', 'warn', 'error']);
    for (const { line } of lines) expect(line).not.toContain('\n');
    const first = JSON.parse(lines[0].line);
    expect(first).toEqual({ ts: '2026-10-02T00:00:00.000Z', level: 'info', message: 'hyrje', meta: { email: 'a@example.invalid', password: REDACTED } });
    expect(JSON.parse(lines[1].line).message).toBe(`kujdes Bearer ${REDACTED}`);
    expect(lines[2].line).not.toContain('sk-ant-zzz');
  });
});
