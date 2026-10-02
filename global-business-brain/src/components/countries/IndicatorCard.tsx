import type { IndicatorSeries } from '@/lib/domain/types';
import { getSource } from '@/lib/data/sources/registry';
import { formatIndicatorValue, formatPeriod } from '@/lib/finance/format';
import { LineChart } from '@/components/charts/LineChart';
import type { ChartUnit } from '@/components/charts/scale';
import { Badge } from '@/components/ui/Badge';
import { CitationList } from '@/components/ui/Evidence';
import { Disclosure } from '@/components/ui/Disclosure';
import { DataStatusBadge } from '@/components/ui/StatusBadge';

function chartUnit(s: IndicatorSeries): ChartUnit {
  const d = s.definition;
  if (d.unit === 'perqind') return { kind: 'percent' };
  if (d.unit === 'monedhe' && d.currency && /^[A-Z]{3}$/.test(d.currency)) return { kind: 'money', currency: d.currency };
  return { kind: 'number', decimals: d.unit === 'raport' ? 2 : d.unit === 'per_100' || d.unit === 'per_1000' ? 1 : 0 };
}

/**
 * One indicator: latest available value with period and status, what changed, how to read it,
 * which businesses it may affect and what extra local evidence is needed. Missing stays missing.
 */
export function IndicatorCard({
  series,
  changeTextSq,
  interpretationSq,
  businessImplicationsSq,
}: {
  series: IndicatorSeries;
  changeTextSq?: string;
  interpretationSq?: string;
  businessImplicationsSq?: string;
}) {
  const d = series.definition;
  const latest = series.latest;
  const src = getSource(d.sourceId);
  return (
    <article className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="min-w-0 font-semibold text-ink">{d.nameSq}</h3>
        <DataStatusBadge status={series.status} title={series.statusReasonSq} />
      </div>
      <p className="mt-1 text-2xl font-semibold tabular text-ink">
        {latest ? formatIndicatorValue(latest.value, d) : <span className="text-base font-normal text-muted">Mungojnë të dhënat</span>}
      </p>
      <p className="text-xs text-faint">
        {latest ? `Të dhënat më të fundit të disponueshme: ${formatPeriod(latest.period)} · ${d.unitLabelSq}` : series.statusReasonSq}
      </p>
      {changeTextSq ? <p className="mt-2 text-sm text-ink">{changeTextSq}</p> : null}
      {series.change.warningsSq.length > 0 ? (
        <ul className="mt-1 space-y-0.5 text-xs text-warn">
          {series.change.warningsSq.map((w) => (
            <li key={w}>⚠ {w}</li>
          ))}
        </ul>
      ) : null}
      <dl className="mt-3 space-y-2 text-sm">
        <div>
          <dt className="text-xs font-medium text-faint">Çfarë mat?</dt>
          <dd className="text-muted">{d.explain.whatItMeasuresSq}</dd>
        </div>
        {interpretationSq ? (
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-medium text-faint">
              Si mund të lexohet <Badge>Interpretim</Badge>
            </dt>
            <dd className="text-muted">{interpretationSq}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-xs font-medium text-faint">Cilat biznese mund të ndikohen dhe si?</dt>
          <dd className="text-muted">
            {businessImplicationsSq ?? d.explain.affectedBusinessesSq} {d.explain.mechanismSq}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-faint">Çfarë prove shtesë duhet para një vendimi?</dt>
          <dd className="text-muted">{d.explain.extraEvidenceSq}</dd>
        </div>
      </dl>
      {d.explain.analogySq || d.explain.cautionSq ? (
        <Disclosure summary="Analogji dhe kujdes në lexim" className="mt-3">
          {d.explain.analogySq ? <p>{d.explain.analogySq}</p> : null}
          {d.explain.cautionSq ? <p className="mt-2 text-warn">{d.explain.cautionSq}</p> : null}
        </Disclosure>
      ) : null}
      {series.observations.length > 1 ? (
        <Disclosure summary="Shiko serinë kohore" className="mt-3">
          <LineChart
            title={d.nameSq}
            subtitle={d.unitLabelSq}
            unit={chartUnit(series)}
            zeroLine={d.unit === 'perqind'}
            series={[
              {
                id: d.code,
                label: d.nameSq,
                points: series.observations.map((o) => ({ x: formatPeriod(o.period), y: o.value, projected: o.isProjection })),
              },
            ]}
          />
        </Disclosure>
      ) : null}
      {latest ? (
        <CitationList
          className="mt-3 space-y-0.5"
          citations={[
            {
              sourceId: latest.sourceId,
              sourceName: src?.nameSq ?? latest.sourceId,
              url: latest.sourceUrl,
              indicatorCode: d.code,
              period: latest.period,
              retrievedAt: latest.retrievedAt,
              sourceLastUpdated: latest.sourceLastUpdated ?? null,
              isDemo: latest.isDemo,
              isProjection: latest.isProjection,
              noteSq: `kodi ${d.sourceCode}`,
            },
          ]}
        />
      ) : null}
    </article>
  );
}
