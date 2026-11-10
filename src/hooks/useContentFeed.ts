import { useCallback, useEffect, useRef, useState } from "react";
import { fetchContentFeed } from "../api/content";
import { initialFeed } from "../data/initialFeed";
import { mergeContentFeed, parseContentFeed } from "../utils/contentFeed";

const CONTENT_KEY = "phrase-pocket.content.v1";
const SYNC_INTERVAL = 60 * 60 * 1000;

function savedFeed() {
  try {
    const text = localStorage.getItem(CONTENT_KEY);
    return text
      ? mergeContentFeed(initialFeed, parseContentFeed(JSON.parse(text)))
      : initialFeed;
  } catch {
    return initialFeed;
  }
}

export function useContentFeed() {
  const [feed, setFeed] = useState(savedFeed);
  const current = useRef(feed);
  const request = useRef<AbortController | null>(null);
  const lastFetch = useRef(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [checkedAt, setCheckedAt] = useState<string | null>(null);

  const sync = useCallback(async () => {
    if (request.current) return;
    if (!navigator.onLine) {
      setError("You’re offline. Reconnect to check for new pages.");
      return;
    }
    const controller = new AbortController();
    request.current = controller;
    const timeout = setTimeout(() => controller.abort(), 15000);
    setBusy(true);
    setError("");
    try {
      const next = mergeContentFeed(
        current.current,
        await fetchContentFeed(controller.signal),
      );
      if (controller.signal.aborted) return;
      current.current = next;
      setFeed(next);
      setCheckedAt(new Date().toISOString());
      lastFetch.current = Date.now();
      try {
        localStorage.setItem(CONTENT_KEY, JSON.stringify(next));
      } catch {
        setError(
          "New pages are open, but could not be saved offline. Free some browser storage and sync again.",
        );
      }
    } catch (issue) {
      if (request.current === controller)
        setError(
          controller.signal.aborted
            ? "The update took too long. Your saved pages are unchanged."
            : issue instanceof Error
              ? issue.message
              : "Please try syncing again.",
        );
    } finally {
      clearTimeout(timeout);
      if (request.current === controller) {
        request.current = null;
        setBusy(false);
      }
    }
  }, []);

  useEffect(() => {
    const onFocus = () => {
      if (Date.now() - lastFetch.current >= SYNC_INTERVAL) void sync();
    };
    void sync();
    const timer = setInterval(() => void sync(), SYNC_INTERVAL);
    window.addEventListener("online", onFocus);
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("online", onFocus);
      window.removeEventListener("focus", onFocus);
      const controller = request.current;
      request.current = null;
      controller?.abort();
    };
  }, [sync]);

  return { feed, busy, error, checkedAt, sync };
}
