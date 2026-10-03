import Link from 'next/link';
import type { ProjectSummary } from '@/lib/domain/types';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

/** Lists the user's projects for a project-scoped section (calculator, plan, tasks). */
export function ProjectPicker({ projects, section, labelSq }: { projects: ProjectSummary[]; section: 'kalkulatori' | 'plani' | 'detyrat'; labelSq: string }) {
  if (projects.length === 0) {
    return (
      <EmptyState title="Nuk keni ende projekte" action={<ButtonLink href="/ide">Zgjidh një ide</ButtonLink>}>
        {labelSq} lidhet me një projekt. Hapni një ide dhe ruajeni si projekt; kalkulatorin mund ta provoni edhe pa ruajtur nga faqja e idesë.
      </EmptyState>
    );
  }
  return (
    <ul className="grid gap-2 md:grid-cols-2">
      {projects.map((p) => (
        <li key={p.id}>
          <Link href={`/projektet/${p.id}/${section}`} className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4 hover:border-accent/60">
            <span className="font-medium text-ink">{p.title}</span>
            <span className="text-sm tabular text-muted">{Math.round(p.progressPct)}%</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
