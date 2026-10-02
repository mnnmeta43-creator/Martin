import type { Metadata } from 'next';
import Link from 'next/link';
import type { BusinessMode, SectorId } from '@/lib/domain/types';
import { BUSINESS_MODE_LABELS, SECTORS } from '@/lib/domain/taxonomy';
import { getCountries } from '@/lib/data/countries';
import { getArchetype } from '@/lib/ideas/archetypes';
import { CountrySelectForm } from '@/components/countries/CountrySelectForm';
import { IdeaCard } from '@/components/ideas/IdeaCard';
import { ButtonLink } from '@/components/ui/Button';
import { Disclosure } from '@/components/ui/Disclosure';
import { EmptyState } from '@/components/ui/EmptyState';
import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { CoverageBadge, DemoBadge } from '@/components/ui/StatusBadge';
import { StoreUnavailable } from '@/components/ui/StoreUnavailable';
import { loadIdeas } from '../_lib/ideas';
import { defaultCountryCode, getViewer } from '../_lib/viewer';

export const metadata: Metadata = { title: 'Ide biznesi' };
export const dynamic = 'force-dynamic';

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function IdeasPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await props.searchParams;
  const viewer = await getViewer();
  const countries = getCountries({ includeDemo: viewer.demoMode });
  const requested = (one(sp.vendi) ?? '').toUpperCase();
  const code = countries.some((c) => c.code === requested) ? requested : defaultCountryCode(viewer);
  const sector = one(sp.sektori) as SectorId | undefined;
  const mode = one(sp.menyra) as BusinessMode | undefined;
  const maxCapitalRaw = Number(one(sp.kapitali));
  const filters = {
    sector: sector && sector in SECTORS ? sector : undefined,
    mode: mode && mode in BUSINESS_MODE_LABELS ? mode : undefined,
    maxCapital: Number.isFinite(maxCapitalRaw) && maxCapitalRaw > 0 ? maxCapitalRaw : undefined,
  };
  const data = viewer.store ? await loadIdeas(viewer, code, filters) : null;
  const href = (id: string) => `/ide/${id}?vendi=${code}`;
  const sectorOf = (id: string) => SECTORS[getArchetype(id)?.sector ?? 'digjitale'];

  return (
    <>
      <PageHeader
        title="Ide biznesi"
        subtitle="Çdo ide lidh të dhënat → problemin e klientit → kërkesën e mundshme → ofertën → mënyrën e fitimit → provën praktike."
        badges={
          data ? (
            <>
              {data.ctx.isDemo ? <DemoBadge /> : null}
              <CoverageBadge level={data.ctx.coverage.level} title={data.ctx.coverage.noteSq} />
            </>
          ) : null
        }
      />
      {viewer.storeErrorSq ? <StoreUnavailable messageSq={viewer.storeErrorSq} /> : null}
      <div className="mb-4 rounded-2xl border border-line bg-surface p-3">
        <CountrySelectForm
          action="/ide"
          countries={countries.map((c) => ({ code: c.code, nameSq: c.nameSq, isDemo: c.isDemo }))}
          value={code}
          extra={
            <>
              <div>
                <label htmlFor="f-sector" className="mb-1 block text-xs text-muted">
                  Sektori
                </label>
                <select id="f-sector" name="sektori" defaultValue={filters.sector ?? ''} className="rounded-xl border border-line-strong bg-surface-2 px-3 py-2.5 text-sm text-ink">
                  <option value="">Të gjithë</option>
                  {(Object.keys(SECTORS) as SectorId[]).map((s) => (
                    <option key={s} value={s}>
                      {SECTORS[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="f-mode" className="mb-1 block text-xs text-muted">
                  Mënyra
                </label>
                <select id="f-mode" name="menyra" defaultValue={filters.mode ?? ''} className="rounded-xl border border-line-strong bg-surface-2 px-3 py-2.5 text-sm text-ink">
                  <option value="">Çdo mënyrë</option>
                  {(Object.keys(BUSINESS_MODE_LABELS) as BusinessMode[]).map((m) => (
                    <option key={m} value={m}>
                      {BUSINESS_MODE_LABELS[m]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-36">
                <label htmlFor="f-cap" className="mb-1 block text-xs text-muted">
                  Kapitali maks. {viewer.profile ? `(${viewer.profile.capital.currency})` : ''}
                </label>
                <input
                  id="f-cap"
                  name="kapitali"
                  type="number"
                  min={0}
                  defaultValue={filters.maxCapital ?? ''}
                  className="w-full rounded-xl border border-line-strong bg-surface-2 px-3 py-2.5 text-sm text-ink"
                />
              </div>
            </>
          }
        />
      </div>

      {data?.usingPlaceholderProfile ? (
        <Notice tone="warn" title="Po shihni ide pa profilin tuaj" className="mb-4">
          Pa profil, kapitali konsiderohet 0 dhe aftësitë mungojnë, prandaj pikëzimet janë vetëm orientuese. <Link href="/profili">Plotësoni profilin</Link> për rekomandime të personalizuara.
        </Notice>
      ) : null}
      {data && data.ctx.coverage.level === 'e_pamjaftueshme' ? (
        <Notice tone="warn" title="Të dhënat makro për këtë vend janë të pamjaftueshme" className="mb-4">
          {data.ctx.coverage.noteSq} Idetë vlerësohen kryesisht sipas profilit; dimensioni “kërkesa e dokumentuar” nuk vlerësohet (nuk trajtohet si 0). Kontrolloni <Link href="/burimet">Burimet</Link>.
        </Notice>
      ) : null}
      {data?.ctx.isDemo ? (
        <Notice tone="demo" title="Të dhëna DEMO" className="mb-4">
          Ky është një vend fiktiv. Idetë dhe numrat shërbejnë vetëm për të provuar aplikacionin — jo për vendime reale.
        </Notice>
      ) : null}

      {!data ? null : data.recommendations.length === 0 ? (
        <EmptyState title="Asnjë ide nuk përputhet me filtrat dhe profilin">Provoni të hiqni filtrat ose shihni më poshtë idetë që kërkojnë ekip dhe ato të përjashtuara, me arsyet.</EmptyState>
      ) : (
        <section aria-labelledby="rec-title">
          <h2 id="rec-title" className="mb-2 text-lg font-semibold text-ink">
            Të përshtatshme për profilin ({data.recommendations.length})
          </h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.recommendations.map((r) => (
              <IdeaCard key={r.archetypeId} rec={r} href={href(r.archetypeId)} sectorLabel={sectorOf(r.archetypeId)} />
            ))}
          </div>
        </section>
      )}

      {data && data.teamRequired.length > 0 ? (
        <section className="mt-6" aria-labelledby="team-title">
          <h2 id="team-title" className="text-lg font-semibold text-ink">
            Kërkojnë partner ose ekip ({data.teamRequired.length})
          </h2>
          <p className="mb-2 text-sm text-muted">Nuk renditen bashkë me të mësipërmet sepse profili juaj thotë se do të punoni vetëm.</p>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.teamRequired.map((r) => (
              <IdeaCard key={r.archetypeId} rec={r} href={href(r.archetypeId)} sectorLabel={sectorOf(r.archetypeId)} />
            ))}
          </div>
        </section>
      ) : null}

      {data && data.excluded.length > 0 ? (
        <Disclosure summary={`Të përjashtuara për profilin tuaj (${data.excluded.length}) — me arsyet`} className="mt-6">
          <ul className="space-y-2">
            {data.excluded.map((r) => (
              <li key={r.archetypeId}>
                <Link href={href(r.archetypeId)} className="font-medium text-ink hover:text-accent-strong">
                  {r.nameSq}
                </Link>
                <ul className="list-disc pl-5 text-xs text-bad">
                  {r.fit.blockersSq.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Disclosure>
      ) : null}

      {data ? <p className="mt-6 text-xs text-faint">{data.noteSq}</p> : null}
      <div className="mt-6">
        <ButtonLink href={`/krahaso?vende=${code}`} variant="secondary">
          Krahaso këtë vend me të tjerë
        </ButtonLink>
      </div>
    </>
  );
}
