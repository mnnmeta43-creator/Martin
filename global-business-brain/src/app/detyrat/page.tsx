import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ProjectPicker } from '@/components/plan/ProjectPicker';
import { PageHeader } from '@/components/ui/PageHeader';
import { StoreUnavailable } from '@/components/ui/StoreUnavailable';
import { getViewer } from '../_lib/viewer';

export const metadata: Metadata = { title: 'Detyrat dhe progresi' };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const viewer = await getViewer();
  if (!viewer.store) return <StoreUnavailable messageSq={viewer.storeErrorSq ?? 'Databaza mungon.'} />;
  const projects = viewer.user ? await viewer.store.projects.list(viewer.user.id) : [];
  if (projects.length === 1) redirect(`/projektet/${projects[0].id}/detyrat`);
  return (
    <>
      <PageHeader title="Detyrat dhe progresi" subtitle="Zgjidhni projektin për të ndjekur detyrat dhe provat nga terreni." />
      <ProjectPicker projects={projects} section="detyrat" labelSq="Detyrat dhe progresi" />
    </>
  );
}
