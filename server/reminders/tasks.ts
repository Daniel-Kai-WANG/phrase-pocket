import type { ReminderDevice } from "./schema.js";
import type { ReminderSnapshot } from "../../src/types/push.js";
import { learningDay } from "../../src/utils/dates.js";

export function reminderWindowOpen(device: ReminderDevice, now: Date) {
  if (!device.preferences.enabled) return false;
  const local = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Australia/Brisbane",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);
  const minutes = (value: string) =>
    Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
  const elapsed = minutes(local) - minutes(device.preferences.time);
  return elapsed >= 0 && elapsed < 60;
}

export function remainingForReminder(
  snapshot: ReminderSnapshot,
  lessonSize: number,
  now: Date,
) {
  if (snapshot.date === learningDay(now))
    return {
      newPhrases: snapshot.lessonCompleted
        ? 0
        : snapshot.newPhrases + Math.max(0, lessonSize - snapshot.lessonSize),
      reviews: snapshot.reviews,
      sounds: snapshot.sounds,
    };
  return {
    newPhrases: lessonSize,
    reviews: Math.min(
      6,
      snapshot.reviewDueDates.filter(
        (date) => Date.parse(date) <= now.getTime(),
      ).length,
    ),
    sounds: snapshot.dailySoundCount,
  };
}
