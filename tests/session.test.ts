import { expect, it } from "vitest";
import { buildSession } from "../src/utils/session";
import { initialPhrases } from "../src/data/catalog";

it("separates exposure and recall with other expressions and repeats them in new scenes", () => {
  const phrases = initialPhrases.slice(0, 3);
  const steps = buildSession(phrases);
  expect(steps.map((step) => step.phase)).toEqual([
    "learn",
    "learn",
    "learn",
    "recall",
    "recall",
    "recall",
    "transfer",
    "transfer",
    "transfer",
  ]);
  expect(steps[6].phrase.id).toBe(steps[0].phrase.id);
});
it("starts due reviews with recall instead of showing the answer first", () => {
  expect(buildSession(initialPhrases.slice(0, 1), true)[0].phase).toBe(
    "recall",
  );
});
