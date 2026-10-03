// SYNTHETIC — format mirrors the documented API; values are not real
/**
 * Store contract suite, shared by the PGlite unit test and the real-Postgres integration test.
 * Each test creates its own users, and data-store tests use unique source ids, so tests never
 * depend on each other even though they share one database.
 */
import { randomBytes, randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import type { Db } from '@/lib/server/db';
import { EmailTakenError } from '@/lib/server/errors';
import type { Store } from '@/lib/server/store/types';
import { makeFx, makeObservation, makeProjectInput, makeSnapshot, makeTasks, WEIGHTS } from './helpers';

const FOREIGN_UUID = '00000000-0000-4000-8000-000000000000';
let counter = 0;
const unique = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}`;
const uniqueHash = () => randomBytes(32).toString('hex');

export function defineStoreContractSuite(label: string, ctx: () => { db: Db; store: Store }): void {
  const store = () => ctx().store;
  const db = () => ctx().db;

  async function newUser() {
    return store().users.create(`${unique('perdorues')}@example.invalid`, 'scrypt$hash');
  }

  async function count(table: string, where: string, params: unknown[]): Promise<number> {
    const { rows } = await db().query<{ n: number }>(`SELECT count(*)::int AS n FROM ${table} WHERE ${where}`, params);
    return Number(rows[0].n);
  }

  describe(`${label} — users`, () => {
    it('creates guests and registered users with normalised emails', async () => {
      const guest = await store().users.createGuest();
      expect(guest).toMatchObject({ isGuest: true, email: null, passwordHash: null });
      expect(guest.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);

      const email = `${unique('Ana')}@Example.Invalid`;
      const user = await store().users.create(`  ${email} `, 'scrypt$x');
      expect(user.email).toBe(email.toLowerCase());
      expect(user.isGuest).toBe(false);
      expect(await store().users.findByEmail(email.toUpperCase())).toEqual(user);
      expect(await store().users.findById(user.id)).toEqual(user);
      expect(await store().users.findById('not-a-uuid')).toBeNull();
      expect(await store().users.findById(FOREIGN_UUID)).toBeNull();
    });

    it('rejects a duplicate email with EmailTakenError', async () => {
      const user = await newUser();
      await expect(store().users.create(user.email!, 'scrypt$y')).rejects.toBeInstanceOf(EmailTakenError);
    });

    it('upgrades a guest once and keeps its id', async () => {
      const guest = await store().users.createGuest();
      const email = `${unique('guest')}@example.invalid`;
      const upgraded = await store().users.upgradeGuest(guest.id, email, 'scrypt$z');
      expect(upgraded).toMatchObject({ id: guest.id, email, isGuest: false, passwordHash: 'scrypt$z' });
      expect(await store().users.upgradeGuest(guest.id, `${unique('again')}@example.invalid`, 'h')).toBeNull();

      const other = await store().users.createGuest();
      await expect(store().users.upgradeGuest(other.id, email, 'h')).rejects.toBeInstanceOf(EmailTakenError);
      expect(await store().users.upgradeGuest('bad-id', email, 'h')).toBeNull();
    });

    it('deletes users', async () => {
      const user = await newUser();
      expect(await store().users.delete(user.id)).toBe(true);
      expect(await store().users.delete(user.id)).toBe(false);
      expect(await store().users.delete('bad-id')).toBe(false);
    });
  });

  describe(`${label} — sessions`, () => {
    it('creates, finds and deletes sessions', async () => {
      const user = await newUser();
      const tokenHash = uniqueHash();
      const session = await store().sessions.create(user.id, tokenHash, '2026-11-01T00:00:00.000Z');
      expect(session).toMatchObject({ userId: user.id, tokenHash, expiresAt: '2026-11-01T00:00:00.000Z' });
      expect(await store().sessions.findByTokenHash(tokenHash)).toEqual(session);
      await store().sessions.delete(session.id);
      expect(await store().sessions.findByTokenHash(tokenHash)).toBeNull();
    });

    it('deletes all sessions of a user and expired sessions only', async () => {
      const user = await newUser();
      const other = await newUser();
      const hashes = [uniqueHash(), uniqueHash(), uniqueHash(), uniqueHash(), uniqueHash()];
      const h = (n: number) => hashes[n];
      await store().sessions.create(user.id, h(1), '2026-10-01T00:00:00.000Z');
      await store().sessions.create(user.id, h(2), '2026-12-01T00:00:00.000Z');
      await store().sessions.create(other.id, h(3), '2026-09-01T00:00:00.000Z');
      await store().sessions.create(other.id, h(4), '2027-01-01T00:00:00.000Z');

      const removed = await store().sessions.deleteExpired('2026-10-02T00:00:00.000Z');
      expect(removed).toBeGreaterThanOrEqual(2);
      expect(await store().sessions.findByTokenHash(h(1))).toBeNull();
      expect(await store().sessions.findByTokenHash(h(3))).toBeNull();
      expect(await store().sessions.findByTokenHash(h(2))).not.toBeNull();

      await store().sessions.deleteForUser(user.id);
      expect(await store().sessions.findByTokenHash(h(2))).toBeNull();
      expect(await store().sessions.findByTokenHash(h(4))).not.toBeNull();
    });
  });

  describe(`${label} — profiles`, () => {
    it('upserts and reads a profile; updatedAt comes from the database', async () => {
      const user = await newUser();
      expect(await store().profiles.get(user.id)).toBeNull();
      const profile = {
        residenceCountry: 'ALB',
        operableCountries: ['ALB'],
        targetCountries: ['XKX'],
        capital: { amount: 12345, currency: 'EUR' },
        skills: ['dizajn_web'],
        experienceYears: 2,
        experienceSectors: ['digjitale' as const],
        hoursPerWeek: 20,
        assets: ['kompjuter'],
        teamMode: 'vetem' as const,
        businessModes: ['online' as const],
        marketScopes: ['lokal' as const],
        startLocations: ['shtepi' as const],
        isAdult: true,
        riskTolerance: 'mesatare' as const,
        ownerIncomeNeedMonthly: null,
        updatedAt: '1999-01-01T00:00:00.000Z',
      };
      const saved = await store().profiles.upsert(user.id, profile);
      expect(saved.updatedAt).not.toBe('1999-01-01T00:00:00.000Z');
      expect(saved).toEqual({ ...profile, updatedAt: saved.updatedAt });
      expect(await store().profiles.get(user.id)).toEqual(saved);

      const updated = await store().profiles.upsert(user.id, { ...profile, hoursPerWeek: 30 });
      expect(updated.hoursPerWeek).toBe(30);
      expect((await store().profiles.get(user.id))?.hoursPerWeek).toBe(30);
      expect(await store().profiles.get('bad-id')).toBeNull();
    });
  });

  describe(`${label} — projects & tasks & evidence`, () => {
    it('creates, reads, lists, updates and deletes a project', async () => {
      const user = await newUser();
      const input = makeProjectInput();
      const project = await store().projects.create(user.id, input);
      expect(project).toMatchObject({
        userId: user.id,
        title: input.title,
        archetypeId: input.archetypeId,
        countryCode: 'ALB',
        city: input.city,
        registrationCountry: 'ALB',
        customerCountries: ['ALB', 'XKX'],
        financialInputs: input.financialInputs,
        scoreWeights: WEIGHTS,
        dataSnapshot: input.dataSnapshot,
        notesSq: 'Shënim',
        analysisDate: input.analysisDate,
      });
      expect(await store().projects.get(user.id, project.id)).toEqual(project);

      const list = await store().projects.list(user.id);
      expect(list).toEqual([
        {
          id: project.id,
          title: input.title,
          archetypeId: input.archetypeId,
          countryCode: 'ALB',
          city: input.city,
          progressPct: 0,
          analysisDate: input.analysisDate,
          updatedAt: project.updatedAt,
          isDemo: false,
        },
      ]);

      const updated = await store().projects.update(user.id, project.id, {
        title: 'Titull i ri',
        city: null,
        notesSq: null,
        customerCountries: ['XKX'],
        scoreWeights: { ...WEIGHTS, kerkesa: 20, kapitali: 20 },
      });
      expect(updated).toMatchObject({ title: 'Titull i ri', city: null, notesSq: null, customerCountries: ['XKX'] });
      expect(updated?.scoreWeights.kapitali).toBe(20);
      expect(updated?.financialInputs).toEqual(input.financialInputs);

      expect(await store().projects.delete(user.id, project.id)).toBe(true);
      expect(await store().projects.get(user.id, project.id)).toBeNull();
      expect(await store().projects.delete(user.id, project.id)).toBe(false);
      expect(await count('tasks', 'project_id = $1', [project.id])).toBe(0);
    });

    it('flags demo projects in summaries and orders by last update', async () => {
      const user = await newUser();
      const real = await store().projects.create(user.id, makeProjectInput({ title: 'Real' }));
      const demo = await store().projects.create(user.id, makeProjectInput({ title: 'Demo', countryCode: 'ZZA', dataSnapshot: makeSnapshot(true) }));
      await store().projects.update(user.id, real.id, { title: 'Real (ndryshuar)' });
      const list = await store().projects.list(user.id);
      expect(list.map((p) => p.id)).toEqual([real.id, demo.id]);
      expect(list.find((p) => p.id === demo.id)?.isDemo).toBe(true);
      expect(list.find((p) => p.id === real.id)?.isDemo).toBe(false);
    });

    it('computes plan completion from task weights, excluding skipped tasks', async () => {
      const user = await newUser();
      const project = await store().projects.create(user.id, makeProjectInput());
      await store().tasks.update(user.id, project.id, 't2', { status: 'perfunduar' }); // weight 3
      await store().tasks.update(user.id, project.id, 't4', { status: 'anashkaluar' }); // weight 2 leaves the denominator
      await store().tasks.update(user.id, project.id, 't3', { status: 'ne_progres' }); // counts as not done
      const [summary] = await store().projects.list(user.id);
      expect(summary.progressPct).toBe(38); // 3 / (1 + 3 + 4) = 37.5 %
    });

    it('lists, updates and replaces tasks', async () => {
      const user = await newUser();
      const project = await store().projects.create(user.id, makeProjectInput());
      const tasks = await store().tasks.list(user.id, project.id);
      expect(tasks).toEqual(makeTasks().map((t) => ({ ...t, completedAt: null, notesSq: null })));

      const done = await store().tasks.update(user.id, project.id, 't1', { status: 'perfunduar', notesSq: 'U krye' });
      expect(done).toMatchObject({ id: 't1', status: 'perfunduar', notesSq: 'U krye' });
      expect(done?.completedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);

      const notesOnly = await store().tasks.update(user.id, project.id, 't1', { notesSq: null });
      expect(notesOnly).toMatchObject({ status: 'perfunduar', notesSq: null, completedAt: done?.completedAt });

      const reopened = await store().tasks.update(user.id, project.id, 't1', { status: 'ne_progres' });
      expect(reopened).toMatchObject({ status: 'ne_progres', completedAt: null });

      expect(await store().tasks.update(user.id, project.id, 'nuk-ekziston', { status: 'perfunduar' })).toBeNull();

      const replacement = makeTasks()
        .slice(0, 2)
        .map((t) => ({ ...t, id: `r-${t.id}`, status: 'perfunduar' as const, completedAt: '2026-10-01T00:00:00.000Z' }));
      expect(await store().tasks.replaceAll(user.id, project.id, replacement)).toBe(true);
      const after = await store().tasks.list(user.id, project.id);
      expect(after?.map((t) => t.id)).toEqual(['r-t1', 'r-t2']);
      expect(after?.[0].completedAt).toBe('2026-10-01T00:00:00.000Z');
      const [summary] = await store().projects.list(user.id);
      expect(summary.progressPct).toBe(100);
    });

    it('adds, lists and deletes evidence; dates stay YYYY-MM-DD', async () => {
      const user = await newUser();
      const project = await store().projects.create(user.id, makeProjectInput());
      const first = await store().evidence.add(user.id, project.id, {
        type: 'interviste',
        summarySq: 'Intervistë me klient',
        quantity: 3,
        amount: null,
        sourceSq: 'Takim',
        collectedAt: '2026-09-01',
      });
      expect(first).toMatchObject({ projectId: project.id, type: 'interviste', quantity: 3, amount: null, collectedAt: '2026-09-01' });
      const second = await store().evidence.add(user.id, project.id, {
        type: 'parapagim',
        summarySq: 'Parapagim',
        quantity: null,
        amount: 12.5,
        sourceSq: 'Faturë',
        collectedAt: '2026-09-15',
      });
      const list = await store().evidence.list(user.id, project.id);
      expect(list?.map((e) => e.id)).toEqual([second!.id, first!.id]);
      expect(list?.[0].amount).toBe(12.5);
      expect(await store().evidence.delete(user.id, project.id, first!.id)).toBe(true);
      expect(await store().evidence.delete(user.id, project.id, first!.id)).toBe(false);
      expect((await store().evidence.list(user.id, project.id))?.length).toBe(1);
    });
  });

  describe(`${label} — chat`, () => {
    it('keeps general and project conversations apart, chronological, with a limit', async () => {
      const user = await newUser();
      const project = await store().projects.create(user.id, makeProjectInput());
      await store().chat.append(user.id, null, [
        { role: 'user', content: 'p1' },
        { role: 'assistant', content: 'a1' },
      ]);
      await store().chat.append(user.id, project.id, [{ role: 'user', content: 'projekt-1' }]);
      await store().chat.append(user.id, null, [{ role: 'user', content: 'p2' }]);

      expect((await store().chat.list(user.id, null)).map((m) => m.content)).toEqual(['p1', 'a1', 'p2']);
      expect(await store().chat.list(user.id, project.id)).toEqual([{ role: 'user', content: 'projekt-1' }]);
      expect((await store().chat.list(user.id, null, 2)).map((m) => m.content)).toEqual(['a1', 'p2']);
      expect(await store().chat.list(user.id, 'bad-id')).toEqual([]);
    });
  });

  describe(`${label} — isolation between users`, () => {
    it('user B cannot see or change anything of user A', async () => {
      const a = await newUser();
      const b = await newUser();
      const project = await store().projects.create(a.id, makeProjectInput());
      const evidence = await store().evidence.add(a.id, project.id, {
        type: 'vezhgim',
        summarySq: 'Vëzhgim',
        sourceSq: 'Terren',
        collectedAt: '2026-09-02',
      });
      await store().chat.append(a.id, project.id, [{ role: 'user', content: 'sekret i A' }]);
      await store().chat.append(a.id, null, [{ role: 'user', content: 'bisedë e përgjithshme e A' }]);

      const before = {
        project: await store().projects.get(a.id, project.id),
        tasks: await store().tasks.list(a.id, project.id),
        evidence: await store().evidence.list(a.id, project.id),
        chat: await store().chat.list(a.id, project.id),
        general: await store().chat.list(a.id, null),
      };

      expect(await store().projects.list(b.id)).toEqual([]);
      expect(await store().projects.get(b.id, project.id)).toBeNull();
      expect(await store().projects.update(b.id, project.id, { title: 'Pushtuar' })).toBeNull();
      expect(await store().projects.delete(b.id, project.id)).toBe(false);

      expect(await store().tasks.list(b.id, project.id)).toBeNull();
      expect(await store().tasks.update(b.id, project.id, 't1', { status: 'perfunduar' })).toBeNull();
      expect(await store().tasks.replaceAll(b.id, project.id, [])).toBe(false);

      expect(await store().evidence.list(b.id, project.id)).toBeNull();
      expect(
        await store().evidence.add(b.id, project.id, { type: 'tjeter', summarySq: 'x', sourceSq: 'x', collectedAt: '2026-09-03' }),
      ).toBeNull();
      expect(await store().evidence.delete(b.id, project.id, evidence!.id)).toBe(false);

      expect(await store().chat.list(b.id, project.id)).toEqual([]);
      expect(await store().chat.list(b.id, null)).toEqual([]);
      await store().chat.append(b.id, project.id, [{ role: 'user', content: 'injektim nga B' }]);
      expect(await store().chat.list(b.id, project.id)).toEqual([]);

      // B's own project id cannot be used to reach A's evidence either.
      const bProject = await store().projects.create(b.id, makeProjectInput());
      expect(await store().evidence.delete(b.id, bProject.id, evidence!.id)).toBe(false);
      expect(await store().tasks.update(b.id, bProject.id, 't1', { status: 'perfunduar' })).not.toBeNull();

      // Malformed ids behave like missing records instead of throwing.
      expect(await store().projects.get(b.id, 'x; DROP TABLE projects')).toBeNull();
      expect(await store().tasks.list(b.id, 'nope')).toBeNull();
      expect(await store().evidence.delete(b.id, project.id, 'nope')).toBe(false);

      const after = {
        project: await store().projects.get(a.id, project.id),
        tasks: await store().tasks.list(a.id, project.id),
        evidence: await store().evidence.list(a.id, project.id),
        chat: await store().chat.list(a.id, project.id),
        general: await store().chat.list(a.id, null),
      };
      expect(after).toEqual(before);
      expect(await count('chat_messages', 'project_id = $1', [project.id])).toBe(1);
    });
  });

  describe(`${label} — account deletion`, () => {
    it('users.delete cascades to every piece of user data', async () => {
      const user = await newUser();
      await store().profiles.upsert(user.id, {
        residenceCountry: 'ALB',
        operableCountries: [],
        targetCountries: [],
        capital: { amount: 1, currency: 'EUR' },
        skills: [],
        experienceYears: 0,
        experienceSectors: [],
        hoursPerWeek: 1,
        assets: [],
        teamMode: 'vetem',
        businessModes: ['online'],
        marketScopes: ['lokal'],
        startLocations: ['shtepi'],
        isAdult: true,
        riskTolerance: 'e_ulet',
      });
      const tokenHash = uniqueHash();
      await store().sessions.create(user.id, tokenHash, '2027-01-01T00:00:00.000Z');
      const project = await store().projects.create(user.id, makeProjectInput());
      await store().evidence.add(user.id, project.id, { type: 'pagese', summarySq: 'Pagesë', sourceSq: 'x', collectedAt: '2026-09-04', amount: 1.11 });
      await store().chat.append(user.id, project.id, [{ role: 'user', content: 'x' }]);
      await store().chat.append(user.id, null, [{ role: 'user', content: 'y' }]);

      expect(await store().users.delete(user.id)).toBe(true);
      expect(await count('profiles', 'user_id = $1', [user.id])).toBe(0);
      expect(await count('sessions', 'user_id = $1', [user.id])).toBe(0);
      expect(await count('projects', 'user_id = $1', [user.id])).toBe(0);
      expect(await count('tasks', 'project_id = $1', [project.id])).toBe(0);
      expect(await count('evidence', 'project_id = $1', [project.id])).toBe(0);
      expect(await count('chat_messages', 'user_id = $1', [user.id])).toBe(0);
    });
  });

  describe(`${label} — rate limit counters`, () => {
    it('counts hits per key in fixed windows', async () => {
      const key = unique('rl');
      const t0 = new Date('2026-10-02T10:00:00.000Z');
      const minute = 60_000;
      expect(await store().rateLimit.hit(key, minute, t0)).toBe(1);
      expect(await store().rateLimit.hit(key, minute, new Date(t0.getTime() + 30_000))).toBe(2);
      expect(await store().rateLimit.hit(`${key}-other`, minute, t0)).toBe(1);
      expect(await store().rateLimit.hit(key, minute, new Date(t0.getTime() + minute))).toBe(1);
      await expect(store().rateLimit.hit(key, 2 * 24 * 60 * minute, t0)).rejects.toThrow();
    });
  });

  describe(`${label} — data store`, () => {
    it('upserts observations idempotently, keeps null as null and dedupes a batch', async () => {
      const sourceId = unique('src');
      const obs = [
        makeObservation({ sourceId, period: '2022', value: 1.11 }),
        makeObservation({ sourceId, period: '2023', value: null }),
        makeObservation({ sourceId, period: '2023', value: null, obsStatus: 'E' }), // duplicate key: last wins
      ];
      expect(await store().data.upsertObservations(obs)).toBe(2);
      expect(await store().data.upsertObservations(obs)).toBe(2);
      expect(await count('observations', 'source_id = $1', [sourceId])).toBe(2);

      const stored = await store().data.getObservations({ sourceIds: [sourceId] });
      expect(stored).toEqual([makeObservation({ sourceId, period: '2022', value: 1.11 }), makeObservation({ sourceId, period: '2023', value: null, obsStatus: 'E' })]);
      expect(stored[1].value).toBeNull();

      await store().data.upsertObservations([makeObservation({ sourceId, period: '2022', value: 2.22, retrievedAt: '2026-10-02T00:00:00.000Z' })]);
      const [updated] = await store().data.getObservations({ sourceIds: [sourceId], indicatorCodes: ['gdp_growth'] });
      expect(updated).toMatchObject({ value: 2.22, retrievedAt: '2026-10-02T00:00:00.000Z' });
    });

    it('filters observations and hides demo rows unless includeDemo is true', async () => {
      const sourceId = unique('src');
      await store().data.upsertObservations([
        makeObservation({ sourceId, countryCode: 'ALB', indicatorCode: 'inflation_cpi', value: 3.33 }),
        makeObservation({ sourceId, countryCode: 'XKX', indicatorCode: 'inflation_cpi', value: 4.44 }),
        makeObservation({ sourceId, countryCode: 'XKX', indicatorCode: 'unemployment', value: 5.55 }),
        makeObservation({ sourceId, countryCode: 'ZZA', indicatorCode: 'unemployment', value: 6.66, isDemo: true }),
      ]);
      const byCountry = await store().data.getObservations({ sourceIds: [sourceId], countryCodes: ['XKX'] });
      expect(byCountry.map((o) => o.value)).toEqual([4.44, 5.55]);
      const byIndicator = await store().data.getObservations({ sourceIds: [sourceId], indicatorCodes: ['unemployment'] });
      expect(byIndicator.map((o) => o.countryCode)).toEqual(['XKX']);
      const withDemo = await store().data.getObservations({ sourceIds: [sourceId], indicatorCodes: ['unemployment'], includeDemo: true });
      expect(withDemo.map((o) => o.countryCode)).toEqual(['XKX', 'ZZA']);
      expect(withDemo[1].isDemo).toBe(true);
      expect(await store().data.getObservations({ sourceIds: [sourceId], countryCodes: [] })).toEqual([]);
    });

    it('refuses demo observations outside the demo economies', async () => {
      await expect(store().data.upsertObservations([makeObservation({ sourceId: unique('src'), isDemo: true, countryCode: 'ALB' })])).rejects.toThrow();
    });

    it('upserts large batches in chunks', async () => {
      const sourceId = unique('src');
      const many = Array.from({ length: 1200 }, (_, i) => makeObservation({ sourceId, period: String(1000 + i), value: i / 100 }));
      expect(await store().data.upsertObservations(many)).toBe(1200);
      expect(await count('observations', 'source_id = $1', [sourceId])).toBe(1200);
    });

    it('keeps fetch logs and returns the latest per source and scope', async () => {
      const sourceId = unique('src');
      await store().data.addFetchLog({ sourceId, scope: 'indicator:gdp_growth', startedAt: '2026-10-01T00:00:00.000Z', finishedAt: '2026-10-01T00:01:00.000Z', status: 'gabim', httpStatus: 503, messageSq: 'Burimi nuk u përgjigj.' });
      await store().data.addFetchLog({ sourceId, scope: 'indicator:gdp_growth', startedAt: '2026-10-02T00:00:00.000Z', finishedAt: '2026-10-02T00:01:00.000Z', status: 'ok', httpStatus: 200, rows: 12345 });
      await store().data.addFetchLog({ sourceId, scope: 'countries', startedAt: '2026-09-30T00:00:00.000Z', finishedAt: null, status: 'pjesshem' });

      const latest = (await store().data.getLatestFetchLogs()).filter((l) => l.sourceId === sourceId);
      expect(latest).toHaveLength(2);
      const gdp = latest.find((l) => l.scope === 'indicator:gdp_growth');
      expect(gdp).toMatchObject({ status: 'ok', httpStatus: 200, rows: 12345, startedAt: '2026-10-02T00:00:00.000Z' });
      const countries = latest.find((l) => l.scope === 'countries');
      expect(countries).toMatchObject({ status: 'pjesshem', finishedAt: null, httpStatus: null, messageSq: null });
      expect(countries?.rows).toBeUndefined();

      const recent = await store().data.getRecentFetchLogs(1000);
      const mine = recent.filter((l) => l.sourceId === sourceId);
      expect(mine.map((l) => l.startedAt)).toEqual(['2026-10-02T00:00:00.000Z', '2026-10-01T00:00:00.000Z', '2026-09-30T00:00:00.000Z']);
      expect(await store().data.getRecentFetchLogs(1)).toHaveLength(1);
    });

    it('updates a fetch log entry when the same id is reused', async () => {
      const sourceId = unique('src');
      const id = randomUUID();
      await store().data.addFetchLog({ id, sourceId, scope: 'fx:EUR', startedAt: '2026-10-02T00:00:00.000Z', finishedAt: null, status: 'pjesshem' });
      await store().data.addFetchLog({ id, sourceId, scope: 'fx:EUR', startedAt: '2026-10-02T00:00:00.000Z', finishedAt: '2026-10-02T00:00:05.000Z', status: 'ok', rows: 2 });
      const logs = (await store().data.getRecentFetchLogs(1000)).filter((l) => l.sourceId === sourceId);
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({ id, status: 'ok', rows: 2, finishedAt: '2026-10-02T00:00:05.000Z' });
    });

    it('returns the latest FX rate per pair and source', async () => {
      const sourceId = unique('fx');
      expect(
        await store().data.upsertFxRates([
          makeFx({ sourceId, rateDate: '2026-09-29', rate: 1.11 }),
          makeFx({ sourceId, rateDate: '2026-09-30', rate: 2.22 }),
          makeFx({ sourceId, base: 'EUR', quote: 'USD', rateDate: '2026-09-28', rate: 3.33 }),
          makeFx({ sourceId: `${sourceId}-b`, rateDate: '2026-09-27', rate: 4.44, kind: 'manuale' }),
        ]),
      ).toBe(4);
      await store().data.upsertFxRates([makeFx({ sourceId, rateDate: '2026-09-30', rate: 2.25 })]);
      const rates = (await store().data.getFxRates()).filter((r) => r.sourceId.startsWith(sourceId));
      expect(rates).toEqual([
        makeFx({ sourceId, rateDate: '2026-09-30', rate: 2.25 }),
        makeFx({ sourceId: `${sourceId}-b`, rateDate: '2026-09-27', rate: 4.44, kind: 'manuale' }),
        makeFx({ sourceId, base: 'EUR', quote: 'USD', rateDate: '2026-09-28', rate: 3.33 }),
      ]);
    });

    it('stores country metadata', async () => {
      const wb = { regionSq: 'Rajon testimi', incomeLevel: 'Testim', lendingType: null, retrievedAt: '2026-10-01T00:00:00.000Z' };
      expect(await store().data.upsertCountryMeta([{ code: 'ALB', wb }, { code: 'XKX', wb }])).toBe(2);
      await store().data.upsertCountryMeta([{ code: 'XKX', wb: { ...wb, incomeLevel: 'Ndryshuar' } }]);
      const meta = await store().data.getCountryMeta();
      expect(meta.ALB).toEqual(wb);
      expect(meta.XKX.incomeLevel).toBe('Ndryshuar');
    });
  });
}
