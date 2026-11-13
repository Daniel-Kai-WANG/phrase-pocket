import { expect } from "@playwright/test";
import { test, connectCoach, readLearning } from "./pocket";
import { inboxReply } from "../fixtures/inbox";

test("saves before requesting a coach and keeps failed questions after reload", async ({
  page,
}) => {
  await connectCoach(page);
  await page
    .getByRole("button", { name: "Learning inbox", exact: true })
    .click();
  await page
    .getByLabel("Your question or chat")
    .fill("How can I ask for reassurance?");
  await page
    .getByRole("button", { name: "Save to inbox", exact: true })
    .click();
  expect((await readLearning(page)).learningInbox?.entries).toHaveLength(1);
  await page
    .getByRole("button", { name: "Prepare cards", exact: true })
    .click();
  await expect(
    page.getByRole("alert").filter({ hasText: "saved question" }),
  ).toBeVisible();
  await page.reload();
  await page
    .getByRole("button", { name: "Learning inbox", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Prepare cards", exact: true }),
  ).toBeVisible();
  await page.route("**/api/learning-inbox", (route) =>
    route.fulfill({ json: inboxReply }),
  );
  await page
    .getByRole("button", { name: "Prepare cards", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Learning cards saved" }),
  ).toBeVisible();
  expect((await readLearning(page)).learningInbox?.phrases).toHaveLength(1);
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page
    .getByLabel("Search expressions")
    .fill(inboxReply.cards[0].expression);
  await page
    .getByRole("button", { name: inboxReply.cards[0].expression, exact: true })
    .click();
  await expect(page.getByRole("button", { name: "Try a scene" })).toBeVisible();
});

test("imports reviewed cards without coach access, deduplicates and retains progress", async ({
  page,
}) => {
  const before = await readLearning(page);
  await page
    .getByRole("button", { name: "Learning inbox", exact: true })
    .click();
  await page
    .getByText("Bring learning cards from ChatGPT", { exact: false })
    .click();
  for (let i = 0; i < 2; i++) {
    await page
      .getByLabel("Learning-card JSON", { exact: true })
      .fill(JSON.stringify(inboxReply));
    await page
      .getByRole("button", { name: "Preview cards", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Import these cards", exact: true })
      .click();
    await expect(
      page.getByRole("status").filter({ hasText: "Imported on this device" }),
    ).toBeVisible();
  }
  const saved = await readLearning(page);
  expect(saved.learningInbox?.phrases).toHaveLength(1);
  expect(saved.progress).toEqual(before.progress);
  expect(saved.completedLessons).toEqual(before.completedLessons);
  expect(saved.learningInbox?.entries[1].phraseIds).toEqual(
    saved.learningInbox?.entries[0].phraseIds,
  );
  await page.reload();
  expect((await readLearning(page)).learningInbox).toEqual(saved.learningInbox);
});

test("refuses to claim a saved question when device storage fails", async ({
  page,
}) => {
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Full", "QuotaExceededError");
    };
  });
  await page
    .getByRole("button", { name: "Learning inbox", exact: true })
    .click();
  await page.getByLabel("Your question or chat").fill("Keep this question");
  await page
    .getByRole("button", { name: "Save to inbox", exact: true })
    .click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "could not save",
  );
  await expect(page.getByLabel("Your question or chat")).toHaveValue(
    "Keep this question",
  );
  await expect(
    page.getByRole("button", { name: "Prepare cards", exact: true }),
  ).toHaveCount(0);
});

test("fits the inbox form and import preview across viewport widths", async ({
  page,
}, testInfo) => {
  for (const width of [375, 768, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page
      .getByRole("button", { name: "Learning inbox", exact: true })
      .click();
    await expect(page.getByLabel("Your question or chat")).toBeVisible();
    expect(
      await page
        .getByRole("dialog")
        .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    ).toBe(true);
    if (width === 375 || width === 1280)
      await page.getByRole("dialog").screenshot({
        path: testInfo.outputPath(`inbox-${width}.png`),
      });
    await page.getByRole("button", { name: "Close", exact: true }).click();
  }
});
