import { createHash } from "node:crypto";
import { z } from "zod";
import { reminderUpdateSchema } from "../../src/types/push.js";

export const deviceIdSchema = z.uuid();
export const deviceTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/);
export const subscriptionSchema = z
  .object({
    endpoint: z
      .url()
      .max(2048)
      .refine((value) => {
        const url = new URL(value);
        return (
          url.protocol === "https:" &&
          !url.port &&
          !url.username &&
          !url.password &&
          (url.hostname === "web.push.apple.com" ||
            url.hostname === "fcm.googleapis.com" ||
            url.hostname === "updates.push.services.mozilla.com" ||
            url.hostname.endsWith(".push.services.mozilla.com"))
        );
      }, "Unsupported push service"),
    keys: z
      .object({
        p256dh: z.string().regex(/^[A-Za-z0-9_-]{87}$/),
        auth: z.string().regex(/^[A-Za-z0-9_-]{22}$/),
      })
      .strict(),
    expirationTime: z.number().nullable().optional(),
  })
  .strict();
export const registrationSchema = reminderUpdateSchema.extend({
  id: deviceIdSchema,
  token: deviceTokenSchema,
  subscription: subscriptionSchema,
});
export const syncSchema = reminderUpdateSchema.extend({ id: deviceIdSchema });
export const deviceRequestSchema = z.object({ id: deviceIdSchema }).strict();
export type DeviceRegistration = z.infer<typeof registrationSchema>;
export type ReminderDevice = Omit<DeviceRegistration, "token"> & {
  tokenHash: string;
  syncedAt: string;
};
export function hashDeviceToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
