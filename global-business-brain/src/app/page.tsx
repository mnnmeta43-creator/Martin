import Link from 'next/link';
import { CLAIM_KIND_LABELS, EVIDENCE_LABELS, SECTORS } from '@/lib/domain/taxonomy';
import { formatDateTime, formatMoney } from '@/lib/finance/format';
import { SOURCES } from '@/lib/data/sources/registry';
import { getArchetype } from '@/lib/ideas/archetypes';
import { IdeaCard } from '@/components/ideas/IdeaCard';
import { ButtonLink } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Notice } from '@/components/ui/Notice';
import { CoverageBadge, DemoBadge } from '@/components/ui/StatusBadge';
import { StoreUnavailable } from '@/components/ui/StoreUnavailable';
import { countryName } from './_lib/data';
import { loadIdeas } from './_lib/ideas';
import { defaultCountryCode, getViewer } from './_lib/viewer';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const viewer = await getViewer();
  const code = defaultCountryCode(viewer);
  const [projects, ideas, logs] = await Promise.all([
    viewer.store && viewer.user ? viewer.store.projects.list(viewer.user.id) : Promise.resolve([]),
    viewer.profile ? loadIdeas(viewer, code) : Promise.resolve(null),
    viewer.store ? viewer.store.data.getLatestFetchLogs() : Promise.resolve([]),
  ]);
  const lastOk = logs.filter((l) => l.status === 'ok').sort((a, b) => (b.finishedAt ?? '').localeCompare(a.finishedAt ?? ''))[0];
  const failing = logs.filter((l) => l.status === 'gabim');
  const withAdapters = SOURCES.filter((s) => s.apiBaseUrl && (s.status === 'integruar' || s.status === 'integruar_pa_verifikim_live'));
  const notYetVerified = withAdapters.filter((s) => s.status === 'integruar_pa_verifikim_live').length;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-line bg-gradient-to-br from-surface to-bg p-5 sm:p-8">
        <p className="text-sm font-medium text-accent-strong">Global Business Brain</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Zbulo ku ka mundësi. Kupto pse. Ndërto biznesin nga zero.</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Nga të dhënat makroekonomike te problemi i klientit, oferta, modeli financiar i kontrollueshëm dhe një plan pune hap pas hapi. Asnjë ide nuk paraqitet si fitim i garantuar.
        </p>
        <ol className="mt-5 grid gap-2 text-sm sm:grid-cols-3">
          {[
            ['1', 'Plotëso profilin', 'Kapitali, aftësitë, koha, ku mund të operoni.', '/profili'],
            ['2', 'Zgjidh vendin dhe idenë', 'Të dhëna me burim, pse funksionon dhe pse mund të dështojë.', '/ide'],
            ['3', 'Ruaj projektin', 'Buxhet i redaktueshëm, plan 0–100, detyra dhe prova.', '/projektet'],
          ].map(([n, t, d, href]) => (
            <li key={n}>
              <Link href={href} className="flex h-full gap-3 rounded-2xl border border-line bg-surface-2/70 p-3 hover:border-accent/60">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">{n}</span>
                <span>
                  <span className="block font-medium text-ink">{t}</span>
                  <span className="block text-muted">{d}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {viewer.storeErrorSq ? <StoreUnavailable messageSq={viewer.storeErrorSq} /> : null}
      {viewer.demoMode ? (
        <Notice tone="demo" title="Modaliteti DEMO është aktiv">
          Ekonomitë fiktive “Demolandë” (ZZA, ZZB, ZZC) kanë të dhëna të sajuara vetëm për të provuar aplikacionin. Ato janë të shënuara DEMO kudo dhe nuk përdoren për rekomandime reale.
        </Notice>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="Profili im" actions={<ButtonLink href="/profili" variant="secondary" size="sm">{viewer.profile ? 'Ndrysho' : 'Plotëso'}</ButtonLink>} />
          {viewer.profile ? (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Vendbanimi</dt>
                <dd className="text-right text-ink">{countryName(viewer.profile.residenceCountry, viewer.demoMode)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Tregjet e synuara</dt>
                <dd className="text-right text-ink">{viewer.profile.targetCountries.map((c) => countryName(c, viewer.demoMode)).join(', ')}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Kapitali</dt>
                <dd className="text-right tabular text-ink">{formatMoney(viewer.profile.capital.amount, viewer.profile.capital.currency)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Aftësi / mjete</dt>
                <dd className="text-right text-ink">
                  {viewer.profile.skills.length} / {viewer.profile.assets.length}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Kohë në javë</dt>
                <dd className="text-right text-ink">{viewer.profile.hoursPerWeek} orë</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-muted">Pa profil, idetë nuk mund të personalizohen. Plotësimi zgjat rreth 3 minuta dhe mund të nisni pa llogari (si vizitor).</p>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Projektet e mia"
            subtitle="Përqindja tregon sa është kryer plani, jo gjasat e suksesit."
            actions={<ButtonLink href="/projektet" variant="ghost" size="sm">Të gjitha</ButtonLink>}
          />
          {projects.length === 0 ? (
            <EmptyState title="Ende nuk keni projekte">Hapni një ide dhe zgjidhni “Ruaj si projekt” për të marrë buxhetin, planin 0–100 dhe detyrat.</EmptyState>
          ) : (
            <ul className="space-y-2">
              {projects.slice(0, 5).map((p) => (
                <li key={p.id}>
                  <Link href={`/projektet/${p.id}`} className="block rounded-xl border border-line bg-surface-2/60 p-3 hover:border-accent/60">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-ink">{p.title}</span>
                      <span className="flex items-center gap-2">
                        {p.isDemo ? <DemoBadge /> : null}
                        <span className="text-sm tabular text-muted">{Math.round(p.progressPct)}%</span>
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-accent-soft" aria-hidden="true">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${p.progressPct}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-faint">
                      {countryName(p.countryCode, true)}
                      {p.city ? ` · ${p.city}` : ''} · analiza e datës {formatDateTime(p.analysisDate)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {ideas ? (
        <section>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-ink">Ide që përputhen me profilin — {countryName(code, viewer.demoMode)}</h2>
              <p className="text-sm text-muted">Renditur sipas pikëzimit të përshtatjes (mjet orientimi, jo probabilitet fitimi).</p>
            </div>
            <div className="flex items-center gap-2">
              <CoverageBadge level={ideas.ctx.coverage.level} />
              <ButtonLink href={`/ide?vendi=${code}`} variant="ghost" size="sm">
                Të gjitha idetë
              </ButtonLink>
            </div>
          </div>
          {ideas.recommendations.length === 0 ? (
            <EmptyState title="Asnjë ide nuk përputhet plotësisht me profilin">Shihni listën e plotë me arsyet pse disa ide janë përjashtuar ose kërkojnë ekip.</EmptyState>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {ideas.recommendations.slice(0, 3).map((r) => (
                <IdeaCard key={r.archetypeId} rec={r} href={`/ide/${r.archetypeId}?vendi=${code}`} sectorLabel={SECTORS[getArchetype(r.archetypeId)?.sector ?? 'digjitale']} />
              ))}
            </div>
          )}
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Gjendja e të dhënave" actions={<ButtonLink href="/burimet" variant="ghost" size="sm">Burimet</ButtonLink>} />
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between gap-2">
              <span className="text-muted">Burime me përshtatës të ndërtuar</span>
              <span className="text-right text-ink">
                {withAdapters.length}
                {notYetVerified > 0 ? ` (ende pa verifikim live: ${notYetVerified})` : ''}
              </span>
            </li>
            <li className="flex justify-between gap-2">
              <span className="text-muted">Rifreskimi i fundit i suksesshëm</span>
              <span className="text-right text-ink">{lastOk?.finishedAt ? formatDateTime(lastOk.finishedAt) : 'Asnjëherë — të dhënat nuk janë sinkronizuar'}</span>
            </li>
            <li className="flex justify-between gap-2">
              <span className="text-muted">Gabime në rifreskimin e fundit</span>
              <span className={failing.length ? 'text-bad' : 'text-ink'}>{failing.length}</span>
            </li>
          </ul>
          <p className="mt-3 text-xs text-faint">
            Treguesit periodikë shfaqen si “Të dhënat më të fundit të disponueshme” me periudhën e tyre, jo si matje në kohë reale.
          </p>
        </Card>
        <Card>
          <CardHeader title="Si t’i lexoni pretendimet" />
          <ul className="space-y-1.5 text-sm text-muted">
            {Object.entries(CLAIM_KIND_LABELS).map(([k, v]) => (
              <li key={k}>
                <span className="font-medium text-ink">{v}</span>
                {k === 'fakt' ? ' — vlerë e matur nga një burim, me periudhë dhe datë.' : null}
                {k === 'interpretim' ? ' — çfarë mund të nënkuptojë një fakt; mund të jetë i gabuar.' : null}
                {k === 'supozim' ? ' — vlerë që e vendosim ne ose ju; duhet verifikuar.' : null}
                {k === 'parashikim' ? ' — vlerësim për të ardhmen; nuk është matje.' : null}
              </li>
            ))}
            {Object.values(EVIDENCE_LABELS).map((v) => (
              <li key={v} className="text-ink">
                “{v}”
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
