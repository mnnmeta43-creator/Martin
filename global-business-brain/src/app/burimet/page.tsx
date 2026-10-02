import type { Metadata } from 'next';
import type { IntegrationStatus } from '@/lib/domain/types';
import { SOURCES } from '@/lib/data/sources/registry';
import { formatDateTime } from '@/lib/finance/format';
import { configStatus } from '@/lib/server/env';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Card, CardHeader } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { StoreUnavailable } from '@/components/ui/StoreUnavailable';
import { getViewer } from '../_lib/viewer';

export const metadata: Metadata = { title: 'Burimet dhe përditësimet' };
export const dynamic = 'force-dynamic';

const STATUS: Record<IntegrationStatus, { label: string; tone: BadgeTone }> = {
  integruar: { label: 'Integruar', tone: 'ok' },
  integruar_pa_verifikim_live: { label: 'Integruar — pa verifikim live ende', tone: 'warn' },
  vleresuar_jo_integruar: { label: 'Vlerësuar, jo i integruar', tone: 'neutral' },
  kerkon_celes: { label: 'Kërkon çelës API', tone: 'neutral' },
  lidhje_zyrtare: { label: 'Vetëm lidhje zyrtare', tone: 'neutral' },
  demo: { label: 'DEMO — fiktive', tone: 'demo' },
};

const LOG_TONE: Record<string, BadgeTone> = { ok: 'ok', gabim: 'bad', pjesshem: 'warn', anashkaluar: 'neutral' };
const LOG_LABEL: Record<string, string> = { ok: 'OK', gabim: 'Gabim', pjesshem: 'I pjesshëm', anashkaluar: 'Anashkaluar' };

export default async function SourcesPage() {
  const viewer = await getViewer();
  const logs = viewer.store ? await viewer.store.data.getLatestFetchLogs() : [];
  const config = configStatus();
  return (
    <>
      <PageHeader
        title="Burimet dhe përditësimet"
        subtitle="Nga vijnë të dhënat, sa shpesh publikohen, kur u morën për herë të fundit dhe çfarë nuk është integruar."
      />
      {viewer.storeErrorSq ? <StoreUnavailable messageSq={viewer.storeErrorSq} /> : null}

      <Notice tone="info" title="Çfarë do të thotë “live” këtu" className="mb-4">
        “Live” do të thotë lidhje reale me burimin dhe rifreskim i verifikueshëm me datë. Treguesit vjetorë ose periodikë shfaqen si “Të dhënat më të fundit të disponueshme” me periudhën e matjes — jo si matje në kohë reale. Kur një burim nuk përgjigjet, shfaqen të dhënat e fundit të ruajtura me paralajmërim për vjetërsinë.
      </Notice>

      <Card className="mb-4">
        <CardHeader title="Konfigurimi i serverit" subtitle="Vetëm nëse ekziston — vlerat sekrete nuk shfaqen kurrë." />
        <ul className="space-y-2">
          {config.map((c) => (
            <li key={c.key} className="rounded-xl border border-line bg-surface-2/60 p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <code className="font-mono text-ink">{c.key}</code>
                <Badge tone={c.present ? 'ok' : 'warn'}>{c.present ? 'I konfiguruar' : 'Mungon'}</Badge>
              </div>
              <p className="mt-1 text-muted">{c.present ? c.enablesSq : c.impactIfMissingSq}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mb-4">
        <CardHeader title="Rifreskimi i të dhënave" />
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
          <li>Rifreskimi bëhet në server: ruhen vlera, periudha, njësia, burimi me lidhjen, data e publikimit kur ofrohet dhe data e marrjes.</li>
          <li>Rifreskimi automatik kërkon një planifikues që thërret <code className="font-mono text-ink">POST /api/cron/refresh</code> me <code className="font-mono text-ink">CRON_SECRET</code>. Pa planifikues, nuk ka rifreskim pasi mbyllet aplikacioni.</li>
          <li>Rifreskim manual: <code className="font-mono text-ink">npm run data:refresh</code> në server.</li>
          <li>Çdo burim ka ritmin e vet (p.sh. kurset ditore, treguesit vjetorë javore); kërkesat ndahen në kohë dhe përsëriten me pritje kur burimi kthen gabim.</li>
        </ul>
      </Card>

      <h2 className="mb-2 text-lg font-semibold text-ink">Burimet e vlerësuara</h2>
      <ul className="mb-6 grid gap-3 lg:grid-cols-2">
        {SOURCES.map((s) => (
          <li key={s.id} className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-ink">{s.nameSq}</p>
                <p className="text-xs text-faint">{s.publisher}</p>
              </div>
              <Badge tone={STATUS[s.status].tone}>{STATUS[s.status].label}</Badge>
            </div>
            <dl className="mt-2 space-y-1 text-sm">
              <div>
                <dt className="inline text-muted">Mbulimi: </dt>
                <dd className="inline text-ink">{s.coverageSq}</dd>
              </div>
              <div>
                <dt className="inline text-muted">Ritmi i publikimit: </dt>
                <dd className="inline text-ink">{s.cadenceSq}</dd>
              </div>
              {s.license ? (
                <div>
                  <dt className="inline text-muted">Licenca: </dt>
                  <dd className="inline text-ink">{s.license}</dd>
                </div>
              ) : null}
              {s.rateLimitSq ? (
                <div>
                  <dt className="inline text-muted">Kufijtë e kërkesave: </dt>
                  <dd className="inline text-ink">{s.rateLimitSq}</dd>
                </div>
              ) : null}
              {s.requiresEnv && s.requiresEnv.length > 0 ? (
                <div>
                  <dt className="inline text-muted">Kërkon: </dt>
                  <dd className="inline font-mono text-ink">{s.requiresEnv.join(', ')}</dd>
                </div>
              ) : null}
            </dl>
            {s.notesSq.length > 0 ? (
              <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-muted">
                {s.notesSq.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            ) : null}
            <p className="mt-2 flex flex-wrap gap-3 text-xs">
              {/^https:\/\//.test(s.homepageUrl) ? (
                <a href={s.homepageUrl} target="_blank" rel="noopener noreferrer" className="text-accent-strong hover:underline">
                  Faqja e burimit
                </a>
              ) : null}
              {s.termsUrl ? (
                <a href={s.termsUrl} target="_blank" rel="noopener noreferrer" className="text-accent-strong hover:underline">
                  Kushtet e përdorimit
                </a>
              ) : null}
              {s.docsUrl ? (
                <a href={s.docsUrl} target="_blank" rel="noopener noreferrer" className="text-accent-strong hover:underline">
                  Dokumentimi
                </a>
              ) : null}
            </p>
          </li>
        ))}
      </ul>

      <h2 className="mb-2 text-lg font-semibold text-ink">Rifreskimet e fundit</h2>
      {logs.length === 0 ? (
        <Notice tone="warn" className="mb-6">
          Asnjë rifreskim nuk është kryer ende. Treguesit e vendeve reale do të shfaqen si “Mungojnë të dhënat” derisa të ekzekutohet rifreskimi në një server me qasje në burime.
        </Notice>
      ) : (
        <DataTable
          className="mb-6"
          caption="Rifreskimet e fundit sipas burimit dhe fushës"
          rows={logs}
          rowKey={(l) => `${l.sourceId}-${l.scope}`}
          columns={[
            { key: 'src', header: 'Burimi', cell: (l) => l.sourceId },
            { key: 'scope', header: 'Fusha', cell: (l) => <span className="font-mono text-xs">{l.scope}</span> },
            { key: 'st', header: 'Statusi', cell: (l) => <Badge tone={LOG_TONE[l.status] ?? 'neutral'}>{LOG_LABEL[l.status] ?? l.status}</Badge> },
            { key: 'at', header: 'Koha', cell: (l) => formatDateTime(l.finishedAt ?? l.startedAt) },
            { key: 'rows', header: 'Rreshta', align: 'right', cell: (l) => l.rows ?? 0 },
            { key: 'msg', header: 'Mesazhi', cell: (l) => <span className="text-xs text-muted">{l.messageSq ?? ''}</span> },
          ]}
        />
      )}

      <Card id="demo">
        <CardHeader title="Të dhënat demonstrative" />
        <p className="text-sm text-muted">
          Me <code className="font-mono text-ink">DATA_MODE=demo</code> aktivizohen tri ekonomi fiktive (ZZA, ZZB, ZZC) me të dhëna të sajuara, për të provuar rrjedhën e plotë pa qasje në burime. Ato nuk ruhen në tabelat e të dhënave reale, shënohen DEMO kudo dhe nuk përdoren për rekomandime reale. Modaliteti aktual:{' '}
          <strong className="text-ink">{viewer.demoMode ? 'DEMO' : 'LIVE (vetëm të dhëna reale të sinkronizuara)'}</strong>.
        </p>
      </Card>
    </>
  );
}
