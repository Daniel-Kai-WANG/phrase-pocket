import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import type { Phrase } from "../src/types/learning";
import {
  buildGuidedPhrase,
  matchesGuidedWord,
} from "../src/utils/guidedPhrase";

const phrases: Phrase[] = JSON.parse(
  readFileSync("public/content.json", "utf8"),
).phrases;

it("builds a reversible one-word warm-up for every published expression", () => {
  for (const phrase of phrases) {
    const puzzle = buildGuidedPhrase(phrase);
    expect(puzzle, phrase.id).not.toBeNull();
    expect(puzzle!.before + puzzle!.word + puzzle!.after).toBe(
      phrase.expression,
    );
    expect(puzzle!.word).not.toContain(" ");
  }
});

it("accepts case, surrounding whitespace and curly apostrophes without accepting a different word", () => {
  expect(matchesGuidedWord(" BALL ", "ball")).toBe(true);
  expect(matchesGuidedWord("can’t", "can't")).toBe(true);
  expect(matchesGuidedWord("balloon", "ball")).toBe(false);
  expect(matchesGuidedWord("", "ball")).toBe(false);
});
