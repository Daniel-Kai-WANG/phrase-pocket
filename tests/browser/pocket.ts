import { expect, test as base, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { LearningStore } from "../../src/types/storage";
import type { Phrase } from "../../src/types/learning";
import { emptyStore, STORAGE_KEY } from "../../src/utils/storage";

export const phrase: Phrase = JSON.parse(
  readFileSync(new URL("../../public/content.json", import.meta.url), "utf8"),
).phrases[0];
export const accessCode = "browser-test-access-code-only";

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(
      (url) => url.pathname.startsWith("/api/"),
      (route) => route.abort(),
    );
    await page.goto("./");
    await use(page);
  },
});

export async function connectCoach(page: Page) {
  await page.getByRole("button", { name: "Open pocket settings" }).click();
  await page.getByLabel("Coach access code").fill(accessCode);
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("status")
      .filter({ hasText: "Access code saved" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).click();
}

export async function startRecall(page: Page) {
  await page.getByLabel("Search expressions").fill(phrase.expression);
  await page
    .getByRole("button", { name: phrase.expression, exact: true })
    .click();
  await page.getByRole("button", { name: "Try a scene" }).click();
  await page.getByRole("button", { name: "Got the idea" }).click();
  await expect(page.getByLabel("What would you say?")).toBeVisible();
}

export async function readLearning(page: Page): Promise<LearningStore> {
  const saved = await page.evaluate(
    (key) => localStorage.getItem(key),
    STORAGE_KEY,
  );
  return saved ? JSON.parse(saved) : emptyStore();
}
