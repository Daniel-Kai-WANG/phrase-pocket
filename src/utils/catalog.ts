import type {
  DailyLesson,
  MemoryState,
  Phrase,
  ProgressMap,
  Theme,
} from "../types/learning";

export function filterPhrases(
  phrases: Phrase[],
  query: string,
  progress: ProgressMap,
  state: MemoryState | "all",
  theme: Theme | "all",
) {
  const search = query.trim().toLocaleLowerCase("en");
  return phrases.filter(
    (phrase) =>
      (theme === "all" || phrase.theme === theme) &&
      (state === "all" || (progress[phrase.id]?.state ?? "new") === state) &&
      `${phrase.expression} ${phrase.meaning} ${phrase.example}`
        .toLocaleLowerCase("en")
        .includes(search),
  );
}

export function phraseKey(expression: string): string {
  return expression
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function mergeCatalog(existing: Phrase[], incoming: Phrase[]): Phrase[] {
  const byId = new Map(existing.map((phrase) => [phrase.id, phrase]));
  const bySense = new Map(
    existing.map((phrase) => [phraseSenseKey(phrase), phrase.id]),
  );
  for (const phrase of incoming) {
    const id = byId.has(phrase.id)
      ? phrase.id
      : (bySense.get(phraseSenseKey(phrase)) ?? phrase.id);
    const previous = byId.get(id);
    if (previous) bySense.delete(phraseSenseKey(previous));
    byId.set(id, {
      ...previous,
      ...phrase,
      id,
      source: previous?.source ?? phrase.source,
    });
    bySense.set(phraseSenseKey(phrase), id);
  }
  return [...byId.values()];
}

export function phraseSenseKey(phrase: Phrase): string {
  return (
    phrase.senseId ??
    `${phraseKey(phrase.expression)}:${phraseKey(phrase.meaning)}`
  );
}

export function getAvailableLessons(
  lessons: DailyLesson[],
  today: string,
): DailyLesson[] {
  return lessons
    .filter((lesson) => lesson.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date));
}
