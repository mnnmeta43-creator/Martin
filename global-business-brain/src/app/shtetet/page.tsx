import type { Metadata } from 'next';
import { CountryCatalog } from '@/components/countries/CountryCatalog';
import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { StoreUnavailable } from '@/components/ui/StoreUnavailable';
import { loadCatalogRows } from '../_lib/data';
import { getViewer } from '../_lib/viewer';

export const metadata: Metadata = { title: 'Eksploro shtetet' };
export const dynamic = 'force-dynamic';

export default async function CountriesPage() {
  const viewer = await getViewer();
  const rows = await loadCatalogRows(viewer);
  return (
    <>
      <PageHeader
        title="Eksploro shtetet dhe ekonomitë"
        subtitle="Katalog global me shtete dhe territore të dalluara. Mbulimi tregon sa të dhëna kemi realisht për secilin — jo sa do të donim."
      />
      {viewer.storeErrorSq ? <StoreUnavailable messageSq={viewer.storeErrorSq} /> : null}
      <Notice tone="info" className="mb-4">
        Lista e vendeve vjen nga paketat e hapura “world-countries” (ODbL) dhe “i18n-iso-countries” (emrat shqip). Statusi i OKB-së dhe klasifikimi i Bankës Botërore shfaqen vetëm kur janë të disponueshëm.
      </Notice>
      <CountryCatalog rows={rows} />
    </>
  );
}
