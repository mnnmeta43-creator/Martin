import Link from 'next/link';
import type { IdeaRecommendation } from '@/lib/domain/types';
import { formatMoney, formatNumber } from '@/lib/finance/format';
import { Badge } from '@/components/ui/Badge';

const EVIDENCE_LEVEL: Record<IdeaRecommendation['evidence']['level'], { label: string; tone: 'ok' | 'warn' | 'bad' | 'neutral' }> = {
  e_larte: { label: 'Prova: të forta', tone: 'ok' },
  mesatare: { label: 'Prova: mesatare', tone: 'warn' },
  e_ulet: { label: 'Prova: të dobëta', tone: 'bad' },
  shume_e_ulet: { label: 'Prova: shumë të dobëta', tone: 'bad' },
};

/** Summary card in the ideas list: fit score, capital range, evidence quality and why it does/doesn't fit. */
export function IdeaCard({ rec, href, sectorLabel }: { rec: IdeaRecommendation; href: string; sectorLabel: string }) {
  const ev = EVIDENCE_LEVEL[rec.evidence.level];
  return (
    <article className="flex h-full flex-col rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-faint">{sectorLabel}</p>
          <h3 className="text-base font-semibold text-ink">
            <Link href={href} className="hover:text-accent-strong">
              {rec.nameSq}
            </Link>
          </h3>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-semibold tabular text-ink">{rec.score.total === null ? '—' : formatNumber(rec.score.total, 0)}</p>
          <p className="text-[10px] text-faint">përshtatja /100</p>
        </div>
      </div>
      <p className="mt-2 line-clamp-3 text-sm text-muted">{rec.summarySq}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {rec.isDemoData ? <Badge tone="demo">DEMO</Badge> : null}
        <Badge tone={ev.tone}>{ev.label}</Badge>
        {rec.capitalRange ? (
          <Badge tone="neutral" title={rec.capitalRange.basisSq}>
            Hapja: {formatMoney(rec.capitalRange.low, rec.capitalRange.currency, { compact: true })}–
            {formatMoney(rec.capitalRange.high, rec.capitalRange.currency, { compact: true })}
          </Badge>
        ) : (
          <Badge tone="warn">Kapitali: mungon kursi</Badge>
        )}
      </div>
      {rec.fit.matchesSq.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-ok">
          {rec.fit.matchesSq.slice(0, 2).map((m) => (
            <li key={m}>✓ {m}</li>
          ))}
        </ul>
      ) : null}
      {rec.fit.mismatchesSq.length > 0 ? (
        <ul className="mt-1 space-y-1 text-xs text-warn">
          {rec.fit.mismatchesSq.slice(0, 2).map((m) => (
            <li key={m}>! {m}</li>
          ))}
        </ul>
      ) : null}
      {rec.fit.blockersSq.length > 0 ? (
        <ul className="mt-1 space-y-1 text-xs text-bad">
          {rec.fit.blockersSq.map((m) => (
            <li key={m}>✕ {m}</li>
          ))}
        </ul>
      ) : null}
      <div className="mt-auto pt-3">
        <Link href={href} className="text-sm font-medium text-accent-strong hover:underline">
          Shiko detajet →
        </Link>
      </div>
    </article>
  );
}
