interface SoundHintsProps {
  clues: string[];
  meaning: string;
  level: number;
  incorrect: boolean;
  finished: boolean;
  onHint: () => void;
}

export function SoundHints({
  clues,
  meaning,
  level,
  incorrect,
  finished,
  onHint,
}: SoundHintsProps) {
  const lastHint = level === clues.length - 1;
  return (
    <section className="sound-hints" aria-label="Meaning hints">
      <div aria-live="polite" aria-atomic="true">
        <strong>
          {finished ? "Meaning" : `Hint ${level + 1} of ${clues.length}`}
        </strong>
        {incorrect && <p className="quiet">Not quite. Try the clue below.</p>}
        <p>{finished ? meaning : clues[level]}</p>
      </div>
      {!finished &&
        (lastHint ? (
          <p className="quiet">
            You've seen every hint. Try once more, or choose “Show me” to study
            the answer.
          </p>
        ) : (
          <button type="button" className="text-button" onClick={onHint}>
            Another hint
          </button>
        ))}
    </section>
  );
}
