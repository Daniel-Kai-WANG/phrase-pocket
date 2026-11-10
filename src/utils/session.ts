import type { Phrase } from "../types/learning";

export type PracticeStep = {
  phrase: Phrase;
  phase: "learn" | "recall" | "transfer";
};

export function buildSession(
  phrases: Phrase[],
  reviewOnly = false,
): PracticeStep[] {
  const phases: PracticeStep["phase"][] = reviewOnly
    ? ["recall", "transfer"]
    : ["learn", "recall", "transfer"];
  return phases.flatMap((phase) =>
    phrases.map((phrase) => ({ phrase, phase })),
  );
}
