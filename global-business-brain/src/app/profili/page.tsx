import type { Metadata } from 'next';
import { getCountries } from '@/lib/data/countries';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { PageHeader } from '@/components/ui/PageHeader';
import { Notice } from '@/components/ui/Notice';
import { StoreUnavailable } from '@/components/ui/StoreUnavailable';
import { defaultCountryCode, getViewer } from '../_lib/viewer';

export const metadata: Metadata = { title: 'Profili im' };
export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const viewer = await getViewer();
  const countries = getCountries({ includeDemo: viewer.demoMode });
  const currencies = Array.from(new Set(countries.flatMap((c) => c.currencies))).filter((c) => /^[A-Z]{3}$/.test(c));
  return (
    <>
      <PageHeader
        title="Profili im"
        subtitle="Çdo rekomandim do të tregojë pse përputhet ose nuk përputhet me këtë profil. Mund ta ndryshoni kurdo."
      />
      {viewer.storeErrorSq ? <StoreUnavailable messageSq={viewer.storeErrorSq} /> : null}
      {!viewer.user ? (
        <Notice tone="info" title="Mund të nisni pa llogari" className="mb-4">
          Profili ruhet në një llogari vizitori në këtë pajisje. Më vonë mund të krijoni llogari me email për ta ruajtur përgjithmonë.
        </Notice>
      ) : null}
      <ProfileForm
        initial={viewer.profile}
        countries={countries.map((c) => ({ code: c.code, nameSq: c.nameSq, isDemo: c.isDemo }))}
        currencies={currencies}
        defaultCountry={defaultCountryCode(viewer)}
        hasSession={Boolean(viewer.user)}
      />
    </>
  );
}
