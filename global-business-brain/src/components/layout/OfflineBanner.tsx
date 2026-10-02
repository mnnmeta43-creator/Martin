'use client';

import { useEffect, useState } from 'react';

/** Tells the user when the device is offline: what they see is stored data, not live analysis. */
export function OfflineBanner() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  if (online) return null;
  return (
    <div role="status" className="border-b border-warn/40 bg-warn-soft px-4 py-2 text-center text-sm text-warn">
      Jeni offline. Po shihni të dhëna të ruajtura më parë me datën e tyre — jo analizë live. Ndryshimet nuk ruhen derisa të lidheni.
    </div>
  );
}
