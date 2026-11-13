import { coachRequest } from "./client";
import { inboxReplySchema, type InboxEntry } from "../types/learningInbox";

export async function prepareLearningCards(
  entry: InboxEntry,
  signal?: AbortSignal,
) {
  return inboxReplySchema.parse(
    await coachRequest(
      "learning-inbox",
      {
        text: entry.text,
        mode: entry.mode,
      },
      signal,
    ),
  );
}
