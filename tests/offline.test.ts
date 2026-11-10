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
      registration: { scope },
      clients: { claim },
      skipWaiting,
      addEventListener: (name: string, handler: (event: unknown) => void) =>
        listeners.set(name, handler),
    },
    caches,
    URL,
    Set,
    fetch,
  });
  async function lifecycle(name: string) {
    let work: Promise<unknown> | undefined;
    listeners.get(name)?.({
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
