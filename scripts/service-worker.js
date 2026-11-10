const scope = self.registration.scope;
const prefix = `phrase-pocket:${scope}:`;
const cacheName = `${prefix}__VERSION__`;
const assets = "__PRECACHE__";
const assetUrls = new Set(assets.map((path) => new URL(path, scope).href));
const home = new URL("index.html", scope).href;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => cache.addAll([...assetUrls])),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(async (keys) => {
      await Promise.all(
        keys
          .filter((key) => key.startsWith(prefix) && key !== cacheName)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    }),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "APPLY_UPDATE") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || request.headers.has("Authorization")) return;
  const url = new URL(request.url);
  if (!url.href.startsWith(scope)) return;
  const isHome =
    request.mode === "navigate" &&
    (url.pathname === new URL(scope).pathname ||
      url.pathname === new URL(home).pathname);
  if (!isHome && !assetUrls.has(url.href)) return;
  event.respondWith(
    caches.open(cacheName).then(async (cache) => {
      const saved = await cache.match(isHome ? home : request, {
        ignoreVary: true,
      });
      return saved ?? fetch(request);
    }),
  );
});
