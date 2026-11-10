export type Theme =
  | "small-talk"
  | "relationships"
  | "work"
  | "social"
  | "feelings"
  | "travel"
  | "slang";
export type MemoryState = "new" | "learning" | "recalling" | "remembered";
export type HintLevel = 0 | 1 | 2 | 3;

export interface Scenario {
  setting: string;
  prompt: string;
  sample: string;
}

export interface Phrase {
  id: string;
  expression: string;
  meaning: string;
  example: string;
  pronunciation: string;
  register: string;
  note: string;
  theme: Theme;
  source: "personal" | "daily" | "quest";
  sourceDate: string;
  sourceMessageId?: string;
  senseId?: string;
  scenarios: [Scenario, Scenario];
}

export interface Assessment {
  meaning: "correct" | "partly-correct" | "incorrect" | "uncertain";
  targetUsed: boolean;
  naturalness: "natural" | "understandable" | "needs-work";
  feedback: string;
  nextHint: string;
}

export interface RecallAttempt {
  id: string;
  phraseId: string;
  at: string;
  hintLevel: HintLevel;
  firstTry: boolean;
  assessment: Assessment;
  mode: "written" | "spoken";
}

export interface PhraseProgress {
  state: MemoryState;
  stage: number;
  dueAt: string;
  lastAttemptAt: string;
  recallDays: string[];
  attempts: RecallAttempt[];
}

export type ProgressMap = Record<string, PhraseProgress>;

export interface DailyLesson {
  date: string;
  theme: Theme;
  phraseIds: string[];
  origin: "conversation" | "generated";
}

export interface PendingPhrase {
  id: string;
  text: string;
  reason: string;
}
