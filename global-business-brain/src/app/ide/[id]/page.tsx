import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FAILURE_KIND_LABELS, SECTORS, BUSINESS_MODE_LABELS } from '@/lib/domain/taxonomy';
import { getCountries } from '@/lib/data/countries';
import { getArchetype } from '@/lib/ideas/archetypes';
import { formatMoney, formatNumber } from '@/lib/finance/format';
import { generatePlan } from '@/lib/plan/generate';
import { tasksForHorizon } from '@/lib/plan/progress';
import { CountrySelectForm } from '@/components/countries/CountrySelectForm';
import { LocationView } from '@/components/ideas/LocationView';
import { SaveProjectButton } from '@/components/ideas/SaveProjectButton';
import { ScoreBreakdown } from '@/components/ideas/ScoreBreakdown';
import { SixStepsView } from '@/components/ideas/SixStepsView';
import { ValidationKitView } from '@/components/ideas/ValidationKitView';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { CitationList, ClaimList } from '@/components/ui/Evidence';
import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatTile } from '@/components/ui/StatTile';
import { CoverageBadge, DemoBadge } from '@/components/ui/StatusBadge';
import { StoreUnavailable } from '@/components/ui/StoreUnavailable';
import { Tabs } from '@/components/ui/Tabs';
import { loadIdeaView } from '../../_lib/ideas';
import { defaultCountryCode, getViewer } from '../../_lib/viewer';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params;
  return { title: getArchetype(id)?.nameSq ?? 'Ideja' };
}

const EVIDENCE_TEXT = { e_larte: 'Prova të forta', mesatare: 'Prova mesatare', e_ulet: 'Prova të dobëta', shume_e_ulet: 'Prova shumë të dobëta' } as const;

export default async function IdeaPage(props: Props) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const archetype = getArchetype(id);
  if (!archetype) notFound();
  const viewer = await getViewer();
  const countries = getCountries({ includeDemo: viewer.demoMode });
  const requested = (Array.isArray(sp.vendi) ? sp.vendi[0] : sp.vendi ?? '').toUpperCase();
  const code = countries.some((c) => c.code === requested) ? requested : defaultCountryCode(viewer);
  if (!viewer.store) return <StoreUnavailable messageSq={viewer.storeErrorSq ?? 'Databaza mungon.'} />;
  const view = await loadIdeaView(viewer, id, code);
  if (!view) notFound();
  const { rec, ctx, projections, inputs } = view;
  const base = projections?.baze ?? null;
  const cur = inputs?.currency ?? viewer.profile?.capital.currency ?? 'EUR';
  const planPreview = inputs && base ? generatePlan({ archetype, countryCode: code, city: viewer.profile?.targetCity ?? null, inputs, projection: base }) : null;
  const first7 = planPreview ? tasksForHorizon(planPreview.tasks, 7) : [];
  const allCitations = [...rec.claims.macro, ...rec.claims.whyWork, ...rec.claims.whyFail].flatMap((c) => c.citations);
  const uniqueCitations = allCitations.filter((c, i) => allCitations.findIndex((d) => d.url === c.url && d.indicatorCode === c.indicatorCode && d.period === c.period) === i);

  const summary = (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Çfarë ofron dhe kujt" />
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted">Produkti / shërbimi konkret</dt>
              <dd className="text-ink">{archetype.offerSq}</dd>
            </div>
            <div>
              <dt className="text-muted">Klienti që paguan</dt>
              <dd className="text-ink">{archetype.payingCustomerSq}</dd>
            </div>
            <div>
              <dt className="text-muted">Problemi që zgjidh</dt>
              <dd className="text-ink">{archetype.problemSq}</dd>
            </div>
            <div>
              <dt className="text-muted">Ku propozohet të operojë</dt>
              <dd className="text-ink">
                {ctx.country.nameSq}
                {viewer.profile?.targetCity ? ` · ${viewer.profile.targetCity} (pa të dhëna të verifikuara për qytetin — shihni planin e kërkimit në terren)` : ''}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Mënyra e gjenerimit të të ardhurave</dt>
              <dd className="text-ink">{archetype.revenueModelSq}</dd>
            </div>
          </dl>
        </Card>
        <Card>
          <CardHeader title="Kapitali dhe kostot" subtitle="Intervale nga supozimet e bibliotekës — ndryshojini me oferta reale." />
          <div className="space-y-2">
            <StatTile
              label="Kapitali fillestar (interval)"
              value={rec.capitalRange ? `${formatMoney(rec.capitalRange.low, rec.capitalRange.currency)} – ${formatMoney(rec.capitalRange.high, rec.capitalRange.currency)}` : 'Mungon kursi'}
              note={rec.capitalRange?.basisSq}
            />
            <StatTile
              label="Kostot fikse mujore (interval)"
              value={rec.monthlyCostRange ? `${formatMoney(rec.monthlyCostRange.low, rec.monthlyCostRange.currency)} – ${formatMoney(rec.monthlyCostRange.high, rec.monthlyCostRange.currency)}` : '—'}
            />
            {base ? (
              <StatTile
                label="Kapitali i nevojshëm (skenari bazë)"
                value={formatMoney(base.capital.totalRequired, cur)}
                note="Investimi + deficiti maksimal i parasë + rezerva"
                tone={base.capital.gap > 0 ? 'warn' : 'ok'}
              />
            ) : null}
          </div>
          <div className="mt-3">
            <ButtonLink href={`/ide/${id}/kalkulatori?vendi=${code}`} variant="secondary" size="sm">
              Hap kalkulatorin
            </ButtonLink>
          </div>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Pse përputhet ose jo me profilin tuaj" />
          {view.usingPlaceholderProfile ? <Notice tone="warn">Nuk keni profil — vlerësimi përdor një profil neutral.</Notice> : null}
          <ul className="mt-2 space-y-1.5 text-sm">
            {rec.fit.matchesSq.map((m) => (
              <li key={m} className="text-ok">
                ✓ <span className="text-ink">{m}</span>
              </li>
            ))}
            {rec.fit.mismatchesSq.map((m) => (
              <li key={m} className="text-warn">
                ! <span className="text-ink">{m}</span>
              </li>
            ))}
            {rec.fit.blockersSq.map((m) => (
              <li key={m} className="text-bad">
                ✕ <span className="text-ink">{m}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Pikëzimi krahasues" subtitle={`Cilësia e provave: ${EVIDENCE_TEXT[rec.evidence.level]} · mbulimi: vlerësuar veçmas`} />
          <ScoreBreakdown dimensions={rec.score.dimensions} initialWeights={rec.score.weights} noteSq={rec.score.noteSq} />
        </Card>
      </div>
      <Card>
        <CardHeader title="Ma shpjego në 6 hapa" />
        <SixStepsView steps={view.sixSteps} />
      </Card>
    </div>
  );

  const deep = (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Pse mund të funksionojë" subtitle="Ndryshimi → problemi → klienti → oferta → arsyeja për të paguar → kushtet për fitim" />
        <ClaimList claims={rec.claims.whyWork} />
      </Card>
      <Card>
        <CardHeader title="Pse mund të dështojë" subtitle="Përfshin provat që do ta rrëzonin idenë." />
        <ClaimList claims={rec.claims.whyFail} />
      </Card>
      <Card>
        <CardHeader title="Konteksti makro (kontekst, jo validim)" subtitle="Të dhënat më të fundit të disponueshme, me periudhë dhe burim." />
        <ClaimList claims={rec.claims.macro} emptyText="Nuk ka tregues makro të lidhur me këtë ide për këtë vend." />
        <p className="mt-3 text-xs text-faint">
          Rritja e ekonomisë nuk do të thotë që ky biznes do të fitojë. Vetëm provat nga klientët lokalë e konfirmojnë kërkesën.{' '}
          <Link href={`/shtetet/${code}`} className="text-accent-strong underline">
            Analiza e plotë makro
          </Link>
        </p>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Konkurrentët dhe alternativat" />
          <p className="mb-2 text-xs text-warn">Konkurrentë konkretë nuk janë verifikuar për këtë vend. Më poshtë janë llojet e alternativave që klientët përdorin zakonisht — numërojini në terren.</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
            {archetype.competitorTypesSq.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p className="mb-1 mt-3 text-sm font-medium text-ink">Si të dalloheni</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
            {archetype.differentiationSq.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Rreziqet dhe kushtet" />
          <ul className="space-y-1.5 text-sm">
            {archetype.failureModes.map((f) => (
              <li key={f.textSq}>
                <span className="font-medium text-ink">{FAILURE_KIND_LABELS[f.kind]}:</span> <span className="text-muted">{f.textSq}</span>
              </li>
            ))}
          </ul>
          {archetype.regulated ? (
            <Notice tone="warn" title="Veprimtari e rregulluar — Kërkon verifikim lokal" className="mt-3">
              <ul className="list-disc space-y-1 pl-5">
                {archetype.regulationNotesSq.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              {archetype.licensedProfessionalsSq.length > 0 ? <p className="mt-2">Profesionistë të licencuar të nevojshëm: {archetype.licensedProfessionalsSq.join(', ')}.</p> : null}
            </Notice>
          ) : (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-muted">
              {archetype.regulationNotesSq.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      <Card>
        <CardHeader title="Ku ta nis: shteti, qyteti dhe zona" />
        <LocationView analysis={view.location} />
      </Card>
      {base ? (
        <Card>
          <CardHeader title="Modeli financiar — skenari bazë" subtitle="Sipas supozimeve të redaktueshme; nuk është garanci." />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Të ardhura (12 muaj)" value={formatMoney(base.totals.revenue, cur)} />
            <StatTile label="Rezultati operativ (12 muaj)" value={formatMoney(base.totals.operatingResult, cur)} tone={base.totals.operatingResult < 0 ? 'bad' : undefined} />
            <StatTile label="Gjendja më e ulët e parasë" value={formatMoney(base.minCashBalance, cur)} tone={base.minCashBalance < 0 ? 'bad' : undefined} />
            <StatTile
              label="Pika e barazimit"
              value={base.unitEconomics.breakEvenCustomersPerMonth === null ? 'Nuk arrihet' : `${formatNumber(Math.ceil(base.unitEconomics.breakEvenCustomersPerMonth))} klientë/muaj`}
            />
          </div>
          <p className="mt-3 text-sm text-muted">{base.payback.statementSq}</p>
        </Card>
      ) : view.inputsErrorSq ? (
        <Notice tone="warn" title="Modeli financiar nuk u ndërtua">
          {view.inputsErrorSq}
        </Notice>
      ) : null}
      <Card>
        <CardHeader title="Supozimet dhe burimet" />
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
          {archetype.assumptionsSq.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-faint">
          {archetype.sourcesNoteSq} Supozimet e bibliotekës janë të datës {archetype.assumptionsDate}.
        </p>
        {rec.evidence.notesSq.length > 0 ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-warn">
            {rec.evidence.notesSq.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        ) : null}
        <CitationList citations={uniqueCitations} className="mt-3 space-y-1" />
      </Card>
    </div>
  );

  const now = (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Testi më i lirë për kërkesën" />
          <p className="text-sm text-ink">{archetype.cheapestTestSq}</p>
        </Card>
        <Card>
          <CardHeader title="Pa kapital: si ta testoni ligjërisht" />
          <p className="text-sm text-ink">{archetype.zeroCapitalTestSq}</p>
        </Card>
      </div>
      {first7.length > 0 ? (
        <Card>
          <CardHeader title="7 ditët e para" subtitle="Nga plani 0–100 që krijohet kur e ruani si projekt." />
          <ol className="list-decimal space-y-1.5 pl-5 text-sm">
            {first7.map((t) => (
              <li key={t.id}>
                <span className="text-ink">{t.titleSq}</span> <span className="text-muted">— {t.descriptionSq}</span>
              </li>
            ))}
          </ol>
        </Card>
      ) : null}
      <Card>
        <CardHeader title="Testoje përpara se të investosh" />
        <ValidationKitView kit={view.kit} />
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Vazhdo nëse" />
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
            {archetype.goCriteriaSq.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Ndalo nëse" />
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
            {archetype.killCriteriaSq.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </Card>
      </div>
      <div className="flex flex-wrap gap-2">
        <SaveProjectButton archetypeId={id} countryCode={code} hasProfile={Boolean(viewer.profile)} />
      </div>
    </div>
  );

  return (
    <>
      <PageHeader
        crumbs={[
          { href: '/ide', label: 'Ide biznesi' },
          { href: `/ide?vendi=${code}`, label: ctx.country.nameSq },
        ]}
        title={archetype.nameSq}
        subtitle={archetype.taglineSq}
        badges={
          <>
            {ctx.isDemo ? <DemoBadge /> : null}
            <Badge>{SECTORS[archetype.sector]}</Badge>
            {archetype.modes.map((m) => (
              <Badge key={m}>{BUSINESS_MODE_LABELS[m]}</Badge>
            ))}
            {archetype.regulated ? <Badge tone="warn">E rregulluar</Badge> : null}
            <CoverageBadge level={ctx.coverage.level} title={ctx.coverage.noteSq} />
            <Badge tone="accent">{EVIDENCE_TEXT[rec.evidence.level]}</Badge>
          </>
        }
        actions={<SaveProjectButton archetypeId={id} countryCode={code} hasProfile={Boolean(viewer.profile)} />}
      />
      <div className="mb-4 rounded-2xl border border-line bg-surface p-3">
        <CountrySelectForm action={`/ide/${id}`} countries={countries.map((c) => ({ code: c.code, nameSq: c.nameSq, isDemo: c.isDemo }))} value={code} label="Analizo këtë ide për vendin" />
      </div>
      {rec.warningsSq.length > 0 ? (
        <div className="mb-4 space-y-2">
          {rec.warningsSq.map((w) => (
            <Notice key={w} tone={ctx.isDemo ? 'demo' : 'warn'}>
              {w}
            </Notice>
          ))}
        </div>
      ) : null}
      {view.currencyFallbackSq ? (
        <Notice tone="warn" title="Mungon kursi i këmbimit" className="mb-4">
          {view.currencyFallbackSq}
        </Notice>
      ) : null}
      <p className="mb-4 text-sm text-muted">{archetype.descriptionSq}</p>
      <Tabs
        items={[
          { id: 'permbledhje', label: 'Përmbledhje', content: summary },
          { id: 'analize', label: 'Analizë e thellë', content: deep },
          { id: 'tani', label: 'Çfarë bëj tani', content: now },
        ]}
      />
    </>
  );
}
