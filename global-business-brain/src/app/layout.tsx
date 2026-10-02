import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Global Business Brain', template: '%s · Global Business Brain' },
  description: 'Zbulo ku ka mundësi. Kupto pse. Ndërto biznesin nga zero.',
  applicationName: 'Global Business Brain',
};

export const viewport: Viewport = {
  themeColor: '#05070d',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq">
      <body>{children}</body>
    </html>
  );
}
