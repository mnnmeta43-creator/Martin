import type { Metadata } from 'next';
import Link from 'next/link';
import { formatDateTime } from '@/lib/finance/format';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { DemoBadge } from '@/components/ui/StatusBadge';
import { StoreUnavailable } from '@/components/ui/StoreUnavailable';
import { countryName } from '../_lib/data';
import { getViewer } from '../_lib/viewer';

export const metadata: Metadata = { title: 'Projektet e ruajtura' };
export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const viewer = await getViewer();
  if (!viewer.store) return <StoreUnavailable messageSq={viewer.storeErrorSq ?? 'Databaza mungon.'} />;
  const projects = viewer.user ? await viewer.store.projects.list(viewer.user.id) : [];
  return (
    <>
      <PageHeader
        title="Projektet e ruajtura"
        subtitle="Çdo projekt ruan të dhënat dhe datën e analizës mbi të cilat u ndërtua. Përqindja = sa është kryer plani."
        actions={<ButtonLink href="/ide" variant="secondary">Gjej një ide</ButtonLink>}
      />
      {projects.length === 0 ? (
        <EmptyState title="Nuk keni projekte të ruajtura" action={<ButtonLink href="/ide">Shiko idetë</ButtonLink>}>
          Hapni një ide dhe zgjidhni “Ruaj si projekt”. Projektet shfaqen vetëm për llogarinë tuaj.
        </EmptyState>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {projects.map((p) => (
            <li key={p.id}>
              <Link href={`/projektet/${p.id}`} className="block h-full rounded-2xl border border-line bg-surface p-4 hover:border-accent/60">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="font-semibold text-ink">{p.title}</h2>
                  {p.isDemo ? <DemoBadge /> : null}
                </div>
                <p className="text-sm text-muted">
                  {countryName(p.countryCode, true)}
                  {p.city ? ` · ${p.city}` : ''}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-accent-soft" aria-hidden="true">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${p.progressPct}%` }} />
                  </div>
                  <span className="text-sm tabular text-ink">{Math.round(p.progressPct)}%</span>
                </div>
                <p className="mt-2 text-xs text-faint">
                  Analiza: {formatDateTime(p.analysisDate)} · përditësuar: {formatDateTime(p.updatedAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
