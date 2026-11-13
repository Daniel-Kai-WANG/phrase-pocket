import { RefreshCw } from "lucide-react";
import type { ContentFeed } from "../types/contentFeed";

function checkedLabel(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("en-AU", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Australia/Brisbane",
      }).format(new Date(value))
    : "Not connected yet";
}

export function ContentSync({
  feed,
  busy,
  error,
  checkedAt,
  onSync,
}: {
  feed: ContentFeed;
  busy: boolean;
  error: string;
  checkedAt: string | null;
  onSync: () => void;
}) {
  return (
    <section>
      <h3>A growing pocket</h3>
      <p>
        Check for newly published expressions. Your memories and completed
        scenes stay with you.
      </p>
      <p className="quiet">
        Personal conversation checked: {checkedLabel(feed.personalCheckedAt)}
        <br />
        Daily source checked: {checkedLabel(feed.dailyCheckedAt)}
      </p>
      <p className="quiet">
        {feed.sourceSyncMode === "scheduled"
          ? "Conversation updates arrive through your desktop sync."
          : "Automatic conversation updates are not connected yet."}{" "}
        Sync now checks published pages; it does not read your private chat
        directly. If a chat update is missing, use Learning inbox in My Phrases
        to save the question or import learning cards on this device.
      </p>
      <button className="secondary-button" disabled={busy} onClick={onSync}>
        <RefreshCw size={17} /> {busy ? "Checking for new pages…" : "Sync now"}
      </button>
      {checkedAt && !error && (
        <p className="quiet" role="status">
          Published pages checked {checkedLabel(checkedAt)} (Brisbane).
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
