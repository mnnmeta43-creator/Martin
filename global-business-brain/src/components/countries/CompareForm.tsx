'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CountryMultiPicker, type CountryOption } from '@/components/profile/CountryPicker';
import { Button } from '@/components/ui/Button';

/** Choose 2–5 economies and optionally one business idea to compare them for. */
export function CompareForm({
  countries,
  ideas,
  initialCodes,
  initialIdea,
}: {
  countries: CountryOption[];
  ideas: { id: string; nameSq: string }[];
  initialCodes: string[];
  initialIdea: string;
}) {
  const router = useRouter();
  const [codes, setCodes] = useState(initialCodes);
  const [idea, setIdea] = useState(initialIdea);
  return (
    <form
      className="space-y-3 rounded-2xl border border-line bg-surface p-4"
      onSubmit={(e) => {
        e.preventDefault();
        const q = new URLSearchParams();
        if (codes.length) q.set('vende', codes.join(','));
        if (idea) q.set('ideja', idea);
        router.push(`/krahaso?${q.toString()}`);
      }}
    >
      <CountryMultiPicker label="Vendet (2–5)" options={countries} values={codes} onChange={setCodes} max={5} />
      <div>
        <label htmlFor="cmpIdea" className="mb-1 block text-sm font-medium text-ink">
          Për cilin biznes? (opsionale)
        </label>
        <select id="cmpIdea" value={idea} onChange={(e) => setIdea(e.target.value)} className="w-full rounded-xl border border-line-strong bg-surface-2 px-3 py-2.5 text-sm text-ink">
          <option value="">Vetëm treguesit makro</option>
          {ideas.map((i) => (
            <option key={i.id} value={i.id}>
              {i.nameSq}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" disabled={codes.length < 2}>
        Krahaso
      </Button>
      {codes.length < 2 ? <p className="text-xs text-faint">Zgjidhni të paktën 2 vende.</p> : null}
    </form>
  );
}
