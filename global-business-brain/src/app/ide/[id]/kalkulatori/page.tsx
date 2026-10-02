import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountries } from '@/lib/data/countries';
import { getArchetype } from '@/lib/ideas/archetypes';
import { Calculator } from '@/components/finance/Calculator';
import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { StoreUnavailable } from '@/components/ui/StoreUnavailable';
import { loadIdeaView } from '../../../_lib/ideas';
import { defaultCountryCode, getViewer, todayIso } from '../../../_lib/viewer';

export const metadata: Metadata = { title: 'Kalkulatori i kapitalit' };
export const dynamic = 'force-dynamic';

export default async function IdeaCalculatorPage(props: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const archetype = getArchetype(id);
  if (!archetype) notFound();
  const viewer = await getViewer();
  if (!viewer.store) return <StoreUnavailable messageSq={viewer.storeErrorSq ?? 'Databaza mungon.'} />;
  const countries = getCountries({ includeDemo: viewer.demoMode });
  const requested = (Array.isArray(sp.vendi) ? sp.vendi[0] : sp.vendi ?? '').toUpperCase();
  const code = countries.some((c) => c.code === requested) ? requested : defaultCountryCode(viewer);
  const view = await loadIdeaView(viewer, id, code);
  if (!view) notFound();
  return (
    <>
      <PageHeader
        crumbs={[
          { href: '/ide', label: 'Ide biznesi' },
          { href: `/ide/${id}?vendi=${code}`, label: archetype.nameSq },
        ]}
        title="Kalkulatori i kapitalit"
        subtitle={`${archetype.nameSq} · ${view.ctx.country.nameSq}. Ndryshimet nuk ruhen derisa ta ruani si projekt.`}
      />
      {view.usingPlaceholderProfile ? (
        <Notice tone="warn" className="mb-4">
          Pa profil, kapitali juaj konsiderohet 0 dhe monedha EUR. Plotësoni profilin për një model të personalizuar.
        </Notice>
      ) : null}
      {view.currencyFallbackSq ? (
        <Notice tone="warn" title="Mungon kursi i këmbimit" className="mb-4">
          {view.currencyFallbackSq}
        </Notice>
      ) : null}
      {view.inputs ? (
        <Calculator
          initialInputs={view.inputs}
          fxRates={view.ctx.fxRates}
          archetypeId={id}
          countryCode={code}
          isDemo={view.ctx.isDemo}
          today={todayIso(viewer.now)}
        />
      ) : (
        <Notice tone="bad" title="Modeli financiar nuk mund të ndërtohet">
          {view.inputsErrorSq}
        </Notice>
      )}
    </>
  );
}
