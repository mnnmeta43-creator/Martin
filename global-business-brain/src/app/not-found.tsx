import { ButtonLink } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <p className="font-mono text-sm text-accent-strong">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-ink">Faqja nuk u gjet</h1>
      <p className="mt-2 text-muted">Faqja nuk ekziston, ose ky projekt nuk i përket llogarisë suaj.</p>
      <div className="mt-6 flex justify-center gap-2">
        <ButtonLink href="/">Paneli</ButtonLink>
        <ButtonLink href="/projektet" variant="secondary">
          Projektet e mia
        </ButtonLink>
      </div>
    </div>
  );
}
