import { expect, it } from "vitest";
import { importSourceBatch } from "../server/content-import";
import { initialFeed } from "../src/data/initialFeed";

const checkedAt = "2026-11-09T14:05:07.000Z";
function batch() {
  return {
    source: "personal",
    checkedAt,
    reviewedForPublication: true,
    phrases: [
      {
        ...initialFeed.phrases[0],
        meaning: "Share the cost with another person.",
      },
    ],
    lessons: [],
    pending: [],
    resolvedPendingIds: [],
  };
}

it("imports a reviewed correction under the original memory id and preserves daily history", () => {
  const next = importSourceBatch(initialFeed, batch());
  expect(next.revision).toBe(1);
  expect(next.phrases[0].id).toBe(initialFeed.phrases[0].id);
  expect(next.phrases[0].meaning).toBe(batch().phrases[0].meaning);
  expect(next.lessons).toEqual(initialFeed.lessons);
  expect(next.personalCheckedAt).toBe(checkedAt);
  expect(next.dailyCheckedAt).toBeNull();
  expect(next.sourceSyncMode).toBe("manual");
  expect(importSourceBatch(next, batch())).toBe(next);
});

it("does not publish unreviewed or mixed-source batches", () => {
  expect(() =>
    importSourceBatch(initialFeed, {
      ...batch(),
      reviewedForPublication: false,
    }),
  ).toThrow();
  expect(() =>
    importSourceBatch(initialFeed, {
      ...batch(),
      phrases: [{ ...batch().phrases[0], source: "daily" }],
    }),
  ).toThrow("mixes");
  expect(() =>
    importSourceBatch(initialFeed, {
      ...batch(),
      lessons: initialFeed.lessons,
    }),
  ).toThrow("Personal updates");
});

it("removes source-only fields and rejects personal addresses or Chinese learning copy", () => {
  const next = importSourceBatch(initialFeed, {
    ...batch(),
    rawConversation: "private source material",
  });
  expect(JSON.stringify(next)).not.toContain("private source material");
  expect(() =>
    importSourceBatch(initialFeed, {
      ...batch(),
      phrases: [
        { ...batch().phrases[0], example: "Contact me at person@example.com" },
      ],
    }),
  ).toThrow("email addresses");
  expect(() =>
    importSourceBatch(initialFeed, {
      ...batch(),
      phrases: [{ ...batch().phrases[0], meaning: "中文解释" }],
    }),
  ).toThrow("English");
});

it("resolves only explicitly named pending entries and rejects older source checks", () => {
  const next = importSourceBatch(initialFeed, {
    ...batch(),
    resolvedPendingIds: [initialFeed.pending[0].id],
  });
  expect(next.pending).toHaveLength(initialFeed.pending.length - 1);
  expect(() =>
    importSourceBatch(next, {
      ...batch(),
      checkedAt: "2026-11-08T00:00:00.000Z",
    }),
  ).toThrow("older");
});
