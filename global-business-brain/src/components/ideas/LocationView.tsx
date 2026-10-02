import type { LocationAnalysis } from '@/lib/domain/types';
import { CitationList } from '@/components/ui/Evidence';
import { Notice } from '@/components/ui/Notice';

/** "Ku ta nis": registration vs operation vs customers, what to verify, and a field-research plan. */
export function LocationView({ analysis }: { analysis: LocationAnalysis }) {
  const r = analysis.registrationVsOperationSq;
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        {[
          ['Ku regjistrohet biznesi', r.registrationSq],
          ['Ku operon', r.operationSq],
          ['Ku janë klientët', r.customersSq],
        ].map(([t, d]) => (
          <div key={t} className="rounded-xl border border-line bg-surface-2/60 p-3">
            <p className="text-sm font-semibold text-ink">{t}</p>
            <p className="mt-1 text-sm text-muted">{d}</p>
          </div>
        ))}
      </div>
      <section>
        <h3 className="mb-2 font-semibold text-ink">Çfarë duhet verifikuar (Kërkon verifikim lokal)</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
          {analysis.toVerifySq.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
      </section>
      <Notice tone="info" title="Qyteti dhe lagjja">
        {analysis.noteSq}
      </Notice>
      <section>
        <h3 className="mb-2 font-semibold text-ink">Plani i kërkimit në terren</h3>
        <ol className="space-y-2">
          {analysis.fieldResearchPlan.map((s, i) => (
            <li key={s.stepSq} className="rounded-xl border border-line bg-surface-2/60 p-3">
              <p className="text-sm font-medium text-ink">
                {i + 1}. {s.stepSq}
              </p>
              <p className="mt-1 text-sm text-muted">{s.howSq}</p>
              <p className="mt-1 text-xs text-faint">
                Rezultati: {s.outputSq} · Kosto: {s.costSq}
              </p>
            </li>
          ))}
        </ol>
      </section>
      {analysis.officialLinks.length > 0 ? (
        <section>
          <h3 className="mb-1 font-semibold text-ink">Burime zyrtare për verifikim</h3>
          <p className="mb-1 text-xs text-faint">Aplikacioni nuk i lexon automatikisht; hapini dhe kontrolloni kërkesat aktuale.</p>
          <CitationList citations={analysis.officialLinks} className="space-y-1" />
        </section>
      ) : (
        <p className="text-sm text-muted">Nuk kemi lidhje zyrtare të regjistruara për këtë vend. Kërkoni regjistrin zyrtar të bizneseve, autoritetin tatimor dhe zyrën e licencimit të bashkisë.</p>
      )}
    </div>
  );
}
