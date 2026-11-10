import { ArrowRight, RotateCcw } from "lucide-react";
import { MEMORY_LABELS } from "../constants/learning";
import type { MemoryState, Phrase, ProgressMap } from "../types/learning";
import { getDuePhrases, getMemorySummary } from "../utils/review";

export function MemoryTrail({
  phrases,
  progress,
  onFilter,
  onReview,
}: {
  phrases: Phrase[];
  progress: ProgressMap;
  onFilter: (state: MemoryState) => void;
  onReview: () => void;
}) {
  const summary = getMemorySummary(phrases, progress);
  const due = getDuePhrases(phrases, progress).length;
  return (
    <section className="memory-trail paper" aria-label="Memory trail">
      <div className="section-heading">
        <div>
          <p className="eyebrow">YOUR MEMORY TRAIL</p>
          <h2>A little clearer, every time.</h2>
        </div>
        <button className="text-button" onClick={onReview} disabled={!due}>
          <RotateCcw size={16} /> {due} due for review <ArrowRight size={16} />
        </button>
      </div>
      <div className="trail-stops">
        {(Object.keys(summary) as MemoryState[]).map((state, index) => (
          <button
            className={`trail-stop state-${state}`}
            key={state}
            onClick={() => onFilter(state)}
          >
            <span className="trail-dot">{index + 1}</span>
            <span>
              <strong>{summary[state]}</strong>
              <span>{MEMORY_LABELS[state]}</span>
            </span>
          </button>
        ))}
      </div>
      <p className="quiet trail-note">
        Hints help you learn. Remembering on different days helps it stick.
      </p>
    </section>
  );
}
