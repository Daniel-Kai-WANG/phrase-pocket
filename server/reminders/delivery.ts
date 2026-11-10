import * as webPush from "web-push";
import { contentFeedSchema } from "../../src/types/contentFeed.js";
import { learningDay } from "../../src/utils/dates.js";
import { reminderMessage } from "../../src/utils/reminders.js";
import type { ReminderConfig } from "./config.js";
import type { ReminderDevice } from "./schema.js";
import type { ReminderStore } from "./store.js";
import { remainingForReminder, reminderWindowOpen } from "./tasks.js";

export async function fetchLessonSize(now: Date) {
  const response = await fetch(
    "https://daniel-kai-wang.github.io/phrase-pocket/content.json",
    { signal: AbortSignal.timeout(10000), cache: "no-store" },
  );
  if (!response.ok) throw new Error("Published lessons are unavailable");
  const feed = contentFeedSchema.parse(await response.json());
  return (
    feed.lessons.find((lesson) => lesson.date === learningDay(now))?.phraseIds
      .length ?? 0
  );
}

export function createPushSender(config: ReminderConfig) {
  return async (
    device: ReminderDevice,
    body: string,
    date: string,
    test = false,
  ) => {
    await webPush.sendNotification(
      device.subscription,
      JSON.stringify({
        title: test
          ? "Your pocket is connected"
          : "A little English adventure?",
        body,
        tag: `${test ? "test" : "daily"}-${date}`,
      }),
      {
        vapidDetails: {
          subject: config.subject,
          publicKey: config.publicKey,
          privateKey: config.privateKey,
        },
        TTL: 3600,
        urgency: "normal",
        timeout: 10000,
      },
    );
  };
}

export async function dispatchReminders(
  store: ReminderStore,
  send: ReturnType<typeof createPushSender>,
  now = new Date(),
  getLessonSize = fetchLessonSize,
) {
  const eligible = (await store.list(now)).filter((device) =>
    reminderWindowOpen(device, now),
  );
  const result = { sent: 0, skipped: 0, expired: 0, failed: 0 };
  if (!eligible.length) return result;
  const lessonSize = await getLessonSize(now);
  const date = learningDay(now);
  for (const candidate of eligible) {
    const device = await store.get(candidate.id);
    if (!device || !reminderWindowOpen(device, now)) continue;
    const counts = remainingForReminder(device.snapshot, lessonSize, now);
    if (
      !Object.values(counts).some(Boolean) ||
      !(await store.claim(device.id, date))
    ) {
      result.skipped++;
      continue;
    }
    try {
      await send(device, reminderMessage(counts), date);
      result.sent++;
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        await store.remove(device.id, device.tokenHash);
        result.expired++;
      } else result.failed++;
    }
  }
  return result;
}
