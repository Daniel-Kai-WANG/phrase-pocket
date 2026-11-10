export interface SpokenTurn {
  role: "user" | "assistant";
  text: string;
}
export interface SpeakingFeedback {
  transcript: string;
  reply: string;
  languageFeedback: string;
  audioFeedback: string;
  retryPrompt: string;
  audioUsable: boolean;
}

export type SpeakingMode = "echo" | "own-words" | "conversation";

export interface SpeakingRecord {
  id: string;
  phraseId: string;
  at: string;
  mode: SpeakingMode;
  feedback: SpeakingFeedback;
}
