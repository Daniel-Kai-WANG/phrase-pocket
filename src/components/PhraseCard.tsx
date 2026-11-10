import { ArrowUpRight, Volume2 } from "lucide-react";
import { MEMORY_LABELS, THEMES } from "../constants/learning";
import type { Phrase, PhraseProgress } from "../types/learning";

export function PhraseCard({
  phrase,
  progress,
  onOpen,
  onListen,
}: {
  phrase: Phrase;
  progress?: PhraseProgress;
  onOpen: () => void;
  onListen: () => void;
}) {
  const state = progress?.state ?? "new";
  return (
    <article className="phrase-card paper">
      <div className="card-meta">
        <span>{THEMES[phrase.theme].label}</span>
        <span className={`status state-${state}`}>{MEMORY_LABELS[state]}</span>
      </div>
      <button className="phrase-title" onClick={onOpen}>
        <h3>{phrase.expression}</h3>
        <ArrowUpRight size={19} />
      </button>
      <p>{phrase.meaning}</p>
      <div className="card-footer">
        <span className="quiet">{phrase.register}</span>
        <button
          className="icon-button"
          onClick={onListen}
          aria-label={`Listen to ${phrase.expression}`}
        >
          <Volume2 size={18} />
        </button>
      </div>
    </article>
  );
}
