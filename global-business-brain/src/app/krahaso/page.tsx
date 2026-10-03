import type { Metadata } from 'next';
import Link from 'next/link';
import { getCountries } from '@/lib/data/countries';
import { getIndicator } from '@/lib/data/indicators';
import { compareCountries } from '@/lib/analysis/compare';
import { ARCHETYPES, getArchetype } from '@/lib/ideas/archetypes';
import { compareCountriesForIdea } from '@/lib/ideas/compareForIdea';
import { DEFAULT_SCORE_WEIGHTS } from '@/lib/domain/taxonomy';
import { formatIndicatorValue, formatMoney, formatNumber, formatPeriod } from '@/lib/finance/format';
import { BarChart } from '@/components/charts/BarChart';
import { CompareForm } from '@/components/countries/CompareForm';
import { Card, CardHeader } from '@/components/ui/Card';
import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { CoverageBadge, DataStatusBadge } from '@/components/ui/StatusBadge';
import { StoreUnavailable } from '@/components/ui/StoreUnavailable';
import { loadContexts } from '../_lib/data';
import { placeholderProfile } from '../_lib/ideas';
import { getViewer } from '../_lib/viewer';

export const metadata: Metadata = { title: 'Krahaso vende' };
export const dynamic = 'force-dynamic';

const INDICATORS_TO_COMPARE = [
  'gdp_per_capita_ppp',
  'gdp_growth',
  'inflation_cpi',
  'unemployment',
  'lending_rate',
  'price_level_ratio',
  'urban_population_pct',
  'internet_users_pct',
  'remittances_gdp',
  'tourism_arrivals',
  'services_va_gdp',
];

export default async function ComparePage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await props.searchParams;
  const viewer = await getViewer();
  const countries = getCountries({ includeDemo: viewer.demoMode });
  const raw = (Array.isArray(sp.vende) ? sp.vende[0] : sp.vende ?? '').toUpperCase();
  const codes = Array.from(new Set(raw.split(',').map((s) => s.trim()).filter((c) => countries.some((x) => x.code === c)))).slice(0, 5);
  const ideaId = Array.isArray(sp.ideja) ? sp.ideja[0] : sp.ideja ?? '';
  const archetype = ideaId ? getArchetype(ideaId) : undefined;
  const demoCodes = countries.filter((c) => c.isDemo).map((c) => c.code);
  // Fictional demo economies are never compared with real countries.
  const mixed = codes.some((c) => demoCodes.includes(c)) && codes.some((c) => !demoCodes.includes(c));
  const contexts = codes.length >= 2 && viewer.store && !mixed ? await loadContexts(viewer, codes) : [];
  const table = contexts.length >= 2 ? compareCountries(contexts, INDICATORS_TO_COMPARE) : null;
  const ideaCmp =
    archetype && contexts.length >= 2
      ? compareCountriesForIdea(archetype, viewer.profile ?? placeholderProfile(codes[0]), contexts, { weights: DEFAULT_SCORE_WEIGHTS, now: viewer.now })
      : null;
  const ppp = table?.rows.find((r) => r.code === 'gdp_per_capita_ppp');

  return (
    <>
      <PageHeader
        title="Krahaso vende"
        subtitle="Krahasoni 2–5 vende për të njëjtin biznes: kërkesa e dokumentuar, fuqia blerëse, kostot, mundësia e operimit dhe përshtatja me profilin."
      />
      {viewer.storeErrorSq ? <StoreUnavailable messageSq={viewer.storeErrorSq} /> : null}
      <CompareForm
        countries={countries.map((c) => ({ code: c.code, nameSq: c.nameSq, isDemo: c.isDemo }))}
        ideas={ARCHETYPES.map((a) => ({ id: a.id, nameSq: a.nameSq }))}
        initialCodes={codes}
        initialIdea={archetype?.id ?? ''}
      />

      {mixed ? (
        <Notice tone="demo" title="Ekonomitë DEMO nuk krahasohen me vende reale" className="mt-4">
          Zgjidhni vetëm vende DEMO (për të provuar aplikacionin) ose vetëm vende reale.
        </Notice>
      ) : null}
      <Notice tone="info" title="Regjistrimi, operimi dhe klientët janë tri vende të ndryshme" className="mt-4">
        Vendi ku regjistrohet biznesi, vendi ku operon dhe vendi ku janë klientët mund të ndryshojnë. Mos vendosni zhvendosje ose regjistrim ndërkombëtar vetëm nga një tregues tatimor: verifikoni rezidencën, të drejtën e punës, pagesat dhe operimin me burime zyrtare.
      </Notice>

      {ideaCmp ? (
        <Card className="mt-4">
          <CardHeader title={`Për biznesin: ${archetype?.nameSq}`} subtitle={ideaCmp.noteSq} />
          <div className="table-scroll">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-left text-xs text-faint">
                <tr>
                  <th scope="col" className="py-2 pr-2">Vendi</th>
                  <th scope="col" className="px-2 text-right">Përshtatja</th>
                  <th scope="col" className="px-2 text-right">Kapitali i hapjes</th>
                  <th scope="col" className="px-2 text-right">Prova makro (+ / −)</th>
                  <th scope="col" className="px-2 text-right">Fuqia blerëse (PPP)</th>
                  <th scope="col" className="px-2 text-right">Niveli i çmimeve</th>
                  <th scope="col" className="px-2">Mundësia e operimit</th>
                  <th scope="col" className="pl-2">Mbulimi</th>
                </tr>
              </thead>
              <tbody>
                {ideaCmp.rows.map((r) => (
                  <tr key={r.countryCode} className="border-t border-line align-top">
                    <th scope="row" className="py-2 pr-2 text-left font-medium text-ink">
                      <Link href={`/ide/${archetype?.id}?vendi=${r.countryCode}`} className="hover:text-accent-strong">
                        {r.nameSq}
                      </Link>
                      {r.isDemo ? <span className="ml-1 text-xs text-demo">DEMO</span> : null}
                    </th>
                    <td className="px-2 text-right tabular text-ink">{r.score.total === null ? '—' : formatNumber(r.score.total, 0)}</td>
                    <td className="px-2 text-right tabular text-ink">
                      {r.capitalRange ? `${formatMoney(r.capitalRange.low, r.capitalRange.currency, { compact: true })}–${formatMoney(r.capitalRange.high, r.capitalRange.currency, { compact: true })}` : '—'}
                    </td>
                    <td className="px-2 text-right tabular text-ink">
                      {r.supportedMacroClaims} / {r.contradictedMacroClaims}
                    </td>
                    <td className="px-2 text-right tabular text-ink">
                      {r.purchasingPower.value === null ? 'mungon' : formatNumber(r.purchasingPower.value, 0)}
                      {r.purchasingPower.period ? <span className="block text-[11px] text-faint">{formatPeriod(r.purchasingPower.period)}</span> : null}
                    </td>
                    <td className="px-2 text-right tabular text-ink">
                      {r.priceLevel.value === null ? 'mungon' : formatNumber(r.priceLevel.value, 2)}
                      {r.priceLevel.period ? <span className="block text-[11px] text-faint">{formatPeriod(r.priceLevel.period)}</span> : null}
                    </td>
                    <td className="px-2 text-xs text-muted">{r.operabilitySq}</td>
                    <td className="pl-2">
                      <CoverageBadge level={r.coverage} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {ideaCmp.warningsSq.length > 0 ? (
            <ul className="mt-3 space-y-1 text-xs text-warn">
              {ideaCmp.warningsSq.map((w) => (
                <li key={w}>⚠ {w}</li>
              ))}
            </ul>
          ) : null}
          <p className="mt-2 text-xs text-faint">Përshtatja është mjet orientimi, jo probabilitet fitimi. Për qytetet dhe lagjet nevojitet kërkim në terren.</p>
        </Card>
      ) : null}

      {table ? (
        <>
          <Card className="mt-4">
            <CardHeader title="Treguesit makro krah për krah" subtitle="Të dhënat më të fundit të disponueshme për secilin vend — periudhat mund të ndryshojnë." />
            <div className="table-scroll">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="text-left text-xs text-faint">
                  <tr>
                    <th scope="col" className="py-2 pr-2">Treguesi</th>
                    {table.countries.map((c) => (
                      <th key={c.code} scope="col" className="px-2 text-right">
                        {c.nameSq}
                        {c.isDemo ? <span className="ml-1 text-demo">DEMO</span> : null}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row) => {
                    const def = getIndicator(row.code);
                    return (
                      <tr key={row.code} className="border-t border-line align-top">
                        <th scope="row" className="py-2 pr-2 text-left font-normal text-ink">
                          {row.labelSq}
                          <span className="block text-[11px] text-faint">{row.unitLabelSq}</span>
                          {row.warningsSq.map((w) => (
                            <span key={w} className="block text-[11px] text-warn">
                              ⚠ {w}
                            </span>
                          ))}
                        </th>
                        {row.cells.map((cell) => (
                          <td key={cell.countryCode} className="px-2 py-2 text-right">
                            {cell.value === null || !def ? (
                              <span className="text-muted">mungon</span>
                            ) : (
                              <span className="tabular text-ink">{formatIndicatorValue(cell.value, def)}</span>
                            )}
                            {cell.period ? <span className="block text-[11px] text-faint">{formatPeriod(cell.period)}</span> : null}
                            {cell.status !== 'i_fresket' ? (
                              <span className="mt-0.5 inline-block">
                                <DataStatusBadge status={cell.status} />
                              </span>
                            ) : null}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          {ppp ? (
            <div className="mt-4">
              <BarChart
                title="PBB për frymë sipas fuqisë blerëse (PPP)"
                subtitle="Dollarë ndërkombëtarë aktualë — krahasojeni vetëm me kujdes kur vitet ndryshojnë"
                unit={{ kind: 'number', decimals: 0 }}
                data={ppp.cells.map((c) => ({
                  label: table.countries.find((x) => x.code === c.countryCode)?.nameSq ?? c.countryCode,
                  value: c.value,
                  note: c.period ? `Periudha ${formatPeriod(c.period)}` : 'mungon',
                }))}
              />
            </div>
          ) : null}
        </>
      ) : codes.length > 0 && codes.length < 2 ? (
        <p className="mt-4 text-sm text-muted">Shtoni të paktën një vend tjetër për krahasim.</p>
      ) : null}
    </>
  );
}
