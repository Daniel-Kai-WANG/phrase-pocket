import { expect, it } from "vitest";
import { personalPhrases, pendingPhrases } from "../src/data/personal";
import { phraseSchema } from "../src/types/contentSchema";
import { phraseKey } from "../src/utils/catalog";

it("keeps the original progress identifiers while covering the saved conversation inventory", () => {
  const ids = new Set(personalPhrases.map((phrase) => phrase.id));
  for (const id of [
    "split-the-bill",
    "take-turns-paying",
    "in-vain",
    "versatile",
    "i-knew-it",
    "genuine",
    "sincere",
    "one-person-show",
    "monopoly",
    "drama-queen",
    "right-to-be-jealous",
    "on-purpose",
    "out-of-sorts",
    "reasonable-grounds",
    "lethal",
    "soggy",
    "inside-out",
    "monologue",
    "few-times-week",
    "every-few-weeks",
  ])
    expect(ids.has(id), id).toBe(true);
  expect(ids.size).toBe(personalPhrases.length);
  expect(personalPhrases.length).toBeGreaterThan(100);
});

it("provides complete English learning cards with two distinct scenarios", () => {
  for (const phrase of personalPhrases) {
    expect(phraseSchema.safeParse(phrase).success, phrase.id).toBe(true);
    expect(phrase.scenarios[0].prompt, phrase.id).not.toBe(
      phrase.scenarios[1].prompt,
    );
    expect(JSON.stringify(phrase), phrase.id).not.toMatch(/[\u3400-\u9fff]/);
    expect(JSON.stringify(phrase), phrase.id).not.toMatch(
      /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i,
    );
  }
});

it("does not print the target expression directly in a recall prompt", () => {
  const leaks = personalPhrases.flatMap((phrase) =>
    phrase.scenarios
      .filter((scenario) =>
        `-${phraseKey(scenario.prompt)}-`.includes(
          `-${phraseKey(phrase.expression)}-`,
        ),
      )
      .map((scenario) => ({ id: phrase.id, prompt: scenario.prompt })),
  );
  expect(leaks).toEqual([]);
});

it("holds unclear source wording and unverified place pronunciations outside the practice catalog", () => {
  const activeIds = new Set(personalPhrases.map((phrase) => phrase.id));
  expect(
    pendingPhrases.some((item) => item.text === "Bet that cool blud"),
  ).toBe(true);
  expect(pendingPhrases.some((item) => item.text === "Head")).toBe(true);
  expect(pendingPhrases.every((item) => !activeIds.has(item.id))).toBe(true);
});

it("links the newly observed relationship clarification to a single contextual card", () => {
  const linked = personalPhrases.filter(
    (phrase) =>
      phrase.sourceMessageId === "d0f3b6ec-1309-4780-a408-7a8e482153e8",
  );
  expect(linked).toHaveLength(1);
  expect(linked[0].meaning).toContain("relationship");
  expect(linked[0].note).toContain("not your personal worth");
});
