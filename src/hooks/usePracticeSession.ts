import { useEffect, useRef, useState } from "react";
import { CoachAccessError, coachRequest } from "../api/client";
import type {
  Assessment,
  HintLevel,
  Phrase,
  RecallAttempt,
} from "../types/learning";
import { buildSession } from "../utils/session";

export function usePracticeSession(
  phrases: Phrase[],
  reviewOnly: boolean | undefined,
  onAttempt: (attempt: RecallAttempt) => void,
  onFinish: () => void,
) {
  const [steps] = useState(() => buildSession(phrases, reviewOnly));
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [hint, setHint] = useState<HintLevel>(0);
  const [tries, setTries] = useState(0);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [error, setError] = useState("");
  const [connectionRequired, setConnectionRequired] = useState(false);
  const [busy, setBusy] = useState(false);
  const request = useRef<AbortController | null>(null);
  const answerRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => () => request.current?.abort(), []);
  const step = steps[index];
  const done = index >= steps.length;
  const scenario = step?.phrase.scenarios[step.phase === "transfer" ? 1 : 0];

  function next() {
    if (index === steps.length - 1) onFinish();
    setIndex(index + 1);
    setAnswer("");
    setHint(0);
    setTries(0);
    setAssessment(null);
    setError("");
    setConnectionRequired(false);
  }

  async function checkAnswer() {
    if (
      !step ||
      !scenario ||
      !answer.trim() ||
      busy ||
      assessment?.meaning === "correct"
    )
      return;
    setBusy(true);
    setError("");
    setConnectionRequired(false);
    setAssessment(null);
    const controller = new AbortController();
    request.current = controller;
    try {
      const result = await coachRequest<Assessment>(
        "assess",
        {
          phrase: step.phrase,
          scenario: scenario.prompt,
          answer: answer.trim(),
          hintLevel: hint,
          attemptNumber: tries + 1,
        },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      setAssessment(result);
      if (result.meaning !== "uncertain") {
        onAttempt({
          id: crypto.randomUUID(),
          phraseId: step.phrase.id,
          at: new Date().toISOString(),
          hintLevel: hint,
          firstTry: tries === 0,
          assessment: result,
          mode: "written",
        });
        setTries(tries + 1);
      }
    } catch (issue) {
      if (!controller.signal.aborted) {
        setError(issue instanceof Error ? issue.message : "Please try again.");
        setConnectionRequired(issue instanceof CoachAccessError);
      }
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  function revisitLater() {
    onAttempt({
      id: crypto.randomUUID(),
      phraseId: step.phrase.id,
      at: new Date().toISOString(),
      hintLevel: 3,
      firstTry: false,
      mode: "written",
      assessment: {
        meaning: "incorrect",
        targetUsed: false,
        naturalness: "understandable",
        feedback: "You chose to practise this phrase again later.",
        nextHint: "",
      },
    });
    next();
  }

  return {
    steps,
    index,
    answer,
    setAnswer,
    hint,
    setHint,
    assessment,
    error,
    connectionRequired,
    setError,
    busy,
    answerRef,
    step,
    done,
    scenario,
    next,
    checkAnswer,
    revisitLater,
  };
}
