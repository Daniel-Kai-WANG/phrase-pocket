import daily from "./daily.json";
import { personalPhrases } from "./personal";
import type { DailyLesson, Phrase } from "../types/learning";

export const initialPhrases = [
  ...personalPhrases,
  ...(daily.phrases as Phrase[]),
];
export const initialLessons = daily.lessons as DailyLesson[];
