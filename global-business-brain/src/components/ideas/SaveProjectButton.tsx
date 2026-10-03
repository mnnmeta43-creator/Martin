'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiFetch } from '@/lib/client/api';
import { Button } from '@/components/ui/Button';

/** Creates a project from an idea (inputs, data snapshot, plan and tasks are built server-side). */
export function SaveProjectButton({ archetypeId, countryCode, hasProfile }: { archetypeId: string; countryCode: string; hasProfile: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!hasProfile) {
    return (
      <Link href="/profili" className="inline-flex min-h-11 items-center rounded-xl border border-accent px-4 text-sm font-medium text-accent-strong">
        Plotëso profilin për ta ruajtur
      </Link>
    );
  }
  async function save() {
    setBusy(true);
    setError(null);
    const res = await apiFetch<{ project: { id: string } }>('/api/projects', { method: 'POST', body: { archetypeId, countryCode } });
    setBusy(false);
    if (!res.ok) setError(res.messageSq);
    else router.push(`/projektet/${res.data.project.id}`);
  }
  return (
    <div className="flex flex-col items-start gap-1">
      <Button type="button" onClick={save} disabled={busy}>
        {busy ? 'Duke krijuar projektin…' : 'Ruaj si projekt'}
      </Button>
      {error ? (
        <p role="alert" className="text-sm text-bad">
          {error}
        </p>
      ) : null}
    </div>
  );
}
