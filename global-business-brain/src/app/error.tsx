'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // The server already logged the details (without secrets); the digest links the two.
    console.error('gbb.page_error', error.digest);
  }, [error]);
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <h1 className="text-2xl font-semibold text-ink">Ndodhi një gabim</h1>
      <p className="mt-2 text-muted">Faqja nuk u ngarkua. Të dhënat tuaja nuk janë prekur. Provoni sërish.</p>
      {error.digest ? <p className="mt-2 font-mono text-xs text-faint">Kodi: {error.digest}</p> : null}
      <div className="mt-6 flex justify-center">
        <Button type="button" onClick={reset}>
          Provo sërish
        </Button>
      </div>
    </div>
  );
}
