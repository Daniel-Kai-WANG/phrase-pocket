import type { ReminderPreferences } from "../types/dailyTasks";
import { DEFAULT_REMINDER_TIME } from "./dailyTasks";
import { learningDay } from "./dates";

export const DEFAULT_REMINDER_PREFERENCES: ReminderPreferences = {
  enabled: true,
  time: DEFAULT_REMINDER_TIME,
  timeZone: "Australia/Brisbane",
};

export function reminderIsDue(
  preferences: ReminderPreferences,
  planDate: string,
  remaining: number,
  dismissedDate: string | undefined,
  now = new Date(),
) {
  const today = learningDay(now);
  if (
    !preferences.enabled ||
    !remaining ||
    planDate !== today ||
    dismissedDate === today
  )
    return false;
  const localTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: preferences.timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);
  return localTime >= preferences.time;
}

export function reminderMessage(counts: {
  newPhrases: number;
  reviews: number;
  sounds: number;
}) {
  const label = (count: number, noun: string) =>
    `${count} ${noun}${count === 1 ? "" : "s"}`;
  return `${label(counts.newPhrases, "new phrase")} · ${label(counts.reviews, "review")} · ${label(counts.sounds, "sound challenge")} left.`;
}
