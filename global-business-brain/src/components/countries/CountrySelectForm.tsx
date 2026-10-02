/** Plain GET form (works without JavaScript) to switch the economy a page analyses. */
export function CountrySelectForm({
  action,
  countries,
  value,
  paramName = 'vendi',
  extra,
  label = 'Vendi',
}: {
  action: string;
  countries: { code: string; nameSq: string; isDemo: boolean }[];
  value: string;
  paramName?: string;
  extra?: React.ReactNode;
  label?: string;
}) {
  return (
    <form action={action} method="get" className="flex flex-wrap items-end gap-2">
      <div className="min-w-0 flex-1 sm:flex-none">
        <label htmlFor={`sel-${paramName}`} className="mb-1 block text-xs text-muted">
          {label}
        </label>
        <select
          id={`sel-${paramName}`}
          name={paramName}
          defaultValue={value}
          className="w-full min-w-48 rounded-xl border border-line-strong bg-surface-2 px-3 py-2.5 text-sm text-ink"
        >
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.nameSq}
              {c.isDemo ? ' (DEMO)' : ''}
            </option>
          ))}
        </select>
      </div>
      {extra}
      <button type="submit" className="min-h-11 rounded-xl border border-line-strong bg-surface-2 px-4 text-sm font-medium text-ink hover:bg-surface-3">
        Shfaq
      </button>
    </form>
  );
}
