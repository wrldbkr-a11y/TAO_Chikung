// Bewaart de app zelf offline. De filmpjes staan apart in de opslag van de app.
const CACHE = "chikung-v4";
const BESTANDEN = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BESTANDEN)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// Eerst uit cache (werkt offline), op de achtergrond bijwerken als er netwerk is.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.open(CACHE).then(async c => {
      const bewaard = await c.match(e.request, {ignoreSearch: true});
      const vers = fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => bewaard);
      return bewaard || vers;
    })
  );
});
