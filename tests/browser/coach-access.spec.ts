import { expect } from "@playwright/test";
import {
  accessCode,
  connectCoach,
  phrase,
  readLearning,
  startRecall,
  test,
} from "./pocket";

const correct = {
  meaning: "correct",
  targetUsed: true,
  naturalness: "natural",
  feedback: "That expresses the intended meaning.",
  nextHint: "",
};

test("a saved coach code survives a new browser session", async ({ page }) => {
  await connectCoach(page);
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  await page.route("**/api/assess", async (route) => {
    expect(route.request().headers().authorization).toBe(
      `Bearer ${accessCode}`,
    );
    await route.fulfill({ json: correct });
  });
  await startRecall(page);
  await page.getByLabel("What would you say?").fill(phrase.example);
  await page.getByRole("button", { name: "Check my reply" }).click();
  await expect(page.getByRole("dialog").getByRole("status")).toContainText(
    "That fits the moment.",
  );
  expect((await readLearning(page)).progress[phrase.id].attempts).toHaveLength(
    1,
  );
});

test("a missing or rejected code can be replaced without losing the answer", async ({
  page,
}, testInfo) => {
  let requests = 0;
  await page.route("**/api/assess", async (route) => {
    requests += 1;
    await route.fulfill(
      route.request().headers().authorization === `Bearer ${accessCode}`
        ? { json: correct }
        : { status: 401, json: { error: "Code not accepted." } },
    );
  });
  await startRecall(page);
  const answer = "Do u wanna split the bill";
  await page.getByLabel("What would you say?").fill(answer);
  await page.getByRole("button", { name: "Check my reply" }).click();
  await expect(page.getByRole("alert")).toContainText("code is missing");
  expect(requests).toBe(0);
  expect((await readLearning(page)).progress).toEqual({});
  await page.getByLabel("Coach access code").fill("incorrect-test-code");
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await page.getByRole("button", { name: "Check my reply" }).click();
  await expect(page.getByRole("alert")).toContainText("not accepted");
  expect((await readLearning(page)).progress).toEqual({});
  await page.getByLabel("Coach access code").fill(accessCode);
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await expect(page.getByLabel("What would you say?")).toHaveValue(answer);
  await expect(page.getByRole("status")).toContainText("saved on this device");
  await page.screenshot({
    path: testInfo.outputPath("coach-reconnected.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Check my reply" }).click();
  await expect(page.getByRole("dialog").getByRole("status")).toContainText(
    "That fits the moment.",
  );
  expect((await readLearning(page)).progress[phrase.id].attempts).toHaveLength(
    1,
  );
});

test("session-only access replaces remembered access and forgetting keeps progress", async ({
  page,
}) => {
  await connectCoach(page);
  const learning = await readLearning(page);
  await page.getByRole("button", { name: "Open pocket settings" }).click();
  await page.getByLabel("Remember on this device").uncheck();
  await page.getByLabel("Coach access code").fill(accessCode);
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Access code saved" }),
  ).toContainText("session only");
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Open pocket settings" }).click();
  await expect(
    page.getByRole("button", { name: "Forget saved coach code" }),
  ).toHaveCount(0);
  await page.getByLabel("Coach access code").fill(accessCode);
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await page.getByRole("button", { name: "Forget saved coach code" }).click();
  await page.reload();
  await startRecall(page);
  await page.getByLabel("What would you say?").fill(phrase.example);
  await page.getByRole("button", { name: "Check my reply" }).click();
  await expect(page.getByRole("alert")).toContainText("code is missing");
  expect(await readLearning(page)).toEqual(learning);
});

test("learning backups exclude remembered coach credentials", async ({
  page,
}) => {
  await connectCoach(page);
  await page.getByRole("button", { name: "Open pocket settings" }).click();
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export backup" }).click();
  const stream = await (await downloaded).createReadStream();
  let backup = "";
  for await (const chunk of stream!) backup += chunk.toString();
  expect(backup).not.toContain(accessCode);
  expect(backup).not.toContain("coach-device");
  expect(JSON.parse(backup).version).toBe(1);
});

test("existing session codes remain usable after updating the app", async ({
  page,
}) => {
  await page.evaluate(
    (code) => sessionStorage.setItem("phrase-pocket.coach-session", code),
    accessCode,
  );
  await page.reload();
  await page.route("**/api/assess", async (route) => {
    expect(route.request().headers().authorization).toBe(
      `Bearer ${accessCode}`,
    );
    await route.fulfill({ json: correct });
  });
  await startRecall(page);
  await page.getByLabel("What would you say?").fill(phrase.example);
  await page.getByRole("button", { name: "Check my reply" }).click();
  await expect(page.getByRole("dialog").getByRole("status")).toContainText(
    "That fits the moment.",
  );
});

test("blocked credential storage gives an error instead of claiming a saved connection", async ({
  page,
}) => {
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith("phrase-pocket.coach-"))
        throw new DOMException("Storage disabled", "SecurityError");
      return original.call(this, key, value);
    };
  });
  await page.getByRole("button", { name: "Open pocket settings" }).click();
  await page.getByLabel("Coach access code").fill(accessCode);
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("could not be saved");
  await expect(
    page.getByRole("status").filter({ hasText: "Access code saved" }),
  ).toHaveCount(0);
  await expect(page.getByLabel("Coach access code")).toHaveValue(accessCode);
});
