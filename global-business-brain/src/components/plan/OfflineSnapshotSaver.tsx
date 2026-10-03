'use client';

import { useEffect } from 'react';
import { saveSnapshot, type OfflineProjectSnapshot } from '@/lib/client/offline';

/** Keeps a dated copy of the project on this device for offline viewing (no network, no secrets). */
export function OfflineSnapshotSaver({ ownerId, snapshot }: { ownerId: string; snapshot: Omit<OfflineProjectSnapshot, 'savedAt'> }) {
  useEffect(() => {
    saveSnapshot(ownerId, { ...snapshot, savedAt: new Date().toISOString() });
  }, [ownerId, snapshot]);
  return null;
}
