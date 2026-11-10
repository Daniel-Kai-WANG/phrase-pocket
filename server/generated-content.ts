import { z } from "zod";
import { themeSchema } from "../src/types/contentSchema.js";
import { phraseKey } from "../src/utils/catalog.js";
import { ProviderError } from "./provider.js";

export const englishLearningText = z
  .string()
  .min(1)
  .regex(/^[^\u3400-\u9fff]*$/);

export const generatedPhraseSchema = z.object({
  expression: englishLearningText,
  meaning: englishLearningText,
  example: englishLearningText,
  pronunciation: englishLearningText,
  register: englishLearningText,
  note: englishLearningText,
  theme: themeSchema,
  scenarios: z
    .array(
      z.object({
        setting: englishLearningText,
        prompt: englishLearningText,
        sample: englishLearningText,
      }),
    )
    .length(2),
});

export function validateGeneratedPhrases(
  phrases: z.infer<typeof generatedPhraseSchema>[],
  knownExpressions: string[],
  count: number,
) {
  const keys = phrases.map((phrase) => phraseKey(phrase.expression));
  const known = new Set(knownExpressions.map(phraseKey));
  if (
    phrases.length !== count ||
    new Set(keys).size !== count ||
    keys.some((key) => !key || known.has(key))
  )
    throw new ProviderError(
      502,
      "The new material contained repeated or missing expressions. Please try again.",
    );
  if (
    phrases.some((phrase, index) =>
      phrase.scenarios.some((scenario) =>
        `-${phraseKey(scenario.prompt)}-`.includes(`-${keys[index]}-`),
      ),
    )
  )
    throw new ProviderError(
      502,
      "A practice scene revealed its answer. Please prepare the material again.",
    );
}
