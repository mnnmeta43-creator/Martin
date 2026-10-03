import type { Citation, Claim, ClaimKind, EvidenceLabel } from '@/lib/domain/types';
import { CLAIM_KIND_LABELS, EVIDENCE_LABELS } from '@/lib/domain/taxonomy';
import { formatDate, formatPeriod } from '@/lib/finance/format';
import { Badge, type BadgeTone } from './Badge';

const LABEL_STYLE: Record<EvidenceLabel, { tone: BadgeTone; icon: string; short: string }> = {
  mbeshtetet_nga_te_dhenat: { tone: 'ok', icon: '✓', short: 'Mbështetet nga të dhënat' },
  hipoteze: { tone: 'warn', icon: '?', short: 'Hipotezë' },
  duhet_testuar: { tone: 'accent', icon: '⟳', short: 'Duhet testuar me klientë' },
};

const KIND_TONE: Record<ClaimKind, BadgeTone> = {
  fakt: 'neutral',
  interpretim: 'neutral',
  supozim: 'neutral',
  parashikim: 'accent',
};

export function EvidenceLabelBadge({ label }: { label: EvidenceLabel }) {
  const s = LABEL_STYLE[label];
  return (
    <Badge tone={s.tone} icon={s.icon} title={EVIDENCE_LABELS[label]}>
      {s.short}
    </Badge>
  );
}

export function ClaimKindBadge({ kind }: { kind: ClaimKind }) {
  return <Badge tone={KIND_TONE[kind]}>{CLAIM_KIND_LABELS[kind]}</Badge>;
}

/** One citation, rendered next to the claim it supports. Links only come from stored provenance. */
export function CitationLine({ c, index }: { c: Citation; index?: number }) {
  const isLink = /^https:\/\//.test(c.url);
  return (
    <li className="text-xs leading-5 text-faint">
      {index !== undefined ? <span className="mr-1 font-mono text-muted">[{index + 1}]</span> : null}
      {c.isDemo ? <span className="mr-1 font-semibold text-demo">DEMO</span> : null}
      {isLink ? (
        <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-accent-strong underline-offset-2 hover:underline">
          {c.sourceName}
        </a>
      ) : (
        <span>{c.sourceName}</span>
      )}
      {c.period ? <span> · periudha {formatPeriod(c.period)}</span> : null}
      {c.isProjection ? <span> · parashikim</span> : null}
      {c.retrievedAt ? <span> · marrë më {formatDate(c.retrievedAt)}</span> : null}
      {c.sourceLastUpdated ? <span> · publikuar/përditësuar më {formatDate(c.sourceLastUpdated)}</span> : null}
      {c.noteSq ? <span> · {c.noteSq}</span> : null}
    </li>
  );
}

export function CitationList({ citations, className }: { citations: Citation[]; className?: string }) {
  if (citations.length === 0) return null;
  return (
    <ul className={className ?? 'mt-1 space-y-0.5'} aria-label="Burimet">
      {citations.map((c, i) => (
        <CitationLine key={`${c.sourceId}-${c.indicatorCode ?? ''}-${c.period ?? ''}-${i}`} c={c} />
      ))}
    </ul>
  );
}

/** List of claims, each with its kind (fakt/interpretim/…), its evidence label and its citations. */
export function ClaimList({ claims, emptyText }: { claims: Claim[]; emptyText?: string }) {
  if (claims.length === 0) return emptyText ? <p className="text-sm text-muted">{emptyText}</p> : null;
  return (
    <ul className="space-y-3">
      {claims.map((cl) => (
        <li key={cl.id} className="rounded-xl border border-line bg-surface-2/60 p-3">
          <div className="mb-1.5 flex flex-wrap gap-1.5">
            <ClaimKindBadge kind={cl.kind} />
            <EvidenceLabelBadge label={cl.label} />
          </div>
          <p className="text-sm text-ink">{cl.textSq}</p>
          <CitationList citations={cl.citations} />
        </li>
      ))}
    </ul>
  );
}
