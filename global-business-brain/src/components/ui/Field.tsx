import { cx } from './cx';

const controlBase =
  'w-full rounded-xl border border-line-strong bg-surface-2 px-3 py-2.5 text-base text-ink placeholder:text-faint focus:border-accent focus:outline-none disabled:opacity-60 sm:text-sm';

export function Label({ htmlFor, children, hint }: { htmlFor?: string; children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-ink">
      {children}
      {hint ? <span className="mt-0.5 block text-xs font-normal text-faint">{hint}</span> : null}
    </label>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(controlBase, className)} {...props} />;
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cx(controlBase, 'appearance-none pr-8', className)} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(controlBase, 'min-h-24', className)} {...props} />;
}

export function FieldError({ children, id }: { children?: React.ReactNode; id?: string }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-sm text-bad">
      {children}
    </p>
  );
}

/** Toggle chips for multi-select lists (skills, assets, countries). Real checkboxes for accessibility. */
export function ChipGroup({
  name,
  legend,
  hint,
  options,
  values,
  onChange,
}: {
  name: string;
  legend: string;
  hint?: string;
  options: { id: string; labelSq: string }[];
  values: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-medium text-ink">{legend}</legend>
      {hint ? <p className="mb-2 text-xs text-faint">{hint}</p> : null}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const checked = values.includes(o.id);
          return (
            <label
              key={o.id}
              className={cx(
                'inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border px-3 text-sm transition-colors',
                checked ? 'border-accent bg-accent-soft text-ink' : 'border-line-strong bg-surface-2 text-muted hover:text-ink',
              )}
            >
              <input
                type="checkbox"
                name={name}
                value={o.id}
                checked={checked}
                onChange={(e) => onChange(e.target.checked ? [...values, o.id] : values.filter((v) => v !== o.id))}
                className="h-4 w-4 accent-[var(--color-accent)]"
              />
              {o.labelSq}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
