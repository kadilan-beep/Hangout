// Service worker: lets The Hangout install as an app, open fast, and handle notification taps.
const CACHE = "hangout-v2";
const SHELL = ["./", "./index.html", "./app.js", "./config.js", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// App files: try the network first (so updates show up), fall back to the saved copy when offline.
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
// Tapping a notification opens The Hangout (and the right chat).
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const chat = e.notification.data && e.notification.data.chat;
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of all) { if ("focus" in c) { await c.focus(); if (chat) c.postMessage({ openChat: chat }); return; } }
    if (self.clients.openWindow) await self.clients.openWindow("./");
  })());
});
