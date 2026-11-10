import { useId, useState } from "react";
import { Link } from "lucide-react";
import {
  forgetCoachToken,
  hasCoachConnection,
  setCoachToken,
} from "../api/client";

export function CoachConnection({ onSaved }: { onSaved?: () => void }) {
  const inputId = useId();
  const [code, setCode] = useState("");
  const [remember, setRemember] = useState(true);
  const [saved, setSaved] = useState(hasCoachConnection);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  return (
    <section>
      <h3>Your online coach</h3>
      <p className="quiet">
        Use your private coach access code, not an OpenAI API key. Remember it
        on your own device to keep practising after reopening the app. It is not
        included in learning backups.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!code.trim()) return;
          setError("");
          try {
            setCoachToken(code, remember);
            setSaved(true);
            setMessage(
              remember
                ? "Access code saved on this device. Your next practice reply will use it."
                : "Access code saved for this session only. Your next practice reply will use it.",
            );
            setCode("");
            onSaved?.();
          } catch {
            setError(
              "The access code could not be saved. Allow browser storage and try again.",
            );
          }
        }}
      >
        <label htmlFor={inputId}>Coach access code</label>
        <div className="input-button-row">
          <input
            id={inputId}
            type="password"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            autoComplete="off"
          />
          <button className="secondary-button" disabled={!code.trim()}>
            <Link size={17} /> Connect
          </button>
        </div>
        <label className="reminder-toggle">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
          />
          Remember on this device
        </label>
      </form>
      {saved && (
        <button
          className="text-button"
          onClick={() => {
            try {
              forgetCoachToken();
              setSaved(false);
              setError("");
              setMessage(
                "Saved coach access removed. Your learning progress is unchanged.",
              );
            } catch {
              setError(
                "The saved access code could not be removed. Please try again.",
              );
            }
          }}
        >
          Forget saved coach code
        </button>
      )}
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
