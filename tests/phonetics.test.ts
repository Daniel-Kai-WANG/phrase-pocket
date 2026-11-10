import { describe, expect, it } from "vitest";
import { SOUND_WORDS } from "../src/data/soundWords";
import {
  checkSoundAnswer,
  getRepairTokens,
  getSoundContext,
  getSoundSummary,
  getSoundTargets,
  getSoundTiles,
} from "../src/utils/phonetics";
import { emptyStore, parseBackup } from "../src/utils/storage";
import type { Phrase } from "../src/types/learning";
import type { SoundAttempt } from "../src/types/phonetics";

const vain = SOUND_WORDS[0];
const phrase = {
  expression: "In vain",
  example: "I searched in vain.",
  id: "in-vain",
} as Phrase;
const attempt: SoundAttempt = {
  id: "a",
  phraseId: phrase.id,
  word: "vain",
  mode: "decode",
  at: "2026-11-10T10:00:00Z",
  correct: true,
  independent: true,
};

describe("personal sound challenges", () => {
  it("prioritizes reviewed source targets over incidental words in an example", () => {
    const target = SOUND_WORDS.find((word) => word.word === "reassure")!;
    const targets = getSoundTargets({
      ...phrase,
      example: "vain versatile head comfort reassure",
      soundTargets: [target],
    });
    expect(targets[0]).toBe(target);
    expect(targets).toHaveLength(3);
  });
  it("matches complete words in imported expressions without false substring matches", () => {
    expect(getSoundTargets(phrase)).toEqual([vain]);
    expect(
      getSoundTargets({
        ...phrase,
        expression: "headache",
        example: "He reassured me.",
      }),
    ).toEqual([]);
  });
  it("conceals every target occurrence and supports a different transfer context", () => {
    expect(getSoundContext(phrase, vain, false)).toBe("I searched in /veɪn/.");
    expect(getSoundContext(phrase, vain, true)).not.toContain("vain");
    expect(getSoundContext(phrase, vain, true)).not.toBe(
      getSoundContext(phrase, vain, false),
    );
  });
  it("uses the context to distinguish homophones and accepts harmless IPA notation", () => {
    expect(checkSoundAnswer(vain, "decode", " VAIN ")).toBe(true);
    expect(checkSoundAnswer(vain, "decode", "vein")).toBe(false);
    expect(checkSoundAnswer(vain, "build", "/v eɪ n/")).toBe(true);
    expect(checkSoundAnswer(vain, "build", "vɛn")).toBe(false);
    const comfort = SOUND_WORDS.find((word) => word.word === "comfort")!;
    expect(checkSoundAnswer(comfort, "build", "ˈkʌm.fət")).toBe(true);
    expect(checkSoundAnswer(comfort, "build", "kʌmˈfət")).toBe(false);
  });
  it("creates exactly one incorrect vowel while preserving stress and has reusable distractor tiles", () => {
    for (const word of SOUND_WORDS) {
      const repair = getRepairTokens(word);
      expect(
        repair.filter((token, index) => token !== word.tokens[index]),
      ).toHaveLength(1);
      expect(checkSoundAnswer(word, "repair", repair.join(""))).toBe(false);
      expect(getSoundTiles(word)).toContain("ɪ");
      expect(getSoundTiles(word)).toEqual(expect.arrayContaining(word.tokens));
    }
  });
  it("counts independent days per mode and reopens mistakes without inflating repeats", () => {
    const records = [
      attempt,
      { ...attempt, id: "b" },
      { ...attempt, id: "c", mode: "build" as const, independent: false },
    ];
    expect(getSoundSummary(records, "vain")).toEqual([
      { mode: "decode", days: 1, needsReview: false },
      { mode: "build", days: 0, needsReview: true },
      { mode: "repair", days: 0, needsReview: false },
    ]);
  });
  it("restores older backups and round-trips sound evidence without semantic progress", () => {
    const legacy = emptyStore();
    delete legacy.soundAttempts;
    expect(parseBackup(JSON.stringify(legacy)).soundAttempts).toEqual([]);
    const restored = parseBackup(
      JSON.stringify({ ...legacy, soundAttempts: [attempt] }),
    );
    expect(restored.soundAttempts).toEqual([attempt]);
    expect(restored.progress).toEqual({});
    expect(restored.completedLessons).toEqual([]);
  });
});
