import { useState } from "react";
import { ArrowRight, Volume2 } from "lucide-react";
import type { Phrase } from "../types/learning";
import { speak } from "../utils/speech";
import { PracticePicture } from "./PracticePicture";

export function DiscoverPhrase({
  phrase,
  onNext,
  onError,
}: {
  phrase: Phrase;
  onNext: () => void;
  onError: (message: string) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  return (
    <section className="mini-scene">
      <PracticePicture theme={phrase.theme} />
      {!revealed ? (
        <>
          <p className="mini-caption">PICTURE THIS</p>
          <h3 className="mini-heading">{phrase.scenarios[0].setting}</h3>
          <p className="scene-question">{phrase.scenarios[0].prompt}</p>
          <p className="mini-reassurance">
            No guessing yet. Let’s find the words together.
          </p>
          <button
            className="primary-button full-width"
            onClick={() => setRevealed(true)}
          >
            Show me what to say <ArrowRight size={18} />
          </button>
        </>
      ) : (
        <>
          <p className="mini-caption">ONE USEFUL EXPRESSION</p>
          <h3 className="mini-heading">{phrase.expression}</h3>
          <p className="mini-meaning">{phrase.meaning}</p>
          <button
            className="secondary-button mini-listen"
            onClick={() => onError(speak(phrase.expression) ?? "")}
          >
            <Volume2 size={18} /> Listen
          </button>
          <details className="mini-more">
            <summary>See an example</summary>
            <p>{phrase.scenarios[0].sample}</p>
            <button
              className="text-button"
              onClick={() => onError(speak(phrase.scenarios[0].sample) ?? "")}
            >
              <Volume2 size={17} /> Hear the example
            </button>
            <p className="quiet">{phrase.register}</p>
          </details>
          <button className="primary-button full-width" onClick={onNext}>
            Try one missing word <ArrowRight size={18} />
          </button>
        </>
      )}
    </section>
  );
}
