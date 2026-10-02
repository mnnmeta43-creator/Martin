'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { CoverageLevel, EconomyKind } from '@/lib/domain/types';
import { COVERAGE_LABELS, ECONOMY_KIND_LABELS } from '@/lib/domain/taxonomy';
import { Badge } from '@/components/ui/Badge';
import { CoverageBadge } from '@/components/ui/StatusBadge';

export interface CatalogRow {
  code: string;
  nameSq: string;
  nameEn: string;
  regionSq: string;
  kind: EconomyKind;
  kindNoteSq?: string;
  coverage: CoverageLevel;
  availableCount: number;
  totalTracked: number;
  incomeLevel?: string | null;
  isDemo: boolean;
}

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ë/g, 'e')
    .replace(/ç/g, 'c');
}

/** Katalogu global: search, filters and a compare tray (2–5 economies). List view only — a map adds no information here. */
export function CountryCatalog({ rows }: { rows: CatalogRow[] }) {
  const [q, setQ] = useState('');
  const [region, setRegion] = useState('');
  const [kind, setKind] = useState('');
  const [coverage, setCoverage] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const regions = useMemo(() => Array.from(new Set(rows.map((r) => r.regionSq))).sort((a, b) => a.localeCompare(b, 'sq')), [rows]);

  const filtered = useMemo(() => {
    const nq = norm(q.trim());
    return rows.filter(
      (r) =>
        (!nq || norm(r.nameSq).includes(nq) || norm(r.nameEn).includes(nq) || r.code.toLowerCase() === nq) &&
        (!region || r.regionSq === region) &&
        (!kind || r.kind === kind) &&
        (!coverage || r.coverage === coverage),
    );
  }, [rows, q, region, kind, coverage]);

  const counts = useMemo(() => {
    const c: Record<CoverageLevel, number> = { e_plote: 0, e_pjesshme: 0, e_pamjaftueshme: 0 };
    for (const r of rows) c[r.coverage]++;
    return c;
  }, [rows]);

  function toggle(code: string) {
    setPicked((p) => (p.includes(code) ? p.filter((x) => x !== code) : p.length >= 5 ? p : [...p, code]));
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        {(Object.keys(counts) as CoverageLevel[]).map((k) => (
          <div key={k} className="rounded-xl border border-line bg-surface-2 p-2">
            <p className="text-lg font-semibold tabular text-ink">{counts[k]}</p>
            <p className="text-muted">{COVERAGE_LABELS[k]}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-2 rounded-2xl border border-line bg-surface p-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="cq" className="mb-1 block text-xs text-muted">
            Kërko
          </label>
          <input
            id="cq"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="p.sh. Shqipëri, Kosova, ITA"
            className="w-full rounded-xl border border-line-strong bg-surface-2 px-3 py-2.5 text-base text-ink placeholder:text-faint sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="cr" className="mb-1 block text-xs text-muted">
            Rajoni
          </label>
          <select id="cr" value={region} onChange={(e) => setRegion(e.target.value)} className="w-full rounded-xl border border-line-strong bg-surface-2 px-3 py-2.5 text-sm text-ink">
            <option value="">Të gjitha</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ck" className="mb-1 block text-xs text-muted">
            Statusi
          </label>
          <select id="ck" value={kind} onChange={(e) => setKind(e.target.value)} className="w-full rounded-xl border border-line-strong bg-surface-2 px-3 py-2.5 text-sm text-ink">
            <option value="">Shtete dhe territore</option>
            {(Object.keys(ECONOMY_KIND_LABELS) as EconomyKind[])
              .filter((k) => rows.some((r) => r.kind === k))
              .map((k) => (
                <option key={k} value={k}>
                  {ECONOMY_KIND_LABELS[k]}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label htmlFor="cc" className="mb-1 block text-xs text-muted">
            Mbulimi i të dhënave
          </label>
          <select id="cc" value={coverage} onChange={(e) => setCoverage(e.target.value)} className="w-full rounded-xl border border-line-strong bg-surface-2 px-3 py-2.5 text-sm text-ink">
            <option value="">Çdo nivel</option>
            {(Object.keys(COVERAGE_LABELS) as CoverageLevel[]).map((k) => (
              <option key={k} value={k}>
                {COVERAGE_LABELS[k]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-sm text-muted" role="status">
        {filtered.length} ekonomi
      </p>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => (
          <li key={r.code} className="flex flex-col rounded-2xl border border-line bg-surface p-3">
            <div className="flex items-start justify-between gap-2">
              <Link href={`/shtetet/${r.code}`} className="min-w-0 font-semibold text-ink hover:text-accent-strong">
                {r.nameSq}
              </Link>
              <span className="shrink-0 font-mono text-xs text-faint">{r.code}</span>
            </div>
            <p className="text-xs text-muted">
              {r.regionSq}
              {r.incomeLevel ? ` · ${r.incomeLevel}` : ''}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {r.isDemo ? <Badge tone="demo">DEMO — fiktive</Badge> : null}
              <Badge title={r.kindNoteSq}>{ECONOMY_KIND_LABELS[r.kind]}</Badge>
              <CoverageBadge level={r.coverage} title={`${r.availableCount} nga ${r.totalTracked} tregues me të dhëna`} />
            </div>
            <div className="mt-auto flex items-center justify-between gap-2 pt-3">
              <span className="text-[11px] text-faint">
                {r.availableCount}/{r.totalTracked} tregues
              </span>
              <label className="flex min-h-9 items-center gap-2 text-xs text-muted">
                <input
                  type="checkbox"
                  checked={picked.includes(r.code)}
                  disabled={!picked.includes(r.code) && picked.length >= 5}
                  onChange={() => toggle(r.code)}
                  className="h-4 w-4 accent-[var(--color-accent)]"
                />
                Krahaso
              </label>
            </div>
          </li>
        ))}
      </ul>
      {picked.length > 0 ? (
        <div className="sticky bottom-20 z-10 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-accent/50 bg-bg/95 p-3 backdrop-blur lg:bottom-4">
          <p className="text-sm text-ink">
            {picked.length} të zgjedhura {picked.length < 2 ? '(zgjidhni 2–5)' : ''}
          </p>
          <Link
            href={picked.length >= 2 ? `/krahaso?vende=${picked.join(',')}` : '#'}
            aria-disabled={picked.length < 2}
            className={`inline-flex min-h-10 items-center rounded-xl px-4 text-sm font-medium ${picked.length >= 2 ? 'bg-accent text-white' : 'pointer-events-none bg-surface-2 text-faint'}`}
          >
            Krahaso
          </Link>
        </div>
      ) : null}
    </div>
  );
}
