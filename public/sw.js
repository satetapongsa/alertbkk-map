// AlertBKK Offline Emergency Service Worker
// Provides resilient caching for disaster and flood telemetry during field cellular drops

const CACHE_NAME = 'alertbkk-offline-v1';
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.svg',
  '/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch(() => {
        // Continue install even if precache fails
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Cache static assets and HTML pages with Network-First, Cache-Fallback strategy
  if (
    url.origin === self.location.origin &&
    (url.pathname === '/' ||
      url.pathname.startsWith('/_next/') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.js'))
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            return cached || (event.request.mode === 'navigate' ? caches.match('/') : null);
          });
        })
    );
  }
});
