import type { Theme } from "../types/learning";
import { CoffeeScene } from "./scenes/CoffeeScene";
import { RiversideScene } from "./scenes/RiversideScene";
import { StudioScene } from "./scenes/StudioScene";
import { RooftopScene } from "./scenes/RooftopScene";
import { RainyScene } from "./scenes/RainyScene";
import { StationScene } from "./scenes/StationScene";
import { ArcadeScene } from "./scenes/ArcadeScene";

const backdrops = {
  "small-talk": CoffeeScene,
  relationships: RiversideScene,
  work: StudioScene,
  social: RooftopScene,
  feelings: RainyScene,
  travel: StationScene,
  slang: ArcadeScene,
};

export function SceneBackdrop({ theme }: { theme: Theme }) {
  const Backdrop = backdrops[theme];
  return (
    <svg
      className="scene-backdrop"
      viewBox="0 0 520 320"
      fill="none"
      aria-hidden="true"
    >
      <rect width="520" height="320" rx="28" fill="var(--scene-sky)" />
      <circle cx="427" cy="65" r="32" fill="var(--scene-pop)" />
      <path
        d="M0 255Q140 211 262 250T520 240V320H0Z"
        fill="var(--scene-floor)"
      />

      <Backdrop />
      <path
        d="M26 300h76m313 0h79"
        stroke="var(--scene-ink)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity=".2"
      />
    </svg>
  );
}
