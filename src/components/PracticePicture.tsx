import { Check, MessageCircle, Pause, Play } from "lucide-react";
import { useState } from "react";
import type { Theme } from "../types/learning";
import { SCENES } from "../constants/scenes";
import { SceneBackdrop } from "./SceneBackdrop";
import { Companion } from "./Companion";

export function PracticePicture({
  theme,
  success = false,
}: {
  theme: Theme;
  success?: boolean;
}) {
  const [paused, setPaused] = useState(false);
  return (
    <div
      className="practice-picture"
      data-success={success}
      data-paused={paused}
    >
      <div
        role="img"
        aria-label={`${SCENES[theme].name}: two conversation buddies${success ? " celebrating your reply" : " waiting for your next move"}`}
      >
        <SceneBackdrop theme={theme} />
        <div className="picture-friend">
          <Companion celebrate={success} />
        </div>
        <div className="picture-dot">
          <Companion celebrate={success} />
        </div>
        <span className="picture-reaction" aria-hidden="true">
          {success ? <Check size={25} /> : <MessageCircle size={25} />}
        </span>
      </div>
      <button
        className="scene-motion"
        aria-label={
          paused ? "Play illustration motion" : "Pause illustration motion"
        }
        onClick={() => setPaused(!paused)}
      >
        {paused ? <Play size={16} /> : <Pause size={16} />}
      </button>
    </div>
  );
}
