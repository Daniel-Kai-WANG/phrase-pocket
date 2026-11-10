import type { ProgressMap } from "./learning";
import type { SavedQuest } from "./quest";
import type { SpeakingRecord } from "./speaking";

export interface LearningStore {
  version: 1;
  progress: ProgressMap;
  completedLessons: string[];
  stamps: string[];
  quests: SavedQuest[];
  speaking: SpeakingRecord[];
}
