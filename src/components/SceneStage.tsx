import { useState } from "react";
import { MessageCircle, Pause, Play, Sparkles } from "lucide-react";
import type { Theme } from "../types/learning";
import { SCENES } from "../constants/scenes";
import { Companion } from "./Companion";
import { SceneBackdrop } from "./SceneBackdrop";

export function SceneStage({
  theme,
  visited = false,
}: {
  theme: Theme;
  visited?: boolean;
}) {
  const [greeting, setGreeting] = useState(false);
  const [paused, setPaused] = useState(false);
  const scene = SCENES[theme];
  return (
    <div className="scene-stage" data-scene={theme} data-paused={paused}>
      <div className="scene-stage-label">
        <span>
          {visited ? <Sparkles size={14} /> : <MessageCircle size={14} />}
          {visited ? "SCENE VISITED" : "MEET DOT"}
        </span>
        <button
          className="scene-motion"
          onClick={() => setPaused(!paused)}
          aria-label={paused ? "Play scene motion" : "Pause scene motion"}
          aria-pressed={paused}
        >
          {paused ? <Play size={15} /> : <Pause size={15} />}
        </button>
      </div>
      <div className="scene-art">
        <SceneBackdrop theme={theme} />
        <button
          className="scene-companion"
          onClick={() => setGreeting(!greeting)}
          aria-label="Talk to Dot"
          aria-expanded={greeting}
        >
          <Companion celebrate={visited} />
        </button>
      </div>
      <div className="scene-dialogue" aria-live="polite">
        <strong>
          {greeting
            ? "DOT SAYS"
            : visited
              ? "SOUVENIR COLLECTED"
              : "TAP DOT TO SAY HELLO"}
        </strong>
        <p>
          {greeting
            ? scene.prompt
            : visited
              ? scene.souvenir
              : scene.invitation}
        </p>
      </div>
    </div>
  );
}
