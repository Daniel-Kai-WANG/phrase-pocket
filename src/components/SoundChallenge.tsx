import { useState } from "react";
import { Volume2 } from "lucide-react";
import type { Phrase } from "../types/learning";
import type { SoundAttempt, SoundMode, SoundWord } from "../types/phonetics";
import {
  checkSoundAnswer,
  getRepairTokens,
  getSoundContext,
  getSoundTiles,
} from "../utils/phonetics";
import { speak } from "../utils/speech";
import { Companion } from "./Companion";
import { SoundAnswerInput } from "./SoundAnswerInput";
import { SoundHints } from "./SoundHints";
import { getSoundHelp } from "../utils/soundHints";

export function SoundChallenge({
  phrase,
  word,
  mode,
  transfer,
  independent,
  previousMistakes = 0,
  onAttempt,
  onNext,
}: {
  phrase: Phrase;
  word: SoundWord;
  mode: SoundMode;
  transfer: boolean;
  independent: boolean;
  previousMistakes?: number;
  onAttempt: (attempt: SoundAttempt) => void;
  onNext: () => void;
}) {
  const [tiles] = useState(() => getSoundTiles(word));
  const [answer, setAnswer] = useState("");
  const [tokens, setTokens] = useState(() =>
    mode === "repair" ? getRepairTokens(word) : [],
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<boolean | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [audioError, setAudioError] = useState("");
  const help = getSoundHelp(word, phrase);
  const [hintLevel, setHintLevel] = useState(() =>
    Math.min(previousMistakes, help.clues.length - 1),
  );
  const finished =
    (mode === "decode" ? result === true : result !== null) || revealed;
  function nextHint() {
    setHintLevel((level) => Math.min(level + 1, help.clues.length - 1));
  }

  function submit(reveal = false) {
    if (finished) return;
    const correct =
      !reveal &&
      checkSoundAnswer(
        word,
        mode,
        mode === "decode" ? answer : tokens.join(""),
      );
    onAttempt({
      id: crypto.randomUUID(),
      phraseId: phrase.id,
      word: word.word,
      mode,
      at: new Date().toISOString(),
      correct,
      independent:
        independent &&
        !reveal &&
        (mode !== "decode" || (hintLevel === 0 && result === null)),
    });
    if (reveal) setRevealed(true);
    else {
      setResult(correct);
      if (!correct && mode === "decode") nextHint();
    }
  }

  return (
    <div className="sound-challenge" data-mode={mode}>
      <div className="sound-guide">
        <Companion celebrate={result === true} />
        <p>
          {mode === "decode"
            ? "Decode the missing word."
            : mode === "build"
              ? "Build the reference pronunciation."
              : "Find and replace the one changed vowel."}
        </p>
      </div>
      {mode === "decode" ? (
        <>
          <blockquote>{getSoundContext(phrase, word, transfer)}</blockquote>
          {!finished && (
            <SoundHints
              clues={help.clues}
              meaning={help.meaning}
              level={hintLevel}
              incorrect={result === false && !finished}
              finished={finished}
              onHint={nextHint}
            />
          )}
        </>
      ) : (
        <h3 className="study-expression">{word.word}</h3>
      )}
      <p className="quiet">
        UK dictionary reference ·{" "}
        {mode === "decode"
          ? "IPA → spelling"
          : "Include stress marks. Syllable dots are optional."}
      </p>
      {!finished && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <SoundAnswerInput
            mode={mode}
            answer={answer}
            setAnswer={setAnswer}
            tokens={tokens}
            setTokens={setTokens}
            tiles={tiles}
            selected={selected}
            setSelected={setSelected}
            finished={finished}
          />
          <div className="button-row">
            <button
              className="primary-button"
              disabled={mode === "decode" ? !answer.trim() : !tokens.length}
            >
              Check answer
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => submit(true)}
            >
              Show me
            </button>
          </div>
        </form>
      )}
      {finished && (
        <div role="status" className={`feedback ${result ? "positive" : ""}`}>
          <strong>
            {result
              ? "Sound unlocked!"
              : revealed
                ? "Study it, then try again later."
                : "Keep this sound in your review trail."}
          </strong>
          <p>
            {word.word} — /{word.tokens.join("")}/
          </p>
          {!revealed && (
            <p className="quiet">
              Your answer: {mode === "decode" ? answer : `/${tokens.join("")}/`}
            </p>
          )}
          {mode === "decode" && (
            <>
              <SoundHints
                clues={help.clues}
                meaning={help.meaning}
                level={hintLevel}
                incorrect={false}
                finished
                onHint={nextHint}
              />
              <section aria-label="More examples">
                <strong>More examples</strong>
                <ul>
                  {help.examples.map((example) => (
                    <li key={example}>{example}</li>
                  ))}
                </ul>
              </section>
            </>
          )}
          <p>{word.note}</p>
          <p className="quiet">
            {result
              ? "Today's attempt is saved. Recall it on another day to strengthen the connection."
              : "Your meaning progress has not changed."}
          </p>
          <div className="button-row">
            <button
              className="secondary-button"
              onClick={() => setAudioError(speak(word.word) ?? "")}
            >
              <Volume2 size={18} /> Listen
            </button>
            <button className="primary-button" onClick={onNext}>
              Next challenge
            </button>
          </div>
          <p className="quiet">
            Device voice is a listening aid; its accent may differ.{" "}
            <a href={word.sourceUrl} target="_blank" rel="noreferrer">
              Dictionary reference
            </a>
          </p>
        </div>
      )}
      {audioError && (
        <p role="alert" className="error-message">
          {audioError}
        </p>
      )}
    </div>
  );
}
