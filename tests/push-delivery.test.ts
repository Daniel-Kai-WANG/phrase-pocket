import { expect, it, vi } from "vitest";
import { dispatchReminders } from "../server/reminders/delivery";
import {
  reminderWindowOpen,
  remainingForReminder,
} from "../server/reminders/tasks";
import {
  memoryReminderStore,
  reminderDevice,
} from "./fixtures/reminder-device";
import { createReminderSnapshot } from "../src/utils/reminderSnapshot";
import { emptyStore } from "../src/utils/storage";
import { initialPhrases } from "../src/data/catalog";

const now = new Date("2026-11-10T10:00:00Z");
it("sends the actual remaining counts once even when schedulers overlap", async () => {
  const store = memoryReminderStore([reminderDevice()]);
  const send = vi.fn().mockResolvedValue(undefined);
  await Promise.all([
    dispatchReminders(store, send, now, async () => 3),
    dispatchReminders(store, send, now, async () => 3),
  ]);
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][1]).toBe(
    "2 new phrases · 1 review · 3 sound challenges left.",
  );
});
it("does not send completed, paused, early or very late reminders", async () => {
  const completed = reminderDevice();
  completed.snapshot = {
    ...completed.snapshot,
    newPhrases: 0,
    reviews: 0,
    sounds: 0,
  };
  const paused = {
    ...reminderDevice(),
    id: "another-device",
    preferences: { ...completed.preferences, enabled: false },
  };
  const send = vi.fn();
  await dispatchReminders(
    memoryReminderStore([completed, paused]),
    send,
    now,
    async () => 3,
  );
  expect(send).not.toHaveBeenCalled();
  expect(
    reminderWindowOpen(reminderDevice(), new Date("2026-11-10T09:59:00Z")),
  ).toBe(false);
  expect(
    reminderWindowOpen(reminderDevice(), new Date("2026-11-10T11:00:00Z")),
  ).toBe(false);
});
it("calculates a new closed-app day from due dates and the served lesson", () => {
  const snapshot = reminderDevice().snapshot;
  expect(
    remainingForReminder(snapshot, 3, new Date("2026-11-11T10:00:00Z")),
  ).toEqual({ newPhrases: 3, reviews: 1, sounds: 3 });
  expect(
    remainingForReminder({ ...snapshot, lessonSize: 0, newPhrases: 0 }, 3, now)
      .newPhrases,
  ).toBe(3);
  expect(
    remainingForReminder(
      { ...snapshot, lessonSize: 0, lessonCompleted: true },
      3,
      now,
    ).newPhrases,
  ).toBe(0);
});
it("expires rejected subscriptions and does not retry ambiguous failed deliveries", async () => {
  const device = reminderDevice();
  const store = memoryReminderStore([device]);
  const send = vi.fn().mockRejectedValue({ statusCode: 410 });
  expect(
    (await dispatchReminders(store, send, now, async () => 3)).expired,
  ).toBe(1);
  expect(await store.get(device.id)).toBeNull();
  const second = memoryReminderStore([device]);
  send.mockRejectedValue(new Error("Timeout"));
  expect(
    (await dispatchReminders(second, send, now, async () => 3)).failed,
  ).toBe(1);
  expect(
    (await dispatchReminders(second, send, now, async () => 3)).skipped,
  ).toBe(1);
});
it("keeps personal expressions, answers, audio and identifiers out of reminder snapshots", () => {
  const snapshot = createReminderSnapshot(
    initialPhrases,
    [],
    emptyStore(),
    now,
  );
  expect(Object.keys(snapshot).sort()).toEqual(
    [
      "date",
      "newPhrases",
      "reviews",
      "sounds",
      "lessonSize",
      "lessonCompleted",
      "reviewDueDates",
      "dailySoundCount",
    ].sort(),
  );
  expect(JSON.stringify(snapshot)).not.toContain(initialPhrases[0].expression);
});
