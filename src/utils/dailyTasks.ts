import type { DailyLesson, Phrase } from "../types/learning";
import type {
  DailySoundTask,
  DailyTaskPlan,
  RemainingTasks,
} from "../types/dailyTasks";
import type { LearningStore } from "../types/storage";
import { learningDay } from "./dates";
import { getSoundTargets, SOUND_MODES } from "./phonetics";
import { getDuePhrases } from "./review";

export const DAILY_REVIEW_LIMIT = 6;
export const DAILY_SOUND_LIMIT = 3;
export const DEFAULT_REMINDER_TIME = "20:00";

export function createDailyTaskPlan(
  phrases: Phrase[],
  lessons: DailyLesson[],
  store: LearningStore,
  now = new Date(),
): DailyTaskPlan {
  const date = learningDay(now);
  const newPhraseIds =
    lessons.find((lesson) => lesson.date === date)?.phraseIds ?? [];
  const existing = store.dailyTaskPlan;
  if (existing?.date === date) {
    if (existing.newPhraseIds.length || !newPhraseIds.length) return existing;
    return { ...existing, newPhraseIds };
  }
  const reviewPhraseIds = getDuePhrases(phrases, store.progress, now)
    .filter((phrase) => !newPhraseIds.includes(phrase.id))
    .slice(0, DAILY_REVIEW_LIMIT)
    .map((phrase) => phrase.id);
  const seen = new Set<string>();
  const candidates = phrases.flatMap((phrase) =>
    getSoundTargets(phrase).flatMap((target) => {
      if (seen.has(target.word)) return [];
      seen.add(target.word);
      return SOUND_MODES.map((mode): DailySoundTask => ({
        phraseId: phrase.id,
        word: target.word,
        mode,
      }));
    }),
  );
  const attempts = store.soundAttempts ?? [];
  const lastAttempt = (task: DailySoundTask) =>
    attempts
      .filter(
        (attempt) => attempt.word === task.word && attempt.mode === task.mode,
      )
      .at(-1);
  candidates.sort((a, b) => {
    const first = lastAttempt(a);
    const second = lastAttempt(b);
    const priority = (value: typeof first) =>
      value && !value.correct ? 0 : value ? 2 : 1;
    return (
      priority(first) - priority(second) ||
      (first?.at ?? "").localeCompare(second?.at ?? "")
    );
  });
  return {
    date,
    newPhraseIds,
    reviewPhraseIds,
    sounds: candidates.slice(0, DAILY_SOUND_LIMIT),
  };
}

export function getRemainingTasks(
  plan: DailyTaskPlan,
  store: LearningStore,
): RemainingTasks {
  const completed = (id: string) =>
    store.progress[id]?.attempts.some(
      (attempt) =>
        learningDay(attempt.at) === plan.date &&
        attempt.assessment.meaning === "correct" &&
        attempt.assessment.targetUsed,
    );
  const newPhraseIds = store.completedLessons.includes(plan.date)
    ? []
    : plan.newPhraseIds.filter((id) => !completed(id));
  const reviewPhraseIds = plan.reviewPhraseIds.filter((id) => !completed(id));
  const sounds = plan.sounds.filter(
    (task) =>
      !(store.soundAttempts ?? []).some(
        (attempt) =>
          attempt.word === task.word &&
          attempt.mode === task.mode &&
          learningDay(attempt.at) === plan.date &&
          attempt.correct,
      ),
  );
  return {
    newPhraseIds,
    reviewPhraseIds,
    sounds,
    total: newPhraseIds.length + reviewPhraseIds.length + sounds.length,
  };
}
