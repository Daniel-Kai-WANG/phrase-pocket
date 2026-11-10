import { useEffect, useRef, useState } from "react";
import { Mic, Square, Volume2, ArrowRight } from "lucide-react";
import { Modal } from "./Modal";
import type { Phrase } from "../types/learning";
import type {
  SpeakingFeedback,
  SpeakingMode,
  SpeakingRecord,
  SpokenTurn,
} from "../types/speaking";
import { useRecorder } from "../hooks/useRecorder";
import { recordingToWave } from "../utils/audio";
import { speak } from "../utils/speech";
import { coachRequest } from "../api/client";
import { SpeakingHistory } from "./SpeakingHistory";

const modes: Record<SpeakingMode, string> = {
  echo: "Listen & echo",
  "own-words": "Say it your way",
  conversation: "Talk it through",
};

export function SpeakingStudio({
  phrase,
  records,
  onReviewed,
  onClose,
}: {
  phrase: Phrase;
  records: SpeakingRecord[];
  onReviewed: (record: SpeakingRecord) => void;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<SpeakingMode>("echo");
  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);
  const [turns, setTurns] = useState<SpokenTurn[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState<Blob | null>(null);
  const request = useRef<AbortController | null>(null);
  const recorder = useRecorder();
  useEffect(() => () => request.current?.abort(), []);
  const replies = turns.filter((turn) => turn.role === "user").length;

  async function coachTake() {
    if (!recorder.clip || busy) return;
    setBusy(true);
    setError("");
    const controller = new AbortController();
    request.current = controller;
    try {
      const audio = await recordingToWave(recorder.clip);
      if (controller.signal.aborted) return;
      const result = await coachRequest<SpeakingFeedback>(
        "speaking",
        { audio, mode, phrase, turns },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      setFeedback(result);
      setSubmitted(recorder.clip);
      if (result.audioUsable)
        onReviewed({
          id: crypto.randomUUID(),
          phraseId: phrase.id,
          at: new Date().toISOString(),
          mode,
          feedback: result,
        });
      if (result.audioUsable && mode === "conversation")
        setTurns([
          ...turns,
          { role: "user", text: result.transcript },
          { role: "assistant", text: result.reply },
        ]);
    } catch (issue) {
      if (!controller.signal.aborted)
        setError(
          issue instanceof Error
            ? issue.message
            : "This take could not be checked.",
        );
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  return (
    <Modal title="A little speaking room" onClose={onClose}>
      <div className="speaking-body">
        <SpeakingHistory records={records} />
        <div className="mode-tabs" role="group" aria-label="Speaking mode">
          {Object.entries(modes).map(([value, label]) => (
            <button
              key={value}
              aria-pressed={mode === value}
              disabled={busy || recorder.recording || recorder.requesting}
              onClick={() => {
                setMode(value as SpeakingMode);
                setFeedback(null);
                setTurns([]);
                recorder.clear();
                setSubmitted(null);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {mode === "echo" ? (
          <>
            <p className="eyebrow">LISTEN. NOTICE. MAKE IT YOURS.</p>
            <blockquote>{phrase.example}</blockquote>
            <button
              className="secondary-button"
              onClick={() => setError(speak(phrase.example) ?? "")}
            >
              <Volume2 size={18} /> Play the example
            </button>
            <p className="quiet">
              Copy the rhythm once. Then say it as if you meant it.
            </p>
          </>
        ) : (
          <div className="scenario">
            <p className="eyebrow">
              {mode === "conversation"
                ? `A SHORT CONVERSATION · ${Math.min(replies + 1, 3)} / 3`
                : "NO SCRIPT THIS TIME"}
            </p>
            <h3>{phrase.scenarios[1].prompt}</h3>
            <p className="quiet">
              {mode === "conversation"
                ? "Start the conversation. Pip will reply after each take."
                : "Respond naturally, using the expression you have been practising."}
            </p>
          </div>
        )}
        {turns.length > 0 && (
          <div className="conversation-log" aria-label="Conversation">
            {turns.map((turn, index) => (
              <div key={index} className={`speech-bubble ${turn.role}`}>
                <strong>{turn.role === "user" ? "You" : "Pip"}</strong>
                <p>{turn.text}</p>
                {turn.role === "assistant" && (
                  <button
                    className="icon-button"
                    aria-label="Listen to Pip’s reply"
                    onClick={() => setError(speak(turn.text) ?? "")}
                  >
                    <Volume2 size={17} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        {mode !== "conversation" || replies < 3 ? (
          <div className="record-panel">
            <button
              className={`record-button ${recorder.recording ? "recording" : ""}`}
              disabled={busy || recorder.requesting}
              onClick={() =>
                recorder.recording ? recorder.stop() : void recorder.start()
              }
            >
              {recorder.recording ? <Square size={23} /> : <Mic size={25} />}
              <span>
                {recorder.requesting
                  ? "Opening microphone…"
                  : recorder.recording
                    ? `Stop · ${recorder.seconds}s`
                    : recorder.clip
                      ? "Record another take"
                      : "Record a take"}
              </span>
            </button>
            <p className="quiet">
              Up to 45 seconds. Recording stops when you close this room.
            </p>
          </div>
        ) : (
          <div className="notice">
            Conversation complete. Read your feedback, then try the difficult
            part once more in “Say it your way”.
          </div>
        )}
        {recorder.url && (
          <div className="recorded-take">
            <label htmlFor="recorded-audio">Your take</label>
            <audio id="recorded-audio" controls src={recorder.url} />
            <button
              className="primary-button"
              disabled={busy || submitted === recorder.clip}
              onClick={coachTake}
            >
              {busy
                ? "Listening carefully…"
                : submitted === recorder.clip
                  ? "Take reviewed"
                  : mode === "conversation"
                    ? "Send my reply"
                    : "Coach this take"}
              <ArrowRight size={17} />
            </button>
            <p className="quiet">
              Sends this recording to your online coach for transcription and
              listening feedback.
            </p>
          </div>
        )}
        {feedback && (
          <div className="speaking-feedback" role="status">
            <h3>
              {feedback.audioUsable
                ? "One small improvement at a time."
                : "Let’s try a clearer recording."}
            </h3>
            <p>
              <strong>Heard:</strong>{" "}
              {feedback.transcript || "No reliable transcript."}
            </p>
            <h4>Your words</h4>
            <p>{feedback.languageFeedback}</p>
            <h4>Your delivery</h4>
            <p>{feedback.audioFeedback}</p>
            <div className="hint-box">{feedback.retryPrompt}</div>
            <p className="quiet">
              Delivery feedback comes from the recording. It is guidance, not a
              pronunciation score.
            </p>
          </div>
        )}
        {(error || recorder.error) && (
          <p className="error-message" role="alert">
            {error || recorder.error}
          </p>
        )}
      </div>
    </Modal>
  );
}
