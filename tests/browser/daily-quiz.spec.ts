import { expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Phrase } from "../../src/types/learning";
import { connectCoach, readLearning, test } from "./pocket";

const feed = JSON.parse(readFileSync("public/content.json", "utf8"));
const date = "2026-11-11";
const lesson = feed.lessons.find(
  (item: { date: string }) => item.date === date,
);
const phrases: Phrase[] = lesson.phraseIds.map((id: string) =>
  feed.phrases.find((item: Phrase) => item.id === id),
);

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date(`${date}T03:00:00Z`) });
  await page.reload();
});

test("nine contextual replies accept alternatives and preserve independent recall after supported rounds", async ({
  page,
}) => {
  await connectCoach(page);
  const requests: { scenario: string; hintLevel: number }[] = [];
  await page.route("**/api/assess", async (route) => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({
      json: {
        meaning: "correct",
        targetUsed: requests.length !== 2,
        naturalness: "natural",
        feedback: "Your reply fits the situation.",
        nextHint: "",
      },
    });
  });
  await page.getByRole("link", { name: /Daily Three/ }).click();
  await page.getByRole("button", { name: "Start scenario quiz" }).click();
  const dialog = page.getByRole("dialog");
  for (let index = 0; index < 9; index += 1) {
    await expect(dialog).toContainText(`Question ${index + 1} of 9`);
    await expect(
      dialog.getByText(phrases[index % 3].expression, { exact: true }),
    ).toHaveCount(0);
    await expect(page.getByLabel("The missing word")).toHaveCount(0);
    await page
      .getByLabel("How would you reply?")
      .fill("Here is my complete response for this situation.");
    await page.getByRole("button", { name: "Check my reply" }).click();
    if (index === 1)
      await expect(dialog).toContainText("A natural alternative.");
    await page.getByRole("button", { name: "Next situation" }).click();
    if (index < 8)
      expect((await readLearning(page)).completedLessons).not.toContain(date);
  }
  await expect(dialog).toContainText(
    "3 independent replies · 6 supported replies · 0 to revisit",
  );
  expect(requests[0].scenario).toBe(phrases[0].scenarios[0].prompt);
  expect(requests[3].scenario).toBe(phrases[0].scenarios[1].prompt);
  expect(requests[6].scenario).toContain("Reply in two sentences");
  expect(requests.map((item) => item.hintLevel)).toEqual([
    0, 0, 0, 1, 1, 1, 1, 1, 1,
  ]);
  const saved = await readLearning(page);
  expect(saved.completedLessons).toContain(date);
  expect(saved.progress[phrases[0].id].stage).toBe(1);
  expect(saved.progress[phrases[0].id].attempts).toHaveLength(1);
  expect(saved.progress[phrases[1].id].stage).toBe(0);
  await page.reload();
  expect((await readLearning(page)).progress).toEqual(saved.progress);
});

test("reference replies and clues do not earn independent recall credit", async ({
  page,
}) => {
  await connectCoach(page);
  await page.route("**/api/assess", (route) =>
    route.fulfill({
      json: {
        meaning: "correct",
        targetUsed: true,
        naturalness: "natural",
        feedback: "That fits.",
        nextHint: "",
      },
    }),
  );
  await page.getByRole("link", { name: /Daily Three/ }).click();
  await page.getByRole("button", { name: "Start scenario quiz" }).click();
  await page.getByRole("button", { name: "Compare a reference reply" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    phrases[0].scenarios[0].sample,
  );
  await page
    .getByLabel("How would you reply?")
    .fill(phrases[0].scenarios[0].sample);
  await page.getByRole("button", { name: "Check my reply" }).click();
  await page.getByRole("button", { name: "Next situation" }).click();
  const saved = await readLearning(page);
  expect(saved.progress[phrases[0].id].stage).toBe(0);
  expect(saved.progress[phrases[0].id].recallDays).toEqual([]);
  expect(saved.progress[phrases[0].id].attempts[0].hintLevel).toBe(3);
  await expect(
    page
      .getByRole("dialog")
      .getByText(phrases[0].scenarios[0].sample, { exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Close", exact: true }).click();
  expect((await readLearning(page)).completedLessons).not.toContain(date);
});

test("failed feedback retains the reply and offers offline comparison without a false score", async ({
  page,
}) => {
  await connectCoach(page);
  await page.getByRole("link", { name: /Daily Three/ }).click();
  await page.getByRole("button", { name: "Start scenario quiz" }).click();
  const answer = page.getByLabel("How would you reply?");
  await answer.fill("My draft stays here.");
  await page.getByRole("button", { name: "Check my reply" }).click();
  await expect(page.getByRole("alert")).toContainText("could not be reached");
  await expect(answer).toHaveValue("My draft stays here.");
  expect((await readLearning(page)).progress).toEqual({});
  await page.getByRole("button", { name: "Compare a reference reply" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    phrases[0].scenarios[0].sample,
  );
});

test("the response form remains usable on phone, tablet and desktop", async ({
  page,
}, testInfo) => {
  await page.getByRole("link", { name: /Daily Three/ }).click();
  await page.getByRole("button", { name: "Start scenario quiz" }).click();
  for (const [width, height] of [
    [375, 667],
    [768, 1024],
    [1280, 800],
    [1920, 1080],
  ]) {
    await page.setViewportSize({ width, height });
    const dialog = page.getByRole("dialog");
    expect(
      await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
    await page
      .getByLabel("How would you reply?")
      .fill("A reply in my own words.");
    const submit = page.getByRole("button", { name: "Check my reply" });
    await submit.scrollIntoViewIfNeeded();
    await expect(submit).toBeInViewport();
    expect((await submit.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await page.screenshot({
      path: testInfo.outputPath(`daily-quiz-${width}.png`),
    });
  }
});

test("a failed transfer schedules another try without awarding same-session mastery", async ({
  page,
}) => {
  await connectCoach(page);
  let count = 0;
  await page.route("**/api/assess", (route) => {
    count += 1;
    return route.fulfill({
      json: {
        meaning: count <= 3 ? "correct" : "incorrect",
        targetUsed: count <= 3,
        naturalness: "natural",
        feedback:
          count <= 3 ? "That fits." : "That does not answer this situation.",
        nextHint: "",
      },
    });
  });
  await page.getByRole("link", { name: /Daily Three/ }).click();
  await page.getByRole("button", { name: "Start scenario quiz" }).click();
  for (let index = 0; index < 3; index += 1) {
    await page.getByLabel("How would you reply?").fill("My first reply.");
    await page.getByRole("button", { name: "Check my reply" }).click();
    await page.getByRole("button", { name: "Next situation" }).click();
  }
  expect((await readLearning(page)).progress[phrases[0].id].stage).toBe(1);
  await page.getByLabel("How would you reply?").fill("An unrelated reply.");
  await page.getByRole("button", { name: "Check my reply" }).click();
  await expect(page.getByRole("status")).toContainText("does not answer");
  const saved = await readLearning(page);
  expect(saved.progress[phrases[0].id].stage).toBe(0);
  expect(saved.progress[phrases[0].id].state).toBe("learning");
  expect(saved.progress[phrases[1].id].stage).toBe(1);
  expect(saved.completedLessons).not.toContain(date);
});
