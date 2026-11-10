import type { DailyLesson, Phrase } from "../types/learning";
import type { LearningStore } from "../types/storage";
import type { ReminderSnapshot } from "../types/push";
import { createDailyTaskPlan, getRemainingTasks } from "./dailyTasks";

export function createReminderSnapshot(
  phrases: Phrase[],
  lessons: DailyLesson[],
  store: LearningStore,
  now = new Date(),
): ReminderSnapshot {
  const plan = createDailyTaskPlan(phrases, lessons, store, now);
  const remaining = getRemainingTasks(plan, store);
  return {
    date: plan.date,
    newPhrases: remaining.newPhraseIds.length,
    reviews: remaining.reviewPhraseIds.length,
    sounds: remaining.sounds.length,
    lessonSize: plan.newPhraseIds.length,
    lessonCompleted: store.completedLessons.includes(plan.date),
    reviewDueDates: phrases.flatMap((phrase) => {
      const dueAt = store.progress[phrase.id]?.dueAt;
      return dueAt ? [dueAt] : [];
    }),
    dailySoundCount: plan.sounds.length,
  };
}
