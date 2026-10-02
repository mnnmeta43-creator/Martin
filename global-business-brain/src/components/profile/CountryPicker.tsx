'use client';

import { useId, useMemo, useState } from 'react';
import { cx } from '@/components/ui/cx';

export interface CountryOption {
  code: string;
  nameSq: string;
  isDemo?: boolean;
}

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ë/g, 'e')
    .replace(/ç/g, 'c');
}

/** Searchable multi-select for countries; selected items are shown as removable chips. */
export function CountryMultiPicker({
  label,
  hint,
  options,
  values,
  onChange,
  max = 10,
}: {
  label: string;
  hint?: string;
  options: CountryOption[];
  values: string[];
  onChange: (next: string[]) => void;
  max?: number;
}) {
  const id = useId();
  const [q, setQ] = useState('');
  const byCode = useMemo(() => new Map(options.map((o) => [o.code, o])), [options]);
  const matches = useMemo(() => {
    const nq = norm(q.trim());
    if (!nq) return [];
    return options.filter((o) => !values.includes(o.code) && (norm(o.nameSq).includes(nq) || o.code.toLowerCase() === nq)).slice(0, 8);
  }, [q, options, values]);

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink">
        {label}
        {hint ? <span className="mt-0.5 block text-xs font-normal text-faint">{hint}</span> : null}
      </label>
      {values.length > 0 ? (
        <ul className="mb-2 flex flex-wrap gap-2" aria-label={`${label}: të zgjedhura`}>
          {values.map((code) => (
            <li key={code}>
              <button
                type="button"
                onClick={() => onChange(values.filter((v) => v !== code))}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-accent bg-accent-soft px-3 text-sm text-ink"
                aria-label={`Hiq ${byCode.get(code)?.nameSq ?? code}`}
              >
                {byCode.get(code)?.nameSq ?? code}
                {byCode.get(code)?.isDemo ? <span className="text-xs text-demo">DEMO</span> : null}
                <span aria-hidden="true" className="text-faint">
                  ×
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <input
        id={id}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={values.length >= max ? `Maksimumi ${max}` : 'Kërko shtetin…'}
        disabled={values.length >= max}
        autoComplete="off"
        className="w-full rounded-xl border border-line-strong bg-surface-2 px-3 py-2.5 text-base text-ink placeholder:text-faint focus:border-accent focus:outline-none sm:text-sm"
      />
      {matches.length > 0 ? (
        <ul className="mt-1 overflow-hidden rounded-xl border border-line-strong bg-surface-2" role="listbox" aria-label="Rezultatet">
          {matches.map((o) => (
            <li key={o.code} role="option" aria-selected={false}>
              <button
                type="button"
                onClick={() => {
                  onChange([...values, o.code]);
                  setQ('');
                }}
                className={cx('flex min-h-10 w-full items-center justify-between px-3 text-left text-sm text-ink hover:bg-surface-3')}
              >
                <span>{o.nameSq}</span>
                <span className="text-xs text-faint">{o.isDemo ? 'DEMO' : o.code}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
