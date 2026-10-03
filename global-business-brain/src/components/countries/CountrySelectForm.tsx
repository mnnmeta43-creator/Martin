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
      <div className="w-full min-w-0 sm:w-auto sm:min-w-56">
        <label htmlFor={`sel-${paramName}`} className="mb-1 block text-xs text-muted">
          {label}
        </label>
        <select
          id={`sel-${paramName}`}
          name={paramName}
          defaultValue={value}
          className="w-full rounded-xl border border-line-strong bg-surface-2 px-3 py-2.5 text-sm text-ink"
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
