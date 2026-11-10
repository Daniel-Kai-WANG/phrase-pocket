import { expect } from "@playwright/test";
import { test, connectCoach, readLearning } from "./pocket";

test("connects phone reminders, syncs pause, and keeps push credentials outside learning backups", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "Notification", {
      configurable: true,
      value: {
        permission: "granted",
        requestPermission: async () => "granted",
      },
    });
    Object.defineProperty(window, "PushManager", {
      configurable: true,
      value: class {},
    });
    const subscription = {
      toJSON: () => ({
        endpoint: "https://web.push.apple.com/test-only",
        keys: { p256dh: "a".repeat(87), auth: "b".repeat(22) },
      }),
      unsubscribe: async () => true,
    };
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        getRegistration: async () => ({
          active: {},
          pushManager: { getSubscription: async () => subscription },
        }),
        addEventListener: () => {},
        removeEventListener: () => {},
      },
    });
  });
  const writes: Array<{
    preferences?: { enabled: boolean };
    snapshot?: object;
  }> = [];
  await page.route("**/api/reminders/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/config"))
      return route.fulfill({
        json: { configured: true, publicKey: "B".repeat(87) },
      });
    writes.push(route.request().postDataJSON());
    await route.fulfill({
      json: { connected: true, synced: true, sent: true },
    });
  });
  await page.reload();
  await connectCoach(page);
  await page.getByRole("button", { name: "Open pocket settings" }).click();
  await page
    .getByRole("button", { name: "Enable phone notifications" })
    .click();
  await expect(
    page.getByRole("button", { name: "Send test reminder" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Send test reminder" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Test accepted" }),
  ).toBeVisible();
  await page.getByLabel("Remind me each day", { exact: true }).uncheck();
  await expect
    .poll(() => writes.some((body) => body.preferences?.enabled === false))
    .toBe(true);
  expect(writes.find((body) => body.snapshot)?.snapshot).not.toHaveProperty(
    "progress",
  );
  expect(await readLearning(page)).not.toHaveProperty("token");
  await page.getByRole("button", { name: "Disconnect this phone" }).click();
  await expect(
    page.getByRole("button", { name: "Enable phone notifications" }),
  ).toBeEnabled();
  expect(
    await page.evaluate(() =>
      localStorage.getItem("phrase-pocket.push-device"),
    ),
  ).toBeNull();
});

test("shows an unsynced pause honestly when the phone cannot reach the server", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "phrase-pocket.push-device",
      JSON.stringify({
        id: "ab832fe8-59a1-4c22-846d-f02e06764b78",
        token: "a".repeat(43),
        revision: 1,
        connected: true,
      }),
    ),
  );
  await page.reload();
  await page.getByRole("button", { name: "Open pocket settings" }).click();
  await page.getByLabel("Remind me each day", { exact: true }).uncheck();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "last synced reminder settings may still apply" }),
  ).toBeVisible();
  await page.screenshot({
    path: test.info().outputPath("phone-reminder-settings.png"),
    fullPage: false,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
