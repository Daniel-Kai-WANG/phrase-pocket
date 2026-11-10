import { z } from "zod";

export const soundWordSchema = z
  .object({
    word: z.string().regex(/^[a-z]+$/),
    tokens: z.array(z.string().min(1)).min(1).max(30),
    accepted: z.array(z.string().min(1)).min(1).max(6),
    hint: z.string().min(1),
    context: z.string().min(1),
    note: z.string().min(1),
    sourceUrl: z.url().refine((value) => value.startsWith("https://")),
  })
  .refine((word) => word.accepted.includes(word.tokens.join("")), {
    message: "The displayed reference must be an accepted pronunciation.",
  });
