import { afterEach, expect, it, vi } from "vitest";
import {
  generatedPhraseSchema,
  validateGeneratedPhrases,
} from "../server/generated-content";
import { preparePlan } from "../server/plans";
import { readConfig } from "../server/config";
import { personalPhrases } from "../src/data/personal";

const phrase = personalPhrases.find((item) => item.id === "split-the-bill")!;

afterEach(() => vi.unstubAllGlobals());

it("rejects blank definitions and Chinese explanations at the generated-content boundary", () => {
  expect(
    generatedPhraseSchema.safeParse({ ...phrase, meaning: "" }).success,
  ).toBe(false);
  expect(
    generatedPhraseSchema.safeParse({ ...phrase, meaning: "平摊账单" }).success,
  ).toBe(false);
});

it("rejects a prompt that reveals the target while allowing natural sample inflections", () => {
  expect(() => validateGeneratedPhrases([phrase], [], 1)).not.toThrow();
  const leaked = {
    ...phrase,
    scenarios: [
      { ...phrase.scenarios[0], prompt: "Ask your friend to split the bill." },
      phrase.scenarios[1],
    ],
  };
  expect(() => validateGeneratedPhrases([leaked], [], 1)).toThrow(
    "revealed its answer",
  );
});

it("rejects duplicate, known and punctuation-only expressions before returning a plan", () => {
  expect(() => validateGeneratedPhrases([phrase, phrase], [], 2)).toThrow(
    "repeated",
  );
  expect(() =>
    validateGeneratedPhrases([phrase], ["Split the bill!"], 1),
  ).toThrow("repeated");
  expect(() =>
    validateGeneratedPhrases([{ ...phrase, expression: "..." }], [], 1),
  ).toThrow("missing");
});

function mockPlan(title = "Everyday meals") {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "completed",
          output: [
            {
              type: "message",
              content: [
                {
                  type: "output_text",
                  text: JSON.stringify({
                    title,
                    description: "Practise sharing meal costs.",
                    phrases: [phrase],
                  }),
                },
              ],
            },
          ],
        }),
      ),
    ),
  );
}

const request = {
  topic: "Eating out",
  difficulty: "B1" as const,
  days: 1,
  dailyCount: 1,
  knownExpressions: [],
};

it("prepares a usable plan with stable phrase identities after content checks", async () => {
  mockPlan();
  const plan = await preparePlan(
    { ...readConfig(), apiKey: "test-only" },
    request,
  );
  expect(plan.phrases).toHaveLength(1);
  expect(plan.phrases[0].id).toBe(`quest-${plan.id}-1`);
  expect(plan.phrases[0].source).toBe("quest");
  expect(plan.days).toBe(1);
});

it("does not return a plan with a Chinese title even if its phrases are English", async () => {
  mockPlan("每日英文");
  await expect(
    preparePlan({ ...readConfig(), apiKey: "test-only" }, request),
  ).rejects.toThrow("incomplete review");
});
