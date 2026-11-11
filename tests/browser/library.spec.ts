import { expect } from "@playwright/test";
import { phrase, readLearning, startRecall, test } from "./pocket";

test("search, clear filters and phrase details work at the Pages subpath", async ({
  page,
}) => {
  await page
    .getByLabel("Search expressions")
    .fill("no-matching-expression-xyz");
  await expect(page.getByText("No expressions here yet.")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page
    .getByRole("button", { name: phrase.expression, exact: true })
    .click();
  const detail = page.getByRole("dialog", { name: phrase.expression });
  await expect(detail.getByText(phrase.meaning, { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(detail).not.toBeVisible();
});

test("hints reveal progressively without recording a successful recall", async ({
  page,
}) => {
  await startRecall(page);
  await page.getByRole("button", { name: "A little hint" }).click();
  await expect(
    page.getByRole("dialog").getByText(phrase.meaning, { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "First letters" }).click();
  await page.getByRole("button", { name: "Show the answer" }).click();
  await expect(
    page
      .getByRole("dialog")
      .getByText(phrase.scenarios[1].sample, { exact: true }),
  ).toBeVisible();
  expect((await readLearning(page)).progress).toEqual({});
});

test("saved daily pages remain selectable after navigation and reload", async ({
  page,
}) => {
  await page.getByRole("link", { name: /Daily Three/ }).click();
  const pages = page.locator(".lesson-list button");
  expect(await pages.count()).toBeGreaterThanOrEqual(8);
  await pages.last().click();
  await expect(pages.last()).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".daily-preview button")).toHaveCount(3);
  await page.reload();
  await expect(page.getByRole("link", { name: /Daily Three/ })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.locator(".daily-preview button")).toHaveCount(3);
});

test("all three sections fit phone, tablet, desktop and wide screens", async ({
  page,
}) => {
  for (const width of [390, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const name of [/My Phrases/, /Daily Three/, /Next Quest/]) {
      await page.getByRole("link", { name }).click();
      await expect(page.locator("main h1")).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, `${name} overflows at ${width}px`).toBeLessThanOrEqual(
        1,
      );
    }
  }
});
