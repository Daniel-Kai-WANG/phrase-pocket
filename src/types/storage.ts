import type { ProgressMap } from "./learning";
import type { SavedQuest } from "./quest";
import type { SpeakingRecord } from "./speaking";
import type { SoundAttempt } from "./phonetics";
import type { DailyTaskPlan, ReminderPreferences } from "./dailyTasks";

export interface LearningStore {
  version: 1;
  progress: ProgressMap;
  completedLessons: string[];
  stamps: string[];
  quests: SavedQuest[];
  speaking: SpeakingRecord[];
  soundAttempts?: SoundAttempt[];
  dailyTaskPlan?: DailyTaskPlan;
  reminderPreferences?: ReminderPreferences;
  reminderDismissedDate?: string;
}
