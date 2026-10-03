import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ECONOMY_KIND_LABELS } from '@/lib/domain/taxonomy';
import { getCountry } from '@/lib/data/countries';
import { getIndicator } from '@/lib/data/indicators';
import { getSource } from '@/lib/data/sources/registry';
import { buildMacroAnalysis } from '@/lib/analysis/macro';
import { formatDateTime } from '@/lib/finance/format';
import { IndicatorCard } from '@/components/countries/IndicatorCard';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { ClaimList } from '@/components/ui/Evidence';
import { Disclosure } from '@/components/ui/Disclosure';
import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { CoverageBadge, DemoBadge } from '@/components/ui/StatusBadge';
import { StoreUnavailable } from '@/components/ui/StoreUnavailable';
import { loadContext } from '../../_lib/data';
import { getViewer } from '../../_lib/viewer';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { code } = await props.params;
  return { title: getCountry(code.toUpperCase(), { includeDemo: true })?.nameSq ?? 'Vendi' };
}

export default async function CountryPage(props: Props) {
  const { code: raw } = await props.params;
  const code = raw.toUpperCase();
  const viewer = await getViewer();
  const country = getCountry(code, { includeDemo: viewer.demoMode });
  if (!country) notFound();
  if (!viewer.store) return <StoreUnavailable messageSq={viewer.storeErrorSq ?? 'Databaza mungon.'} />;
  const ctx = await loadContext(viewer, code);
  if (!ctx) notFound();
  const macro = buildMacroAnalysis(ctx);

  return (
    <>
      <PageHeader
        crumbs={[{ href: '/shtetet', label: 'Shtetet' }]}
        title={country.nameSq}
        subtitle={`${country.regionSq}${country.subregionSq ? ` · ${country.subregionSq}` : ''}${country.capital ? ` · kryeqyteti: ${country.capital}` : ''}`}
        badges={
          <>
            {ctx.isDemo ? <DemoBadge /> : null}
            <Badge title={country.kindNoteSq}>{ECONOMY_KIND_LABELS[country.kind]}</Badge>
            <CoverageBadge level={ctx.coverage.level} title={ctx.coverage.noteSq} />
            {ctx.country.wb?.incomeLevel ? <Badge>Banka Botërore: {ctx.country.wb.incomeLevel}</Badge> : null}
          </>
        }
        actions={
          <>
            <ButtonLink href={`/ide?vendi=${code}`}>Ide për këtë vend</ButtonLink>
            <ButtonLink href={`/krahaso?vende=${code}`} variant="secondary">
              Krahaso
            </ButtonLink>
          </>
        }
      />
      {country.kindNoteSq ? <p className="mb-3 text-sm text-muted">{country.kindNoteSq}</p> : null}
      {ctx.isDemo ? (
        <Notice tone="demo" title="Vend fiktiv me të dhëna DEMO" className="mb-4">
          Të gjitha vlerat në këtë faqe janë të sajuara për të provuar aplikacionin. Nuk përfaqësojnë asnjë vend real.
        </Notice>
      ) : null}
      {ctx.sourceErrors.length > 0 ? (
        <Notice tone="warn" title="Disa burime nuk u përgjigjën në rifreskimin e fundit" className="mb-4">
          <ul className="list-disc space-y-0.5 pl-5">
            {ctx.sourceErrors.slice(0, 5).map((e) => (
              <li key={`${e.sourceId}-${e.scope}-${e.startedAt}`}>
                {getSource(e.sourceId)?.nameSq ?? e.sourceId} · {formatDateTime(e.startedAt)}: {e.messageSq}
              </li>
            ))}
          </ul>
          <p className="mt-1">Po shfaqen të dhënat e fundit të ruajtura, me datën e marrjes së tyre.</p>
        </Notice>
      ) : null}

      <Card className="mb-4">
        <CardHeader
          title="Mbulimi i të dhënave"
          subtitle={`${ctx.coverage.availableCount} nga ${ctx.coverage.totalTracked} tregues kanë vlera · ${ctx.coverage.freshCount} të freskët · rifreskimi i fundit: ${ctx.lastRefreshAt ? formatDateTime(ctx.lastRefreshAt) : 'asnjëherë'}`}
        />
        <p className="text-sm text-muted">{ctx.coverage.noteSq}</p>
        {ctx.coverage.missingIndicators.length > 0 ? (
          <Disclosure summary={`Tregues që mungojnë (${ctx.coverage.missingIndicators.length})`} className="mt-3">
            <ul className="list-disc space-y-0.5 pl-5">
              {ctx.coverage.missingIndicators.map((c) => (
                <li key={c}>{getIndicator(c)?.nameSq ?? c}</li>
              ))}
            </ul>
            <p className="mt-2">Mungesa shfaqet si mungesë — asnjë vlerë nuk është vendosur në vend të saj.</p>
          </Disclosure>
        ) : null}
      </Card>

      {macro.highlights.length > 0 ? (
        <Card className="mb-4">
          <CardHeader title="Pikat kryesore" subtitle="Faktet me burim, të ndara nga interpretimet." />
          <ClaimList claims={macro.highlights} />
        </Card>
      ) : null}

      <div className="space-y-6">
        {macro.sections.map((s) => (
          <section key={s.category} aria-labelledby={`sec-${s.category}`}>
            <h2 id={`sec-${s.category}`} className="mb-2 text-lg font-semibold text-ink">
              {s.titleSq}
            </h2>
            <div className="grid gap-3 lg:grid-cols-2">
              {s.items.map((it) => (
                <IndicatorCard
                  key={it.code}
                  series={it.series}
                  changeTextSq={it.changeTextSq}
                  interpretationSq={it.interpretationSq}
                  businessImplicationsSq={it.businessImplicationsSq}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader title="Kufizimet e kësaj analize" />
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
          {macro.limitationsSq.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-ink">
          Analiza makro është kontekst, jo zëvendësim i validimit lokal. <Link href={`/ide?vendi=${code}`} className="text-accent-strong underline">Shihni idetë</Link> dhe testojini me klientë realë.
        </p>
      </Card>
    </>
  );
}
