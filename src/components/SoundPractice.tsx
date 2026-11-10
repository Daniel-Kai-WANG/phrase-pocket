import { useState } from "react";
import type { Phrase } from "../types/learning";
import type { SoundAttempt, SoundMode } from "../types/phonetics";
import {
  getSoundSummary,
  getSoundTargets,
  SOUND_MODES,
} from "../utils/phonetics";
import { learningDay } from "../utils/dates";
import { Modal } from "./Modal";
import { SoundChallenge } from "./SoundChallenge";
import type { DailySoundTask } from "../types/dailyTasks";

const LABELS = {
  decode: "IPA → word",
  build: "Word → IPA",
  repair: "Sound repair",
};

export function SoundPractice({
  phrase,
  attempts,
  onAttempt,
  onClose,
  initialTask,
}: {
  phrase: Phrase;
  attempts: SoundAttempt[];
  onAttempt: (attempt: SoundAttempt) => void;
  onClose: () => void;
  initialTask?: DailySoundTask;
}) {
  const targets = getSoundTargets(phrase);
  const [wordIndex, setWordIndex] = useState(
    Math.max(
      0,
      targets.findIndex((word) => word.word === initialTask?.word),
    ),
  );
  const [mode, setMode] = useState<SoundMode>(initialTask?.mode ?? "decode");
  const [round, setRound] = useState(0);
  const word = targets[wordIndex];
  return (
    <Modal title="Sound adventure" onClose={onClose}>
      <div className="practice-body">
        <div className="mode-tabs" aria-label="Sound challenge mode">
          {SOUND_MODES.map((item) => (
            <button
              key={item}
              aria-pressed={item === mode}
              onClick={() => {
                setMode(item);
                setRound((value) => value + 1);
              }}
            >
              {LABELS[item]}
            </button>
          ))}
        </div>
        {!word ? (
          <p className="notice">
            A dictionary-checked sound challenge is not available for this
            expression yet. You can still practise its meaning or speaking
            scene.
          </p>
        ) : (
          <>
            {targets.length > 1 && (
              <div className="button-row" aria-label="Choose a target word">
                {targets.map((item, index) => (
                  <button
                    key={item.word}
                    className="secondary-button"
                    aria-pressed={index === wordIndex}
                    onClick={() => {
                      setWordIndex(index);
                      setRound((value) => value + 1);
                    }}
                  >
                    Target {index + 1}
                  </button>
                ))}
              </div>
            )}
            <SoundChallenge
              key={`${word.word}-${mode}-${round}`}
              phrase={phrase}
              word={word}
              mode={mode}
              transfer={round > 0}
              independent={
                !attempts.some(
                  (attempt) =>
                    attempt.word === word.word &&
                    attempt.mode === mode &&
                    learningDay(attempt.at) === learningDay(),
                )
              }
              onAttempt={onAttempt}
              onNext={() => {
                const nextMode = SOUND_MODES.indexOf(mode) + 1;
                setMode(SOUND_MODES[nextMode % SOUND_MODES.length]);
                if (nextMode === SOUND_MODES.length)
                  setWordIndex((wordIndex + 1) % targets.length);
                setRound((value) => value + 1);
              }}
            />
            <details className="speaking-history">
              <summary>Your sound trail</summary>
              {getSoundSummary(attempts, word.word).map((item) => (
                <p key={item.mode}>
                  {LABELS[item.mode]}: {item.days} independent recall{" "}
                  {item.days === 1 ? "day" : "days"}
                  {item.needsReview ? " · Review this" : ""}
                </p>
              ))}
              <p className="quiet">
                Sound recall is separate from meaning and spoken pronunciation.
              </p>
            </details>
          </>
        )}
      </div>
    </Modal>
  );
}
