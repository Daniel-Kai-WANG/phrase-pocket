import type { Phrase } from "../types/learning";

const placeholderWords = new Set([
  "someone",
  "something",
  "somebody",
  "anyone",
  "anything",
  "your",
  "with",
  "that",
  "this",
  "have",
  "been",
  "into",
  "oneself",
]);

export function buildGuidedPhrase(phrase: Phrase) {
  const words = [...phrase.expression.matchAll(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)];
  const target =
    [...words]
      .reverse()
      .find(
        (word) =>
          word[0].length > 2 && !placeholderWords.has(word[0].toLowerCase()),
      ) ?? words[0];
  if (!target) return null;
  return {
    before: phrase.expression.slice(0, target.index),
    word: target[0],
    after: phrase.expression.slice(target.index + target[0].length),
  };
}

export function matchesGuidedWord(answer: string, expected: string) {
  const normalize = (value: string) =>
    value.trim().toLowerCase().replaceAll("’", "'");
  return normalize(answer) === normalize(expected);
}
