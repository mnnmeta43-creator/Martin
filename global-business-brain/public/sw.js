/*
 * Global Business Brain — service worker.
 * Offline = viewing pages and project snapshots already seen on this device, labelled with their date.
 * It never pretends to be live analysis: API calls are never cached, and the offline banner is shown.
 */
const VERSION = 'gbb-v1';
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;
const PRECACHE = ['/offline', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  // Sent on logout / account deletion so the next person on this device cannot read cached project pages.
  if (event.data && event.data.type === 'clear-user-data') {
    event.waitUntil(caches.delete(PAGE_CACHE));
  }
});

function isCacheablePage(url) {
  return url.pathname === '/' || url.pathname.startsWith('/projektet') || url.pathname.startsWith('/ide') || url.pathname.startsWith('/shtetet');
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return; // always network; never cached

  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) caches.open(STATIC_CACHE).then((c) => c.put(req, res.clone()));
            return res;
          }),
      ),
    );
    return;
  }

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok && isCacheablePage(url)) {
            const copy = res.clone();
            caches.open(PAGE_CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('/offline'))),
    );
  }
});
