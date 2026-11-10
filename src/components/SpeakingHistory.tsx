import type { SpeakingRecord } from "../types/speaking";

export function SpeakingHistory({ records }: { records: SpeakingRecord[] }) {
  if (!records.length)
    return (
      <p className="quiet">
        Reviewed takes for this expression will appear here. Speaking practice
        is tracked separately from memory recall.
      </p>
    );
  return (
    <details className="speaking-history">
      <summary>
        {records.length} reviewed {records.length === 1 ? "take" : "takes"} ·
        your speaking notes
      </summary>
      {records
        .slice(-5)
        .reverse()
        .map((record) => (
          <article key={record.id}>
            <p className="eyebrow">
              {new Date(record.at).toLocaleDateString("en-AU")} ·{" "}
              {record.mode.replace("-", " ")}
            </p>
            <p>
              <strong>Your words:</strong> {record.feedback.languageFeedback}
            </p>
            <p>
              <strong>Your delivery:</strong> {record.feedback.audioFeedback}
            </p>
            <p className="hint-box">{record.feedback.retryPrompt}</p>
          </article>
        ))}
    </details>
  );
}
