import type { Plan, PlanProgress } from '@/lib/domain/types';
import { formatMoney } from '@/lib/finance/format';
import { PHASE_TITLES } from '@/lib/domain/taxonomy';

/** Plani 0–100: each phase with actions, output, budget, dependencies, proof and go/stop criteria. */
export function PhaseList({ plan, progress }: { plan: Plan; progress?: PlanProgress | null }) {
  return (
    <ol className="space-y-3">
      {plan.phases.map((ph) => {
        const pp = progress?.byPhase[ph.id];
        return (
          <li key={ph.id} className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-semibold text-ink">
                <span className="mr-2 rounded-md bg-accent-soft px-1.5 py-0.5 font-mono text-sm text-accent-strong">{ph.rangeLabel}</span>
                {ph.titleSq}
              </h3>
              {pp ? (
                <span className="text-xs text-muted">
                  {pp.done}/{pp.total} detyra · {Math.round(pp.completionPct)}%
                </span>
              ) : null}
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
              {ph.actionsSq.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div className="rounded-lg bg-surface-2 p-2">
                <dt className="text-xs text-faint">Rezultati që duhet prodhuar</dt>
                <dd className="text-ink">{ph.outputSq}</dd>
              </div>
              <div className="rounded-lg bg-surface-2 p-2">
                <dt className="text-xs text-faint">Buxheti i përafërt</dt>
                <dd className="text-ink">
                  {ph.budget.amount > 0 ? formatMoney(ph.budget.amount, ph.budget.currency) : '—'}{' '}
                  <span className="text-xs text-muted">({ph.budget.basisSq})</span>
                </dd>
              </div>
              <div className="rounded-lg bg-surface-2 p-2">
                <dt className="text-xs text-faint">Varësitë</dt>
                <dd className="text-ink">
                  {ph.dependencies.length ? ph.dependencies.map((d) => PHASE_TITLES[d].range).join(', ') : 'Asnjë — fillimi'}
                </dd>
              </div>
              <div className="rounded-lg bg-surface-2 p-2">
                <dt className="text-xs text-faint">Prova e përfundimit</dt>
                <dd className="text-ink">{ph.proofOfCompletionSq}</dd>
              </div>
              <div className="rounded-lg border border-ok/30 bg-ok-soft/40 p-2">
                <dt className="text-xs text-ok">Vazhdo nëse</dt>
                <dd className="text-ink">{ph.continueCriterionSq}</dd>
              </div>
              <div className="rounded-lg border border-bad/30 bg-bad-soft/40 p-2">
                <dt className="text-xs text-bad">Ndalo ose ndrysho nëse</dt>
                <dd className="text-ink">{ph.stopCriterionSq}</dd>
              </div>
            </dl>
          </li>
        );
      })}
    </ol>
  );
}
