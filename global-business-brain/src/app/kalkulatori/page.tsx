import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ProjectPicker } from '@/components/plan/ProjectPicker';
import { PageHeader } from '@/components/ui/PageHeader';
import { StoreUnavailable } from '@/components/ui/StoreUnavailable';
import { getViewer } from '../_lib/viewer';

export const metadata: Metadata = { title: 'Kalkulatori i kapitalit' };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const viewer = await getViewer();
  if (!viewer.store) return <StoreUnavailable messageSq={viewer.storeErrorSq ?? 'Databaza mungon.'} />;
  const projects = viewer.user ? await viewer.store.projects.list(viewer.user.id) : [];
  if (projects.length === 1) redirect(`/projektet/${projects[0].id}/kalkulatori`);
  return (
    <>
      <PageHeader title="Kalkulatori i kapitalit" subtitle="Zgjidhni projektin për të cilin dëshironi të llogaritni kapitalin, kostot dhe parashikimin 12-mujor." />
      <ProjectPicker projects={projects} section="kalkulatori" labelSq="Kalkulatori i kapitalit" />
    </>
  );
}
