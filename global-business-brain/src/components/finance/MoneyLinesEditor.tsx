'use client';

import type { CostSourceKind, MoneyLine, MonthlyCategory, StartupCategory } from '@/lib/domain/types';
import { MONTHLY_CATEGORY_LABELS, STARTUP_CATEGORY_LABELS } from '@/lib/domain/taxonomy';
import { formatDate, formatMoney } from '@/lib/finance/format';
import { cx } from '@/components/ui/cx';

const SOURCE_LABELS: Record<CostSourceKind, string> = {
  supozim: 'Supozim',
  oferte: 'Ofertë e marrë',
  verifikuar: 'E verifikuar',
  perdoruesi: 'Vendosur nga ju',
};

const numberInput =
  'w-full min-w-0 rounded-lg border border-line-strong bg-surface px-2 py-2 text-right text-base tabular text-ink focus:border-accent focus:outline-none sm:text-sm';

/**
 * Editable list of cost lines. Every line shows value, range, currency, source/assumption and date;
 * editing a value marks it as user-provided with today's date so provenance stays honest.
 */
export function MoneyLinesEditor({
  kind,
  lines,
  currency,
  onChange,
  readOnly,
  today,
}: {
  kind: 'startup' | 'monthly';
  lines: MoneyLine[];
  currency: string;
  onChange: (next: MoneyLine[]) => void;
  readOnly?: boolean;
  today: string;
}) {
  const categories = kind === 'startup' ? STARTUP_CATEGORY_LABELS : MONTHLY_CATEGORY_LABELS;
  const total = lines.filter((l) => l.enabled).reduce((s, l) => s + (Number.isFinite(l.amount) ? l.amount : 0), 0);

  function update(id: string, patch: Partial<MoneyLine>) {
    onChange(lines.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function editAmount(l: MoneyLine, value: number) {
    update(l.id, {
      amount: value,
      sourceKind: l.sourceKind === 'supozim' ? 'perdoruesi' : l.sourceKind,
      date: today,
    });
  }

  function addLine() {
    const id = `custom-${kind}-${Date.now().toString(36)}`;
    const category = (kind === 'startup' ? 'hapje' : 'tjeter') as StartupCategory | MonthlyCategory;
    onChange([
      ...lines,
      { id, labelSq: 'Zë i ri', category, amount: 0, low: null, high: null, sourceKind: 'perdoruesi', sourceNoteSq: 'Shtuar nga ju.', date: today, enabled: true, optional: true },
    ]);
  }

  return (
    <div>
      <ul className="space-y-2">
        {lines.map((l) => (
          <li key={l.id} className={cx('rounded-xl border p-3', l.enabled ? 'border-line bg-surface-2/70' : 'border-line bg-surface/40 opacity-70')}>
            <div className="flex flex-wrap items-start gap-2">
              <label className="flex min-h-9 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={l.enabled}
                  disabled={readOnly}
                  onChange={(e) => update(l.id, { enabled: e.target.checked })}
                  className="h-4 w-4 accent-[var(--color-accent)]"
                  aria-label={`Përfshi: ${l.labelSq}`}
                />
              </label>
              <div className="min-w-0 flex-1">
                {l.id.startsWith('custom-') && !readOnly ? (
                  <input
                    value={l.labelSq}
                    maxLength={120}
                    onChange={(e) => update(l.id, { labelSq: e.target.value })}
                    className="w-full rounded-lg border border-line-strong bg-surface px-2 py-1.5 text-sm text-ink"
                    aria-label="Emri i zërit"
                  />
                ) : (
                  <p className="text-sm font-medium text-ink">{l.labelSq}</p>
                )}
                <p className="text-xs text-faint">{categories[l.category as keyof typeof categories] ?? l.category}</p>
              </div>
              <div className="w-36 shrink-0">
                <label className="sr-only" htmlFor={`amt-${l.id}`}>
                  Vlera ({currency})
                </label>
                <input
                  id={`amt-${l.id}`}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  disabled={readOnly}
                  value={Number.isFinite(l.amount) ? l.amount : 0}
                  onChange={(e) => editAmount(l, e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
                  className={numberInput}
                />
                <p className="mt-0.5 text-right text-[11px] text-faint">{currency}</p>
              </div>
            </div>
            <div className="mt-2 grid gap-2 text-xs text-faint sm:grid-cols-[1fr_auto]">
              <p>
                {l.low !== null && l.low !== undefined && l.high !== null && l.high !== undefined ? (
                  <span className="mr-2 text-muted">
                    Interval: {formatMoney(l.low, currency)} – {formatMoney(l.high, currency)}.
                  </span>
                ) : null}
                {l.sourceNoteSq}
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <select
                  value={l.sourceKind}
                  disabled={readOnly}
                  onChange={(e) => update(l.id, { sourceKind: e.target.value as CostSourceKind, date: today })}
                  className="rounded-lg border border-line-strong bg-surface px-2 py-1 text-xs text-ink"
                  aria-label={`Burimi i vlerës: ${l.labelSq}`}
                >
                  {(Object.keys(SOURCE_LABELS) as CostSourceKind[]).map((k) => (
                    <option key={k} value={k}>
                      {SOURCE_LABELS[k]}
                    </option>
                  ))}
                </select>
                <span>{formatDate(l.date)}</span>
                {l.id.startsWith('custom-') && !readOnly ? (
                  <button type="button" onClick={() => onChange(lines.filter((x) => x.id !== l.id))} className="rounded px-2 py-1 text-bad hover:bg-bad-soft">
                    Hiq
                  </button>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        {!readOnly ? (
          <button type="button" onClick={addLine} className="min-h-9 rounded-lg border border-dashed border-line-strong px-3 text-sm text-muted hover:text-ink">
            + Shto zë
          </button>
        ) : (
          <span />
        )}
        <p className="text-sm text-ink">
          Totali i përfshirë: <span className="font-semibold tabular">{formatMoney(total, currency)}</span>
        </p>
      </div>
    </div>
  );
}
