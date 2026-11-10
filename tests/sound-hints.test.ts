import { expect, it } from "vitest";
import { SOUND_WORDS } from "../src/data/soundWords";
import { getRecentSoundMistakes, getSoundHelp } from "../src/utils/soundHints";
import type { Phrase } from "../src/types/learning";
import type { SoundAttempt } from "../src/types/phonetics";

const phrase = { id: "in-vain", example: "I tried in vain." } as Phrase;
const vain = SOUND_WORDS[0];

it("provides distinct clues without giving away the target and keeps examples in its reviewed sense", () => {
  for (const word of SOUND_WORDS) {
    const help = getSoundHelp(word, phrase);
    expect(help.clues.length).toBeGreaterThanOrEqual(5);
    expect(new Set(help.clues).size).toBe(help.clues.length);
    expect(help.examples.length).toBeGreaterThanOrEqual(2);
    for (const clue of help.clues)
      expect(clue).not.toMatch(new RegExp(`\\b${word.word}\\b`, "i"));
  }
  expect(
    getSoundHelp(vain, phrase).examples.every((example) =>
      example.includes("in vain"),
    ),
  ).toBe(true);
});

it("does not apply the failure meaning of vain to a different imported sense", () => {
  const imported = {
    ...vain,
    hint: "Too proud of your appearance.",
    context: "He is vain about his hair.",
  };
  const help = getSoundHelp(imported, {
    ...phrase,
    example: "The vain actor checked his hair again.",
  });
  expect(help.clues[0]).toBe(imported.hint);
  expect(help.clues.join(" ")).not.toContain("Your effort did not work");
  expect(help.examples).toContain(imported.context);
});

it("resumes hints after failures only for the same word, source expression and decode mode", () => {
  const attempt: SoundAttempt = {
    id: "a",
    phraseId: phrase.id,
    word: "vain",
    mode: "decode",
    at: new Date().toISOString(),
    correct: false,
    independent: true,
  };
  expect(
    getRecentSoundMistakes(
      [attempt, { ...attempt, id: "b" }],
      phrase.id,
      "vain",
    ),
  ).toBe(2);
  expect(
    getRecentSoundMistakes(
      [
        attempt,
        { ...attempt, id: "b", mode: "build" },
        { ...attempt, id: "c", phraseId: "other" },
      ],
      phrase.id,
      "vain",
    ),
  ).toBe(1);
  expect(
    getRecentSoundMistakes(
      [
        attempt,
        { ...attempt, id: "b", correct: true },
        { ...attempt, id: "c" },
      ],
      phrase.id,
      "vain",
    ),
  ).toBe(1);
});
