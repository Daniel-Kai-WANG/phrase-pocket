import { expect, type Page } from "@playwright/test";
import { test, readLearning } from "./pocket";

async function openVain(page: Page) {
  await page.getByLabel("Search expressions").fill("In vain");
  await page.getByRole("button", { name: "In vain", exact: true }).click();
  await page
    .getByRole("button", { name: "Sound challenge", exact: true })
    .click();
}

async function answer(page: Page, value: string) {
  await page.getByLabel("Which word fits?").fill(value);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
}

test("gives simpler clues after mistakes and retains meaning and examples after a supported success", async ({
  page,
}, testInfo) => {
  await openVain(page);
  const hints = page.getByRole("region", { name: "Meaning hints" });
  await answer(page, "vein");
  await expect(hints).toContainText(
    "You tried, but did not get the result you wanted.",
  );
  await expect(page.getByLabel("Which word fits?")).toBeEnabled();
  await expect(page.getByRole("region", { name: "More examples" })).toHaveCount(
    0,
  );
  await answer(page, "vane");
  await expect(hints).toContainText("You looked everywhere for your keys");
  await page.getByRole("button", { name: "Another hint", exact: true }).click();
  await expect(hints).toContainText("Your effort did not work.");
  await page.screenshot({ path: testInfo.outputPath("simpler-hint.png") });
  await answer(page, "vain");
  await expect(hints).toContainText("Meaning");
  await expect(hints).toContainText(
    "You tried, but did not get the result you wanted.",
  );
  const examples = page.getByRole("region", { name: "More examples" });
  await expect(examples.getByRole("listitem")).toHaveCount(2);
  await expect(examples).toContainText("It never came.");
  await expect(page.getByRole("status")).toContainText("Sound unlocked!");
  const data = await readLearning(page);
  expect(
    data.soundAttempts?.map(({ correct, independent }) => ({
      correct,
      independent,
    })),
  ).toEqual([
    { correct: false, independent: true },
    { correct: false, independent: false },
    { correct: true, independent: false },
  ]);
  expect(data.progress).toEqual({});
  const dialog = page.getByRole("dialog");
  expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true,
  );
  await page.screenshot({
    path: testInfo.outputPath("meaning-and-examples.png"),
  });
  await examples.scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath("extra-examples.png") });
});

test("remembers mistakes when reopening and offers an honest study fallback when clues run out", async ({
  page,
}) => {
  await openVain(page);
  await answer(page, "vein");
  await page.reload();
  await openVain(page);
  const hints = page.getByRole("region", { name: "Meaning hints" });
  await expect(hints).toContainText("Hint 2");
  for (let i = 0; i < 5; i++)
    await page
      .getByRole("button", { name: "Another hint", exact: true })
      .click();
  await expect(hints).toContainText("You've seen every hint");
  await expect(
    page.getByRole("button", { name: "Another hint", exact: true }),
  ).toHaveCount(0);
  await answer(page, "wrong");
  await expect(hints).toContainText("You've seen every hint");
  await page.getByRole("button", { name: "Show me", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "More examples" }),
  ).toBeVisible();
  expect((await readLearning(page)).soundAttempts?.at(-1)).toMatchObject({
    correct: false,
    independent: false,
  });
});

test("still explains a word and shows extra examples when the first guess is correct", async ({
  page,
}) => {
  await openVain(page);
  await answer(page, "vain");
  await expect(
    page.getByRole("region", { name: "Meaning hints" }),
  ).toContainText("Meaning");
  await expect(
    page.getByRole("region", { name: "More examples" }).getByRole("listitem"),
  ).toHaveCount(2);
  expect((await readLearning(page)).soundAttempts?.[0]).toMatchObject({
    correct: true,
    independent: true,
  });
});
