import { z } from "zod";
import { phraseSchema } from "./contentSchema.js";

const englishText = z
  .string()
  .trim()
  .min(1)
  .max(2000)
  .regex(/^[^\u3400-\u9fff]*$/);
export const inboxCardSchema = phraseSchema
  .pick({
    expression: true,
    meaning: true,
    example: true,
    register: true,
    note: true,
    theme: true,
    scenarios: true,
  })
  .extend({
    expression: englishText,
    meaning: englishText,
    example: englishText,
    register: englishText,
    note: englishText,
    scenarios: z
      .array(
        z.object({
          setting: englishText,
          prompt: englishText,
          sample: englishText,
        }),
      )
      .length(2),
  });

export const inboxReplySchema = z.object({
  explanation: englishText,
  cards: z.array(inboxCardSchema).max(8),
  pending: z.array(z.object({ text: englishText, reason: englishText })).max(8),
});
export const inboxRequestSchema = z.object({
  text: z.string().trim().min(1).max(12000),
  mode: z.enum(["question", "conversation"]),
});
export const inboxEntrySchema = inboxRequestSchema.extend({
  id: z.string().min(1),
  createdAt: z.iso.datetime(),
  reply: inboxReplySchema.optional(),
  phraseIds: z.array(z.string()).default([]),
});
export const learningInboxSchema = z.object({
  entries: z.array(inboxEntrySchema),
  phrases: z.array(phraseSchema.extend({ source: z.literal("personal") })),
});
export type InboxReply = z.infer<typeof inboxReplySchema>;
export type InboxEntry = z.infer<typeof inboxEntrySchema>;
export type LearningInbox = z.infer<typeof learningInboxSchema>;
