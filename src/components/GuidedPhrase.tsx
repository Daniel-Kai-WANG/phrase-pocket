import { useState } from "react";
import { ArrowRight, Lightbulb, Volume2 } from "lucide-react";
import type { Phrase } from "../types/learning";
import { buildGuidedPhrase, matchesGuidedWord } from "../utils/guidedPhrase";
import { speak } from "../utils/speech";
import { PracticePicture } from "./PracticePicture";

export function GuidedPhrase({
  phrase,
  onNext,
  onError,
  isLast,
}: {
  phrase: Phrase;
  onNext: () => void;
  onError: (message: string) => void;
  isLast: boolean;
}) {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [hint, setHint] = useState(false);
  const [complete, setComplete] = useState(false);
  const puzzle = buildGuidedPhrase(phrase);

  function check() {
    if (!puzzle || !answer.trim()) return;
    if (matchesGuidedWord(answer, puzzle.word)) {
      setComplete(true);
      setFeedback("You’ve put it together!");
    } else {
      setHint(true);
      setFeedback("Not quite. Use the clue and have another go.");
    }
  }

  return (
    <section className="mini-scene">
      <PracticePicture theme={phrase.theme} success={complete} />
      <p className="mini-caption">
        {complete ? "A LITTLE WIN" : "LET’S BUILD IT"}
      </p>
      <h3 className="mini-heading">
        {complete ? phrase.expression : "One word is missing."}
      </h3>
      {!complete && puzzle ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            check();
          }}
        >
          <p
            className="phrase-puzzle"
            aria-label={`${puzzle.before} blank ${puzzle.after}`}
          >
            {puzzle.before}
            <span>•••</span>
            {puzzle.after}
          </p>
          <label htmlFor="guided-word">The missing word</label>
          <input
            id="guided-word"
            value={answer}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            onChange={(event) => setAnswer(event.target.value)}
          />
          <button
            type="button"
            className="text-button mini-hint"
            onClick={() => setHint(true)}
          >
            <Lightbulb size={17} /> Give me a clue
          </button>
          {hint && (
            <div className="hint-box">
              <p>{phrase.meaning}</p>
              <p>Starts with “{puzzle.word[0].toLowerCase()}”.</p>
              <button
                type="button"
                className="text-button"
                onClick={() => setAnswer(puzzle.word)}
              >
                Show the missing word
              </button>
            </div>
          )}
          {feedback && (
            <p role="status" className="mini-feedback">
              {feedback}
            </p>
          )}
          <button
            type="submit"
            className="primary-button full-width"
            disabled={!answer.trim()}
          >
            Check the word <ArrowRight size={18} />
          </button>
        </form>
      ) : (
        <>
          <p role="status" className="mini-feedback">
            {feedback || "Let’s try this in a conversation."}
          </p>
          <p className="mini-example">{phrase.example}</p>
          <button
            className="secondary-button mini-listen"
            onClick={() => onError(speak(phrase.example) ?? "")}
          >
            <Volume2 size={18} /> Listen
          </button>
          <p className="mini-reassurance">
            A warm-up, not a memory score. We’ll come back to it.
          </p>
          <button className="primary-button full-width" onClick={onNext}>
            {isLast ? "Try a new situation" : "Next little scene"}{" "}
            <ArrowRight size={18} />
          </button>
        </>
      )}
    </section>
  );
}
