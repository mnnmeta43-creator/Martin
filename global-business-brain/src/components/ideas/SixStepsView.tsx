import type { SixSteps } from '@/lib/domain/types';

const STEPS: { key: keyof SixSteps; title: string }[] = [
  { key: 'whatItIsSq', title: 'Çfarë është' },
  { key: 'whoItServesSq', title: 'Kujt i shërben' },
  { key: 'whyItCouldWorkSq', title: 'Pse mund të funksionojë' },
  { key: 'whatItRequiresSq', title: 'Çfarë kërkon' },
  { key: 'howToStartSq', title: 'Si niset' },
  { key: 'howToMeasureSq', title: 'Si matet' },
];

/** "Ma shpjego në 6 hapa" — a numbered, linear explanation. */
export function SixStepsView({ steps }: { steps: SixSteps }) {
  return (
    <ol className="relative space-y-3 border-l border-line-strong pl-5">
      {STEPS.map((s, i) => (
        <li key={s.key} className="relative">
          <span
            aria-hidden="true"
            className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border border-accent bg-accent-soft text-xs font-semibold text-accent-strong"
          >
            {i + 1}
          </span>
          <p className="font-semibold text-ink">{s.title}</p>
          <p className="text-sm text-muted">{steps[s.key]}</p>
        </li>
      ))}
    </ol>
  );
}
