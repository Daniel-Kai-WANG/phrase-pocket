import { vi } from "vitest";
import type { ReminderStore } from "../../server/reminders/store";
import type { ReminderDevice } from "../../server/reminders/schema";
import { hashDeviceToken } from "../../server/reminders/schema";

export const deviceToken = "a".repeat(43);
export function reminderDevice(): ReminderDevice {
  return {
    id: "ab832fe8-59a1-4c22-846d-f02e06764b78",
    tokenHash: hashDeviceToken(deviceToken),
    revision: 1,
    subscription: {
      endpoint: "https://web.push.apple.com/test-only",
      keys: { p256dh: "a".repeat(87), auth: "b".repeat(22) },
    },
    preferences: {
      enabled: true,
      time: "20:00",
      timeZone: "Australia/Brisbane",
    },
    snapshot: {
      date: "2026-11-10",
      newPhrases: 2,
      reviews: 1,
      sounds: 3,
      lessonSize: 3,
      lessonCompleted: false,
      reviewDueDates: ["2026-11-11T00:00:00Z"],
      dailySoundCount: 3,
    },
    syncedAt: "2026-11-10T09:00:00Z",
  };
}

export function memoryReminderStore(
  initial: ReminderDevice[] = [],
): ReminderStore {
  const rows = new Map(initial.map((device) => [device.id, device]));
  const claimed = new Set<string>();
  return {
    get: vi.fn(async (id) => rows.get(id) ?? null),
    save: vi.fn(async (device, create) => {
      const previous = rows.get(device.id);
      if (
        (!previous && !create) ||
        (previous && previous.tokenHash !== device.tokenHash)
      )
        return -1;
      if (previous && previous.revision >= device.revision) return 0;
      rows.set(device.id, device);
      return 1;
    }),
    remove: vi.fn(async (id, hash) => {
      if (rows.get(id)?.tokenHash !== hash) return 0;
      rows.delete(id);
      return 1;
    }),
    list: vi.fn(async () => [...rows.values()]),
    claim: vi.fn(async (id, slot) => {
      const key = `${id}:${slot}`;
      if (claimed.has(key)) return false;
      claimed.add(key);
      return true;
    }),
  };
}
