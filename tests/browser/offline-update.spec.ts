import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";

test("updates a cached app shell together with its matching script", async ({
  page,
  context,
}) => {
  let version = 1;
  const template = readFileSync("scripts/service-worker.js", "utf8");
  const server = createServer((request, response) => {
    const path = request.url?.split("?")[0];
    if (path === "/sw.js") {
      response.writeHead(200, {
        "Content-Type": "text/javascript",
        "Cache-Control": "no-cache",
      });
      response.end(
        template
          .replace("__VERSION__", String(version))
          .replace(
            '"__PRECACHE__"',
            JSON.stringify(["index.html", `app-${version}.js`]),
          ),
      );
    } else if (path === "/" || path === "/index.html") {
      response.writeHead(200, {
        "Content-Type": "text/html",
        "Cache-Control": "public, max-age=600",
      });
      response.end(
        `<html><body><script src="/app-${version}.js"></script></body></html>`,
      );
    } else if (path === `/app-${version}.js`) {
      response.writeHead(200, {
        "Content-Type": "text/javascript",
        "Cache-Control": "public, max-age=31536000, immutable",
      });
      response.end(`document.body.textContent = "Pocket version ${version}";`);
    } else {
      response.writeHead(404);
      response.end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Missing test server address");
  const origin = `http://127.0.0.1:${address.port}`;
  try {
    await page.goto(origin);
    await expect(page.getByText("Pocket version 1")).toBeVisible();
    await page.evaluate(async () => {
      localStorage.setItem("learning-progress", "keep-me");
      await navigator.serviceWorker.register("/sw.js", {
        updateViaCache: "none",
      });
      await navigator.serviceWorker.ready;
    });
    version = 2;
    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      await registration!.update();
    });
    await expect
      .poll(() =>
        page.evaluate(async () =>
          Boolean((await navigator.serviceWorker.getRegistration())?.waiting),
        ),
      )
      .toBe(true);
    await page.evaluate(async () => {
      const changed = new Promise<void>((resolve) =>
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          () => resolve(),
          { once: true },
        ),
      );
      (await navigator.serviceWorker.getRegistration())!.waiting!.postMessage({
        type: "APPLY_UPDATE",
      });
      await changed;
    });
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByText("Pocket version 2")).toBeVisible();
    expect(
      await page.evaluate(() => localStorage.getItem("learning-progress")),
    ).toBe("keep-me");
  } finally {
    await context.setOffline(false);
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
