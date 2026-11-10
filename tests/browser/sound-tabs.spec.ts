import { expect } from "@playwright/test";
import { test, readLearning } from "./pocket";

test.beforeEach(async ({ page }) => {
  await page.getByLabel("Search expressions").fill("In vain");
  await page.getByRole("button", { name: "In vain", exact: true }).click();
  await page
    .getByRole("button", { name: "Sound challenge", exact: true })
    .click();
});

test("keeps a correct answer and its feedback when returning to a sound tab without recording it twice", async ({
  page,
}) => {
  await page.getByLabel("Which word fits?").fill("vain");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  const saved = (await readLearning(page)).soundAttempts;
  await page.getByRole("button", { name: "Word → IPA", exact: true }).click();
  await page.getByRole("button", { name: "IPA → word", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Your answer: vain");
  await expect(
    page.getByRole("region", { name: "More examples" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Next challenge", exact: true })
    .click();
  await page.getByRole("button", { name: "IPA → word", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Your answer: vain");
  expect((await readLearning(page)).soundAttempts).toEqual(saved);
});

test("keeps unfinished spelling, hint progress and IPA tiles separately between tabs", async ({
  page,
}) => {
  await page.getByLabel("Which word fits?").fill("va");
  await page.getByRole("button", { name: "Another hint", exact: true }).click();
  await page.getByRole("button", { name: "Word → IPA", exact: true }).click();
  await page
    .locator(".sound-tiles")
    .getByRole("button", { name: "v", exact: true })
    .click();
  await page.getByRole("button", { name: "IPA → word", exact: true }).click();
  await expect(page.getByLabel("Which word fits?")).toHaveValue("va");
  await expect(
    page.getByRole("region", { name: "Meaning hints" }),
  ).toContainText("Hint 2 of 7");
  await page.getByRole("button", { name: "Word → IPA", exact: true }).click();
  await expect(page.locator(".sound-answer:visible")).toContainText("v");
  expect((await readLearning(page)).soundAttempts).toEqual([]);
});
