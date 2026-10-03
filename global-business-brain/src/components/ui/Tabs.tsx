'use client';

import { useId, useState } from 'react';
import { cx } from './cx';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

/** Accessible tabs (WAI-ARIA tabs pattern with arrow-key navigation). */
export function Tabs({ items, initialId, className }: { items: TabItem[]; initialId?: string; className?: string }) {
  const [active, setActive] = useState(initialId ?? items[0]?.id);
  const base = useId();
  const index = Math.max(0, items.findIndex((t) => t.id === active));

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    let next = index;
    if (e.key === 'ArrowRight') next = (index + 1) % items.length;
    if (e.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = items.length - 1;
    setActive(items[next].id);
    document.getElementById(`${base}-tab-${items[next].id}`)?.focus();
  }

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        className="-mx-1 mb-4 flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1"
      >
        {items.map((t) => {
          const selected = t.id === items[index]?.id;
          return (
            <button
              key={t.id}
              id={`${base}-tab-${t.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${base}-panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(t.id)}
              className={cx(
                'min-h-10 shrink-0 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors',
                selected ? 'bg-accent text-white' : 'text-muted hover:bg-surface-2 hover:text-ink',
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {items.map((t) => (
        <div
          key={t.id}
          id={`${base}-panel-${t.id}`}
          role="tabpanel"
          aria-labelledby={`${base}-tab-${t.id}`}
          hidden={t.id !== items[index]?.id}
          tabIndex={0}
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
