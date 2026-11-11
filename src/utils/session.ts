import type { Phrase } from "../types/learning";

export type PracticeStep = {
  phrase: Phrase;
  phase: "learn" | "guided" | "recall" | "transfer";
};

export function buildSession(
  phrases: Phrase[],
  reviewOnly = false,
): PracticeStep[] {
  if (reviewOnly) {
    return ["recall", "transfer"].flatMap((phase) =>
      phrases.map((phrase) => ({ phrase, phase }) as PracticeStep),
    );
  }
  return [
    ...phrases.flatMap((phrase): PracticeStep[] => [
      { phrase, phase: "learn" },
      { phrase, phase: "guided" },
    ]),
    ...phrases.map((phrase): PracticeStep => ({ phrase, phase: "transfer" })),
  ];
}
