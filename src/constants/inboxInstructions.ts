export const INBOX_CARD_INSTRUCTIONS = `Prepare a Phrase Pocket learning-card JSON file from the English questions and visible answers I provide below.
Only include the expressions I actually asked about. Use English in all output fields, even when my question is Chinese. Explain natural Australian everyday usage without claiming every expression is uniquely Australian.
Do not include personal names, addresses, contacts or private stories. Use invented neutral examples. A content-reference placeholder is not an explanation. Put uncertain senses in pending with a specific clarification question, and do not invent a card for them.
Return ONLY JSON, no markdown, using this shape:
{
  "explanation": "A short English explanation of the learning points.",
  "cards": [{
    "expression": "Thanks for letting me know.",
    "meaning": "A friendly way to thank someone for giving you information.",
    "example": "The meeting is at ten? Thanks for letting me know.",
    "register": "Friendly and neutral; suitable for everyday messages.",
    "note": "Use this when someone shares an update.",
    "theme": "small-talk",
    "scenarios": [
      {"setting": "A schedule update", "prompt": "A colleague tells you the meeting has moved. Acknowledge their update.", "sample": "Thanks for letting me know."},
      {"setting": "A change of plans", "prompt": "A friend says they will arrive later. Thank them for the information.", "sample": "Thanks for letting me know. See you soon."}
    ]
  }],
  "pending": [{"text": "An unresolved expression", "reason": "A specific question needed to establish its meaning."}]
}
Use up to eight cards per file. Each card must have exactly two distinct scenarios. Allowed themes: small-talk, relationships, work, social, feelings, travel, slang. Use empty cards or pending arrays when appropriate. Do not reproduce the example card unless I asked about it.
Here is the material to review:
`;
