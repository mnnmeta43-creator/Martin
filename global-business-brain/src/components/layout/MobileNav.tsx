'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cx } from '@/components/ui/cx';
import { Icon } from './Icon';
import { MOBILE_PRIMARY, NAV_ITEMS, isActive } from './nav';

const SHORT: Record<string, string> = {
  '/': 'Paneli',
  '/ide': 'Ide',
  '/projektet': 'Projektet',
  '/asistenti': 'Asistenti',
};

/** Bottom tab bar for phones with a "Më shumë" sheet listing every section. */
export function MobileNav() {
  const pathname = usePathname() ?? '/';
  // The sheet belongs to the page it was opened on, so navigating closes it without an effect.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (value: boolean) => setOpenOn(value ? pathname : null);
  const primary = NAV_ITEMS.filter((i) => MOBILE_PRIMARY.includes(i.href));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenOn(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <nav
        aria-label="Navigimi kryesor"
        className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 backdrop-blur lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {primary.map((item) => {
            const active = isActive(item, pathname);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cx('flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px]', active ? 'text-accent-strong' : 'text-muted')}
                >
                  <Icon name={item.icon} />
                  {SHORT[item.href] ?? item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="mobile-more"
              className="flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-[11px] text-muted"
            >
              <Icon name="more" />
              Më shumë
            </button>
          </li>
        </ul>
      </nav>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Të gjitha seksionet" id="mobile-more">
          <button type="button" aria-label="Mbyll" className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div
            className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-line bg-surface p-4"
            style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold text-ink">Të gjitha seksionet</p>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-muted hover:text-ink" aria-label="Mbyll">
                <Icon name="close" />
              </button>
            </div>
            <ul className="grid grid-cols-2 gap-2">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item, pathname);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cx(
                        'flex min-h-12 items-center gap-2 rounded-xl border px-3 text-sm',
                        active ? 'border-accent bg-accent-soft text-ink' : 'border-line bg-surface-2 text-muted',
                      )}
                    >
                      <Icon name={item.icon} />
                      <span className="min-w-0">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
