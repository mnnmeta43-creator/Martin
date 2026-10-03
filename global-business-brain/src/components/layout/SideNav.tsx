'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cx } from '@/components/ui/cx';
import { Icon } from './Icon';
import { NAV_ITEMS, isActive } from './nav';

export function SideNav() {
  const pathname = usePathname() ?? '/';
  return (
    <nav aria-label="Seksionet" className="flex flex-col gap-0.5">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cx(
              'flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm transition-colors',
              active ? 'bg-accent-soft font-medium text-ink' : 'text-muted hover:bg-surface-2 hover:text-ink',
            )}
          >
            <Icon name={item.icon} className={active ? 'text-accent-strong' : undefined} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
