import type { Metadata } from 'next';
import Link from 'next/link';
import { configStatus } from '@/lib/server/env';
import { AccountActions } from '@/components/account/AccountActions';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { getViewer } from '../_lib/viewer';

export const metadata: Metadata = { title: 'Cilësimet' };
export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const viewer = await getViewer();
  const config = configStatus();
  const missing = config.filter((c) => !c.present);
  return (
    <>
      <PageHeader title="Cilësimet" />
      <div className="space-y-4">
        <Card>
          <CardHeader title="Llogaria" />
          {viewer.user ? (
            viewer.user.isGuest ? (
              <p className="text-sm text-muted">
                Po përdorni një llogari vizitori në këtë pajisje. <Link href="/hyr" className="text-accent-strong underline">Ruajeni me email</Link> për të mos humbur projektet.
              </p>
            ) : (
              <p className="text-sm text-ink">{viewer.user.email}</p>
            )
          ) : (
            <p className="text-sm text-muted">
              Nuk jeni të identifikuar. <Link href="/hyr" className="text-accent-strong underline">Hyr</Link>
            </p>
          )}
          <div className="mt-4">
            <AccountActions signedIn={Boolean(viewer.user)} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Gjuha dhe monedha" />
          <p className="text-sm text-muted">Gjuha e ndërfaqes: shqip. Monedha e modeleve financiare ndiqet nga profili juaj dhe mund të ndryshohet te çdo kalkulator, me kursin e ruajtur ose një kurs manual të shënuar si i tillë.</p>
        </Card>
        <Card>
          <CardHeader title="Të dhënat dhe privatësia" />
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
            <li>Projektet dhe profili juaj janë të izoluara: asnjë përdorues tjetër nuk mund t’i shohë.</li>
            <li>Aplikacioni nuk kryen asnjë regjistrim biznesi, pagesë, blerje apo veprim të jashtëm në emrin tuaj.</li>
            <li>Kopjet offline ruhen vetëm në këtë pajisje dhe fshihen kur dilni nga llogaria.</li>
            <li>Modaliteti i të dhënave: {viewer.demoMode ? 'DEMO (ekonomi fiktive aktive)' : 'LIVE'}.</li>
          </ul>
        </Card>
        <Card>
          <CardHeader title="Funksione që presin konfigurim" />
          {missing.length === 0 ? (
            <p className="text-sm text-ok">Të gjitha shërbimet opsionale janë të konfiguruara.</p>
          ) : (
            <ul className="space-y-2">
              {missing.map((c) => (
                <li key={c.key} className="text-sm">
                  <Badge tone="warn">{c.key}</Badge> <span className="text-muted">{c.impactIfMissingSq}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
