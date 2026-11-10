import { expect } from "@playwright/test";
import { SCENES } from "../../src/constants/scenes";
import { readLearning, startRecall, test } from "./pocket";

const knownDay = new Date("2026-11-10T02:00:00Z");

test("switching phone tabs starts the new page at the top", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const destination of [/Daily Three/, /Next Quest/, /My Phrases/]) {
    await page.evaluate(() => window.scrollTo(0, 300));
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(100);
    await page.getByRole("link", { name: destination }).click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  }
});

for (const [theme, scene] of Object.entries(SCENES)) {
  test(`${scene.name} restores its lesson and keeps learning progress unchanged`, async ({
    page,
  }, testInfo) => {
    await page.clock.install({ time: knownDay });
    await page.reload();
    await page.getByRole("link", { name: /Daily Three/ }).click();
    const before = await readLearning(page);
    await page
      .locator(".lesson-list button")
      .filter({ hasText: scene.name })
      .first()
      .click();
    await expect(page.locator(".app-shell")).toHaveAttribute(
      "data-scene",
      theme,
    );
    await expect(page.locator(".daily-feature h2")).toHaveText(scene.name);
    await expect(page.locator(".daily-preview button")).toHaveCount(3);
    const start = await page
      .getByRole("button", { name: "Start this daily quest" })
      .boundingBox();
    expect(start!.height).toBeGreaterThanOrEqual(44);
    await page.getByRole("button", { name: "Talk to Dot" }).click();
    await expect(page.locator(".scene-dialogue")).toContainText(scene.prompt);
    await page.getByRole("button", { name: "Pause scene motion" }).click();
    await expect(page.locator(".scene-stage")).toHaveAttribute(
      "data-paused",
      "true",
    );
    await page
      .locator(".daily-feature")
      .screenshot({ path: testInfo.outputPath(`${theme}.png`) });
    expect(await readLearning(page)).toEqual(before);
  });
}

test("the home world changes at Brisbane midnight while an active practice stays stable", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-11-10T13:59:30Z") });
  await page.reload();
  await expect(page.locator(".app-shell")).toHaveAttribute(
    "data-scene",
    "relationships",
  );
  await page.clock.fastForward(61_000);
  await expect(page.locator(".app-shell")).toHaveAttribute(
    "data-scene",
    "work",
  );
  await startRecall(page);
  const scene = await page.locator(".app-shell").getAttribute("data-scene");
  await page.clock.fastForward(24 * 60 * 60 * 1000);
  await expect(page.locator(".app-shell")).toHaveAttribute(
    "data-scene",
    scene!,
  );
  await expect(page.getByLabel("What would you say?")).toBeVisible();
});

test("scene motion pauses and reduced motion disables decorative animation", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Pause scene motion" }).click();
  await expect(page.locator(".scene-stage .companion-body")).toHaveCSS(
    "animation-play-state",
    "paused",
  );
  await page.getByRole("button", { name: "Play scene motion" }).click();
  await expect(page.locator(".scene-stage .companion-body")).toHaveCSS(
    "animation-play-state",
    "running",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".scene-stage .companion-body")).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(
    page.getByRole("button", { name: "Pause scene motion" }),
  ).toBeHidden();
  await page.getByRole("button", { name: "Talk to Dot" }).click();
  await expect(page.locator(".scene-dialogue")).toContainText("DOT SAYS");
});

test("phone users can start from the first screen and type above a shortened viewport", async ({
  page,
}, testInfo) => {
  await page.clock.install({ time: knownDay });
  await page.reload();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("link", { name: /Daily Three/ }).click();
  for (const viewport of [
    { width: 375, height: 667 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    const start = page.getByRole("button", { name: "Start this daily quest" });
    const button = await start.boundingBox();
    const navigation = await page.locator(".sidebar").boundingBox();
    expect(button!.y).toBeGreaterThan(0);
    expect(button!.y + button!.height).toBeLessThan(navigation!.y);
    expect(button!.height).toBeGreaterThanOrEqual(44);
    await page.screenshot({
      path: testInfo.outputPath(`phone-${viewport.width}.png`),
    });
  }
  await page.getByRole("link", { name: /My Phrases/ }).click();
  await startRecall(page);
  await page.setViewportSize({ width: 390, height: 420 });
  const answer = page.getByLabel("What would you say?");
  await answer.fill("A reply I can keep editing.");
  await expect(answer).toHaveCSS("font-size", "16px");
  await answer.scrollIntoViewIfNeeded();
  await expect(answer).toBeInViewport();
  await page
    .getByRole("button", { name: "Check my reply" })
    .scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("button", { name: "Check my reply" }),
  ).toBeInViewport();
  await expect(answer).toHaveValue("A reply I can keep editing.");
});
