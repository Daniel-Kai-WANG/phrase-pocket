import { initialLessons, initialPhrases } from "./catalog";
import { pendingPhrases } from "./personal";
import type { ContentFeed } from "../types/contentFeed";

export const initialFeed: ContentFeed = {
  version: 1,
  revision: 0,
  publishedAt: null,
  personalCheckedAt: null,
  dailyCheckedAt: null,
  sourceSyncMode: "disconnected",
  phrases: initialPhrases,
  lessons: initialLessons,
  pending: pendingPhrases,
};
