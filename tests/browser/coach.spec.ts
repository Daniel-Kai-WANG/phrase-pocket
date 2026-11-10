import { expect } from "@playwright/test";
import type { Assessment } from "../../src/types/learning";
import type { QuestPlan } from "../../src/types/quest";
import {
  accessCode,
  connectCoach,
  phrase,
  readLearning,
  startRecall,
  test,
} from "./pocket";

const correct: Assessment = {
  meaning: "correct",
  targetUsed: true,
  naturalness: "natural",
  feedback: "That expresses the intended meaning.",
  nextHint: "",
};

test("a coach failure leaves memory unchanged and a retry can succeed", async ({
  page,
}) => {
  let requests = 0;
  await page.route("**/api/assess", async (route) => {
    expect(route.request().headers().authorization).toBe(
      `Bearer ${accessCode}`,
    );
    expect(route.request().postDataJSON().phrase.id).toBe(phrase.id);
    requests += 1;
    await route.fulfill(
      requests === 1
        ? {
            status: 503,
            json: { error: "The coach is temporarily unavailable." },
          }
        : { json: correct },
    );
  });
  await connectCoach(page);
  await startRecall(page);
  await page.getByLabel("What would you say?").fill(phrase.example);
  await page.getByRole("button", { name: "Check my reply" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "temporarily unavailable",
  );
  expect((await readLearning(page)).progress).toEqual({});
  await page.getByRole("button", { name: "Check my reply" }).click();
  await expect(page.getByRole("dialog").getByRole("status")).toContainText(
    "That fits the moment.",
  );
  expect((await readLearning(page)).progress[phrase.id].state).toBe(
    "recalling",
  );
  await page.reload();
  await page
    .getByRole("button", { name: phrase.expression, exact: true })
    .click();
  await expect(
    page.getByRole("dialog").getByText("Coming back", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("1 different day");
});

test("a correct answer with a hint remains in Needs practice after reload", async ({
  page,
}) => {
  await page.route("**/api/assess", async (route) => {
    expect(route.request().postDataJSON().hintLevel).toBe(1);
    await route.fulfill({ json: correct });
  });
  await connectCoach(page);
  await startRecall(page);
  await page.getByRole("button", { name: "A little hint" }).click();
  await page.getByLabel("What would you say?").fill(phrase.example);
  await page.getByRole("button", { name: "Check my reply" }).click();
  await expect(page.getByRole("dialog").getByRole("status")).toContainText(
    "That fits the moment.",
  );
  await page.reload();
  await page
    .getByRole("button", { name: phrase.expression, exact: true })
    .click();
  await expect(
    page.getByRole("dialog").getByText("Needs practice", { exact: true }),
  ).toBeVisible();
  expect((await readLearning(page)).progress[phrase.id].recallDays).toEqual([]);
});

test("a plan preview is saved only when started and its scene completion persists", async ({
  page,
}) => {
  const plan: QuestPlan = {
    id: "browser-plan",
    title: "A weekend plan",
    description: "Practise making plans.",
    topic: "Making new friends",
    difficulty: "B2",
    days: 3,
    dailyCount: 1,
    phrases: Array.from({ length: 3 }, (_, index) => ({
      ...phrase,
      id: `browser-plan-${index}`,
      source: "quest",
    })),
  };
  await page.route("**/api/plan", async (route) => {
    expect(route.request().postDataJSON()).toMatchObject({
      topic: plan.topic,
      days: 3,
      dailyCount: 1,
    });
    await route.fulfill({ json: plan });
  });
  await connectCoach(page);
  await page.getByRole("link", { name: /Next Quest/ }).click();
  await page.getByRole("button", { name: plan.topic, exact: true }).click();
  await page.getByRole("combobox", { name: /^Length/ }).selectOption("3");
  await page
    .getByRole("combobox", { name: /^Daily expressions/ })
    .selectOption("1");
  await page.getByRole("button", { name: "Preview my quest" }).click();
  await expect(page.getByRole("heading", { name: plan.title })).toBeVisible();
  expect((await readLearning(page)).quests).toEqual([]);
  await page.getByRole("button", { name: "Start this plan" }).click();
  await page.reload();
  await page.getByRole("button", { name: "Day 1", exact: true }).click();
  await page.getByRole("button", { name: "Got the idea" }).click();
  await page
    .getByRole("button", { name: "Keep this one for another try" })
    .click();
  await page
    .getByRole("button", { name: "Keep this one for another try" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Good practice. Let it settle." }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByText("B2 · 1 OF 3 SCENES VISITED")).toBeVisible();
  expect((await readLearning(page)).quests[0].completedDays).toEqual([1]);
  expect((await readLearning(page)).progress[plan.phrases[0].id].state).toBe(
    "learning",
  );
});
