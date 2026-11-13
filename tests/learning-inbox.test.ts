import { expect, it } from "vitest";
import {
  completeInboxEntry,
  parseInboxImport,
} from "../src/utils/learningInbox";
import { emptyStore, parseBackup } from "../src/utils/storage";
import { inboxEntry, inboxReply } from "./fixtures/inbox";

it("imports cards once, keeps pending context, and preserves existing identities", () => {
  const initial = { entries: [inboxEntry], phrases: [] };
  const first = completeInboxEntry(initial, inboxEntry.id, inboxReply, []);
  expect(first.phrases).toHaveLength(1);
  expect(first.entries[0].reply?.pending).toEqual(inboxReply.pending);
  expect(completeInboxEntry(first, inboxEntry.id, inboxReply, [])).toBe(first);
  const next = {
    ...first,
    entries: [...first.entries, { ...inboxEntry, id: "two" }],
  };
  const repeated = completeInboxEntry(next, "two", inboxReply, []);
  expect(repeated.phrases).toEqual(first.phrases);
  expect(repeated.entries[1].phraseIds).toEqual(first.entries[0].phraseIds);
});

it("links an existing published sense without overwriting it and retains distinct meanings", () => {
  const stored = completeInboxEntry(
    { entries: [inboxEntry], phrases: [] },
    inboxEntry.id,
    inboxReply,
    [],
  );
  const published = {
    ...stored.phrases[0],
    id: "stable-id",
    source: "daily" as const,
  };
  const linked = completeInboxEntry(
    { entries: [inboxEntry], phrases: [] },
    inboxEntry.id,
    inboxReply,
    [published],
  );
  expect(linked.phrases).toEqual([]);
  expect(linked.entries[0].phraseIds).toEqual(["stable-id"]);
  expect(published.source).toBe("daily");
  const different = {
    ...inboxReply,
    cards: [{ ...inboxReply.cards[0], meaning: "A different intended sense." }],
  };
  expect(
    completeInboxEntry(
      { entries: [inboxEntry], phrases: [] },
      inboxEntry.id,
      different,
      [published],
    ).phrases,
  ).toHaveLength(1);
});

it("round trips inbox data and progress in backups without changing daily completion", () => {
  const data = {
    ...emptyStore(),
    completedLessons: ["2026-11-13"],
    stamps: ["kept"],
    learningInbox: completeInboxEntry(
      { entries: [inboxEntry], phrases: [] },
      inboxEntry.id,
      inboxReply,
      [],
    ),
  };
  expect(parseBackup(JSON.stringify(data))).toEqual(data);
  expect(
    parseBackup(JSON.stringify(emptyStore())).learningInbox,
  ).toBeUndefined();
});

it("rejects raw exports, missing scenes and non-English cards before import", () => {
  expect(parseInboxImport(JSON.stringify(inboxReply))).toEqual(inboxReply);
  expect(
    parseInboxImport("```json\n" + JSON.stringify(inboxReply) + "\n```"),
  ).toEqual(inboxReply);
  expect(() => parseInboxImport('{"mapping":{}}')).toThrow("incomplete");
  expect(() =>
    parseInboxImport(
      JSON.stringify({
        ...inboxReply,
        cards: [{ ...inboxReply.cards[0], meaning: "安慰" }],
      }),
    ),
  ).toThrow("incomplete");
  expect(() =>
    parseInboxImport(
      JSON.stringify({
        ...inboxReply,
        cards: [{ ...inboxReply.cards[0], scenarios: [] }],
      }),
    ),
  ).toThrow("incomplete");
});
