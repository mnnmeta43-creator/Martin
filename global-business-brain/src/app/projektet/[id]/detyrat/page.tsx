import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EvidenceLog } from '@/components/plan/EvidenceLog';
import { ProjectNav } from '@/components/plan/ProjectNav';
import { TaskBoard } from '@/components/plan/TaskBoard';
import { PageHeader } from '@/components/ui/PageHeader';
import { DemoBadge } from '@/components/ui/StatusBadge';
import { StoreUnavailable } from '@/components/ui/StoreUnavailable';
import { Tabs } from '@/components/ui/Tabs';
import { loadProjectView } from '../../../_lib/projects';
import { getViewer, todayIso } from '../../../_lib/viewer';

export const metadata: Metadata = { title: 'Detyrat dhe progresi' };
export const dynamic = 'force-dynamic';

export default async function TasksPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const viewer = await getViewer();
  if (!viewer.store) return <StoreUnavailable messageSq={viewer.storeErrorSq ?? 'Databaza mungon.'} />;
  if (!viewer.user) notFound();
  const view = await loadProjectView(viewer.store, viewer.user.id, id, viewer.demoMode);
  if (!view) notFound();
  const { project } = view;
  return (
    <>
      <PageHeader
        crumbs={[
          { href: '/projektet', label: 'Projektet' },
          { href: `/projektet/${project.id}`, label: project.title },
        ]}
        title="Detyrat dhe progresi"
        subtitle="Shënoni detyrat dhe regjistroni provat reale nga terreni: intervista, oferta, parapagime."
        badges={project.dataSnapshot.isDemo ? <DemoBadge /> : null}
      />
      <ProjectNav id={project.id} />
      <Tabs
        items={[
          { id: 'detyrat', label: 'Të gjitha detyrat', content: <TaskBoard projectId={project.id} initialTasks={view.tasks} /> },
          { id: 'provat', label: 'Provat nga terreni', content: <EvidenceLog projectId={project.id} initial={view.evidence} currency={project.financialInputs.currency} today={todayIso(viewer.now)} /> },
        ]}
      />
    </>
  );
}
