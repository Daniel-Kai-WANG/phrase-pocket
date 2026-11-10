import type { Phrase } from "./learning";

export interface QuestPlan {
  id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: "B1" | "B2" | "C1";
  days: number;
  dailyCount: number;
  phrases: Phrase[];
}

export interface SavedQuest extends QuestPlan {
  startedAt: string;
  completedDays: number[];
}
