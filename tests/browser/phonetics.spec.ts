import { expect } from "@playwright/test";
import { test, readLearning } from "./pocket";

test("plays all three sound games on a personal expression without changing meaning progress", async ({
  page,
}) => {
  await page.getByLabel("Search expressions").fill("In vain");
  await page.getByRole("button", { name: "In vain", exact: true }).click();
  await page
    .getByRole("button", { name: "Sound challenge", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveAccessibleName(
    "Sound adventure",
  );
  await expect(page.getByRole("dialog").locator("blockquote")).toContainText(
    "/veɪn/",
  );
  await page.getByLabel("Which word fits?").fill("vein");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Meaning hints" }),
  ).toContainText("You tried, but did not get the result you wanted.");
  await page.getByRole("button", { name: "Word → IPA", exact: true }).click();
  for (const token of ["v", "eɪ", "n"])
    await page
      .locator(".sound-tiles")
      .getByRole("button", { name: token, exact: true })
      .click();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("status")).toContainText(
    "Sound unlocked",
  );
  await page
    .getByRole("button", { name: "Next challenge", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Position 2: æ", exact: true })
    .click();
  await page
    .locator(".sound-tiles")
    .getByRole("button", { name: "eɪ", exact: true })
    .click();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  const data = await readLearning(page);
  expect(data.progress).toEqual({});
  expect(data.soundAttempts?.map((attempt) => attempt.correct)).toEqual([
    false,
    true,
    true,
  ]);
  await page.reload();
  expect((await readLearning(page)).soundAttempts).toHaveLength(3);
});

test("shows reviewed coverage honestly and keeps sound controls within the viewport", async ({
  page,
}, testInfo) => {
  await page.getByLabel("Search expressions").fill("In vain");
  await page.getByRole("button", { name: "In vain", exact: true }).click();
  await page
    .getByRole("button", { name: "Sound challenge", exact: true })
    .click();
  await page.getByRole("button", { name: "Word → IPA", exact: true }).click();
  await page.screenshot({ path: testInfo.outputPath("sound-build.png") });
  const widths = await page.getByRole("dialog").evaluate((element) => ({
    width: element.clientWidth,
    scroll: element.scrollWidth,
  }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.width);
  for (const button of await page.locator(".sound-tiles button").all()) {
    const box = await button.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  await page.getByRole("button", { name: "Show me", exact: true }).click();
  expect((await readLearning(page)).soundAttempts?.[0].independent).toBe(false);
});

test("assembles a longer personal word with both stress marks on a phone", async ({
  page,
}, testInfo) => {
  await page.getByLabel("Search expressions").fill("prerequisite");
  await page
    .getByRole("button", { name: "A prerequisite", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Sound challenge", exact: true })
    .click();
  await page.getByRole("button", { name: "Word → IPA", exact: true }).click();
  for (const token of [
    "ˌ",
    "p",
    "r",
    "iː",
    "ˈ",
    "r",
    "e",
    "k",
    "w",
    "ɪ",
    "z",
    "ɪ",
    "t",
  ])
    await page
      .locator(".sound-tiles")
      .getByRole("button", { name: token, exact: true })
      .click();
  const dialog = page.getByRole("dialog");
  const widths = await dialog.evaluate((element) => ({
    width: element.clientWidth,
    scroll: element.scrollWidth,
  }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.width);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(dialog.getByRole("status")).toContainText("Sound unlocked!");
  await expect(page.locator(".sound-tiles")).toHaveCount(0);
  await expect(dialog.getByRole("status")).toContainText(
    "Your answer: /ˌpriːˈrekwɪzɪt/",
  );
  await page.screenshot({
    path: testInfo.outputPath("sound-prerequisite.png"),
  });
  expect((await readLearning(page)).soundAttempts?.[0]).toMatchObject({
    word: "prerequisite",
    mode: "build",
    correct: true,
  });
});
