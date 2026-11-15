import { expect, it } from "vitest";
import { initialPhrases } from "../src/data/catalog";
import { buildDailyQuiz } from "../src/utils/dailyQuiz";

it("interleaves expressions across distinct scenarios and a conversational extension", () => {
  const phrases = initialPhrases.slice(0, 3);
  const questions = buildDailyQuiz(phrases);
  expect(questions).toHaveLength(9);
  expect(questions.map((item) => item.phrase.id)).toEqual(
    [...phrases, ...phrases, ...phrases].map((item) => item.id),
  );
  expect(questions[0].scenario).toEqual(phrases[0].scenarios[0]);
  expect(questions[3].scenario).toEqual(phrases[0].scenarios[1]);
  expect(questions[6].scenario?.prompt).toContain("Reply in two sentences");
  expect(questions[6].scenario?.prompt).not.toBe(questions[0].scenario?.prompt);
  expect(
    questions.every(
      (item) => item.phase !== "learn" && item.phase !== "guided",
    ),
  ).toBe(true);
});

it("treats within-session repetitions as supported practice", () => {
  const questions = buildDailyQuiz(initialPhrases.slice(0, 3));
  expect(questions.slice(0, 3).every((item) => item.hintLevel === 0)).toBe(
    true,
  );
  expect(questions.slice(3).every((item) => item.hintLevel === 1)).toBe(true);
});

it("does not invent questions when a lesson has no available expressions", () => {
  expect(buildDailyQuiz([])).toEqual([]);
});
