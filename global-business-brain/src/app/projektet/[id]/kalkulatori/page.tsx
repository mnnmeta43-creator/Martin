import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Calculator } from '@/components/finance/Calculator';
import { ProjectNav } from '@/components/plan/ProjectNav';
import { PageHeader } from '@/components/ui/PageHeader';
import { DemoBadge } from '@/components/ui/StatusBadge';
import { StoreUnavailable } from '@/components/ui/StoreUnavailable';
import { loadProjectView } from '../../../_lib/projects';
import { getViewer, todayIso } from '../../../_lib/viewer';

export const metadata: Metadata = { title: 'Kalkulatori i kapitalit' };
export const dynamic = 'force-dynamic';

export default async function ProjectCalculatorPage(props: { params: Promise<{ id: string }> }) {
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
        title="Kalkulatori i kapitalit"
        subtitle="Llogaritje deterministe me formula të kontrollueshme. Ndryshoni çdo supozim me oferta dhe prova reale."
        badges={project.dataSnapshot.isDemo ? <DemoBadge /> : null}
      />
      <ProjectNav id={project.id} />
      <Calculator
        initialInputs={project.financialInputs}
        fxRates={project.dataSnapshot.fxRates}
        projectId={project.id}
        archetypeId={project.archetypeId}
        countryCode={project.countryCode}
        isDemo={project.dataSnapshot.isDemo}
        today={todayIso(viewer.now)}
      />
    </>
  );
}
