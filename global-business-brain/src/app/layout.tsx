import type { Metadata, Viewport } from 'next';
import { AppShell } from '@/components/layout/AppShell';
import { ServiceWorkerRegister } from '@/components/layout/ServiceWorkerRegister';
import { getViewer } from './_lib/viewer';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Global Business Brain', template: '%s · Global Business Brain' },
  description: 'Zbulo ku ka mundësi. Kupto pse. Ndërto biznesin nga zero.',
  applicationName: 'Global Business Brain',
  appleWebApp: { capable: true, title: 'Business Brain', statusBarStyle: 'black-translucent' },
  icons: { apple: '/icons/apple-touch-icon.png' },
};

export const viewport: Viewport = {
  themeColor: '#05070d',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  return (
    <html lang="sq">
      <body>
        <AppShell user={viewer.user ? { email: viewer.user.email, isGuest: viewer.user.isGuest } : null} demoMode={viewer.demoMode}>
          {children}
        </AppShell>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
