/**
 * Pamjet offline të projekteve (device-local snapshots of saved projects).
 * Snapshots are a convenience for viewing without a connection; they are clearly dated and are
 * never presented as live analysis. They are scoped to the signed-in user and cleared on logout.
 */
export interface OfflineProjectSnapshot {
  id: string;
  title: string;
  countryNameSq: string;
  city?: string | null;
  isDemo: boolean;
  analysisDate: string;
  savedAt: string;
  currency: string;
  keyNumbers: { labelSq: string; valueSq: string }[];
  progressLabelSq: string;
  phases: { rangeLabel: string; titleSq: string; done: number; total: number }[];
  openTasks: { titleSq: string; phaseRange: string }[];
}

const KEY = 'gbb:offline:projects';
const OWNER_KEY = 'gbb:offline:owner';
const MAX = 20;

function read(): OfflineProjectSnapshot[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as OfflineProjectSnapshot[]) : [];
  } catch {
    return [];
  }
}

function write(list: OfflineProjectSnapshot[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    // Storage full or blocked (private mode): offline copy is optional.
  }
}

export function saveSnapshot(ownerId: string, snap: OfflineProjectSnapshot) {
  try {
    if (window.localStorage.getItem(OWNER_KEY) !== ownerId) {
      window.localStorage.removeItem(KEY);
      window.localStorage.setItem(OWNER_KEY, ownerId);
    }
  } catch {
    return;
  }
  const rest = read().filter((s) => s.id !== snap.id);
  write([snap, ...rest]);
}

export function listSnapshots(): OfflineProjectSnapshot[] {
  return read().sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function removeSnapshot(id: string) {
  write(read().filter((s) => s.id !== id));
}

/** Called on logout / account deletion: removes local snapshots and the service-worker page cache. */
export function clearOfflineData() {
  try {
    window.localStorage.removeItem(KEY);
    window.localStorage.removeItem(OWNER_KEY);
  } catch {
    // ignore
  }
  navigator.serviceWorker?.controller?.postMessage({ type: 'clear-user-data' });
}
