import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { expect, it, vi } from "vitest";

function worker(scope = "https://example.com/phrase-pocket/") {
  const listeners = new Map<string, (event: unknown) => void>();
  const stored = new Map<string, Response>();
  const cache = {
    addAll: vi.fn(async (urls: string[]) => {
      urls.forEach((url) => stored.set(url, new Response(`cached:${url}`)));
    }),
    match: vi.fn(
      async (request: string | Request, options?: CacheQueryOptions) => {
        if (
          typeof request !== "string" &&
          request.headers.has("Origin") &&
          !options?.ignoreVary
        )
          return undefined;
        return stored.get(typeof request === "string" ? request : request.url);
      },
    ),
  };
  const caches = {
    open: vi.fn(async () => cache),
    keys: vi.fn(async () => [`phrase-pocket:${scope}:old`, "unrelated-app"]),
    delete: vi.fn(async () => true),
  };
  const skipWaiting = vi.fn();
  const claim = vi.fn();
  const showNotification = vi.fn(async () => {});
  const openWindow = vi.fn(async () => {});
  const focus = vi.fn(async () => {});
  const postMessage = vi.fn();
  const matchAll = vi.fn(async () => [{ url: scope, focus, postMessage }]);
  const fetch = vi.fn(async () => {
    throw new Error("offline");
  });
  const script = readFileSync("scripts/service-worker.js", "utf8")
    .replace("__VERSION__", "test")
    .replace(
      '"__PRECACHE__"',
      JSON.stringify(["index.html", "assets/app.js", "icons/pocket-192.png"]),
    );
  runInNewContext(script, {
    self: {
      registration: { scope, showNotification },
      clients: { claim, openWindow, matchAll },
      skipWaiting,
      addEventListener: (name: string, handler: (event: unknown) => void) =>
        listeners.set(name, handler),
    },
    caches,
    URL,
    Set,
    fetch,
  });
  async function lifecycle(name: string, event = {}) {
    let work: Promise<unknown> | undefined;
    listeners.get(name)?.({
      ...event,
      waitUntil: (promise: Promise<unknown>) => {
        work = promise;
      },
    });
    await work;
  }
  function request(
    url: string,
    mode = "cors",
    method = "GET",
    authorized = false,
  ) {
    let response: Promise<Response> | undefined;
    listeners.get("fetch")?.({
      request: {
        url,
        mode,
        method,
        headers: new Headers(
          authorized
            ? { Authorization: "Bearer test" }
            : { Origin: new URL(scope).origin },
        ),
      },
      respondWith: (promise: Promise<Response>) => {
        response = promise;
      },
    });
    return response;
  }
  return {
    scope,
    cache,
    caches,
    skipWaiting,
    claim,
    fetch,
    listeners,
    lifecycle,
    request,
    showNotification,
    openWindow,
    focus,
    postMessage,
    matchAll,
  };
}

it("opens the app shell and assets offline under a GitHub Pages subpath", async () => {
  const app = worker();
  await app.lifecycle("install");
  const home = await app.request(`${app.scope}?from=home`, "navigate");
  const script = await app.request(`${app.scope}assets/app.js`);
  expect(await home?.text()).toBe(`cached:${app.scope}index.html`);
  expect(await script?.text()).toBe(`cached:${app.scope}assets/app.js`);
  expect(app.fetch).not.toHaveBeenCalled();
});

it("always displays incoming pushes and opens only the pocket's remaining work", async () => {
  const app = worker();
  await app.lifecycle("push", {
    data: {
      json: () => ({
        title: "Practice time",
        body: "3 reviews left.",
        url: "https://unrelated.example",
      }),
    },
  });
  expect(app.showNotification).toHaveBeenCalledWith(
    "Practice time",
    expect.objectContaining({
      body: "3 reviews left.",
      data: { url: `${app.scope}?reminder=1#phrases` },
    }),
  );
  await app.lifecycle("push", {
    data: {
      json: () => {
        throw new Error("bad payload");
      },
    },
  });
  expect(app.showNotification).toHaveBeenLastCalledWith(
    "Your Phrase Pocket",
    expect.any(Object),
  );
  await app.lifecycle("notificationclick", {
    notification: { close: vi.fn() },
  });
  expect(app.focus).toHaveBeenCalledOnce();
  expect(app.postMessage).toHaveBeenCalledWith({
    type: "OPEN_REMAINING_TASKS",
  });
  expect(app.openWindow).not.toHaveBeenCalled();
  app.matchAll.mockResolvedValueOnce([]);
  await app.lifecycle("notificationclick", {
    notification: { close: vi.fn() },
  });
  expect(app.openWindow).toHaveBeenCalledWith(
    `${app.scope}?reminder=1#phrases`,
  );
});

it("never intercepts coaching, authorization, recordings, content feeds or other apps", async () => {
  const app = worker();
  await app.lifecycle("install");
  expect(app.request(`${app.scope}api/assess`, "cors", "POST")).toBeUndefined();
  expect(
    app.request(`${app.scope}assets/app.js`, "cors", "GET", true),
  ).toBeUndefined();
  expect(app.request(`${app.scope}recording.wav`)).toBeUndefined();
  expect(app.request(`${app.scope}content.json`)).toBeUndefined();
  expect(
    app.request("https://example.com/another-app/", "navigate"),
  ).toBeUndefined();
  expect(app.request("https://coach.example.com/assess")).toBeUndefined();
});

it("activates an update only on explicit request and cleans only its own scope", async () => {
  const app = worker();
  await app.lifecycle("install");
  expect(app.skipWaiting).not.toHaveBeenCalled();
  app.listeners.get("message")?.({ data: { type: "OTHER" } });
  expect(app.skipWaiting).not.toHaveBeenCalled();
  app.listeners.get("message")?.({ data: { type: "APPLY_UPDATE" } });
  expect(app.skipWaiting).toHaveBeenCalledOnce();
  await app.lifecycle("activate");
  expect(app.caches.delete).toHaveBeenCalledExactlyOnceWith(
    `phrase-pocket:${app.scope}:old`,
  );
  expect(app.claim).toHaveBeenCalledOnce();
});

it("fails installation when a required asset cannot be cached", async () => {
  const app = worker();
  app.cache.addAll.mockRejectedValueOnce(new Error("missing asset"));
  await expect(app.lifecycle("install")).rejects.toThrow("missing asset");
  expect(app.skipWaiting).not.toHaveBeenCalled();
});
