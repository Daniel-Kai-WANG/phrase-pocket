import { Check, Flag, MessageCircle, Sparkles } from "lucide-react";

import type { PracticeStep } from "../utils/session";

const stops = [
  { id: "learn", label: "Discover", icon: Sparkles },
  { id: "recall", label: "Recall", icon: MessageCircle },
  { id: "transfer", label: "Use it", icon: Flag },
];

export function SceneJourney({ phase }: { phase: PracticeStep["phase"] }) {
  const active = stops.findIndex((stop) => stop.id === phase);
  return (
    <ol className="scene-journey" aria-label="Conversation journey">
      {stops.map(({ id, label, icon: Icon }, index) => (
        <li
          key={id}
          className={index <= active ? "reached" : ""}
          aria-current={index === active ? "step" : undefined}
        >
          <span>
            {index < active ? <Check size={18} /> : <Icon size={18} />}
          </span>
          {label}
        </li>
      ))}
    </ol>
  );
}
