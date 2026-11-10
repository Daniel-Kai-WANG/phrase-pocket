import { z } from "zod";

const sourceSnapshotSchema = z.object({
  thread: z.object({ id: z.string().min(1) }),
  page: z.object({
    order: z.literal("newest_first"),
    hasMore: z.boolean(),
    nextCursor: z.string().nullable(),
  }),
  turns: z.array(
    z.object({ id: z.string().min(1), status: z.string().min(1) }),
  ),
});

export const sourceCheckpointSchema = z.object({
  version: z.literal(1),
  threadId: z.string().min(1),
  publishedTurnId: z.string().min(1),
  publishedRevision: z.number().int().nonnegative(),
});

export type SourceCheckpoint = z.infer<typeof sourceCheckpointSchema>;

export interface SourceWindowResult {
  status:
    | "needs-baseline"
    | "needs-history"
    | "gap"
    | "waiting"
    | "unchanged"
    | "ready";
  newTurnIds: string[];
  newestTurnId: string | null;
  nextCursor: string | null;
  reason: string;
}

export function inspectSourceWindow(
  input: unknown,
  checkpointInput: unknown | null,
): SourceWindowResult {
  const snapshot = sourceSnapshotSchema.parse(input);
  const ids = snapshot.turns.map((turn) => turn.id);
  if (new Set(ids).size !== ids.length)
    throw new Error("The source window contains duplicate turn ids.");
  const result = {
    newTurnIds: [] as string[],
    newestTurnId: ids[0] ?? null,
    nextCursor: snapshot.page.nextCursor,
  };
  if (!checkpointInput)
    return {
      ...result,
      status: "needs-baseline",
      reason:
        "Establish a reviewed, published baseline before automatic imports.",
    };
  const checkpoint = sourceCheckpointSchema.parse(checkpointInput);
  if (checkpoint.threadId !== snapshot.thread.id)
    throw new Error("The source window belongs to a different conversation.");
  const boundary = ids.indexOf(checkpoint.publishedTurnId);
  if (boundary < 0)
    return {
      ...result,
      status:
        snapshot.page.hasMore && snapshot.page.nextCursor
          ? "needs-history"
          : "gap",
      reason:
        "The last published turn is not visible. Recover the missing history before advancing the checkpoint.",
    };
  const additions = snapshot.turns.slice(0, boundary);
  if (additions.some((turn) => turn.status !== "completed"))
    return {
      ...result,
      status: "waiting",
      reason:
        "A newer turn is unfinished. Wait for its final context before importing.",
    };
  return {
    ...result,
    status: additions.length ? "ready" : "unchanged",
    newTurnIds: additions.map((turn) => turn.id).reverse(),
    reason: additions.length
      ? "The window overlaps the published checkpoint. Review new turns in chronological order."
      : "No newer turns are visible. The published checkpoint stays unchanged.",
  };
}
