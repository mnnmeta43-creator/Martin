/** Leximi i të dhënave për faqet: country contexts and catalogue rows, demo-aware. */
import type { CountryDataContext } from '@/lib/domain/types';
import { getCountries, getCountry } from '@/lib/data/countries';
import { getCountryDataContext, getCountryDataContexts } from '@/lib/data/context';
import type { CatalogRow } from '@/components/countries/CountryCatalog';
import type { Viewer } from './viewer';

export async function loadContext(viewer: Viewer, code: string): Promise<CountryDataContext | null> {
  if (!viewer.store) return null;
  const known = getCountry(code, { includeDemo: viewer.demoMode });
  if (!known) return null;
  return getCountryDataContext(viewer.store.data, code, viewer.now, { demoMode: viewer.demoMode });
}

export async function loadContexts(viewer: Viewer, codes: string[]): Promise<CountryDataContext[]> {
  if (!viewer.store) return [];
  const valid = codes.filter((c) => getCountry(c, { includeDemo: viewer.demoMode }));
  const list = await getCountryDataContexts(viewer.store.data, valid, viewer.now, { demoMode: viewer.demoMode });
  return list.filter((c): c is CountryDataContext => Boolean(c));
}

/** Catalogue rows with coverage. Computes contexts for every economy (cached per request by the store). */
export async function loadCatalogRows(viewer: Viewer): Promise<CatalogRow[]> {
  const countries = getCountries({ includeDemo: viewer.demoMode });
  const contexts = viewer.store ? await loadContexts(viewer, countries.map((c) => c.code)) : [];
  const byCode = new Map(contexts.map((c) => [c.country.code, c]));
  return countries
    .map((c) => {
      const ctx = byCode.get(c.code);
      return {
        code: c.code,
        nameSq: c.nameSq,
        nameEn: c.nameEn,
        regionSq: c.regionSq,
        kind: c.kind,
        kindNoteSq: c.kindNoteSq,
        coverage: ctx?.coverage.level ?? 'e_pamjaftueshme',
        availableCount: ctx?.coverage.availableCount ?? 0,
        totalTracked: ctx?.coverage.totalTracked ?? 0,
        incomeLevel: ctx?.country.wb?.incomeLevel ?? null,
        isDemo: c.isDemo,
      } satisfies CatalogRow;
    })
    .sort((a, b) => Number(b.isDemo) - Number(a.isDemo) || a.nameSq.localeCompare(b.nameSq, 'sq'));
}

export function countryName(code: string, demoMode: boolean): string {
  return getCountry(code, { includeDemo: demoMode })?.nameSq ?? code;
}
