import type { Phrase } from "../types/learning";
import type { PracticeStep } from "./session";

export interface DailyQuestion extends PracticeStep {
  round: string;
  instruction: string;
}

export function buildDailyQuiz(phrases: Phrase[]): DailyQuestion[] {
  return [0, 1, 2].flatMap((round) =>
    phrases.map((phrase): DailyQuestion => {
      const scenario = phrase.scenarios[round === 1 ? 1 : 0];
      const instruction =
        round === 2
          ? "Reply in two sentences: communicate the main point, then add a relevant question or next step. Keep the tone appropriate to the situation."
          : "Write a complete reply that fits the situation. Natural alternatives are welcome.";
      return {
        phrase,
        phase: round === 0 ? "recall" : "transfer",
        round: [
          "Respond to the situation",
          "Use it somewhere else",
          "Keep the conversation going",
        ][round],
        instruction,
        hintLevel: round === 0 ? 0 : 1,
        scenario: {
          ...scenario,
          prompt:
            round === 2
              ? `${scenario.prompt}\n\n${instruction}`
              : scenario.prompt,
        },
      };
    }),
  );
}
