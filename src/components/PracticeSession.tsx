import { ArrowRight, Lightbulb, Volume2 } from "lucide-react";
import type { HintLevel, Phrase, RecallAttempt } from "../types/learning";
import { usePracticeSession } from "../hooks/usePracticeSession";
import { speak } from "../utils/speech";
import { Fox } from "./Fox";
import { Modal } from "./Modal";

export function PracticeSession({
  phrases,
  reviewOnly,
  onAttempt,
  onFinish,
  onClose,
}: {
  phrases: Phrase[];
  reviewOnly?: boolean;
  onAttempt: (attempt: RecallAttempt) => void;
  onFinish: () => void;
  onClose: () => void;
}) {
  const {
    steps,
    index,
    answer,
    setAnswer,
    hint,
    setHint,
    assessment,
    error,
    setError,
    busy,
    answerRef,
    step,
    done,
    scenario,
    next,
    checkAnswer,
    revisitLater,
  } = usePracticeSession(phrases, reviewOnly, onAttempt, onFinish);

  return (
    <Modal
      title={
        done
          ? "A little more in your pocket."
          : reviewOnly
            ? "The recall trail"
            : "A conversation quest"
      }
      onClose={onClose}
    >
      {done ? (
        <div className="session-finish">
          <Fox />
          <p className="eyebrow">SCENE VISITED</p>
          <h3>Good practice. Let it settle.</h3>
          <p>
            Your memory trail follows what you recalled, including where you
            needed help. Come back when a review is due.
          </p>
          <button className="primary-button" onClick={onClose}>
            Back to my pocket <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <div className="practice-body">
          <div className="step-label">
            <span>
              {step.phase === "learn"
                ? "01 · Meet the expression"
                : step.phase === "recall"
                  ? "02 · Find it from memory"
                  : "03 · Try it somewhere new"}
            </span>
            <span>
              {index + 1} / {steps.length}
            </span>
          </div>
          <progress
            value={index}
            max={steps.length}
            aria-label="Quest progress"
          />
          {step.phase === "learn" ? (
            <>
              <h3 className="study-expression">{step.phrase.expression}</h3>
              <p className="study-meaning">{step.phrase.meaning}</p>
              <blockquote>{step.phrase.example}</blockquote>
              <p className="quiet">{step.phrase.note}</p>
              <button
                className="secondary-button"
                onClick={() => setError(speak(step.phrase.example) ?? "")}
              >
                <Volume2 size={18} /> Hear it
              </button>
              <div className="session-tip">
                Picture a time you could use this. Say your own example aloud
                before moving on.
              </div>
              <button className="primary-button full-width" onClick={next}>
                Got the idea <ArrowRight size={18} />
              </button>
            </>
          ) : (
            <>
              <div className="scenario">
                <span className="eyebrow">{scenario.setting}</span>
                <h3>{scenario.prompt}</h3>
              </div>
              <label htmlFor="recall-answer">What would you say?</label>
              <textarea
                ref={answerRef}
                id="recall-answer"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="Your words, in English…"
                rows={3}
                maxLength={1200}
                disabled={busy}
              />
              <div className="answer-tools">
                <button
                  className="text-button"
                  disabled={busy || hint === 3}
                  onClick={() => setHint(Math.min(3, hint + 1) as HintLevel)}
                >
                  <Lightbulb size={17} />{" "}
                  {hint === 0
                    ? "A little hint"
                    : hint === 1
                      ? "First letters"
                      : "Show the answer"}
                </button>
                <span className="quiet">No timer. Take your time.</span>
              </div>
              {hint > 0 && (
                <div className="hint-box">
                  {hint === 1
                    ? step.phrase.meaning
                    : hint === 2
                      ? step.phrase.expression
                          .split(" ")
                          .map((word) => word[0] + "…")
                          .join(" ")
                      : scenario.sample}
                </div>
              )}
              {assessment && (
                <div
                  className={`feedback ${assessment.meaning === "correct" ? "positive" : ""}`}
                  role="status"
                >
                  <strong>
                    {assessment.meaning === "correct"
                      ? assessment.targetUsed
                        ? "That fits the moment."
                        : "A good alternative."
                      : assessment.meaning === "uncertain"
                        ? "Let’s check that again."
                        : "You’re working it out."}
                  </strong>
                  <p>{assessment.feedback}</p>
                  {assessment.nextHint && <p>{assessment.nextHint}</p>}
                </div>
              )}
              {assessment?.meaning === "correct" ? (
                <button className="primary-button full-width" onClick={next}>
                  Continue <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  className="primary-button full-width"
                  disabled={!answer.trim() || busy}
                  onClick={checkAnswer}
                >
                  {busy
                    ? "Thinking it through…"
                    : assessment
                      ? "Try again"
                      : "Check my reply"}{" "}
                  <ArrowRight size={18} />
                </button>
              )}
              <button
                className="text-button revisit-button"
                disabled={busy}
                onClick={revisitLater}
              >
                Keep this one for another try
              </button>
            </>
          )}
          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
