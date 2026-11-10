import { SOUND_HELP } from "../data/soundHelp";
import { SOUND_WORDS } from "../data/soundWords";
import type { Phrase } from "../types/learning";
import type { SoundAttempt, SoundWord } from "../types/phonetics";

export function getSoundHelp(word: SoundWord, phrase: Phrase) {
  const reference = SOUND_WORDS.find((item) => item.word === word.word);
  const help =
    reference?.hint === word.hint && reference.context === word.context
      ? SOUND_HELP[word.word]
      : undefined;
  const examples = [
    ...new Set(help?.examples ?? [word.context, phrase.example]),
  ].filter((example) => example.toLowerCase().includes(word.word));
  const clues = [
    ...new Set([
      ...(help?.hints ?? [word.hint]),
      `Spelling clue: ${word.word.length} letters, starting with ‘${word.word[0]}’.`,
    ]),
  ];
  return { clues, examples, meaning: help?.hints[5] ?? word.hint };
}

export function getRecentSoundMistakes(
  attempts: SoundAttempt[],
  phraseId: string,
  word: string,
) {
  let mistakes = 0;
  for (const attempt of attempts) {
    if (
      attempt.phraseId !== phraseId ||
      attempt.word !== word ||
      attempt.mode !== "decode"
    )
      continue;
    mistakes = attempt.correct ? 0 : mistakes + 1;
  }
  return mistakes;
}
