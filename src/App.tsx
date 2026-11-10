import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Compass,
  Settings,
  Mic,
  ArrowUpRight,
  WifiOff,
} from "lucide-react";
import type { Phrase } from "./types/learning";
import { Library } from "./pages/Library";
import { DailyThree } from "./pages/DailyThree";
import { NextQuest } from "./pages/NextQuest";
import { PhraseDetail } from "./components/PhraseDetail";
import { PracticeSession } from "./components/PracticeSession";
import { PocketSettings } from "./components/PocketSettings";
import { SpeakingStudio } from "./components/SpeakingStudio";
import { useLearningStore } from "./hooks/useLearningStore";
import { speak } from "./utils/speech";
import { learningDay, themeForDay } from "./utils/dates";
import { Companion } from "./components/Companion";
import { SCENES } from "./constants/scenes";
import { getAvailableLessons } from "./utils/catalog";
import { useMinuteClock } from "./hooks/useMinuteClock";
import { useOfflinePocket } from "./hooks/useOfflinePocket";
import { PocketUpdate } from "./components/PocketUpdate";
import { useContentFeed } from "./hooks/useContentFeed";
import { ContentSync } from "./components/ContentSync";

type Destination = "phrases" | "daily" | "quest";
interface ActiveSession {
  phrases: Phrase[];
  reviewOnly?: boolean;
  date?: string;
  questId?: string;
  questDay?: number;
}
const destinations = [
  { id: "phrases", label: "My Phrases", icon: BookOpen, number: "01" },
  { id: "daily", label: "Daily Three", icon: CalendarDays, number: "02" },
  { id: "quest", label: "Next Quest", icon: Compass, number: "03" },
] as const;

function currentDestination(): Destination {
  const hash = location.hash.slice(1);
  return hash === "daily" || hash === "quest" ? hash : "phrases";
}

export default function App() {
  const [tab, setTab] = useState<Destination>(currentDestination);
  const [detail, setDetail] = useState<Phrase | null>(null);
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [speaking, setSpeaking] = useState<Phrase | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>();
  const [settings, setSettings] = useState(false);
  const [notice, setNotice] = useState("");
  const [online, setOnline] = useState(navigator.onLine);
  const learning = useLearningStore();
  const offline = useOfflinePocket();
  const content = useContentFeed();
  const phrases = [
    ...content.feed.phrases,
    ...learning.data.quests.flatMap((quest) => quest.phrases),
  ];
  const personal = phrases.filter((phrase) => phrase.source === "personal");
  const today = learningDay(useMinuteClock());
  const availableLessons = getAvailableLessons(content.feed.lessons, today);
  const selectedLesson =
    availableLessons.find((lesson) => lesson.date === selectedDate) ??
    availableLessons[0];
  const dailyTheme = tab === "daily" ? selectedLesson?.theme : undefined;
  const sceneTheme =
    session?.phrases[0]?.theme ??
    detail?.theme ??
    speaking?.theme ??
    dailyTheme ??
    themeForDay(today);

  useEffect(() => {
    const navigate = () => setTab(currentDestination());
    const connection = () => setOnline(navigator.onLine);
    window.addEventListener("hashchange", navigate);
    window.addEventListener("online", connection);
    window.addEventListener("offline", connection);
    return () => {
      window.removeEventListener("hashchange", navigate);
      window.removeEventListener("online", connection);
      window.removeEventListener("offline", connection);
      window.speechSynthesis?.cancel();
    };
  }, []);

  function startSession(next: ActiveSession) {
    if (!next.phrases.length) {
      setNotice(
        "No expressions are due right now. Explore a saved card or visit Daily Three.",
      );
      return;
    }
    setDetail(null);
    setSession(next);
  }

  function finishSession() {
    if (!session) return;
    learning.completeScene(
      session.date
        ? `daily-${session.date}`
        : `${today}-${session.phrases.map((phrase) => phrase.id).join("-")}`,
      session.date,
    );
    if (session.questId && session.questDay)
      learning.completeQuestDay(session.questId, session.questDay);
  }

  return (
    <div className="app-shell" data-scene={sceneTheme}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="sidebar">
        <a className="brand" href="#phrases" aria-label="Phrase Pocket home">
          <span className="brand-icon">
            <Companion />
          </span>
          <span>
            phrase
            <span className="brand-second">
              pocket<span className="brand-dot">.</span>
            </span>
          </span>
        </a>
        <p className="sidebar-caption">Your everyday English adventure.</p>
        <nav aria-label="Main navigation">
          {destinations.map(({ id, label, icon: Icon, number }) => (
            <a
              key={id}
              href={`#${id}`}
              className={tab === id ? "nav-link selected" : "nav-link"}
              aria-current={tab === id ? "page" : undefined}
            >
              <Icon size={20} />
              <span>{label}</span>
              <small>{number}</small>
            </a>
          ))}
        </nav>
        <div className="sidebar-companion">
          <Companion />
          <p>
            YOUR CONVERSATION SIDEKICK
            <br />
            <strong>A little braver, every day.</strong>
          </p>
          <div className="stamp-total">
            {learning.data.stamps.length} scene{" "}
            {learning.data.stamps.length === 1 ? "stamp" : "stamps"} collected
          </div>
        </div>
        <button className="sidebar-settings" onClick={() => setSettings(true)}>
          <Settings size={18} /> Pocket settings
        </button>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span className="breadcrumb">
            PHRASE POCKET <span>/</span>{" "}
            {destinations.find((item) => item.id === tab)?.label}
          </span>
          <span className="world-indicator">
            <i />
            {SCENES[sceneTheme].name}
          </span>
          <div className="topbar-actions">
            <button
              className="text-button speaking-shortcut"
              onClick={() => setSpeaking(personal[0])}
            >
              <Mic size={17} /> Speaking room <ArrowUpRight size={15} />
            </button>
            <button
              className="profile-button"
              onClick={() => setSettings(true)}
              aria-label="Open pocket settings"
            >
              D
            </button>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          {offline.updateAvailable && (
            <PocketUpdate
              busy={Boolean(session || speaking)}
              onReload={offline.applyUpdate}
            />
          )}
          {!online && (
            <p className="notice" role="status">
              <WifiOff size={17} /> You’re offline. Saved cards are here; online
              coaching will return when you reconnect.
            </p>
          )}
          {learning.error && (
            <p className="error-message" role="alert">
              {learning.error}{" "}
              <button className="text-button" onClick={() => setSettings(true)}>
                Open settings
              </button>
            </p>
          )}
          {notice && (
            <div className="notice" role="status">
              {notice}
              <button className="text-button" onClick={() => setNotice("")}>
                Dismiss
              </button>
            </div>
          )}
          {tab === "phrases" && (
            <Library
              sceneTheme={sceneTheme}
              phrases={phrases}
              pendingPhrases={content.feed.pending}
              progress={learning.data.progress}
              onOpen={setDetail}
              onListen={(text) => setNotice(speak(text) ?? "")}
              onPractise={(items, reviewOnly) =>
                startSession({ phrases: items, reviewOnly })
              }
              onSpeak={() => setSpeaking(personal[0])}
            />
          )}
          {tab === "daily" && (
            <DailyThree
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              today={today}
              lessons={content.feed.lessons}
              phrases={phrases}
              progress={learning.data.progress}
              completed={learning.data.completedLessons}
              onOpen={setDetail}
              onListen={(text) => setNotice(speak(text) ?? "")}
              onPractise={(items, date) =>
                startSession({ phrases: items, date })
              }
            />
          )}
          {tab === "quest" && (
            <NextQuest
              quests={learning.data.quests}
              knownExpressions={phrases.map((phrase) => phrase.expression)}
              onStart={learning.startQuest}
              onPractise={(items, questId, questDay) =>
                startSession({ phrases: items, questId, questDay })
              }
            />
          )}
          <footer className="page-footer">
            <span>Small adventures. Real conversations.</span>
            <span>One little world at a time.</span>
          </footer>
        </main>
      </div>
      {detail && (
        <PhraseDetail
          phrase={detail}
          progress={learning.data.progress[detail.id]}
          onClose={() => setDetail(null)}
          onPractise={() =>
            startSession({
              phrases: [detail],
              reviewOnly: Boolean(learning.data.progress[detail.id]),
            })
          }
          onSpeak={() => {
            setSpeaking(detail);
            setDetail(null);
          }}
        />
      )}
      {session && (
        <PracticeSession
          phrases={session.phrases}
          reviewOnly={session.reviewOnly}
          onAttempt={learning.saveAttempt}
          onFinish={finishSession}
          onClose={() => setSession(null)}
        />
      )}
      {speaking && (
        <SpeakingStudio
          phrase={speaking}
          records={learning.data.speaking.filter(
            (record) => record.phraseId === speaking.id,
          )}
          onReviewed={learning.saveSpeaking}
          onClose={() => setSpeaking(null)}
        />
      )}
      {settings && (
        <PocketSettings
          data={learning.data}
          offlineReady={offline.ready}
          offlineError={offline.error}
          recoveryText={learning.recoveryText}
          contentSync={<ContentSync {...content} onSync={content.sync} />}
          onRestore={learning.restore}
          onClose={() => setSettings(false)}
        />
      )}
    </div>
  );
}
