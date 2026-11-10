import { ArrowRight, Check, CalendarDays } from "lucide-react";
import { useState } from "react";
import { THEMES } from "../constants/learning";
import { PhraseCard } from "../components/PhraseCard";
import type { DailyLesson, Phrase, ProgressMap } from "../types/learning";
import { getAvailableLessons } from "../utils/catalog";
import { formatLessonDate, learningDay } from "../utils/dates";

export function DailyThree({
  lessons,
  phrases,
  progress,
  completed,
  onOpen,
  onListen,
  onPractise,
}: {
  lessons: DailyLesson[];
  phrases: Phrase[];
  progress: ProgressMap;
  completed: string[];
  onOpen: (phrase: Phrase) => void;
  onListen: (text: string) => void;
  onPractise: (phrases: Phrase[], date: string) => void;
}) {
  const today = learningDay();
  const available = getAvailableLessons(lessons, today);
  const [selectedDate, setSelectedDate] = useState<string>();
  const selected =
    available.find((lesson) => lesson.date === selectedDate) ?? available[0];
  const selectedPhrases =
    selected?.phraseIds.flatMap(
      (id) => phrases.find((phrase) => phrase.id === id) ?? [],
    ) ?? [];
  return (
    <>
      <header className="page-intro">
        <p className="eyebrow">A SMALL DAILY RITUAL</p>
        <h1>
          Three little expressions.
          <br />
          <span>A whole lot to say.</span>
        </h1>
        <p>A new theme each day. A growing pocket of English for real life.</p>
      </header>
      <div className="daily-layout">
        <section className="daily-feature paper">
          <div className="daily-topline">
            <span className="date-stamp">
              <CalendarDays size={18} />{" "}
              {selected ? formatLessonDate(selected.date) : "Daily Three"}
            </span>
            <span className="quiet">Brisbane time</span>
          </div>
          {selected ? (
            <>
              <p className="eyebrow">{THEMES[selected.theme].label}</p>
              <h2>{THEMES[selected.theme].scene}</h2>
              <p>
                Meet your three expressions, recall them without peeking, then
                put them into a new conversation.
              </p>
              <div className="daily-preview">
                {selectedPhrases.map((phrase, i) => (
                  <button key={phrase.id} onClick={() => onOpen(phrase)}>
                    <span>0{i + 1}</span>
                    <strong>{phrase.expression}</strong>
                    <ArrowRight size={18} />
                  </button>
                ))}
              </div>
              <button
                className="primary-button"
                onClick={() => onPractise(selectedPhrases, selected.date)}
              >
                {completed.includes(selected.date)
                  ? "Visit this scene again"
                  : "Start this daily quest"}{" "}
                <ArrowRight size={18} />
              </button>
            </>
          ) : (
            <div className="empty-state">
              <h2>Your next three are on their way.</h2>
              <p>
                Practise a saved expression while the next lesson is prepared.
              </p>
            </div>
          )}
        </section>
        <aside className="paper lesson-calendar">
          <p className="eyebrow">YOUR DAILY PAGES</p>
          <h2>Every page stays.</h2>
          <p className="quiet">Missed a day? Pick it up whenever you like.</p>
          <div className="lesson-list">
            {available.map((lesson) => (
              <button
                key={lesson.date}
                className={selected?.date === lesson.date ? "selected" : ""}
                onClick={() => setSelectedDate(lesson.date)}
                aria-pressed={selected?.date === lesson.date}
              >
                <span>
                  <strong>{formatLessonDate(lesson.date)}</strong>
                  <small>{THEMES[lesson.theme].label}</small>
                </span>
                {completed.includes(lesson.date) ? (
                  <Check size={18} aria-label="Scene completed" />
                ) : (
                  <span className="lesson-count">3</span>
                )}
              </button>
            ))}
          </div>
        </aside>
      </div>
      {selected && (
        <>
          <div className="section-heading">
            <h2>Inside this page</h2>
            <span className="quiet">
              {selected.origin === "conversation"
                ? "From your daily conversation"
                : "Prepared for your daily practice"}
            </span>
          </div>
          <div className="phrase-grid">
            {selectedPhrases.map((phrase) => (
              <PhraseCard
                key={phrase.id}
                phrase={phrase}
                progress={progress[phrase.id]}
                onOpen={() => onOpen(phrase)}
                onListen={() => onListen(phrase.expression)}
              />
            ))}
          </div>
        </>
      )}
      {!available.some((lesson) => lesson.date === today) && (
        <p className="notice">
          Today’s page has not arrived yet. Your previous lessons are ready to
          use.
        </p>
      )}
    </>
  );
}
