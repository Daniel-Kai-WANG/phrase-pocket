import type { InboxEntry, InboxReply } from "../../src/types/learningInbox";

export const inboxEntry: InboxEntry = {
  id: "question-one",
  mode: "question",
  text: "How do I ask someone to reassure me?",
  createdAt: "2026-11-14T00:00:00.000Z",
  phraseIds: [],
};
export const inboxReply: InboxReply = {
  explanation: "Reassure someone means to help them feel less worried.",
  cards: [
    {
      expression: "Could you reassure me?",
      meaning:
        "A request for someone to help you feel less worried or uncertain.",
      example: "I am worried about tomorrow. Could you reassure me?",
      register: "Direct and personal; use with someone you trust.",
      note: "Reassurance addresses worry; comfort can also address sadness.",
      theme: "feelings",
      scenarios: [
        {
          setting: "Before an interview",
          prompt: "You are nervous and want encouragement from a friend.",
          sample: "Could you reassure me?",
        },
        {
          setting: "A new responsibility",
          prompt:
            "You are unsure you can manage a task. Ask a trusted colleague for encouragement.",
          sample: "Could you reassure me? I am feeling unsure.",
        },
      ],
    },
  ],
  pending: [
    {
      text: "Never mind",
      reason: "Are you withdrawing a request or expressing disappointment?",
    },
  ],
};
