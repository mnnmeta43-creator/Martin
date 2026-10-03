import Link from 'next/link';

export function PageHeader({
  title,
  subtitle,
  actions,
  crumbs,
  badges,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  crumbs?: { href: string; label: string }[];
  badges?: React.ReactNode;
}) {
  return (
    <header className="mb-5">
      {crumbs && crumbs.length > 0 ? (
        <nav aria-label="Rruga e navigimit" className="mb-2 text-sm text-faint">
          <ol className="flex flex-wrap items-center gap-1">
            {crumbs.map((c, i) => (
              <li key={c.href} className="flex items-center gap-1">
                {i > 0 ? <span aria-hidden="true">›</span> : null}
                <Link href={c.href} className="hover:text-ink">
                  {c.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h1>
          {subtitle ? <p className="mt-1 max-w-3xl text-muted">{subtitle}</p> : null}
          {badges ? <div className="mt-2 flex flex-wrap gap-2">{badges}</div> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
