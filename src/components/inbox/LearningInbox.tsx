import { useEffect, useRef, useState } from "react";
import type { Phrase } from "../../types/learning";
import type {
  InboxEntry,
  InboxReply,
  LearningInbox as InboxData,
} from "../../types/learningInbox";
import { EMPTY_INBOX } from "../../utils/learningInbox";
import { prepareLearningCards } from "../../api/learningInbox";
import { Modal } from "../Modal";
import { CoachConnection } from "../CoachConnection";
import { InboxImport } from "./InboxImport";
import { InboxEntries } from "./InboxEntries";

export function LearningInbox({
  data = EMPTY_INBOX,
  phrases,
  onSave,
  onComplete,
  onImport,
  onClose,
}: {
  data?: InboxData;
  phrases: Phrase[];
  onSave: (entry: InboxEntry) => string | null | undefined;
  onComplete: (
    id: string,
    reply: InboxReply,
    published: Phrase[],
  ) => string | null | undefined;
  onImport: (
    entry: InboxEntry,
    reply: InboxReply,
    published: Phrase[],
  ) => string | null | undefined;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<InboxEntry["mode"]>("question");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);

  function createEntry(value: string, kind = mode): InboxEntry {
    return {
      id: crypto.randomUUID(),
      text: value.trim(),
      mode: kind,
      createdAt: new Date().toISOString(),
      phraseIds: [],
    };
  }
  async function prepare(entry: InboxEntry) {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(entry.id);
    setError("");
    setMessage("");
    try {
      const reply = await prepareLearningCards(entry, controller.signal);
      if (controller.signal.aborted) return;
      const issue = onComplete(entry.id, reply, phrases);
      if (issue) throw new Error(issue);
      setMessage(
        reply.cards.length
          ? "Learning cards saved in My Phrases. Matching cards are reused; your progress is kept."
          : "Saved the explanation. Add the requested context before preparing more cards.",
      );
    } catch (issue) {
      if (!controller.signal.aborted)
        setError(
          `${(issue as Error).message} Your saved question is still in this inbox.`,
        );
    } finally {
      if (!controller.signal.aborted) setBusy("");
      request.current = null;
    }
  }
  return (
    <Modal title="Learning inbox" onClose={onClose} wide>
      <div className="settings-body learning-inbox">
        <p>
          Keep a word, sentence or question. Paste a conversation here when
          automatic chat updates are unavailable.
        </p>
        <p className="quiet">
          Saved on this device and included in Pocket backups. Preparing cards
          sends the selected text to your online coach. Nothing here is
          published to the shared feed. This inbox does not monitor ChatGPT or
          sync between devices.
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (busy || !text.trim()) return;
            const entry = createEntry(text);
            const issue = onSave(entry);
            if (issue) {
              setError(issue);
              return;
            }
            setText("");
            setError("");
            setMessage(
              "Saved on this device. Choose Prepare cards when you are ready.",
            );
          }}
        >
          <label>
            What are you saving?
            <select
              value={mode}
              disabled={Boolean(busy)}
              onChange={(e) => setMode(e.target.value as InboxEntry["mode"])}
            >
              <option value="question">An English question</option>
              <option value="conversation">A pasted chat exchange</option>
            </select>
          </label>
          <label>
            Your question or chat
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              maxLength={12000}
              required
              placeholder="Ask in Chinese or English, or paste the question and its answer…"
            />
          </label>
          <button
            className="primary-button"
            disabled={Boolean(busy) || !text.trim()}
          >
            Save to inbox
          </button>
        </form>
        {busy && (
          <p role="status" className="notice">
            Preparing English explanations and practice cards… You can close
            this window; your question will stay saved.
          </p>
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
        <InboxImport
          disabled={Boolean(busy)}
          onImport={(reply) => {
            const entry = createEntry(
              "Imported learning cards",
              "conversation",
            );
            return onImport(entry, reply, phrases);
          }}
        />
        <InboxEntries
          entries={data.entries}
          busy={busy}
          onPrepare={(entry) => void prepare(entry)}
          onClarify={(entry) => {
            setMode(entry.mode);
            setText(`${entry.text}\n\nClarification: `);
          }}
        />
        <details>
          <summary>Connect the online coach</summary>
          <CoachConnection />
        </details>
      </div>
    </Modal>
  );
}
