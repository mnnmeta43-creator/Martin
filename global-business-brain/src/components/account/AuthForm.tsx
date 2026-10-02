'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiFetch } from '@/lib/client/api';
import { Button } from '@/components/ui/Button';
import { FieldError, Input, Label } from '@/components/ui/Field';
import { cx } from '@/components/ui/cx';

/** Login / register. Registering while browsing as a guest keeps the guest's profile and projects. */
export function AuthForm({ isGuest }: { isGuest: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>(isGuest ? 'register' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Shkruani një adresë emaili të vlefshme.');
      return;
    }
    if (mode === 'register' && password.length < 10) {
      setError('Fjalëkalimi duhet të ketë të paktën 10 karaktere.');
      return;
    }
    setBusy(true);
    const res = await apiFetch<unknown>(`/api/auth/${mode}`, { method: 'POST', body: { email: email.trim(), password } });
    setBusy(false);
    if (!res.ok) {
      setError(res.messageSq);
      return;
    }
    router.push('/');
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-line bg-surface p-5">
      <div role="tablist" className="mb-4 grid grid-cols-2 gap-1 rounded-xl border border-line bg-surface-2 p-1">
        {(['login', 'register'] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={cx('min-h-10 rounded-lg text-sm font-medium', mode === m ? 'bg-accent text-white' : 'text-muted')}
          >
            {m === 'login' ? 'Hyr' : isGuest ? 'Ruaj llogarinë' : 'Krijo llogari'}
          </button>
        ))}
      </div>
      {mode === 'register' && isGuest ? (
        <p className="mb-3 text-sm text-muted">Profili dhe projektet që krijuat si vizitor do të kalojnë në këtë llogari.</p>
      ) : null}
      <form onSubmit={submit} className="space-y-3" noValidate>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="password" hint={mode === 'register' ? 'Të paktën 10 karaktere.' : undefined}>
            Fjalëkalimi
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <FieldError>{error}</FieldError>
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? 'Duke u lidhur…' : mode === 'login' ? 'Hyr' : 'Krijo llogarinë'}
        </Button>
      </form>
      <p className="mt-4 text-xs text-faint">Fjalëkalimi ruhet vetëm si hash i sigurt. Nuk dërgojmë email marketingu dhe nuk ndajmë të dhënat tuaja.</p>
    </div>
  );
}
