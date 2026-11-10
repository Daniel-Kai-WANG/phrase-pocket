import { expect, it } from "vitest";
import {
  createDailyTaskPlan,
  getRemainingTasks,
  DEFAULT_REMINDER_TIME,
} from "../src/utils/dailyTasks";
import { emptyStore } from "../src/utils/storage";
import { recordRecall } from "../src/utils/review";
import type { DailyLesson, Phrase, RecallAttempt } from "../src/types/learning";

const now = new Date("2026-11-10T10:00:00Z");
const phrases = [
  { id: "vain", expression: "In vain", example: "We searched in vain." },
] as Phrase[];
const lessons: DailyLesson[] = [
  {
    date: "2026-11-10",
    phraseIds: ["new-a", "new-b", "new-c"],
    theme: "work",
    origin: "generated",
  },
];
const attempt: RecallAttempt = {
  id: "a",
  phraseId: "vain",
  at: "2026-11-09T10:00:00Z",
  hintLevel: 0,
  firstTry: true,
  mode: "written",
  assessment: {
    meaning: "correct",
    targetUsed: true,
    naturalness: "natural",
    feedback: "Good",
    nextHint: "",
  },
};

it("plans only today's lesson, a bounded due review queue and available sound work", () => {
  const data = emptyStore();
  data.progress.vain = recordRecall(undefined, attempt)!;
  const plan = createDailyTaskPlan(phrases, lessons, data, now);
  expect(plan.newPhraseIds).toEqual(["new-a", "new-b", "new-c"]);
  expect(plan.reviewPhraseIds).toEqual(["vain"]);
  expect(plan.sounds.map((item) => item.mode)).toEqual([
    "decode",
    "build",
    "repair",
  ]);
  expect(DEFAULT_REMINDER_TIME).toBe("20:00");
});

it("does not replace finished work with new tasks as progress or the feed changes", () => {
  const data = emptyStore();
  data.dailyTaskPlan = createDailyTaskPlan(phrases, lessons, data, now);
  data.completedLessons = ["2026-11-10"];
  expect(createDailyTaskPlan([], [], data, now)).toBe(data.dailyTaskPlan);
  expect(getRemainingTasks(data.dailyTaskPlan, data).newPhraseIds).toEqual([]);
});

it("adds a late daily lesson once without replacing existing sound or review work", () => {
  const data = emptyStore();
  data.dailyTaskPlan = createDailyTaskPlan(phrases, [], data, now);
  const next = createDailyTaskPlan(phrases, lessons, data, now);
  expect(next.newPhraseIds).toEqual(lessons[0].phraseIds);
  expect(next.sounds).toBe(data.dailyTaskPlan.sounds);
});

it("leaves incorrect work unfinished and counts successful practice without claiming mastery", () => {
  const data = emptyStore();
  data.progress.vain = recordRecall(undefined, attempt)!;
  const plan = createDailyTaskPlan(phrases, [], data, now);
  const wrong = {
    ...attempt,
    id: "b",
    at: now.toISOString(),
    assessment: { ...attempt.assessment, meaning: "incorrect" as const },
  };
  data.progress.vain = recordRecall(data.progress.vain, wrong)!;
  expect(getRemainingTasks(plan, data).reviewPhraseIds).toEqual(["vain"]);
  data.progress.vain = recordRecall(data.progress.vain, {
    ...attempt,
    id: "c",
    at: now.toISOString(),
    hintLevel: 1,
  })!;
  expect(getRemainingTasks(plan, data).reviewPhraseIds).toEqual([]);
  expect(data.progress.vain.state).toBe("learning");
  data.soundAttempts = [
    {
      id: "sound",
      phraseId: "vain",
      word: "vain",
      mode: "decode",
      at: now.toISOString(),
      correct: true,
      independent: true,
    },
  ];
  expect(getRemainingTasks(plan, data).sounds).toHaveLength(2);
});

it("rolls the plan at Brisbane midnight and never treats yesterday's sound success as today's", () => {
  const data = emptyStore();
  data.dailyTaskPlan = createDailyTaskPlan(phrases, lessons, data, now);
  data.soundAttempts = [
    {
      id: "sound",
      phraseId: "vain",
      word: "vain",
      mode: "decode",
      at: now.toISOString(),
      correct: true,
      independent: true,
    },
  ];
  const next = createDailyTaskPlan(
    phrases,
    lessons,
    data,
    new Date("2026-11-10T14:00:00Z"),
  );
  expect(next.date).toBe("2026-11-11");
  expect(next.newPhraseIds).toEqual([]);
  expect(getRemainingTasks(next, data).sounds).toHaveLength(3);
});
