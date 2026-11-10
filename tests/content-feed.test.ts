import { afterEach, expect, it, vi } from "vitest";
import { fetchContentFeed } from "../src/api/content";
import { initialFeed } from "../src/data/initialFeed";
import { mergeContentFeed, parseContentFeed } from "../src/utils/contentFeed";

afterEach(() => vi.unstubAllGlobals());

it("explains a network failure without losing saved content", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
  );
  await expect(fetchContentFeed(new AbortController().signal)).rejects.toThrow(
    "Your saved cards are still here",
  );
});

it("rejects a broken update before existing lessons can change", () => {
  const broken = { ...initialFeed, revision: 1, phrases: [] };
  expect(() => parseContentFeed(broken)).toThrow("three distinct");
  expect(initialFeed.lessons).toHaveLength(8);
});

it("ignores stale feeds and preserves earlier daily pages during incremental updates", () => {
  const current = { ...initialFeed, revision: 4 };
  expect(mergeContentFeed(current, { ...initialFeed, revision: 3 })).toBe(
    current,
  );
  const next = {
    ...initialFeed,
    revision: 5,
    phrases: [],
    lessons: [],
    pending: [],
  };
  const merged = mergeContentFeed(current, next);
  expect(merged.lessons).toEqual(current.lessons);
  expect(merged.phrases).toEqual(current.phrases);
  expect(merged.pending).toEqual([]);
});

it("maps revised source identifiers back to the existing memory id in daily pages", () => {
  const phrase = { ...initialFeed.phrases[0], senseId: "shared-cost" };
  const current = {
    ...initialFeed,
    phrases: [phrase, ...initialFeed.phrases.slice(1)],
    lessons: [
      {
        ...initialFeed.lessons[0],
        phraseIds: [
          phrase.id,
          initialFeed.phrases[1].id,
          initialFeed.phrases[2].id,
        ],
      },
      ...initialFeed.lessons.slice(1),
    ],
  };
  const replacement = {
    ...phrase,
    id: "new-id",
    meaning: "Share the total amount to pay.",
  };
  const incoming = {
    ...initialFeed,
    revision: 1,
    phrases: [replacement, ...initialFeed.phrases.slice(1)],
    lessons: [
      {
        ...initialFeed.lessons[0],
        phraseIds: [
          replacement.id,
          initialFeed.phrases[1].id,
          initialFeed.phrases[2].id,
        ],
      },
    ],
  };
  const merged = mergeContentFeed(current, incoming);
  expect(merged.phrases[0].id).toBe(phrase.id);
  expect(merged.phrases[0].meaning).toBe(replacement.meaning);
  expect(merged.lessons[0].phraseIds[0]).toBe(phrase.id);
  expect(merged.lessons).toHaveLength(8);
});

it("refuses to replace the expressions of an already published day", () => {
  const incoming = {
    ...initialFeed,
    revision: 1,
    lessons: [
      {
        ...initialFeed.lessons[0],
        phraseIds: initialFeed.phrases.slice(0, 3).map((phrase) => phrase.id),
      },
    ],
  };
  expect(() => mergeContentFeed(initialFeed, incoming)).toThrow(
    "changed an existing daily page",
  );
});

it("rejects duplicate lesson dates, ids and repeated expressions in a three-expression page", () => {
  expect(() =>
    parseContentFeed({
      ...initialFeed,
      phrases: [...initialFeed.phrases, initialFeed.phrases[0]],
    }),
  ).toThrow("identifiers");
  expect(() =>
    parseContentFeed({
      ...initialFeed,
      lessons: [...initialFeed.lessons, initialFeed.lessons[0]],
    }),
  ).toThrow("dates");
  const lesson = initialFeed.lessons[0];
  expect(() =>
    parseContentFeed({
      ...initialFeed,
      lessons: [
        {
          ...lesson,
          phraseIds: [
            lesson.phraseIds[0],
            lesson.phraseIds[0],
            lesson.phraseIds[1],
          ],
        },
      ],
    }),
  ).toThrow("distinct");
});
