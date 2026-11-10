import { describe, expect, it } from "vitest";
import { initialLessons, initialPhrases } from "../src/data/catalog";
import {
  filterPhrases,
  getAvailableLessons,
  mergeCatalog,
} from "../src/utils/catalog";

describe("initial course and catalog", () => {
  it("contains eight dated lessons of three unique expressions, all connected to content", () => {
    expect(initialLessons).toHaveLength(8);
    const ids = initialLessons.flatMap((lesson) => lesson.phraseIds);
    expect(ids).toHaveLength(24);
    expect(new Set(ids).size).toBe(24);
    expect(new Set(initialLessons.map((lesson) => lesson.theme)).size).toBe(7);
    for (const id of ids)
      expect(
        initialPhrases.find((phrase) => phrase.id === id)?.scenarios,
      ).toHaveLength(2);
  });
  it("provides English-only learning copy and no duplicate identifiers", () => {
    expect(new Set(initialPhrases.map((phrase) => phrase.id)).size).toBe(
      initialPhrases.length,
    );
    expect(JSON.stringify(initialPhrases)).not.toMatch(/[\u3400-\u9fff]/);
  });
  it("keeps earlier lessons accessible and hides future lessons", () => {
    const available = getAvailableLessons(initialLessons, "2026-11-04");
    expect(available).toHaveLength(3);
    expect(available[0].date).toBe("2026-11-04");
  });
  it("merges a corrected expression without changing its progress identifier", () => {
    const phrase = { ...initialPhrases[0], senseId: "share-a-cost" };
    const revised = {
      ...phrase,
      id: "new-source-id",
      meaning: "A revised explanation.",
    };
    const merged = mergeCatalog([phrase], [revised, revised]);
    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe(phrase.id);
    expect(merged[0].meaning).toBe(revised.meaning);
  });
  it("retains separate meanings of the same expression", () => {
    const first = {
      ...initialPhrases[0],
      expression: "Take off",
      meaning: "Leave the ground.",
      id: "take-off-flight",
    };
    const second = {
      ...first,
      meaning: "Remove an item of clothing.",
      id: "take-off-clothing",
    };
    expect(mergeCatalog([first], [second])).toHaveLength(2);
  });
  it("keeps the durable id when a correction changes both the expression and explanation", () => {
    const phrase = initialPhrases[0];
    const corrected = {
      ...phrase,
      expression: "Share the bill",
      meaning: "A corrected meaning.",
    };
    expect(mergeCatalog([phrase], [corrected])).toEqual([corrected]);
  });
  it("searches meanings as well as phrases and combines theme and memory filters", () => {
    expect(
      filterPhrases(initialPhrases, "share the cost", {}, "new", "social")[0]
        .id,
    ).toBe("split-the-bill");
    expect(
      filterPhrases(
        initialPhrases,
        "share the cost",
        {},
        "remembered",
        "social",
      ),
    ).toEqual([]);
  });
});
