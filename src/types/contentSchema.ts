import { z } from "zod";
import { soundWordSchema } from "./phoneticsSchema.js";

export const themeSchema = z.enum([
  "small-talk",
  "relationships",
  "work",
  "social",
  "feelings",
  "travel",
  "slang",
]);
const scenarioSchema = z.object({
  setting: z.string().min(1),
  prompt: z.string().min(1),
  sample: z.string().min(1),
});
export const phraseSchema = z.object({
  id: z.string().min(1),
  expression: z.string().min(1),
  meaning: z.string().min(1),
  example: z.string().min(1),
  pronunciation: z.string(),
  register: z.string(),
  note: z.string(),
  theme: themeSchema,
  source: z.enum(["personal", "daily", "quest"]),
  sourceDate: z.iso.date(),
  sourceMessageId: z.string().optional(),
  senseId: z.string().min(1).optional(),
  soundTargets: z.array(soundWordSchema).max(3).optional(),
  scenarios: z.tuple([scenarioSchema, scenarioSchema]),
});
export const questSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string(),
  topic: z.string().min(1),
  difficulty: z.enum(["B1", "B2", "C1"]),
  days: z.number().int().min(1).max(14),
  dailyCount: z.number().int().min(1).max(3),
  phrases: z.array(phraseSchema).min(1).max(42),
});
export const savedQuestSchema = questSchema.extend({
  startedAt: z.iso.datetime(),
  completedDays: z.array(z.number().int().min(1).max(14)),
});
