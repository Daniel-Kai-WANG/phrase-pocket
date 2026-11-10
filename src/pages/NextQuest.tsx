import { useEffect, useRef, useState } from "react";
import { ArrowRight, Compass, Check, Sparkles } from "lucide-react";
import { coachRequest } from "../api/client";
import type { Phrase } from "../types/learning";
import type { QuestPlan, SavedQuest } from "../types/quest";
import { questSchema } from "../types/contentSchema";

export function NextQuest({
  quests,
  knownExpressions,
  onStart,
  onPractise,
}: {
  quests: SavedQuest[];
  knownExpressions: string[];
  onStart: (plan: QuestPlan) => void;
  onPractise: (phrases: Phrase[], questId: string, day: number) => void;
}) {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<QuestPlan["difficulty"]>("B2");
  const [days, setDays] = useState(7);
  const [dailyCount, setDailyCount] = useState(3);
  const [preview, setPreview] = useState<QuestPlan | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);

  async function prepareQuest() {
    setBusy(true);
    setError("");
    setPreview(null);
    const controller = new AbortController();
    request.current = controller;
    try {
      const result = await coachRequest<QuestPlan>(
        "plan",
        { topic, difficulty, days, dailyCount, knownExpressions },
        controller.signal,
      );
      setPreview(questSchema.parse(result));
    } catch (issue) {
      if (!controller.signal.aborted)
        setError(
          issue instanceof Error
            ? issue.message
            : "Your plan could not be prepared.",
        );
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  return (
    <>
      <header className="page-intro">
        <p className="eyebrow">YOUR ENGLISH, YOUR NEXT CHAPTER</p>
        <h1>
          Where shall we
          <br />
          <span>take your words?</span>
        </h1>
        <p>
          A job interview, a trip, a first date. Build a little plan around the
          conversations you want to have.
        </p>
      </header>
      <div className="quest-builder paper">
        <div className="builder-title">
          <Compass size={30} />
          <div>
            <h2>Pack your next quest</h2>
            <p className="quiet">Preview the expressions before you begin.</p>
          </div>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void prepareQuest();
          }}
        >
          <label htmlFor="quest-topic">
            What would you like to talk about?
          </label>
          <input
            id="quest-topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="e.g. Confident conversations at work"
            required
            maxLength={160}
            disabled={busy}
          />
          <div className="topic-suggestions">
            {[
              "Making new friends",
              "Travelling in Japan",
              "Job interviews",
            ].map((suggestion) => (
              <button
                type="button"
                key={suggestion}
                onClick={() => setTopic(suggestion)}
                disabled={busy}
              >
                {suggestion}
              </button>
            ))}
          </div>
          <div className="plan-options">
            <label>
              Comfort level
              <select
                value={difficulty}
                onChange={(event) =>
                  setDifficulty(event.target.value as QuestPlan["difficulty"])
                }
                disabled={busy}
              >
                <option value="B1">B1 · Keep it simple</option>
                <option value="B2">B2 · More natural</option>
                <option value="C1">C1 · More nuanced</option>
              </select>
            </label>
            <label>
              Length
              <select
                value={days}
                onChange={(event) => setDays(Number(event.target.value))}
                disabled={busy}
              >
                {[3, 7, 14].map((value) => (
                  <option key={value} value={value}>
                    {value} days
                  </option>
                ))}
              </select>
            </label>
            <label>
              Daily expressions
              <select
                value={dailyCount}
                onChange={(event) => setDailyCount(Number(event.target.value))}
                disabled={busy}
              >
                {[1, 2, 3].map((value) => (
                  <option key={value} value={value}>
                    {value} a day
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button className="primary-button" disabled={!topic.trim() || busy}>
            <Sparkles size={18} />{" "}
            {busy ? "Packing your expressions…" : "Preview my quest"}
          </button>
        </form>
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
      </div>
      {preview && (
        <section className="plan-preview paper">
          <p className="eyebrow">READY WHEN YOU ARE</p>
          <h2>{preview.title}</h2>
          <p>{preview.description}</p>
          <ol className="preview-expressions">
            {preview.phrases.map((phrase) => (
              <li key={phrase.id}>
                <strong>{phrase.expression}</strong>
                <span>{phrase.meaning}</span>
              </li>
            ))}
          </ol>
          <button
            className="primary-button"
            onClick={() => {
              onStart(preview);
              setPreview(null);
            }}
          >
            Start this plan <ArrowRight size={18} />
          </button>
        </section>
      )}
      <div className="section-heading">
        <h2>Your adventures</h2>
        <span className="quiet">{quests.length} plans</span>
      </div>
      {quests.length ? (
        <div className="saved-quests">
          {quests.map((quest) => (
            <section key={quest.id} className="paper saved-quest">
              <p className="eyebrow">
                {quest.difficulty} · {quest.completedDays.length} OF{" "}
                {quest.days} SCENES VISITED
              </p>
              <h3>{quest.title}</h3>
              <p>{quest.description}</p>
              <div className="quest-days">
                {Array.from({ length: quest.days }, (_, i) => i + 1).map(
                  (day) => (
                    <button
                      className={
                        quest.completedDays.includes(day) ? "finished" : ""
                      }
                      key={day}
                      onClick={() =>
                        onPractise(
                          quest.phrases.slice(
                            (day - 1) * quest.dailyCount,
                            day * quest.dailyCount,
                          ),
                          quest.id,
                          day,
                        )
                      }
                    >
                      {quest.completedDays.includes(day) && <Check size={16} />}{" "}
                      Day {day}
                    </button>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="empty-state paper">
          <Compass size={30} />
          <h3>A fresh page is waiting.</h3>
          <p>
            Your personal plans will live here. You can start one whenever you
            feel ready.
          </p>
        </div>
      )}
    </>
  );
}
