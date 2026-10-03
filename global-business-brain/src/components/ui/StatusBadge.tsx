import type { CoverageLevel, DataStatus } from '@/lib/domain/types';
import { COVERAGE_LABELS, DATA_STATUS_LABELS } from '@/lib/domain/taxonomy';
import { Badge, type BadgeTone } from './Badge';

const STATUS_TONE: Record<DataStatus, { tone: BadgeTone; icon: string }> = {
  i_fresket: { tone: 'ok', icon: '●' },
  i_vjeter: { tone: 'warn', icon: '◐' },
  shume_i_vjeter: { tone: 'bad', icon: '○' },
  mungon: { tone: 'neutral', icon: '∅' },
  gabim_burimi: { tone: 'bad', icon: '⚠' },
  demo: { tone: 'demo', icon: '◆' },
  parashikim: { tone: 'accent', icon: '↗' },
};

export function DataStatusBadge({ status, title }: { status: DataStatus; title?: string }) {
  const s = STATUS_TONE[status];
  return (
    <Badge tone={s.tone} icon={s.icon} title={title}>
      {DATA_STATUS_LABELS[status]}
    </Badge>
  );
}

const COVERAGE_TONE: Record<CoverageLevel, { tone: BadgeTone; icon: string }> = {
  e_plote: { tone: 'ok', icon: '■' },
  e_pjesshme: { tone: 'warn', icon: '◧' },
  e_pamjaftueshme: { tone: 'neutral', icon: '□' },
};

export function CoverageBadge({ level, title }: { level: CoverageLevel; title?: string }) {
  const s = COVERAGE_TONE[level];
  return (
    <Badge tone={s.tone} icon={s.icon} title={title}>
      {COVERAGE_LABELS[level]}
    </Badge>
  );
}

export function DemoBadge() {
  return (
    <Badge tone="demo" icon="◆" title="Të dhëna fiktive vetëm për testim — jo për vendime reale">
      DEMO — fiktive
    </Badge>
  );
}
