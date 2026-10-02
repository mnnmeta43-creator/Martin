import Link from 'next/link';
import { MobileNav } from './MobileNav';
import { OfflineBanner } from './OfflineBanner';
import { SideNav } from './SideNav';

export interface ShellUser {
  email: string | null;
  isGuest: boolean;
}

function Logo() {
  return (
    <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#0b1220" stroke="#2f7bff" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="8.5" fill="none" stroke="#5b9bff" strokeWidth="1.6" />
      <path d="M7.5 16h17M16 7.5c3 3 3 14 0 17M16 7.5c-3 3-3 14 0 17" fill="none" stroke="#5b9bff" strokeWidth="1.2" />
      <circle cx="23" cy="9" r="2.6" fill="#2f7bff" />
    </svg>
  );
}

/** Page chrome: desktop sidebar, top bar with data-mode + account state, phone bottom navigation. */
export function AppShell({ children, user, demoMode }: { children: React.ReactNode; user: ShellUser | null; demoMode: boolean }) {
  return (
    <div className="min-h-dvh">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-white">
        Kalo te përmbajtja
      </a>
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface/80 p-3 lg:flex">
        <Link href="/" className="mb-4 flex items-center gap-2 px-2 py-1">
          <Logo />
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-ink">Global Business Brain</span>
            <span className="block text-[11px] text-faint">Nga të dhënat te veprimi</span>
          </span>
        </Link>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <SideNav />
        </div>
        <p className="mt-3 px-2 text-[11px] leading-4 text-faint">
          Asnjë rekomandim nuk është garanci fitimi. Çështjet ligjore dhe tatimore kërkojnë verifikim lokal.
        </p>
      </aside>
      <div className="lg:pl-64">
        <header className="no-print sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
            <Link href="/" className="flex items-center gap-2 lg:hidden">
              <Logo />
              <span className="text-sm font-semibold text-ink">Global Business Brain</span>
            </Link>
            <div className="hidden text-sm text-muted lg:block">Zbulo ku ka mundësi. Kupto pse. Ndërto biznesin nga zero.</div>
            <div className="flex items-center gap-2">
              {demoMode ? (
                <Link
                  href="/burimet#demo"
                  className="rounded-full border border-demo/50 bg-demo-soft px-2.5 py-1 text-xs font-semibold text-demo"
                  title="Modaliteti DEMO: ekonomitë fiktive ZZA/ZZB/ZZC janë aktive"
                >
                  ◆ DEMO aktiv
                </Link>
              ) : null}
              {user && !user.isGuest ? (
                <Link href="/cilesimet" className="max-w-40 truncate rounded-full border border-line-strong px-3 py-1 text-xs text-muted hover:text-ink">
                  {user.email}
                </Link>
              ) : (
                <Link href="/hyr" className="rounded-full border border-accent/60 px-3 py-1 text-xs font-medium text-accent-strong hover:bg-accent-soft">
                  {user?.isGuest ? 'Ruaj llogarinë' : 'Hyr'}
                </Link>
              )}
            </div>
          </div>
        </header>
        <OfflineBanner />
        <main id="main" className="mx-auto max-w-6xl px-4 pb-28 pt-5 lg:pb-12">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
