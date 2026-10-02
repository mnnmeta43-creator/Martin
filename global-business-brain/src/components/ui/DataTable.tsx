import { cx } from './cx';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

/** Table that scrolls horizontally inside its own container on narrow screens. */
export function DataTable<T>({
  columns,
  rows,
  caption,
  rowKey,
  className,
  dense,
}: {
  columns: Column<T>[];
  rows: T[];
  caption?: string;
  rowKey: (row: T, i: number) => string;
  className?: string;
  dense?: boolean;
}) {
  return (
    <div className={cx('table-scroll rounded-xl border border-line', className)}>
      <table className="w-full border-collapse text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-faint">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={cx('whitespace-nowrap px-3 font-medium', dense ? 'py-1.5' : 'py-2', c.align === 'right' && 'text-right', c.className)}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={rowKey(r, i)} className="border-t border-line">
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cx('px-3 align-top text-ink', dense ? 'py-1.5' : 'py-2', c.align === 'right' && 'text-right tabular', c.className)}
                >
                  {c.cell(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
