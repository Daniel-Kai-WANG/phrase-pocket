import { z } from "zod";
import { phraseSchema } from "../src/types/contentSchema";
import { contentFeedSchema, type ContentFeed } from "../src/types/contentFeed";
import { mergeContentFeed } from "../src/utils/contentFeed";

export const sourceBatchSchema = z.object({
  source: z.enum(["personal", "daily"]),
  checkedAt: z.iso.datetime(),
  reviewedForPublication: z.literal(true),
  phrases: z.array(phraseSchema),
  lessons: contentFeedSchema.shape.lessons,
  pending: contentFeedSchema.shape.pending,
  resolvedPendingIds: z.array(z.string()),
});

export function importSourceBatch(
  current: ContentFeed,
  input: unknown,
): ContentFeed {
  const batch = sourceBatchSchema.parse(input);
  const previousCheck =
    batch.source === "personal"
      ? current.personalCheckedAt
      : current.dailyCheckedAt;
  if (previousCheck && batch.checkedAt < previousCheck)
    throw new Error("The source batch is older than the last imported check.");
  if (batch.phrases.some((phrase) => phrase.source !== batch.source))
    throw new Error("The source batch mixes different content sources.");
  if (batch.source === "personal" && batch.lessons.length)
    throw new Error("Personal updates cannot replace daily pages.");
  const learningCopy = batch.phrases.map(
    ({
      expression,
      meaning,
      example,
      note,
      pronunciation,
      scenarios,
      soundTargets,
    }) => ({
      expression,
      meaning,
      example,
      note,
      pronunciation,
      scenarios,
      soundTargets,
    }),
  );
  const publicText = JSON.stringify([learningCopy, batch.pending]);
  if (/[\u3400-\u9fff]/.test(publicText))
    throw new Error("Public learning copy must use English explanations.");
  if (/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(publicText))
    throw new Error("Remove personal email addresses before publishing.");
  const pending = new Map(current.pending.map((item) => [item.id, item]));
  for (const id of batch.resolvedPendingIds) pending.delete(id);
  for (const item of batch.pending) pending.set(item.id, item);
  const incoming: ContentFeed = {
    ...current,
    revision: current.revision + 1,
    publishedAt: new Date().toISOString(),
    personalCheckedAt:
      batch.source === "personal" ? batch.checkedAt : current.personalCheckedAt,
    dailyCheckedAt:
      batch.source === "daily" ? batch.checkedAt : current.dailyCheckedAt,
    sourceSyncMode:
      current.sourceSyncMode === "scheduled" ? "scheduled" : "manual",
    phrases: batch.phrases,
    lessons: batch.lessons,
    pending: [...pending.values()],
  };
  const merged = mergeContentFeed(current, incoming);
  const comparison = {
    ...merged,
    revision: current.revision,
    publishedAt: current.publishedAt,
  };
  return JSON.stringify(comparison) === JSON.stringify(current)
    ? current
    : merged;
}
