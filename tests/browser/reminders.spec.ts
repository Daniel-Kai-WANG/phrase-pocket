import { expect } from "@playwright/test";
import { test, readLearning } from "./pocket";

test("shows remaining work at 20:00 Brisbane and persists today's dismissal", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-11-10T09:59:00Z") });
  await page.reload();
  const reminder = page
    .getByRole("status")
    .filter({ hasText: "Time for a little practice" });
  await expect(reminder).toHaveCount(0);
  await page.clock.runFor(60_000);
  await expect(reminder).toContainText("3 sound challenges left");
  await page.getByRole("button", { name: "Dismiss today's reminder" }).click();
  await expect(reminder).toHaveCount(0);
  await page.reload();
  await expect(reminder).toHaveCount(0);
  expect((await readLearning(page)).reminderDismissedDate).toBe("2026-11-10");
});

test("can change reminder time and pause without changing practice progress", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Open pocket settings" }).click();
  await expect(page.getByLabel("Reminder time · Brisbane")).toHaveValue(
    "20:00",
  );
  await page.getByLabel("Reminder time · Brisbane").fill("21:30");
  await page.getByLabel("Remind me each day", { exact: true }).uncheck();
  await expect(page.getByLabel("Reminder time · Brisbane")).toBeDisabled();
  const data = await readLearning(page);
  expect(data.reminderPreferences).toEqual({
    enabled: false,
    time: "21:30",
    timeZone: "Australia/Brisbane",
  });
  expect(data.progress).toEqual({});
  await page.reload();
  await page.getByRole("button", { name: "Open pocket settings" }).click();
  await expect(
    page.getByLabel("Remind me each day", { exact: true }),
  ).not.toBeChecked();
  await expect(page.getByLabel("Reminder time · Brisbane")).toHaveValue(
    "21:30",
  );
});
