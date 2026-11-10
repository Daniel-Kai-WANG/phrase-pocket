import type { MemoryState, Theme } from "../types/learning";

export const LEARNING_TIME_ZONE = "Australia/Brisbane";
export const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14, 30, 60] as const;
export const RETRY_DELAY_MINUTES = 10;
export const MEMORY_LABELS: Record<MemoryState, string> = {
  new: "New",
  learning: "Needs practice",
  recalling: "Coming back",
  remembered: "Remembered",
};
export const THEMES: Record<Theme, { label: string; scene: string }> = {
  "small-talk": { label: "Small talk", scene: "The neighbourhood café" },
  relationships: { label: "Connections", scene: "A walk by the river" },
  work: { label: "At work", scene: "The project room" },
  social: { label: "Out with friends", scene: "The weekend meetup" },
  feelings: { label: "Feelings", scene: "A little heart-to-heart" },
  travel: { label: "Out & about", scene: "The next adventure" },
  slang: { label: "Casual English", scene: "A chat with mates" },
};
export const WEEKLY_THEMES: Theme[] = [
  "slang",
  "small-talk",
  "relationships",
  "work",
  "social",
  "feelings",
  "travel",
];
