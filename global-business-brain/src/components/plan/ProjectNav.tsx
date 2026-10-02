'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cx } from '@/components/ui/cx';

/** Sub-navigation inside a project: overview, calculator, plan, tasks. */
export function ProjectNav({ id }: { id: string }) {
  const pathname = usePathname() ?? '';
  const items = [
    { href: `/projektet/${id}`, label: 'Përmbledhje' },
    { href: `/projektet/${id}/kalkulatori`, label: 'Kalkulatori' },
    { href: `/projektet/${id}/plani`, label: 'Plani 0–100' },
    { href: `/projektet/${id}/detyrat`, label: 'Detyrat & provat' },
  ];
  return (
    <nav aria-label="Seksionet e projektit" className="no-print -mx-1 mb-5 flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1">
      {items.map((i) => {
        const active = pathname === i.href;
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active ? 'page' : undefined}
            className={cx('min-h-10 shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium', active ? 'bg-accent text-white' : 'text-muted hover:bg-surface-2 hover:text-ink')}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
