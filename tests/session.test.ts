import { expect, it } from "vitest";
import { buildSession } from "../src/utils/session";
import { initialPhrases } from "../src/data/catalog";

it("introduces and supports one expression at a time before returning to new situations", () => {
  const phrases = initialPhrases.slice(0, 3);
  const steps = buildSession(phrases);
  expect(steps.map((step) => step.phase)).toEqual([
    "learn",
    "guided",
    "learn",
    "guided",
    "learn",
    "guided",
    "transfer",
    "transfer",
    "transfer",
  ]);
  expect(steps[1].phrase.id).toBe(steps[0].phrase.id);
  expect(steps[2].phrase.id).toBe(phrases[1].id);
  expect(steps[6].phrase.id).toBe(steps[0].phrase.id);
});
it("starts due reviews with recall instead of showing the answer first", () => {
  expect(buildSession(initialPhrases.slice(0, 1), true)[0].phase).toBe(
    "recall",
  );
});
