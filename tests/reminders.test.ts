import { expect, it } from "vitest";
import {
  DEFAULT_REMINDER_PREFERENCES,
  reminderIsDue,
  reminderMessage,
} from "../src/utils/reminders";

it("starts the reminder at 20:00 Brisbane, not at 20:00 UTC", () => {
  const due = (at: string) =>
    reminderIsDue(
      DEFAULT_REMINDER_PREFERENCES,
      "2026-11-10",
      3,
      undefined,
      new Date(at),
    );
  expect(due("2026-11-10T09:59:59Z")).toBe(false);
  expect(due("2026-11-10T10:00:00Z")).toBe(true);
  expect(due("2026-11-10T14:00:00Z")).toBe(false);
});

it("skips completed, paused, dismissed and stale plans", () => {
  const now = new Date("2026-11-10T10:00:00Z");
  expect(
    reminderIsDue(
      DEFAULT_REMINDER_PREFERENCES,
      "2026-11-10",
      0,
      undefined,
      now,
    ),
  ).toBe(false);
  expect(
    reminderIsDue(
      { ...DEFAULT_REMINDER_PREFERENCES, enabled: false },
      "2026-11-10",
      3,
      undefined,
      now,
    ),
  ).toBe(false);
  expect(
    reminderIsDue(
      DEFAULT_REMINDER_PREFERENCES,
      "2026-11-10",
      3,
      "2026-11-10",
      now,
    ),
  ).toBe(false);
  expect(
    reminderIsDue(
      DEFAULT_REMINDER_PREFERENCES,
      "2026-11-09",
      3,
      undefined,
      now,
    ),
  ).toBe(false);
});

it("honours a changed time and includes actual category counts", () => {
  expect(
    reminderIsDue(
      { ...DEFAULT_REMINDER_PREFERENCES, time: "21:30" },
      "2026-11-10",
      3,
      undefined,
      new Date("2026-11-10T10:00:00Z"),
    ),
  ).toBe(false);
  expect(reminderMessage({ newPhrases: 2, reviews: 4, sounds: 1 })).toBe(
    "2 new phrases · 4 reviews · 1 sound challenge left.",
  );
});
