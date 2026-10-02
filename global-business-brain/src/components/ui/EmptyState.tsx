export function EmptyState({ title, children, action }: { title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong bg-surface/60 p-6 text-center">
      <p className="font-semibold text-ink">{title}</p>
      {children ? <div className="mx-auto mt-1 max-w-xl text-sm text-muted">{children}</div> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
