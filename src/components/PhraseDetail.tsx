import { ArrowRight, Volume2 } from "lucide-react";
import { useState } from "react";
import type { Phrase, PhraseProgress } from "../types/learning";
import { MEMORY_LABELS } from "../constants/learning";
import { speak } from "../utils/speech";
import { Modal } from "./Modal";

export function PhraseDetail({
  phrase,
  progress,
  onClose,
  onPractise,
  onSpeak,
  onSound,
}: {
  phrase: Phrase;
  progress?: PhraseProgress;
  onClose: () => void;
  onPractise: () => void;
  onSpeak: () => void;
  onSound: () => void;
}) {
  const [error, setError] = useState("");
  return (
    <Modal title={phrase.expression} onClose={onClose}>
      <div className="detail-body">
        <span className={`status state-${progress?.state ?? "new"}`}>
          {MEMORY_LABELS[progress?.state ?? "new"]}
        </span>
        <p className="study-meaning">{phrase.meaning}</p>
        <blockquote>{phrase.example}</blockquote>
        <button
          className="secondary-button"
          onClick={() => setError(speak(phrase.example) ?? "")}
        >
          <Volume2 size={18} /> Listen
        </button>
        <h3>A note for real life</h3>
        <p>{phrase.note}</p>
        <p className="quiet">{phrase.pronunciation}</p>
        {progress && (
          <p className="session-tip">
            Recalled independently on {progress.recallDays.length} different{" "}
            {progress.recallDays.length === 1 ? "day" : "days"}. Next review:{" "}
            {new Date(progress.dueAt).toLocaleString("en-AU", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
            .
          </p>
        )}
        <div className="button-row">
          <button className="primary-button" onClick={onPractise}>
            Try a scene <ArrowRight size={18} />
          </button>
          <button className="secondary-button" onClick={onSpeak}>
            Say it aloud
          </button>
          <button className="secondary-button" onClick={onSound}>
            Sound challenge
          </button>
        </div>
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
