import {
  RETRY_DELAY_MINUTES,
  REVIEW_INTERVAL_DAYS,
} from "../constants/learning";
import type {
  Phrase,
  PhraseProgress,
  ProgressMap,
  RecallAttempt,
} from "../types/learning";
import { addDays, daysBetween, learningDay } from "./dates";

export function recordRecall(
  previous: PhraseProgress | undefined,
  attempt: RecallAttempt,
): PhraseProgress | undefined {
  if (previous?.attempts.some((item) => item.id === attempt.id))
    return previous;
  if (attempt.assessment.meaning === "uncertain") return previous;
  const day = learningDay(attempt.at);
  const independent =
    attempt.assessment.meaning === "correct" &&
    attempt.assessment.targetUsed &&
    attempt.hintLevel === 0 &&
    attempt.firstTry;
  const recallDays = previous?.recallDays ?? [];
  const newRecallDay = independent && !recallDays.includes(day);
  const nextDays = newRecallDay ? [...recallDays, day].sort() : recallDays;
  const advancedToday = previous?.attempts.some(
    (item) =>
      learningDay(item.at) === day &&
      item.assessment.meaning === "correct" &&
      item.assessment.targetUsed &&
      item.hintLevel === 0 &&
      item.firstTry,
  );
  const stage = independent
    ? Math.min(
        (previous?.stage ?? 0) + (advancedToday ? 0 : 1),
        REVIEW_INTERVAL_DAYS.length,
      )
    : 0;
  const remembered =
    stage >= 3 && nextDays.length >= 3 && daysBetween(nextDays[0], day) >= 7;
  const dueAt = independent
    ? advancedToday && previous
      ? previous.dueAt
      : addDays(attempt.at, REVIEW_INTERVAL_DAYS[Math.max(stage - 1, 0)])
    : new Date(
        Date.parse(attempt.at) + RETRY_DELAY_MINUTES * 60_000,
      ).toISOString();
  return {
    state: independent ? (remembered ? "remembered" : "recalling") : "learning",
    stage,
    dueAt,
    lastAttemptAt: attempt.at,
    recallDays: nextDays,
    attempts: [...(previous?.attempts ?? []), attempt],
  };
}

export function getDuePhrases(
  phrases: Phrase[],
  progress: ProgressMap,
  now = new Date(),
): Phrase[] {
  return phrases
    .filter(
      (phrase) =>
        progress[phrase.id] &&
        Date.parse(progress[phrase.id].dueAt) <= now.getTime(),
    )
    .sort(
      (a, b) =>
        Date.parse(progress[a.id].dueAt) - Date.parse(progress[b.id].dueAt),
    );
}

export function getMemorySummary(phrases: Phrase[], progress: ProgressMap) {
  const counts = { new: 0, learning: 0, recalling: 0, remembered: 0 };
  for (const phrase of phrases)
    counts[progress[phrase.id]?.state ?? "new"] += 1;
  return counts;
}

export function getPracticeQueue(
  phrases: Phrase[],
  progress: ProgressMap,
  limit = 3,
): Phrase[] {
  const due = getDuePhrases(phrases, progress);
  const fresh = phrases.filter((phrase) => !progress[phrase.id]);
  return [...due, ...fresh].slice(0, limit);
}
