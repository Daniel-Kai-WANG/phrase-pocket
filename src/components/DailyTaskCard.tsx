import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import type { DailyLesson, Phrase } from "../types/learning";
import type { LearningStore } from "../types/storage";
import type { DailySoundTask, DailyTaskPlan } from "../types/dailyTasks";
import { createDailyTaskPlan, getRemainingTasks } from "../utils/dailyTasks";
import {
  DEFAULT_REMINDER_PREFERENCES,
  reminderIsDue,
  reminderMessage,
} from "../utils/reminders";

export function DailyTaskCard({
  phrases,
  lessons,
  data,
  today,
  onPlan,
  onPractice,
  onSound,
  onDismiss,
}: {
  phrases: Phrase[];
  lessons: DailyLesson[];
  data: LearningStore;
  today: string;
  onPlan: (plan: DailyTaskPlan) => void;
  onPractice: (phrases: Phrase[], reviewOnly: boolean) => void;
  onSound: (phrase: Phrase, task: DailySoundTask) => void;
  onDismiss: (date: string) => void;
}) {
  const plan = createDailyTaskPlan(phrases, lessons, data);
  const remaining = getRemainingTasks(plan, data);
  const reminderDue = reminderIsDue(
    data.reminderPreferences ?? DEFAULT_REMINDER_PREFERENCES,
    plan.date,
    remaining.total,
    data.reminderDismissedDate,
  );
  const total =
    plan.newPhraseIds.length + plan.reviewPhraseIds.length + plan.sounds.length;
  useEffect(() => {
    onPlan(plan);
  }, [plan, onPlan, today]);
  function continueLearning() {
    const ids = remaining.reviewPhraseIds.length
      ? remaining.reviewPhraseIds
      : remaining.newPhraseIds;
    if (ids.length) {
      onPractice(
        phrases.filter((phrase) => ids.includes(phrase.id)),
        Boolean(remaining.reviewPhraseIds.length),
      );
      return;
    }
    const task = remaining.sounds[0];
    const phrase = phrases.find((item) => item.id === task?.phraseId);
    if (phrase && task) onSound(phrase, task);
  }
  return (
    <section className="daily-task-card" aria-label="Today's remaining tasks">
      <div>
        <p className="eyebrow">TODAY'S LITTLE ADVENTURE</p>
        {reminderDue && (
          <div className="notice" role="status">
            <p>
              Time for a little practice.{" "}
              {reminderMessage({
                newPhrases: remaining.newPhraseIds.length,
                reviews: remaining.reviewPhraseIds.length,
                sounds: remaining.sounds.length,
              })}
            </p>
            <button
              className="text-button"
              onClick={() => onDismiss(plan.date)}
            >
              Dismiss today's reminder
            </button>
          </div>
        )}
        <h2>
          {remaining.total
            ? `${remaining.total} small steps left`
            : total
              ? "Today's trail is complete"
              : "Your next trail is on its way"}
        </h2>
        <p>
          {remaining.newPhraseIds.length} new phrases ·{" "}
          {remaining.reviewPhraseIds.length} reviews · {remaining.sounds.length}{" "}
          sound challenges
        </p>
        <progress
          aria-label="Today's task progress"
          max={total || 1}
          value={total - remaining.total}
        />
        {!plan.newPhraseIds.length && (
          <p className="quiet">Today's new lesson is not available yet.</p>
        )}
        <p className="quiet">
          Today's practice counts separately from long-term mastery.
        </p>
      </div>
      {remaining.total > 0 && (
        <button className="primary-button" onClick={continueLearning}>
          Continue today's trail <ArrowRight size={18} />
        </button>
      )}
    </section>
  );
}
