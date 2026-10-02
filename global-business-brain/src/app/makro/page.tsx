import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCountries } from '@/lib/data/countries';
import { CountrySelectForm } from '@/components/countries/CountrySelectForm';
import { PageHeader } from '@/components/ui/PageHeader';
import { defaultCountryCode, getViewer } from '../_lib/viewer';

export const metadata: Metadata = { title: 'Analiza makro' };
export const dynamic = 'force-dynamic';

export default async function MacroPicker(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await props.searchParams;
  const viewer = await getViewer();
  const countries = getCountries({ includeDemo: viewer.demoMode });
  const v = (Array.isArray(sp.vendi) ? sp.vendi[0] : sp.vendi ?? '').toUpperCase();
  if (v && countries.some((c) => c.code === v)) redirect(`/shtetet/${v}`);
  return (
    <>
      <PageHeader
        title="Analiza makro"
        subtitle="Çfarë mat secili tregues, çfarë ka ndryshuar, cilat biznese ndikohen dhe çfarë prove duhet para një vendimi."
      />
      <div className="rounded-2xl border border-line bg-surface p-4">
        <CountrySelectForm action="/makro" countries={countries.map((c) => ({ code: c.code, nameSq: c.nameSq, isDemo: c.isDemo }))} value={defaultCountryCode(viewer)} />
      </div>
    </>
  );
}
