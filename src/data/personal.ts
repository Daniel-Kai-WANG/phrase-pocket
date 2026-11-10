import type { Phrase, PendingPhrase, Theme } from "../types/learning";
import original from "./personal/original.json";
import conversations from "./personal/conversations.json";
import connections from "./personal/connections.json";
import feelings from "./personal/feelings.json";
import work from "./personal/work.json";
import casual from "./personal/casual.json";
import food from "./personal/food.json";
import everyday from "./personal/everyday.json";
import wordChoices from "./personal/word-choices.json";
import registerNotes from "./personal/register-notes.json";
import travel from "./personal/travel.json";
import placeNames from "./personal/place-names.json";

interface PhraseSeed {
  id: string;
  expression: string;
  meaning: string;
  example: string;
  note: string;
  prompt: string;
  transfer: string;
  transferSample: string;
  theme?: Theme;
  register?: string;
  pronunciation?: string;
  sourceMessageId?: string;
}

function preparePhrases(seeds: PhraseSeed[], theme: Theme): Phrase[] {
  return seeds.map(({ prompt, transfer, transferSample, ...phrase }) => ({
    ...phrase,
    theme: phrase.theme ?? theme,
    source: "personal",
    sourceDate: "2026-11-09",
    register:
      phrase.register ?? (theme === "slang" ? "Informal" : "Conversational"),
    pronunciation:
      phrase.pronunciation ??
      "Listen to the phrase, then repeat it without looking.",
    scenarios: [
      { setting: "First encounter", prompt, sample: phrase.example },
      { setting: "A new situation", prompt: transfer, sample: transferSample },
    ],
  }));
}

export const personalPhrases: Phrase[] = [
  ...preparePhrases(original as PhraseSeed[], "social"),
  ...preparePhrases(conversations, "social"),
  ...preparePhrases(connections, "relationships"),
  ...preparePhrases(feelings, "feelings"),
  ...preparePhrases(work, "work"),
  ...preparePhrases(casual, "slang"),
  ...preparePhrases(food, "travel"),
  ...preparePhrases(everyday, "small-talk"),
  ...preparePhrases(wordChoices, "work"),
  ...preparePhrases(registerNotes, "slang"),
  ...preparePhrases(travel, "travel"),
  ...preparePhrases(placeNames, "travel"),
];

export const pendingPhrases: PendingPhrase[] = [
  {
    id: "4d0e66f0-7a5f-4212-8b71-1ce0fc66727b",
    text: "Bet that cool blud",
    reason:
      "The intended sentence is unclear. The surrounding message is needed before this becomes a recall card.",
  },
  {
    id: "unclear-busy-pussy",
    text: "Busy pussy",
    reason:
      "This wording may contain a typo or vulgar slang. Its intended meaning cannot be recovered reliably from the saved inventory.",
  },
  {
    id: "unclear-head",
    text: "Head",
    reason:
      "This word has several ordinary and slang meanings. The original sentence is needed to choose the intended sense.",
  },
];
