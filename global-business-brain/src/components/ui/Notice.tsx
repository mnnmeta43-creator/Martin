import { cx } from './cx';

type Tone = 'info' | 'warn' | 'bad' | 'ok' | 'demo';

const STYLES: Record<Tone, { box: string; icon: string; label: string }> = {
  info: { box: 'border-accent/40 bg-accent-soft/60', icon: 'ℹ', label: 'Informacion' },
  warn: { box: 'border-warn/40 bg-warn-soft/70', icon: '⚠', label: 'Kujdes' },
  bad: { box: 'border-bad/40 bg-bad-soft/70', icon: '✕', label: 'Problem' },
  ok: { box: 'border-ok/40 bg-ok-soft/70', icon: '✓', label: 'Në rregull' },
  demo: { box: 'border-demo/50 bg-demo-soft/80', icon: '◆', label: 'DEMO' },
};

/** Callout box. The icon and a visually hidden label carry the meaning, not just colour. */
export function Notice({
  tone = 'info',
  title,
  children,
  className,
}: {
  tone?: Tone;
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  const s = STYLES[tone];
  return (
    <div role={tone === 'bad' ? 'alert' : 'note'} className={cx('flex gap-3 rounded-xl border p-3 text-sm', s.box, className)}>
      <span aria-hidden="true" className="mt-0.5 shrink-0 font-semibold">
        {s.icon}
      </span>
      <div className="min-w-0">
        <span className="sr-only">{s.label}: </span>
        {title ? <p className="font-semibold text-ink">{title}</p> : null}
        {children ? <div className="text-muted [&_a]:text-accent-strong [&_a]:underline">{children}</div> : null}
      </div>
    </div>
  );
}
