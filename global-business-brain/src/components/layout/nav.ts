/** The app's sections (spec §12). Project-scoped screens live under /projektet/[id]/…. */
export interface NavItem {
  href: string;
  label: string;
  icon: string;
  match?: RegExp;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Paneli global', icon: 'home', match: /^\/$/ },
  { href: '/profili', label: 'Profili im', icon: 'user' },
  { href: '/shtetet', label: 'Eksploro shtetet', icon: 'globe', match: /^\/shtetet(\/|$)/ },
  { href: '/krahaso', label: 'Krahaso vende', icon: 'compare' },
  { href: '/makro', label: 'Analiza makro', icon: 'chart' },
  { href: '/ide', label: 'Ide biznesi', icon: 'bulb', match: /^\/ide(\/|$)/ },
  { href: '/kalkulatori', label: 'Kalkulatori i kapitalit', icon: 'calculator', match: /\/kalkulatori(\/|$)/ },
  { href: '/plani', label: 'Plani 0–100', icon: 'flag', match: /\/plani(\/|$)/ },
  { href: '/detyrat', label: 'Detyrat dhe progresi', icon: 'tasks', match: /\/detyrat(\/|$)/ },
  { href: '/projektet', label: 'Projektet e ruajtura', icon: 'folder', match: /^\/projektet(\/[^/]+)?$/ },
  { href: '/asistenti', label: 'Asistenti AI', icon: 'chat' },
  { href: '/burimet', label: 'Burimet dhe përditësimet', icon: 'database' },
  { href: '/cilesimet', label: 'Cilësimet', icon: 'gear' },
];

/** Bottom bar on phones: the four most used sections + "Më shumë". */
export const MOBILE_PRIMARY = ['/', '/ide', '/projektet', '/asistenti'];

export function isActive(item: NavItem, pathname: string): boolean {
  if (item.match) return item.match.test(pathname);
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
