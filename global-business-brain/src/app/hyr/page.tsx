import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/account/AuthForm';
import { PageHeader } from '@/components/ui/PageHeader';
import { StoreUnavailable } from '@/components/ui/StoreUnavailable';
import { getViewer } from '../_lib/viewer';

export const metadata: Metadata = { title: 'Hyr' };
export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const viewer = await getViewer();
  if (viewer.user && !viewer.user.isGuest) redirect('/cilesimet');
  return (
    <>
      <PageHeader title={viewer.user?.isGuest ? 'Ruaj llogarinë' : 'Hyr ose krijo llogari'} subtitle="Llogaria ruan profilin dhe projektet tuaja; vetëm ju i shihni." />
      {viewer.storeErrorSq ? <StoreUnavailable messageSq={viewer.storeErrorSq} /> : <AuthForm isGuest={Boolean(viewer.user?.isGuest)} />}
    </>
  );
}
