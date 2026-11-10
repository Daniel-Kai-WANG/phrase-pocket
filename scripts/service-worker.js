const scope = self.registration.scope;
const prefix = `phrase-pocket:${scope}:`;
const cacheName = `${prefix}__VERSION__`;
const assets = "__PRECACHE__";
const assetUrls = new Set(assets.map((path) => new URL(path, scope).href));
const home = new URL("index.html", scope).href;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(cacheName)
      .then((cache) =>
        cache.addAll(
          [...assetUrls].map((url) => new Request(url, { cache: "reload" })),
        ),
      ),
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

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data?.json() ?? {};
  } catch {
    /* Always show a visible notification. */
  }
  event.waitUntil(
    self.registration.showNotification(
      typeof payload.title === "string" ? payload.title : "Your Phrase Pocket",
      {
        body:
          typeof payload.body === "string"
            ? payload.body
            : "Your little English adventure is waiting.",
        tag: typeof payload.tag === "string" ? payload.tag : "pocket-reminder",
        icon: new URL("icons/pocket-192.png", scope).href,
        data: { url: new URL("?reminder=1#phrases", scope).href },
      },
    ),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const destination = new URL("?reminder=1#phrases", scope).href;
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(async (clients) => {
        const existing = clients.find((client) => client.url.startsWith(scope));
        if (existing) {
          await existing.focus();
          existing.postMessage({ type: "OPEN_REMAINING_TASKS" });
        } else await self.clients.openWindow(destination);
      }),
  );
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
