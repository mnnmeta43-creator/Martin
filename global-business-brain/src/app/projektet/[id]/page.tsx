import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PHASE_TITLES, SCENARIO_LABELS } from '@/lib/domain/taxonomy';
import { formatDateTime, formatMoney, formatNumber } from '@/lib/finance/format';
import { tasksForHorizon } from '@/lib/plan/progress';
import { OfflineSnapshotSaver } from '@/components/plan/OfflineSnapshotSaver';
import { ProjectActions } from '@/components/plan/ProjectActions';
import { ProjectNav } from '@/components/plan/ProjectNav';
import { ScoreBreakdown } from '@/components/ideas/ScoreBreakdown';
import { ButtonLink } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { CitationList } from '@/components/ui/Evidence';
import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatTile } from '@/components/ui/StatTile';
import { DemoBadge } from '@/components/ui/StatusBadge';
import { StoreUnavailable } from '@/components/ui/StoreUnavailable';
import { evaluateIdea } from '@/lib/ideas/engine';
import { loadProjectView } from '../../_lib/projects';
import { loadContext } from '../../_lib/data';
import { getViewer } from '../../_lib/viewer';

export const metadata: Metadata = { title: 'Projekti' };
export const dynamic = 'force-dynamic';

export default async function ProjectPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const viewer = await getViewer();
  if (!viewer.store) return <StoreUnavailable messageSq={viewer.storeErrorSq ?? 'Databaza mungon.'} />;
  if (!viewer.user) notFound();
  const view = await loadProjectView(viewer.store, viewer.user.id, id, viewer.demoMode);
  if (!view) notFound();
  const { project, archetype, projections, progress, plan } = view;
  const cur = project.financialInputs.currency;
  const base = projections.baze;
  const ctx = archetype && viewer.profile ? await loadContext(viewer, project.countryCode) : null;
  const rec = archetype && viewer.profile && ctx ? evaluateIdea(archetype, viewer.profile, ctx, { weights: project.scoreWeights, now: viewer.now, evidence: view.evidence }) : null;
  const next = tasksForHorizon(view.tasks.filter((t) => t.status !== 'perfunduar' && t.status !== 'anashkaluar'), 30).slice(0, 6);

  const keyNumbers = [
    { labelSq: 'Investimi fillestar', valueSq: formatMoney(base.capital.startupTotal, cur) },
    { labelSq: 'Kapitali i nevojshëm (bazë)', valueSq: formatMoney(base.capital.totalRequired, cur) },
    { labelSq: 'Gjendja më e ulët e parasë', valueSq: formatMoney(base.minCashBalance, cur) },
    {
      labelSq: 'Pika e barazimit',
      valueSq: base.unitEconomics.breakEvenCustomersPerMonth === null ? 'Nuk arrihet (kontributi ≤ 0)' : `${formatNumber(Math.ceil(base.unitEconomics.breakEvenCustomersPerMonth))} klientë/muaj`,
    },
  ];

  return (
    <>
      <PageHeader
        crumbs={[{ href: '/projektet', label: 'Projektet' }]}
        title={project.title}
        subtitle={`${view.countryNameSq}${project.city ? ` · ${project.city}` : ''} · analiza e datës ${formatDateTime(project.analysisDate)}`}
        badges={project.dataSnapshot.isDemo ? <DemoBadge /> : null}
        actions={<ProjectActions id={project.id} />}
      />
      <ProjectNav id={project.id} />
      <OfflineSnapshotSaver
        ownerId={viewer.user.id}
        snapshot={{
          id: project.id,
          title: project.title,
          countryNameSq: view.countryNameSq,
          city: project.city,
          isDemo: project.dataSnapshot.isDemo,
          analysisDate: project.analysisDate,
          currency: cur,
          keyNumbers,
          progressLabelSq: progress.labelSq,
          phases: (plan?.phases ?? []).map((p) => ({ rangeLabel: p.rangeLabel, titleSq: p.titleSq, done: progress.byPhase[p.id]?.done ?? 0, total: progress.byPhase[p.id]?.total ?? 0 })),
          openTasks: next.map((t) => ({ titleSq: t.titleSq, phaseRange: PHASE_TITLES[t.phaseId].range })),
        }}
      />
      {view.demoModeMismatch ? (
        <Notice tone="demo" title="Projekt me të dhëna DEMO" className="mb-4">
          Ky projekt u krijua me të dhëna fiktive. Mos e përdorni për vendime reale.
        </Notice>
      ) : null}
      {!archetype ? (
        <Notice tone="bad" title="Ideja bazë nuk gjendet më në bibliotekë">
          Modeli financiar dhe detyrat janë ruajtur, por plani nuk mund të rigjenerohet.
        </Notice>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {keyNumbers.map((k) => (
          <StatTile key={k.labelSq} label={k.labelSq} value={k.valueSq} note={`Skenari ${SCENARIO_LABELS.baze.toLowerCase()} · supozime`} />
        ))}
      </div>
      <p className="mt-3 rounded-xl bg-surface-2 p-3 text-sm text-ink">{base.payback.statementSq}</p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Progresi i planit" subtitle="Mat përfundimin e hapave, jo gjasat e suksesit." actions={<ButtonLink href={`/projektet/${project.id}/detyrat`} variant="ghost" size="sm">Detyrat</ButtonLink>} />
          <p className="text-3xl font-semibold tabular text-ink">{Math.round(progress.completionPct)}%</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-accent-soft" aria-hidden="true">
            <div className="h-full rounded-full bg-accent" style={{ width: `${progress.completionPct}%` }} />
          </div>
          <p className="mt-2 text-xs text-faint">{progress.labelSq}</p>
          {next.length > 0 ? (
            <>
              <p className="mt-4 text-sm font-medium text-ink">Hapat e radhës (30 ditët e para)</p>
              <ul className="mt-1 space-y-1 text-sm text-muted">
                {next.map((t) => (
                  <li key={t.id}>
                    <span className="mr-1 font-mono text-xs text-accent-strong">{PHASE_TITLES[t.phaseId].range}</span> {t.titleSq}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </Card>
        <Card>
          <CardHeader
            title="Pikëzimi i përshtatjes"
            subtitle="Me të dhënat e sotme, supozimet e bibliotekës dhe provat që keni regjistruar; peshat ruhen në projekt."
          />
          {rec ? (
            <ScoreBreakdown dimensions={rec.score.dimensions} initialWeights={project.scoreWeights} projectId={project.id} noteSq={rec.score.noteSq} />
          ) : (
            <p className="text-sm text-muted">Pikëzimi kërkon profilin tuaj dhe të dhënat e vendit.</p>
          )}
        </Card>
      </div>

      {archetype ? (
        <Card className="mt-4">
          <CardHeader title="Ideja" actions={<Link href={`/ide/${archetype.id}?vendi=${project.countryCode}`} className="text-sm text-accent-strong hover:underline">Analiza e plotë e idesë →</Link>} />
          <p className="text-sm text-ink">{archetype.offerSq}</p>
          <p className="mt-2 text-sm text-muted">Klienti: {archetype.payingCustomerSq}</p>
        </Card>
      ) : null}

      <Card className="mt-4">
        <CardHeader title="Të dhënat e ruajtura në këtë analizë" subtitle={`Kapur më ${formatDateTime(project.dataSnapshot.capturedAt)}. Vlerat nuk ndryshojnë vetvetiu; rifreskimi i burimeve nuk e ndryshon këtë projekt.`} />
        {view.citations.length === 0 ? (
          <p className="text-sm text-muted">Projekti u krijua pa të dhëna makro të disponueshme për këtë vend.</p>
        ) : (
          <CitationList citations={view.citations} className="space-y-1" />
        )}
      </Card>
    </>
  );
}
