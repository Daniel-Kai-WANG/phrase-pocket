import { ArrowRight, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { SceneStage } from "../components/SceneStage";
import { SCENES } from "../constants/scenes";
import { MemoryTrail } from "../components/MemoryTrail";
import { PhraseCard } from "../components/PhraseCard";
import { MEMORY_LABELS, THEMES } from "../constants/learning";
import type {
  MemoryState,
  Phrase,
  ProgressMap,
  Theme,
  PendingPhrase,
} from "../types/learning";
import { filterPhrases } from "../utils/catalog";
import { getDuePhrases, getPracticeQueue } from "../utils/review";

export function Library({
  sceneTheme,
  phrases,
  pendingPhrases,
  progress,
  onOpen,
  onListen,
  onPractise,
  onSpeak,
}: {
  sceneTheme: Theme;
  phrases: Phrase[];
  pendingPhrases: PendingPhrase[];
  progress: ProgressMap;
  onOpen: (phrase: Phrase) => void;
  onListen: (text: string) => void;
  onPractise: (phrases: Phrase[], reviewOnly?: boolean) => void;
  onSpeak: () => void;
}) {
  const [query, setQuery] = useState("");
  const [memory, setMemory] = useState<MemoryState | "all">("all");
  const [theme, setTheme] = useState<Theme | "all">("all");
  const [source, setSource] = useState<Phrase["source"] | "all">("personal");
  const selectedSource =
    source === "all"
      ? phrases
      : phrases.filter((phrase) => phrase.source === source);
  const visible = filterPhrases(selectedSource, query, progress, memory, theme);
  const queue = getPracticeQueue(phrases, progress);
  return (
    <>
      <section className="welcome-scene paper">
        <div className="scene-copy">
          <p className="eyebrow">
            <Sparkles size={15} /> TODAY’S WORLD ·{" "}
            {SCENES[sceneTheme].name.toUpperCase()}
          </p>
          <h1>
            Little words.
            <br />
            <span>Big adventures.</span>
          </h1>
          <p>
            Meet Dot, your conversation sidekick.
            <br />
            Step into a scene. See what you can say.
          </p>
          <button
            className="primary-button"
            disabled={!queue.length}
            onClick={() => onPractise(queue)}
          >
            Take a little quest <ArrowRight size={18} />
          </button>
          <span className="scene-caption">
            {queue.length
              ? `${queue.length} expressions · at your own pace`
              : "All caught up. Explore a card or come back for review."}
          </span>
        </div>
        <SceneStage key={sceneTheme} theme={sceneTheme} />
      </section>
      <MemoryTrail
        phrases={phrases}
        progress={progress}
        onFilter={(state) => {
          setMemory(state);
          setSource("all");
          setTheme("all");
          setQuery("");
          document
            .getElementById("phrase-library")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        onReview={() =>
          onPractise(getDuePhrases(phrases, progress).slice(0, 3), true)
        }
      />
      <div className="section-heading library-heading" id="phrase-library">
        <div>
          <p className="eyebrow">YOUR GROWING COLLECTION</p>
          <h2>
            Words you wanted to keep{" "}
            <span className="count-bubble">{selectedSource.length}</span>
          </h2>
        </div>
        <button className="text-button" onClick={onSpeak}>
          Warm up your voice <ArrowRight size={16} />
        </button>
      </div>
      <div className="source-tabs" role="group" aria-label="Phrase source">
        {(
          [
            ["personal", "From my chat"],
            ["daily", "Daily expressions"],
            ["quest", "My plans"],
            ["all", "Everything"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setSource(value)}
            aria-pressed={source === value}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="library-tools">
        <label className="search-field">
          <Search size={18} />
          <span className="sr-only">Search expressions</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find an expression or a meaning…"
            type="search"
          />
        </label>
        <label>
          <span className="sr-only">Memory state</span>
          <select
            value={memory}
            onChange={(event) =>
              setMemory(event.target.value as MemoryState | "all")
            }
          >
            <option value="all">All memories</option>
            {Object.entries(MEMORY_LABELS).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Topic</span>
          <select
            value={theme}
            onChange={(event) => setTheme(event.target.value as Theme | "all")}
          >
            <option value="all">All topics</option>
            {Object.entries(THEMES).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="phrase-grid">
        {visible.map((phrase) => (
          <PhraseCard
            key={phrase.id}
            phrase={phrase}
            progress={progress[phrase.id]}
            onOpen={() => onOpen(phrase)}
            onListen={() => onListen(phrase.expression)}
          />
        ))}
      </div>
      {!visible.length && (
        <div className="empty-state paper">
          <h3>No expressions here yet.</h3>
          <p>Try another topic or memory state.</p>
          <button
            className="secondary-button"
            onClick={() => {
              setQuery("");
              setMemory("all");
              setTheme("all");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
      {pendingPhrases.length > 0 && (
        <details className="pending-notes">
          <summary>
            {pendingPhrases.length} expression needs a little more context
          </summary>
          {pendingPhrases.map((phrase) => (
            <p key={phrase.id}>
              <strong>{phrase.text}</strong> — {phrase.reason}
            </p>
          ))}
        </details>
      )}
    </>
  );
}
