import { expect, it } from "vitest";
import { initialPhrases } from "../src/data/catalog";
import {
  getDuePhrases,
  getMemorySummary,
  recordRecall,
} from "../src/utils/review";
import { emptyStore, parseBackup } from "../src/utils/storage";

it("includes daily expressions in due review without treating an unread lesson as learned", () => {
  const daily = initialPhrases.find((phrase) => phrase.source === "daily")!;
  const result = recordRecall(undefined, {
    id: "test-daily",
    phraseId: daily.id,
    at: "2026-11-09T02:00:00.000Z",
    hintLevel: 1,
    firstTry: true,
    mode: "written",
    assessment: {
      meaning: "correct",
      targetUsed: true,
      naturalness: "natural",
      feedback: "That fits.",
      nextHint: "",
    },
  })!;
  const progress = { [daily.id]: result };
  expect(
    getDuePhrases(initialPhrases, progress, new Date("2026-11-09T02:09:00Z")),
  ).toEqual([]);
  expect(
    getDuePhrases(
      initialPhrases,
      progress,
      new Date("2026-11-09T02:10:00Z"),
    ).map((phrase) => phrase.id),
  ).toEqual([daily.id]);
  expect(getMemorySummary(initialPhrases, progress).learning).toBe(1);
  expect(getMemorySummary(initialPhrases, progress).new).toBe(
    initialPhrases.length - 1,
  );
});

it("backs up speaking notes separately without turning them into recall evidence", () => {
  const store = emptyStore();
  store.speaking.push({
    id: "take-1",
    phraseId: initialPhrases[0].id,
    at: "2026-11-09T02:00:00.000Z",
    mode: "echo",
    feedback: {
      transcript: "Shall we split the bill?",
      reply: "",
      languageFeedback: "A natural question.",
      audioFeedback: "Try a smoother final phrase.",
      retryPrompt: "Say it in one breath.",
      audioUsable: true,
    },
  });
  const restored = parseBackup(JSON.stringify(store));
  expect(restored.speaking).toEqual(store.speaking);
  expect(restored.progress).toEqual({});
  expect(restored.stamps).toEqual([]);
});

it("opens earlier backups before the speaking-history addition", () => {
  expect(
    parseBackup(
      '{"version":1,"progress":{},"completedLessons":[],"stamps":[],"quests":[]}',
    ).speaking,
  ).toEqual([]);
});
