import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PHASE_TITLES } from '@/lib/domain/taxonomy';
import { tasksForHorizon } from '@/lib/plan/progress';
import { PhaseList } from '@/components/plan/PhaseList';
import { ProjectNav } from '@/components/plan/ProjectNav';
import { buttonClass } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { DemoBadge } from '@/components/ui/StatusBadge';
import { StoreUnavailable } from '@/components/ui/StoreUnavailable';
import type { PlanTask } from '@/lib/domain/types';
import { loadProjectView } from '../../../_lib/projects';
import { getViewer } from '../../../_lib/viewer';

export const metadata: Metadata = { title: 'Plani 0–100' };
export const dynamic = 'force-dynamic';

function HorizonList({ title, tasks }: { title: string; tasks: PlanTask[] }) {
  return (
    <Card>
      <CardHeader title={title} subtitle={`${tasks.filter((t) => t.status === 'perfunduar').length}/${tasks.length} të kryera`} level={3} />
      <ul className="space-y-1.5 text-sm">
        {tasks.map((t) => (
          <li key={t.id} className="flex gap-2">
            <span aria-hidden="true" className={t.status === 'perfunduar' ? 'text-ok' : 'text-faint'}>
              {t.status === 'perfunduar' ? '☑' : '☐'}
            </span>
            <span className={t.status === 'perfunduar' ? 'text-muted line-through' : 'text-ink'}>
              {t.titleSq} <span className="font-mono text-xs text-faint">({PHASE_TITLES[t.phaseId].range})</span>
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default async function PlanPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const viewer = await getViewer();
  if (!viewer.store) return <StoreUnavailable messageSq={viewer.storeErrorSq ?? 'Databaza mungon.'} />;
  if (!viewer.user) notFound();
  const view = await loadProjectView(viewer.store, viewer.user.id, id, viewer.demoMode);
  if (!view) notFound();
  const { project, plan, progress } = view;
  return (
    <>
      <PageHeader
        crumbs={[
          { href: '/projektet', label: 'Projektet' },
          { href: `/projektet/${project.id}`, label: project.title },
        ]}
        title="Plani nga zero në 100"
        subtitle="Dhjetë faza me veprime, rezultat, buxhet, varësi, provë përfundimi dhe kriter për të vazhduar ose ndaluar."
        badges={project.dataSnapshot.isDemo ? <DemoBadge /> : null}
        actions={
          <a href={`/api/projects/${project.id}/export/pdf`} className={buttonClass('secondary', 'sm')}>
            Shkarko planin (PDF)
          </a>
        }
      />
      <ProjectNav id={project.id} />
      {!plan ? (
        <Notice tone="bad">Plani nuk mund të rigjenerohet sepse ideja bazë nuk gjendet në bibliotekë.</Notice>
      ) : (
        <>
          <Notice tone="info" className="mb-4">
            {plan.noteSq} Aktualisht: {Math.round(progress.completionPct)}% e planit.
          </Notice>
          <div className="mb-5 grid gap-3 lg:grid-cols-3">
            <HorizonList title="7 ditët e para" tasks={tasksForHorizon(view.tasks, 7)} />
            <HorizonList title="30 ditët e para" tasks={tasksForHorizon(view.tasks, 30)} />
            <HorizonList title="90 ditët e para" tasks={tasksForHorizon(view.tasks, 90)} />
          </div>
          <PhaseList plan={plan} progress={progress} />
        </>
      )}
    </>
  );
}
