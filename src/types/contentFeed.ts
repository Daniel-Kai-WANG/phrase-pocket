import { z } from "zod";
import { phraseSchema, themeSchema } from "./contentSchema";

export const contentFeedSchema = z.object({
  version: z.literal(1),
  revision: z.number().int().nonnegative(),
  publishedAt: z.iso.datetime().nullable(),
  personalCheckedAt: z.iso.datetime().nullable(),
  dailyCheckedAt: z.iso.datetime().nullable(),
  sourceSyncMode: z
    .enum(["disconnected", "manual", "scheduled"])
    .default("disconnected"),
  phrases: z.array(phraseSchema).max(10000),
  lessons: z.array(
    z.object({
      date: z.iso.date(),
      theme: themeSchema,
      phraseIds: z.array(z.string()).length(3),
      origin: z.enum(["conversation", "generated"]),
    }),
  ),
  pending: z.array(
    z.object({ id: z.string(), text: z.string(), reason: z.string() }),
  ),
});

export type ContentFeed = z.infer<typeof contentFeedSchema>;
