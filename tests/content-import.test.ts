import { expect, it } from "vitest";
import { importSourceBatch } from "../server/content-import";
import { initialFeed } from "../src/data/initialFeed";
import { SOUND_WORDS } from "../src/data/soundWords";
import { getSoundTargets } from "../src/utils/phonetics";

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

it("publishes reviewed sound targets with their source and preserves the expression identity", () => {
  const phrase = {
    ...batch().phrases[0],
    expression: "In vain",
    example: "We tried in vain.",
    soundTargets: [SOUND_WORDS[0]],
  };
  const next = importSourceBatch(initialFeed, {
    ...batch(),
    phrases: [phrase],
  });
  expect(next.phrases[0].id).toBe(phrase.id);
  expect(next.phrases[0].soundTargets).toEqual(phrase.soundTargets);
  expect(getSoundTargets(next.phrases[0])[0].word).toBe("vain");
  expect(next.lessons).toEqual(initialFeed.lessons);
});

it("rejects inconsistent or untranslated imported sound exercises", () => {
  const withTarget = (target: (typeof SOUND_WORDS)[number]) => ({
    ...batch(),
    phrases: [{ ...batch().phrases[0], soundTargets: [target] }],
  });
  expect(() =>
    importSourceBatch(
      initialFeed,
      withTarget({ ...SOUND_WORDS[0], accepted: ["wrong"] }),
    ),
  ).toThrow();
  expect(() =>
    importSourceBatch(
      initialFeed,
      withTarget({ ...SOUND_WORDS[0], hint: "中文解释" }),
    ),
  ).toThrow("English");
  expect(() =>
    importSourceBatch(
      initialFeed,
      withTarget({ ...SOUND_WORDS[0], sourceUrl: "javascript:alert(1)" }),
    ),
  ).toThrow();
});

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
