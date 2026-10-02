export default function Loading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">Duke ngarkuar…</span>
      <div className="h-8 w-2/3 animate-pulse rounded-lg bg-surface-2" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-surface-2" />
      <div className="grid gap-3 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-surface" />
        ))}
      </div>
    </div>
  );
}
