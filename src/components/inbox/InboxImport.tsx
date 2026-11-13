import { useState } from "react";
import { parseInboxImport } from "../../utils/learningInbox";
import { INBOX_CARD_INSTRUCTIONS } from "../../constants/inboxInstructions";
import type { InboxReply } from "../../types/learningInbox";

export function InboxImport({
  onImport,
  disabled,
}: {
  onImport: (reply: InboxReply) => string | null | undefined;
  disabled: boolean;
}) {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<InboxReply>();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  function inspect(value: string) {
    setPreview(undefined);
    setError("");
    setMessage("");
    try {
      setPreview(parseInboxImport(value));
    } catch (issue) {
      setError((issue as Error).message);
    }
  }
  return (
    <details className="inbox-import">
      <summary>
        Bring learning cards from ChatGPT — no coach connection needed
      </summary>
      <p>
        Use these instructions in your chat with the questions you want to keep.
        Paste the returned JSON here, or choose its saved file. Review the cards
        before importing.
      </p>
      <details>
        <summary>Card preparation instructions</summary>
        <textarea
          aria-label="Card preparation instructions"
          readOnly
          rows={8}
          value={INBOX_CARD_INSTRUCTIONS}
        />
      </details>
      <label>
        Learning-card JSON
        <textarea
          rows={5}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setPreview(undefined);
          }}
          maxLength={100000}
        />
      </label>
      <div className="button-row">
        <button
          className="secondary-button"
          disabled={disabled || !text.trim()}
          onClick={() => inspect(text)}
        >
          Preview cards
        </button>
        <label className="secondary-button file-button">
          Choose card file
          <input
            type="file"
            accept=".json,application/json"
            disabled={disabled}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              setPreview(undefined);
              setError("");
              if (file.size > 100000) {
                setError("Choose a card file smaller than 100 KB.");
                return;
              }
              try {
                const value = await file.text();
                setText(value);
                inspect(value);
              } catch {
                setError(
                  "That file could not be opened. Please choose it again.",
                );
              }
            }}
          />
        </label>
      </div>
      {preview && (
        <section className="notice" aria-label="Import preview">
          <p>
            {preview.cards.length} cards · {preview.pending.length} need
            clarification. Check that examples contain no private details.
          </p>
          {preview.cards.map((card, i) => (
            <details key={i}>
              <summary>{card.expression}</summary>
              <p>{card.meaning}</p>
              <p>{card.example}</p>
              <p>
                {card.register} {card.note}
              </p>
              {card.scenarios.map((s, j) => (
                <p key={j}>
                  {s.setting}: {s.prompt}
                  <br />
                  {s.sample}
                </p>
              ))}
            </details>
          ))}
          {preview.pending.map((p, i) => (
            <p key={i}>
              {p.text}: {p.reason}
            </p>
          ))}
          <button
            className="primary-button"
            disabled={disabled}
            onClick={() => {
              const issue = onImport(preview);
              if (issue) {
                setError(issue);
                return;
              }
              setPreview(undefined);
              setText("");
              setError("");
              setMessage(
                "Imported on this device. Cards are in My Phrases; unresolved meanings stay in your inbox.",
              );
            }}
          >
            Import these cards
          </button>
        </section>
      )}
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
    </details>
  );
}
