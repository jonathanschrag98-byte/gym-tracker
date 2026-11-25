const CACHE = "gym-v6";
const FILES = ["./", "index.html", "platform.js", "settings.js", "meals.js", "plan.js", "finder.js", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache:"reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Netz zuerst (damit Updates ankommen), sonst aus dem Cache – so läuft die App auch offline
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || req.url.includes("api.anthropic.com")) return;
  e.respondWith(
    (new URL(req.url).origin === location.origin ? fetch(req.url, { cache:"no-cache" }) : fetch(req)).then(res => {
      if (res.ok && (new URL(req.url).origin === location.origin || req.url.includes("fonts.g"))){
        const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch:true }).then(r => r || caches.match("index.html")))
  );
});
