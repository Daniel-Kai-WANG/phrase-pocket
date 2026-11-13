import type { InboxEntry } from "../../types/learningInbox";

export function InboxEntries({
  entries,
  busy,
  onPrepare,
  onClarify,
}: {
  entries: InboxEntry[];
  busy: string;
  onPrepare: (entry: InboxEntry) => void;
  onClarify: (entry: InboxEntry) => void;
}) {
  return (
    <section aria-label="Saved questions">
      <h3>Your saved questions</h3>
      {!entries.length && (
        <p className="quiet">
          No questions saved yet. Start above, or import a card file.
        </p>
      )}
      {[...entries].reverse().map((entry) => (
        <article className="inbox-entry paper" key={entry.id}>
          <p className="quiet">
            {new Date(entry.createdAt).toLocaleDateString("en-AU")} ·{" "}
            {entry.reply
              ? "Processed on this device"
              : "Saved · awaiting preparation"}
          </p>
          <details>
            <summary>
              {entry.text.length > 100
                ? `${entry.text.slice(0, 100)}…`
                : entry.text}
            </summary>
            <p className="inbox-source">{entry.text}</p>
          </details>
          {!entry.reply && (
            <button
              className="secondary-button"
              disabled={Boolean(busy)}
              onClick={() => onPrepare(entry)}
            >
              {busy === entry.id ? "Preparing…" : "Prepare cards"}
            </button>
          )}
          {entry.reply && (
            <>
              <p className="inbox-source">{entry.reply.explanation}</p>
              {entry.reply.cards.map((card, i) => (
                <details key={i}>
                  <summary>{card.expression}</summary>
                  <p>{card.meaning}</p>
                  <p>{card.example}</p>
                  <p className="quiet">
                    {card.register} {card.note}
                  </p>
                </details>
              ))}
              {entry.reply.pending.map((item, i) => (
                <p key={i} className="notice">
                  <strong>Needs context: {item.text}</strong>
                  <br />
                  {item.reason}
                </p>
              ))}
              {entry.reply.pending.length > 0 && (
                <button
                  className="text-button"
                  onClick={() => {
                    onClarify(entry);
                  }}
                >
                  Add context in a new question
                </button>
              )}
              <p className="quiet">
                {entry.phraseIds.length} linked learning cards. Open My Phrases
                to practise.
              </p>
            </>
          )}
        </article>
      ))}
    </section>
  );
}
