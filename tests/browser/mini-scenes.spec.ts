import { expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { buildGuidedPhrase } from "../../src/utils/guidedPhrase";
import type { Phrase } from "../../src/types/learning";
import { finishWarmup, phrase, readLearning, test } from "./pocket";

const feed = JSON.parse(readFileSync("public/content.json", "utf8"));
const lesson = feed.lessons.find(
  (item: { date: string }) => item.date === "2026-11-11",
);
const daily: Phrase[] = lesson.phraseIds.map((id: string) =>
  feed.phrases.find((item: Phrase) => item.id === id),
);

test("each expression gets a supported turn before the next, with no false memory credit", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-11-11T03:00:00Z") });
  await page.reload();
  await page.getByRole("link", { name: /Daily Three/ }).click();
  await page.getByRole("button", { name: "Start this daily quest" }).click();
  const dialog = page.getByRole("dialog");
  for (const [index, item] of daily.entries()) {
    await expect(dialog).toContainText(`Expression ${index + 1} of 3`);
    await expect(
      dialog.getByRole("heading", { name: item.expression, exact: true }),
    ).toHaveCount(0);
    await expect(
      dialog.getByRole("img", { name: /two conversation buddies/ }),
    ).toBeVisible();
    await finishWarmup(page, item);
    expect((await readLearning(page)).progress).toEqual({});
  }
  await expect(dialog).toContainText("Your turn");
  await expect(dialog).toContainText(daily[0].scenarios[1].prompt);
  await expect(page.getByLabel("What would you say?")).toBeVisible();
  await expect(
    dialog.getByRole("heading", { name: daily[0].expression, exact: true }),
  ).toHaveCount(0);
});

test("wrong warm-up answers get help, stay on the same word and never create review failures", async ({
  page,
}, testInfo) => {
  await page.getByLabel("Search expressions").fill(phrase.expression);
  await page
    .getByRole("button", { name: phrase.expression, exact: true })
    .click();
  await page.getByRole("button", { name: "Try a scene" }).click();
  await page.getByRole("button", { name: "Show me what to say" }).click();
  await expect(
    page
      .getByRole("dialog")
      .getByText(phrase.scenarios[0].sample, { exact: true }),
  ).toBeHidden();
  await page.getByText("See an example", { exact: true }).click();
  await expect(
    page
      .getByRole("dialog")
      .getByText(phrase.scenarios[0].sample, { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Try one missing word" }).click();
  await page.getByLabel("The missing word").fill("wrong-word");
  await page.getByRole("button", { name: "Check the word" }).click();
  await expect(page.getByRole("dialog").getByRole("status")).toContainText(
    "Not quite",
  );
  await expect(page.locator(".hint-box")).toContainText(phrase.meaning);
  expect((await readLearning(page)).progress).toEqual({});
  await page.getByRole("button", { name: "Show the missing word" }).click();
  await expect(page.getByLabel("The missing word")).toHaveValue(
    buildGuidedPhrase(phrase)!.word,
  );
  await page.getByRole("button", { name: "Check the word" }).click();
  await expect(
    page.getByRole("img", { name: /two conversation buddies/ }),
  ).toHaveAttribute("aria-label", /celebrating your reply/);
  await page.screenshot({ path: testInfo.outputPath("warmup-win.png") });
  expect((await readLearning(page)).progress).toEqual({});
});

test("illustrated learning fits phone and larger screens with accessible motion controls", async ({
  page,
}, testInfo) => {
  await page.getByLabel("Search expressions").fill(phrase.expression);
  await page
    .getByRole("button", { name: phrase.expression, exact: true })
    .click();
  await page.getByRole("button", { name: "Try a scene" }).click();
  for (const [width, height] of [
    [375, 667],
    [390, 844],
    [768, 1024],
    [1280, 800],
    [1920, 1080],
  ]) {
    await page.setViewportSize({ width, height });
    const button = page.getByRole("button", { name: "Show me what to say" });
    await expect(button).toBeInViewport();
    expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    expect(
      await page
        .getByRole("dialog")
        .evaluate((element) => element.scrollWidth <= element.clientWidth),
    ).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`scene-${width}.png`) });
  }
  await page.getByRole("button", { name: "Pause illustration motion" }).click();
  await expect(
    page.locator(".practice-picture .companion-hand").first(),
  ).toHaveCSS("animation-play-state", "paused");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    page.locator(".practice-picture .companion-hand").first(),
  ).toHaveCSS("animation-name", "none");
  await page.getByRole("button", { name: "Show me what to say" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: testInfo.outputPath("one-expression.png") });
});
