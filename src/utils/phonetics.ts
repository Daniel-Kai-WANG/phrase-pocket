import { SOUND_WORDS } from "../data/soundWords";
import type { Phrase } from "../types/learning";
import type { SoundAttempt, SoundMode, SoundWord } from "../types/phonetics";
import { learningDay } from "./dates";

export const SOUND_MODES: SoundMode[] = ["decode", "build", "repair"];
const VOWELS = new Set([
  "e",
  "ɛ",
  "eɪ",
  "ʌ",
  "iː",
  "ɪ",
  "ə",
  "ɔː",
  "ɜː",
  "aɪ",
  "æ",
  "ɑː",
  "ɒ",
  "ʊ",
  "uː",
  "ɔɪ",
  "əʊ",
  "aʊ",
  "ɪə",
  "eə",
  "ʊə",
]);
const DISTRACTORS = ["æ", "ɪ", "iː", "e", "eɪ", "ə", "ʌ", "ʃ", "s", "ˈ", "ˌ"];

function wordPattern(word: string) {
  return new RegExp(
    `\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
    "gi",
  );
}

export function getSoundTargets(phrase: Phrase): SoundWord[] {
  const words = new Map(
    (phrase.soundTargets ?? []).map((item) => [item.word, item]),
  );
  for (const item of SOUND_WORDS)
    if (!words.has(item.word)) words.set(item.word, item);
  return [...words.values()]
    .filter(
      (item) =>
        wordPattern(item.word).test(`${phrase.expression} ${phrase.example}`) &&
        item.tokens.some((token) => VOWELS.has(token)),
    )
    .slice(0, 3);
}

export function normalizeIpa(answer: string): string {
  return answer.normalize("NFC").replace(/[/[\].\s]/g, "");
}

export function checkSoundAnswer(
  word: SoundWord,
  mode: SoundMode,
  answer: string,
) {
  return mode === "decode"
    ? answer.trim().toLowerCase() === word.word
    : word.accepted.includes(normalizeIpa(answer));
}

export function getSoundContext(
  phrase: Phrase,
  word: SoundWord,
  transfer: boolean,
) {
  const context =
    !transfer && wordPattern(word.word).test(phrase.example)
      ? phrase.example
      : word.context;
  return context.replace(wordPattern(word.word), `/${word.tokens.join("")}/`);
}

export function getRepairTokens(word: SoundWord): string[] {
  const index = word.tokens.findIndex((token) => VOWELS.has(token));
  return word.tokens.map((token, position) =>
    position === index ? (token === "æ" ? "ɪ" : "æ") : token,
  );
}

export function getSoundTiles(word: SoundWord, random = Math.random): string[] {
  const tiles = [...new Set([...word.tokens, ...DISTRACTORS])];
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
  return tiles;
}

export function getSoundSummary(attempts: SoundAttempt[], word: string) {
  const relevant = attempts.filter((attempt) => attempt.word === word);
  const modes = SOUND_MODES.map((mode) => {
    const records = relevant.filter((attempt) => attempt.mode === mode);
    const last = records.at(-1);
    const days = new Set(
      records
        .filter((attempt) => attempt.correct && attempt.independent)
        .map((attempt) => learningDay(attempt.at)),
    );
    return {
      mode,
      days: days.size,
      needsReview: Boolean(last && (!last.correct || !last.independent)),
    };
  });
  return modes;
}
