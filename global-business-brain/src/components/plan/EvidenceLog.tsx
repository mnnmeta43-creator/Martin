'use client';

import { useState } from 'react';
import type { EvidenceEntry, EvidenceType } from '@/lib/domain/types';
import { EVIDENCE_TYPE_LABELS } from '@/lib/domain/taxonomy';
import { formatDate, formatMoney } from '@/lib/finance/format';
import { apiFetch } from '@/lib/client/api';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select, Textarea } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Notice';

/**
 * Regjistri i provave lokale: interviews, observations, quotes, pre-orders, payments.
 * Verbal interest and real buying behaviour are logged as different types on purpose.
 */
export function EvidenceLog({
  projectId,
  initial,
  currency,
  today,
}: {
  projectId: string;
  initial: EvidenceEntry[];
  currency: string;
  today: string;
}) {
  const [items, setItems] = useState(initial);
  const [type, setType] = useState<EvidenceType>('interviste');
  const [summary, setSummary] = useState('');
  const [source, setSource] = useState('');
  const [quantity, setQuantity] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(today);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const paid = items.filter((i) => i.type === 'pagese' || i.type === 'parapagim');
  const interviews = items.filter((i) => i.type === 'interviste');

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (summary.trim().length < 3) {
      setError('Përshkruani shkurt provën (të paktën 3 shkronja).');
      return;
    }
    setBusy(true);
    setError(null);
    const res = await apiFetch<{ evidence: EvidenceEntry }>(`/api/projects/${projectId}/evidence`, {
      method: 'POST',
      body: {
        type,
        summarySq: summary.trim(),
        sourceSq: source.trim() || 'Mbledhur nga përdoruesi',
        quantity: quantity === '' ? null : Number(quantity),
        amount: amount === '' ? null : Number(amount),
        collectedAt: date,
      },
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.messageSq);
      return;
    }
    setItems((xs) => [res.data.evidence, ...xs]);
    setSummary('');
    setSource('');
    setQuantity('');
    setAmount('');
  }

  async function remove(id: string) {
    const res = await apiFetch<unknown>(`/api/projects/${projectId}/evidence/${id}`, { method: 'DELETE' });
    if (res.ok) setItems((xs) => xs.filter((x) => x.id !== id));
    else setError(res.messageSq);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-surface-2 p-3">
          <p className="text-xs text-muted">Intervista të regjistruara</p>
          <p className="text-xl font-semibold tabular text-ink">{interviews.length}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface-2 p-3">
          <p className="text-xs text-muted">Parapagime / pagesa</p>
          <p className="text-xl font-semibold tabular text-ink">{paid.length}</p>
        </div>
        <div className="col-span-2 rounded-xl border border-line bg-surface-2 p-3 sm:col-span-1">
          <p className="text-xs text-muted">Interesi verbal ≠ blerje</p>
          <p className="text-xs text-ink">Vetëm pagesat dhe parapagimet tregojnë sjellje reale blerjeje.</p>
        </div>
      </div>

      <form onSubmit={add} className="space-y-3 rounded-2xl border border-line bg-surface p-4">
        <p className="font-semibold text-ink">Shto një provë</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="evType">Lloji</Label>
            <Select id="evType" value={type} onChange={(e) => setType(e.target.value as EvidenceType)}>
              {(Object.keys(EVIDENCE_TYPE_LABELS) as EvidenceType[]).map((k) => (
                <option key={k} value={k}>
                  {EVIDENCE_TYPE_LABELS[k]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="evDate">Data</Label>
            <Input id="evDate" type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <div>
          <Label htmlFor="evSummary" hint="Çfarë ndodhi realisht? P.sh. “Pronari tha se humb 2–3 telefonata në javë për orarin e gabuar”.">
            Përmbledhja
          </Label>
          <Textarea id="evSummary" maxLength={1000} value={summary} onChange={(e) => setSummary(e.target.value)} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label htmlFor="evSource">Burimi</Label>
            <Input id="evSource" maxLength={200} placeholder="p.sh. takim në lokal" value={source} onChange={(e) => setSource(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="evQty">Sasia (opsionale)</Label>
            <Input id="evQty" type="number" min={0} step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="evAmt">Shuma ({currency}, opsionale)</Label>
            <Input id="evAmt" type="number" min={0} step="any" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
        </div>
        <p className="text-xs text-faint">Mos regjistroni të dhëna personale të panevojshme të klientëve (emra, telefona) pa pëlqimin e tyre.</p>
        {error ? <Notice tone="bad">{error}</Notice> : null}
        <Button type="submit" disabled={busy}>
          {busy ? 'Duke ruajtur…' : 'Ruaj provën'}
        </Button>
      </form>

      {items.length === 0 ? (
        <p className="text-sm text-muted">Ende nuk ka prova. Nisni me intervistat e fazës 10–20.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((i) => (
            <li key={i.id} className="rounded-xl border border-line bg-surface-2/60 p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-accent-strong">{EVIDENCE_TYPE_LABELS[i.type]}</p>
                  <p className="text-sm text-ink">{i.summarySq}</p>
                  <p className="mt-1 text-[11px] text-faint">
                    {formatDate(i.collectedAt)} · {i.sourceSq}
                    {i.quantity !== null && i.quantity !== undefined ? ` · sasia ${i.quantity}` : ''}
                    {i.amount !== null && i.amount !== undefined ? ` · ${formatMoney(i.amount, currency)}` : ''}
                  </p>
                </div>
                <button type="button" onClick={() => remove(i.id)} className="rounded-lg px-2 py-1 text-xs text-bad hover:bg-bad-soft">
                  Fshi
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
