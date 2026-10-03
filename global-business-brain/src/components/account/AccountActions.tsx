'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiFetch } from '@/lib/client/api';
import { clearOfflineData } from '@/lib/client/offline';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';

/** Logout, clearing device data, and permanent account deletion (with explicit confirmation). */
export function AccountActions({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState<{ tone: 'ok' | 'bad'; text: string } | null>(null);

  async function logout() {
    await apiFetch<unknown>('/api/auth/logout', { method: 'POST', body: {} });
    clearOfflineData();
    router.push('/');
    router.refresh();
  }

  async function deleteAccount() {
    const res = await apiFetch<unknown>('/api/account', { method: 'DELETE' });
    if (!res.ok) {
      setMsg({ tone: 'bad', text: res.messageSq });
      return;
    }
    clearOfflineData();
    router.push('/');
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {signedIn ? (
          <Button type="button" variant="secondary" onClick={logout}>
            Dil nga llogaria
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            clearOfflineData();
            setMsg({ tone: 'ok', text: 'Kopjet offline në këtë pajisje u fshinë.' });
          }}
        >
          Fshi kopjet offline në këtë pajisje
        </Button>
      </div>
      {signedIn ? (
        <div className="rounded-xl border border-bad/40 bg-bad-soft/40 p-3">
          <p className="font-medium text-ink">Fshi llogarinë dhe të gjitha të dhënat</p>
          <p className="mt-1 text-sm text-muted">Fshihen përgjithmonë profili, projektet, detyrat, provat dhe bisedat. Ky veprim nuk kthehet pas.</p>
          <label htmlFor="confirmDelete" className="mt-2 block text-sm text-muted">
            Shkruani FSHI për të konfirmuar
          </label>
          <div className="mt-1 flex flex-wrap gap-2">
            <input
              id="confirmDelete"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="min-h-10 rounded-lg border border-line-strong bg-surface px-3 text-base text-ink sm:text-sm"
            />
            <Button type="button" variant="danger" disabled={confirm !== 'FSHI'} onClick={deleteAccount}>
              Fshi përgjithmonë
            </Button>
          </div>
        </div>
      ) : null}
      {msg ? <Notice tone={msg.tone === 'ok' ? 'ok' : 'bad'}>{msg.text}</Notice> : null}
    </div>
  );
}
