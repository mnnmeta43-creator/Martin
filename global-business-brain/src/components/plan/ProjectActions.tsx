'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiFetch } from '@/lib/client/api';
import { removeSnapshot } from '@/lib/client/offline';
import { Button, buttonClass } from '@/components/ui/Button';

/** Export and delete actions for a project. Deleting asks for confirmation. */
export function ProjectActions({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function del() {
    const res = await apiFetch<unknown>(`/api/projects/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      setError(res.messageSq);
      return;
    }
    removeSnapshot(id);
    router.push('/projektet');
    router.refresh();
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <a href={`/api/projects/${id}/export/pdf`} className={buttonClass('secondary', 'sm')}>
        Plani në PDF
      </a>
      <a href={`/api/projects/${id}/export/xlsx`} className={buttonClass('secondary', 'sm')}>
        Modeli në Excel
      </a>
      {confirming ? (
        <>
          <Button type="button" variant="danger" size="sm" onClick={del}>
            Po, fshije
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)}>
            Anulo
          </Button>
        </>
      ) : (
        <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(true)}>
          Fshi projektin
        </Button>
      )}
      {error ? <p className="text-sm text-bad">{error}</p> : null}
    </div>
  );
}
