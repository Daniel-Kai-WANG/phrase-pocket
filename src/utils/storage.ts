import { z } from "zod";
import type { LearningStore } from "../types/storage";
import { savedQuestSchema } from "../types/contentSchema";

export const STORAGE_KEY = "phrase-pocket.learning.v1";
const assessment = z.object({
  meaning: z.enum(["correct", "partly-correct", "incorrect", "uncertain"]),
  targetUsed: z.boolean(),
  naturalness: z.enum(["natural", "understandable", "needs-work"]),
  feedback: z.string(),
  nextHint: z.string(),
});
const attempt = z.object({
  id: z.string(),
  phraseId: z.string(),
  at: z.iso.datetime(),
  hintLevel: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  firstTry: z.boolean(),
  assessment,
  mode: z.enum(["written", "spoken"]),
});
const progress = z.object({
  state: z.enum(["new", "learning", "recalling", "remembered"]),
  stage: z.number().int().min(0).max(6),
  dueAt: z.iso.datetime(),
  lastAttemptAt: z.iso.datetime(),
  recallDays: z.array(z.iso.date()),
  attempts: z.array(attempt),
});
const storeSchema = z.object({
  version: z.literal(1),
  progress: z.record(z.string(), progress),
  completedLessons: z.array(z.iso.date()),
  stamps: z.array(z.string()),
  quests: z.array(savedQuestSchema).default([]),
  speaking: z
    .array(
      z.object({
        id: z.string(),
        phraseId: z.string(),
        at: z.iso.datetime(),
        mode: z.enum(["echo", "own-words", "conversation"]),
        feedback: z.object({
          transcript: z.string(),
          reply: z.string(),
          languageFeedback: z.string(),
          audioFeedback: z.string(),
          retryPrompt: z.string(),
          audioUsable: z.boolean(),
        }),
      }),
    )
    .default([]),
});

export function emptyStore(): LearningStore {
  return {
    version: 1,
    progress: {},
    completedLessons: [],
    stamps: [],
    quests: [],
    speaking: [],
  };
}

export function parseBackup(text: string): LearningStore {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error("This file is not a readable JSON backup.");
  }
  const result = storeSchema.safeParse(json);
  if (!result.success)
    throw new Error(
      "This backup has an unsupported format or incomplete progress. Nothing was changed.",
    );
  return result.data;
}

export function loadStore(storage: Pick<Storage, "getItem">): {
  data: LearningStore;
  error: string | null;
  recoveryText: string | null;
} {
  let saved: string | null = null;
  try {
    saved = storage.getItem(STORAGE_KEY);
    return {
      data: saved ? parseBackup(saved) : emptyStore(),
      error: null,
      recoveryText: null,
    };
  } catch {
    return {
      data: emptyStore(),
      error:
        "Saved progress could not be opened. Export the existing data or restore a backup before continuing.",
      recoveryText: saved,
    };
  }
}

export function saveStore(
  storage: Pick<Storage, "setItem">,
  data: LearningStore,
): string | null {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
    return null;
  } catch {
    return "Your browser could not save this progress. Keep this page open and export a backup.";
  }
}

export function downloadBackup(data: LearningStore) {
  downloadRecovery(JSON.stringify(data, null, 2), "backup");
}

export function downloadRecovery(text: string, kind = "recovery") {
  const url = URL.createObjectURL(
    new Blob([text], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `phrase-pocket-${kind}-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
