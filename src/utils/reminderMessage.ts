export function reminderMessage(counts: {
  newPhrases: number;
  reviews: number;
  sounds: number;
}) {
  const label = (count: number, noun: string) =>
    `${count} ${noun}${count === 1 ? "" : "s"}`;
  return `${label(counts.newPhrases, "new phrase")} · ${label(counts.reviews, "review")} · ${label(counts.sounds, "sound challenge")} left.`;
}
