import { useId, type Dispatch, type SetStateAction } from "react";
import type { SoundMode } from "../types/phonetics";

export function SoundAnswerInput({
  mode,
  answer,
  setAnswer,
  tokens,
  setTokens,
  tiles,
  selected,
  setSelected,
  finished,
}: {
  mode: SoundMode;
  answer: string;
  setAnswer: (value: string) => void;
  tokens: string[];
  setTokens: Dispatch<SetStateAction<string[]>>;
  tiles: string[];
  selected: number | null;
  setSelected: (value: number | null) => void;
  finished: boolean;
}) {
  const answerId = useId();
  const instructionsId = useId();
  return (
    <>
      {mode === "decode" ? (
        <>
          <label htmlFor={answerId}>Which word fits?</label>
          <input
            id={answerId}
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            disabled={finished}
          />
        </>
      ) : (
        <>
          <p id={instructionsId}>
            {mode === "repair"
              ? "Tap the changed sound, then choose its replacement."
              : "Tap sounds in order. You can use a tile more than once."}
          </p>
          <div
            className="sound-answer"
            aria-label="Your transcription"
            aria-describedby={instructionsId}
          >
            <span>/</span>
            {tokens.length ? (
              tokens.map((token, index) => (
                <button
                  type="button"
                  key={index}
                  className="sound-tile"
                  disabled={finished || mode !== "repair"}
                  aria-pressed={selected === index}
                  aria-label={`Position ${index + 1}: ${token}`}
                  onClick={() => setSelected(index)}
                >
                  {token}
                </button>
              ))
            ) : (
              <span className="quiet">Your sounds go here</span>
            )}
            <span>/</span>
          </div>
          <div className="sound-tiles" aria-label="Sound tiles">
            {tiles.map((tile) => (
              <button
                type="button"
                key={tile}
                className="sound-tile"
                disabled={finished || (mode === "repair" && selected === null)}
                onClick={() => {
                  setTokens((current) =>
                    mode === "repair"
                      ? current.map((token, index) =>
                          index === selected ? tile : token,
                        )
                      : [...current, tile],
                  );
                  setSelected(null);
                }}
              >
                {tile}
              </button>
            ))}
          </div>
          {mode === "build" && (
            <button
              type="button"
              className="text-button"
              disabled={finished || !tokens.length}
              onClick={() => setTokens((current) => current.slice(0, -1))}
            >
              Undo last sound
            </button>
          )}
        </>
      )}
    </>
  );
}
