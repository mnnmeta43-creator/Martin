import { cx } from './cx';

/** Label · value · optional note. The note says what the number is (assumption, period, source). */
export function StatTile({
  label,
  value,
  note,
  tone,
  className,
}: {
  label: string;
  value: React.ReactNode;
  note?: React.ReactNode;
  tone?: 'ok' | 'warn' | 'bad';
  className?: string;
}) {
  return (
    <div className={cx('rounded-xl border border-line bg-surface-2 p-3', className)}>
      <p className="text-xs text-muted">{label}</p>
      <p
        className={cx(
          'mt-1 text-xl font-semibold tabular text-ink',
          tone === 'ok' && 'text-ok',
          tone === 'warn' && 'text-warn',
          tone === 'bad' && 'text-bad',
        )}
      >
        {value}
      </p>
      {note ? <p className="mt-1 text-xs text-faint">{note}</p> : null}
    </div>
  );
}
