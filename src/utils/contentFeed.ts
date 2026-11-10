import { contentFeedSchema, type ContentFeed } from "../types/contentFeed";
import { mergeCatalog, phraseKey, phraseSenseKey } from "./catalog";

export function parseContentFeed(input: unknown): ContentFeed {
  const feed = contentFeedSchema.parse(input);
  const ids = new Set(feed.phrases.map((phrase) => phrase.id));
  if (ids.size !== feed.phrases.length)
    throw new Error("The update contains repeated phrase identifiers.");
  if (
    new Set(feed.lessons.map((lesson) => lesson.date)).size !==
    feed.lessons.length
  )
    throw new Error("The update contains repeated lesson dates.");
  for (const lesson of feed.lessons) {
    const phrases = lesson.phraseIds.map((id) =>
      feed.phrases.find((phrase) => phrase.id === id),
    );
    if (
      phrases.some((phrase) => !phrase) ||
      new Set(phrases.map((phrase) => phraseKey(phrase!.expression))).size !== 3
    )
      throw new Error("A daily page is missing three distinct expressions.");
  }
  return feed;
}

export function mergeContentFeed(
  current: ContentFeed,
  incoming: ContentFeed,
): ContentFeed {
  if (incoming.revision <= current.revision) return current;
  const phrases = mergeCatalog(current.phrases, incoming.phrases);
  const bySense = new Map(
    phrases.map((phrase) => [phraseSenseKey(phrase), phrase.id]),
  );
  const aliases = new Map(
    incoming.phrases.map((phrase) => [
      phrase.id,
      bySense.get(phraseSenseKey(phrase)) ?? phrase.id,
    ]),
  );
  const lessons = new Map(
    current.lessons.map((lesson) => [lesson.date, lesson]),
  );
  for (const lesson of incoming.lessons) {
    const next = {
      ...lesson,
      phraseIds: lesson.phraseIds.map((id) => aliases.get(id) ?? id),
    };
    const previous = lessons.get(lesson.date);
    if (previous && previous.phraseIds.join("|") !== next.phraseIds.join("|"))
      throw new Error(
        "This update changed an existing daily page. Your saved cards have been kept.",
      );
    lessons.set(lesson.date, next);
  }
  return parseContentFeed({
    ...incoming,
    phrases,
    lessons: [...lessons.values()],
  });
}
