import { cx } from './cx';

export type BadgeTone = 'neutral' | 'accent' | 'ok' | 'warn' | 'bad' | 'demo';

const TONES: Record<BadgeTone, string> = {
  neutral: 'border-line-strong bg-surface-2 text-muted',
  accent: 'border-accent/50 bg-accent-soft text-accent-strong',
  ok: 'border-ok/40 bg-ok-soft text-ok',
  warn: 'border-warn/40 bg-warn-soft text-warn',
  bad: 'border-bad/40 bg-bad-soft text-bad',
  demo: 'border-demo/50 bg-demo-soft text-demo',
};

/** Small label. Tone is always paired with text (and usually an icon) — never colour alone. */
export function Badge({
  tone = 'neutral',
  icon,
  children,
  className,
  title,
}: {
  tone?: BadgeTone;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cx(
        'inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium leading-5',
        TONES[tone],
        className,
      )}
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      <span className="truncate">{children}</span>
    </span>
  );
}
