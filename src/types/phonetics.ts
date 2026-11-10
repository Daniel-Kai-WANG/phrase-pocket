export type SoundMode = "decode" | "build" | "repair";

export interface SoundHelp {
  hints: [string, string, string, string, string, string];
  examples: string[];
}

export interface SoundWord {
  word: string;
  tokens: string[];
  accepted: string[];
  hint: string;
  context: string;
  note: string;
  sourceUrl: string;
}

export interface SoundAttempt {
  id: string;
  phraseId: string;
  word: string;
  mode: SoundMode;
  at: string;
  correct: boolean;
  independent: boolean;
}
