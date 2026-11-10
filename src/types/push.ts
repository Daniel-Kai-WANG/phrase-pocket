import { z } from "zod";

export const reminderSnapshotSchema = z
  .object({
    date: z.iso.date(),
    newPhrases: z.number().int().min(0).max(3),
    reviews: z.number().int().min(0).max(6),
    sounds: z.number().int().min(0).max(3),
    lessonSize: z.number().int().min(0).max(3),
    lessonCompleted: z.boolean(),
    reviewDueDates: z.array(z.iso.datetime()).max(10000),
    dailySoundCount: z.number().int().min(0).max(3),
  })
  .strict();

export const reminderUpdateSchema = z
  .object({
    revision: z.number().int().positive().safe(),
    preferences: z
      .object({
        enabled: z.boolean(),
        time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
        timeZone: z.literal("Australia/Brisbane"),
      })
      .strict(),
    snapshot: reminderSnapshotSchema,
  })
  .strict();

export type ReminderSnapshot = z.infer<typeof reminderSnapshotSchema>;
export type ReminderUpdate = z.infer<typeof reminderUpdateSchema>;
export interface PushDevice {
  id: string;
  token: string;
  revision: number;
  connected?: boolean;
}
export interface PhoneReminderControls {
  connected: boolean;
  busy: boolean;
  message: string;
  error: string;
  enable: () => Promise<void>;
  test: () => Promise<void>;
  disconnect: () => Promise<void>;
  sync: () => Promise<void>;
}
