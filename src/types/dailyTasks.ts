import type { SoundMode } from "./phonetics";

export interface DailySoundTask {
  phraseId: string;
  word: string;
  mode: SoundMode;
}

export interface DailyTaskPlan {
  date: string;
  newPhraseIds: string[];
  reviewPhraseIds: string[];
  sounds: DailySoundTask[];
}

export interface ReminderPreferences {
  enabled: boolean;
  time: string;
  timeZone: "Australia/Brisbane";
}

export interface RemainingTasks {
  newPhraseIds: string[];
  reviewPhraseIds: string[];
  sounds: DailySoundTask[];
  total: number;
}
