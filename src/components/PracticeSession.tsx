import { ArrowRight, Lightbulb } from "lucide-react";
import { useEffect, useRef } from "react";
import type { HintLevel, Phrase, RecallAttempt } from "../types/learning";
import { usePracticeSession } from "../hooks/usePracticeSession";
import { Companion } from "./Companion";
import { DiscoverPhrase } from "./DiscoverPhrase";
import { GuidedPhrase } from "./GuidedPhrase";
import { PracticePicture } from "./PracticePicture";
import { Modal } from "./Modal";
import { CoachConnection } from "./CoachConnection";

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
  } = usePracticeSession(phrases, reviewOnly, onAttempt, onFinish);

  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bodyRef.current?.closest("dialog")?.scrollTo({ top: 0 });
    bodyRef.current?.focus({ preventScroll: true });
  }, [index]);
  const phraseNumber = done
    ? phrases.length
    : phrases.findIndex((phrase) => phrase.id === step.phrase.id) + 1;

  return (
    <Modal
      title={
        done
          ? "A little more in your pocket."
          : reviewOnly
            ? "A quick revisit"
            : "One little scene at a time"
      }
      onClose={onClose}
    >
      {done ? (
        <div className="session-finish">
          <Companion celebrate />
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
        <div
          className="practice-body mini-practice"
          data-scene={step.phrase.theme}
          ref={bodyRef}
          tabIndex={-1}
          aria-label={`Expression ${phraseNumber} of ${phrases.length}`}
        >
          <div className="mini-progress">
            <span>
              {step.phase === "learn" || step.phase === "guided"
                ? "Learn a little"
                : "Your turn"}
            </span>
            <span>
              Expression {phraseNumber} of {phrases.length}
            </span>
          </div>
          {step.phase === "learn" ? (
            <DiscoverPhrase
              key={index}
              phrase={step.phrase}
              onNext={next}
              onError={setError}
            />
          ) : step.phase === "guided" ? (
            <GuidedPhrase
              key={index}
              phrase={step.phrase}
              onNext={next}
              onError={setError}
              isLast={phraseNumber === phrases.length}
            />
          ) : (
            <>
              <PracticePicture
                theme={step.phrase.theme}
                success={assessment?.meaning === "correct"}
              />
              <div className="scenario">
                <span className="mini-caption">A NEW SITUATION</span>
                <h3>{scenario.prompt}</h3>
              </div>
              <label htmlFor="recall-answer">What would you say?</label>
              <textarea
                ref={answerRef}
                id="recall-answer"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="Your words, in English…"
                rows={2}
                maxLength={1200}
                disabled={busy || assessment?.meaning === "correct"}
              />
              <div className="answer-tools">
                <button
                  className="text-button"
                  disabled={
                    busy || hint === 3 || assessment?.meaning === "correct"
                  }
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
              {assessment?.meaning !== "correct" && (
                <button
                  className="text-button revisit-button"
                  disabled={busy}
                  onClick={revisitLater}
                >
                  Keep this one for another try
                </button>
              )}
            </>
          )}
          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}
          {connectionRequired && (
            <CoachConnection onSaved={() => setError("")} />
          )}
        </div>
      )}
    </Modal>
  );
}
