import { cx } from './cx';

export function Card({
  children,
  className,
  as: Tag = 'section',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'section' | 'div' | 'article' | 'li';
  id?: string;
}) {
  return (
    <Tag id={id} className={cx('rounded-2xl border border-line bg-surface p-4 sm:p-5', className)}>
      {children}
    </Tag>
  );
}

export function CardHeader({
  title,
  subtitle,
  actions,
  level = 2,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  level?: 2 | 3;
}) {
  const H = level === 2 ? 'h2' : 'h3';
  return (
    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
      <div className="min-w-0">
        <H className={cx('font-semibold text-ink', level === 2 ? 'text-lg' : 'text-base')}>{title}</H>
        {subtitle ? <p className="mt-0.5 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
