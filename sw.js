// Revora service worker: app shell cached for instant load and offline viewing of the last data.
const VERSION = 'revora-v1';
const SHELL = ['./', './index.html', './firebase-config.js', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // Firebase/Google APIs: always network (Firestore handles its own offline cache).
  if (/googleapis\.com|firebaseio\.com|firebase\.com|gstatic\.com\/firebasejs/.test(url.host + url.pathname) && !/firebasejs/.test(url.pathname)) return;
  // SDK scripts and fonts: cache first.
  if (/gstatic\.com|googleapis\.com\/css|fonts\./.test(url.host + url.pathname)) {
    e.respondWith(caches.open(VERSION).then(async c => { const hit = await c.match(e.request); if (hit) return hit; const res = await fetch(e.request); if (res.ok) c.put(e.request, res.clone()); return res; }));
    return;
  }
  // Own files: network first, fall back to cache.
  if (url.origin === location.origin) {
    e.respondWith(fetch(e.request).then(res => { if (res.ok) caches.open(VERSION).then(c => c.put(e.request, res.clone())); return res; }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html'))));
  }
});
