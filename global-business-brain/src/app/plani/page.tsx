import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ProjectPicker } from '@/components/plan/ProjectPicker';
import { PageHeader } from '@/components/ui/PageHeader';
import { StoreUnavailable } from '@/components/ui/StoreUnavailable';
import { getViewer } from '../_lib/viewer';

export const metadata: Metadata = { title: 'Plani 0–100' };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const viewer = await getViewer();
  if (!viewer.store) return <StoreUnavailable messageSq={viewer.storeErrorSq ?? 'Databaza mungon.'} />;
  const projects = viewer.user ? await viewer.store.projects.list(viewer.user.id) : [];
  if (projects.length === 1) redirect(`/projektet/${projects[0].id}/plani`);
  return (
    <>
      <PageHeader title="Plani 0–100" subtitle="Zgjidhni projektin për të parë planin me 10 faza dhe planet 7/30/90 ditore." />
      <ProjectPicker projects={projects} section="plani" labelSq="Plani 0–100" />
    </>
  );
}
