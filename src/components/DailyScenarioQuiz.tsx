import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Phrase, RecallAttempt } from "../types/learning";
import { usePracticeSession } from "../hooks/usePracticeSession";
import { buildDailyQuiz } from "../utils/dailyQuiz";
import { Modal } from "./Modal";
import { CoachConnection } from "./CoachConnection";
import { DailyQuizFeedback } from "./DailyQuizFeedback";

export function DailyScenarioQuiz({
  phrases,
  onAttempt,
  onFinish,
  onClose,
}: {
  phrases: Phrase[];
  onAttempt: (attempt: RecallAttempt) => void;
  onFinish: () => void;
  onClose: () => void;
}) {
  const [questions] = useState(() => buildDailyQuiz(phrases));
  const [results, setResults] = useState<Record<number, RecallAttempt>>({});
  const [referenceShown, setReferenceShown] = useState(false);
  const [clueShown, setClueShown] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  const session = usePracticeSession(
    phrases,
    true,
    saveAttempt,
    onFinish,
    questions,
  );
  const question = questions[session.index];
  const correct = session.assessment?.meaning === "correct";
  const outcomes = Object.values(results);
  const independent = outcomes.filter(
    (item) =>
      item.assessment.meaning === "correct" &&
      item.firstTry &&
      item.hintLevel === 0,
  ).length;
  const supported =
    outcomes.filter((item) => item.assessment.meaning === "correct").length -
    independent;

  function saveAttempt(attempt: RecallAttempt) {
    setResults((previous) => ({ ...previous, [session.index]: attempt }));
    if (
      session.index < phrases.length ||
      attempt.assessment.meaning !== "correct"
    )
      onAttempt(attempt);
  }
  useEffect(() => {
    body.current?.closest("dialog")?.scrollTo({ top: 0 });
    body.current?.focus({ preventScroll: true });
  }, [session.index]);

  function next(revisit = false) {
    setReferenceShown(false);
    setClueShown(false);
    if (revisit) session.revisitLater();
    else session.next();
  }

  return (
    <Modal title="Daily Three · Scenario quiz" onClose={onClose}>
      <div className="practice-body daily-quiz" ref={body} tabIndex={-1}>
        {session.done ? (
          <>
            <p className="eyebrow">QUIZ COMPLETE</p>
            <h3>Keep the useful replies. Revisit the difficult ones.</h3>
            <p>
              {independent} independent replies · {supported} supported replies
              · {outcomes.length - independent - supported} to revisit
            </p>
            <p className="quiet">
              These are practice results, not a mastery score. Later rounds
              count as supported practice; long-term recall still needs reviews
              on different days.
            </p>
            <button className="primary-button full-width" onClick={onClose}>
              Back to Daily Three <ArrowRight size={18} />
            </button>
          </>
        ) : (
          <>
            <div className="step-label">
              <span>
                Round {Math.floor(session.index / phrases.length) + 1} of 3
              </span>
              <span>
                Question {session.index + 1} of {questions.length}
              </span>
            </div>
            <progress
              aria-label="Quiz progress"
              max={questions.length}
              value={session.index}
            />
            <p className="eyebrow">{question.round}</p>
            <section className="scenario" aria-label="Conversation situation">
              <p className="quiet">{question.scenario?.setting}</p>
              <h3>{question.scenario?.prompt.split("\n\n")[0]}</h3>
              <p>{question.instruction}</p>
            </section>
            <label htmlFor="daily-reply">How would you reply?</label>
            <textarea
              id="daily-reply"
              value={session.answer}
              onChange={(event) => session.setAnswer(event.target.value)}
              rows={4}
              maxLength={1200}
              disabled={session.busy || correct}
              placeholder="Write what you would actually say…"
            />
            <div className="answer-tools">
              <button
                className="text-button"
                disabled={
                  session.busy || correct || clueShown || referenceShown
                }
                onClick={() => {
                  setClueShown(true);
                  session.setHint(Math.max(1, session.hint) as 1 | 3);
                }}
              >
                Meaning clue
              </button>
              <button
                className="text-button"
                disabled={session.busy || referenceShown}
                onClick={() => {
                  setReferenceShown(true);
                  session.setHint(3);
                }}
              >
                Compare a reference reply
              </button>
            </div>
            <DailyQuizFeedback
              question={question}
              clueShown={clueShown}
              referenceShown={referenceShown}
              extension={session.index >= phrases.length * 2}
              assessment={session.assessment}
            />
            {session.error && (
              <p className="error-message" role="alert">
                {session.error}
              </p>
            )}
            {session.connectionRequired && (
              <CoachConnection onSaved={() => session.setError("")} />
            )}
            {correct ? (
              <button
                className="primary-button full-width"
                onClick={() => next()}
              >
                Next situation <ArrowRight size={18} />
              </button>
            ) : (
              <>
                <button
                  className="primary-button full-width"
                  disabled={session.busy || !session.answer.trim()}
                  onClick={session.checkAnswer}
                >
                  {session.busy ? "Reviewing your reply…" : "Check my reply"}{" "}
                  <ArrowRight size={18} />
                </button>
                <button
                  className="text-button revisit-button"
                  disabled={session.busy}
                  onClick={() => next(true)}
                >
                  Keep this for another try
                </button>
              </>
            )}
            <p className="quiet">
              {session.index < phrases.length
                ? "Start without a model answer. Use a clue if you need one."
                : "A different task with the same expression. This round is supported practice."}{" "}
              Online feedback checks meaning and naturalness, not exact wording.
            </p>
          </>
        )}
      </div>
    </Modal>
  );
}
