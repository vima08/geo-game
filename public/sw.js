const CACHE_PREFIX = 'almaty-trails-';
const LEGACY_CACHE_PREFIX = 'bostandyk-trails-';
const CACHE = `${CACHE_PREFIX}v1`;
const scopeUrl = new URL('./', self.registration.scope);

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const response = await fetch(scopeUrl);
    if (response.ok) {
      await cache.put(scopeUrl, response.clone());
      const html = await response.text();
      const paths = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
        .map((match) => new URL(match[1], scopeUrl).href)
        .filter((url) => new URL(url).origin === scopeUrl.origin);
      await Promise.allSettled(paths.map((url) => cache.add(url)));
    }
    await Promise.allSettled(['manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png'].map((path) => cache.add(new URL(path, scopeUrl).href)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => (key.startsWith(CACHE_PREFIX) || key.startsWith(LEGACY_CACHE_PREFIX)) && key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then((response) => {
      const type = response.headers.get('content-type') || '';
      if (response.ok && type.includes('text/html') && url.pathname === scopeUrl.pathname) {
        const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(scopeUrl, copy));
      }
      return response;
    }).catch(() => caches.match(scopeUrl)));
    return;
  }
  if (url.origin === scopeUrl.origin) {
    event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (response.ok) { const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(event.request, copy)); }
      return response;
    })));
  }
});
