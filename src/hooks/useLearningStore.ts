import { useRef, useState } from "react";
import type { RecallAttempt } from "../types/learning";
import type { LearningStore } from "../types/storage";
import { loadStore, saveStore } from "../utils/storage";
import { recordRecall } from "../utils/review";
import type { QuestPlan } from "../types/quest";
import type { SpeakingRecord } from "../types/speaking";
import type { SoundAttempt } from "../types/phonetics";
import type { DailyTaskPlan, ReminderPreferences } from "../types/dailyTasks";

export function useLearningStore() {
  const [initial] = useState(() => loadStore(localStorage));
  const [data, setData] = useState(initial.data);
  const current = useRef(data);
  const [error, setError] = useState(initial.error);
  const damaged = useRef(Boolean(initial.error));
  const [recoveryText, setRecoveryText] = useState(initial.recoveryText);

  function persist(next: LearningStore, restoring = false) {
    if (damaged.current && !restoring) return;
    const issue = saveStore(localStorage, next);
    current.current = next;
    setData(next);
    setError(issue);
    if (!issue) {
      damaged.current = false;
      setRecoveryText(null);
    }
    return issue;
  }

  function saveAttempt(attempt: RecallAttempt) {
    const next = recordRecall(
      current.current.progress[attempt.phraseId],
      attempt,
    );
    if (next)
      persist({
        ...current.current,
        progress: { ...current.current.progress, [attempt.phraseId]: next },
      });
  }

  function completeScene(stamp: string, lessonDate?: string) {
    const latest = current.current;
    persist({
      ...latest,
      stamps: [...new Set([...latest.stamps, stamp])],
      completedLessons: lessonDate
        ? [...new Set([...latest.completedLessons, lessonDate])]
        : latest.completedLessons,
    });
  }

  function startQuest(plan: QuestPlan) {
    if (current.current.quests.some((quest) => quest.id === plan.id)) return;
    persist({
      ...current.current,
      quests: [
        ...current.current.quests,
        { ...plan, startedAt: new Date().toISOString(), completedDays: [] },
      ],
    });
  }

  function completeQuestDay(id: string, day: number) {
    persist({
      ...current.current,
      quests: current.current.quests.map((quest) =>
        quest.id === id
          ? {
              ...quest,
              completedDays: [...new Set([...quest.completedDays, day])],
            }
          : quest,
      ),
    });
  }

  function saveSpeaking(record: SpeakingRecord) {
    if (current.current.speaking.some((item) => item.id === record.id)) return;
    persist({
      ...current.current,
      speaking: [...current.current.speaking, record],
    });
  }

  function saveSoundAttempt(attempt: SoundAttempt) {
    const attempts = current.current.soundAttempts ?? [];
    if (attempts.some((item) => item.id === attempt.id)) return;
    persist({ ...current.current, soundAttempts: [...attempts, attempt] });
  }

  return {
    data,
    error,
    recoveryText,
    saveAttempt,
    completeScene,
    startQuest,
    completeQuestDay,
    saveSpeaking,
    saveSoundAttempt,
    saveReminderPreferences: (preferences: ReminderPreferences) =>
      persist({ ...current.current, reminderPreferences: preferences }),
    dismissReminder: (date: string) =>
      persist({ ...current.current, reminderDismissedDate: date }),
    saveDailyTaskPlan: (plan: DailyTaskPlan) => {
      if (
        JSON.stringify(current.current.dailyTaskPlan) !== JSON.stringify(plan)
      )
        persist({ ...current.current, dailyTaskPlan: plan });
    },
    restore: (backup: LearningStore) => persist(backup, true),
  };
}
