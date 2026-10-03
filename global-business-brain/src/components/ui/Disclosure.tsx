import { cx } from './cx';

export function Disclosure({
  summary,
  children,
  defaultOpen,
  className,
}: {
  summary: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  return (
    <details open={defaultOpen} className={cx('group rounded-xl border border-line bg-surface-2/60', className)}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 font-medium text-ink [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">{summary}</span>
        <span aria-hidden="true" className="text-faint transition-transform group-open:rotate-90">
          ›
        </span>
      </summary>
      <div className="border-t border-line px-3 py-3 text-sm text-muted">{children}</div>
    </details>
  );
}
