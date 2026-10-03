import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { Notice } from '@/components/ui/Notice';
import { OfflineList } from './OfflineList';

export const metadata: Metadata = { title: 'Offline' };

export default function OfflinePage() {
  return (
    <>
      <PageHeader title="Pamje offline" subtitle="Projektet që keni hapur në këtë pajisje, me datën e ruajtjes." />
      <Notice tone="warn" title="Nuk ka lidhje me serverin">
        Këto janë kopje të ruajta më parë. Nuk janë analizë live dhe nuk përditësohen derisa të lidheni sërish. Ndryshimet nuk mund të ruhen offline.
      </Notice>
      <div className="mt-5">
        <OfflineList />
      </div>
    </>
  );
}
