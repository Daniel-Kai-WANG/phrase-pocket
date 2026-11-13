import type { Phrase } from "../types/learning";
import {
  inboxReplySchema,
  type InboxReply,
  type LearningInbox,
} from "../types/learningInbox";
import { phraseKey } from "./catalog";
import { learningDay } from "./dates";

export const EMPTY_INBOX: LearningInbox = { entries: [], phrases: [] };
const cardKey = (card: { expression: string; meaning: string }) =>
  `${phraseKey(card.expression)}:${phraseKey(card.meaning)}`;

export function completeInboxEntry(
  inbox: LearningInbox,
  entryId: string,
  reply: InboxReply,
  published: Phrase[],
): LearningInbox {
  const entry = inbox.entries.find((item) => item.id === entryId);
  if (!entry || entry.reply) return inbox;
  const phrases = [...inbox.phrases];
  const existing = new Map(
    [...published, ...phrases].map((item) => [cardKey(item), item.id]),
  );
  const phraseIds = reply.cards.map((card, index) => {
    const key = cardKey(card);
    const found = existing.get(key);
    if (found) return found;
    const id = `inbox-${entryId}-${index}`;
    phrases.push({
      ...card,
      scenarios: [card.scenarios[0], card.scenarios[1]],
      id,
      source: "personal",
      sourceDate: learningDay(new Date(entry.createdAt)),
      pronunciation: "",
    });
    existing.set(key, id);
    return id;
  });
  return {
    phrases,
    entries: inbox.entries.map((item) =>
      item.id === entryId
        ? { ...item, reply, phraseIds: [...new Set(phraseIds)] }
        : item,
    ),
  };
}

export function parseInboxImport(text: string): InboxReply {
  let value: unknown;
  try {
    value = JSON.parse(
      text.trim().replace(/^```(?:json)?\s*\n([\s\S]*?)\n```$/, "$1"),
    );
  } catch {
    throw new Error(
      "Choose a JSON learning-card file, not a raw conversation export. Nothing was imported.",
    );
  }
  const result = inboxReplySchema.safeParse(value);
  if (!result.success)
    throw new Error(
      "These cards are incomplete. Use the card instructions below to prepare English explanations and two practice scenes per card.",
    );
  return result.data;
}
