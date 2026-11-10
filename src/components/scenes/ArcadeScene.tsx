export function ArcadeScene() {
  return (
    <g stroke="var(--scene-ink)" strokeWidth="3" strokeLinejoin="round">
      <rect
        x="54"
        y="48"
        width="194"
        height="46"
        rx="23"
        fill="var(--scene-pop)"
      />
      <path d="M78 71h22m-11-11v22m28-11h47m18-8 8 8-8 8m27-16 8 8-8 8" />
      <path
        d="M69 124h130l-13 86 23 29v48H59v-48l23-29Z"
        fill="var(--scene-floor)"
      />
      <rect
        x="88"
        y="142"
        width="91"
        height="59"
        rx="8"
        fill="var(--scene-ink)"
      />
      <path
        className="scene-spark"
        d="m112 174 12-12 12 12 12-12 12 12"
        stroke="var(--companion-color)"
      />
      <path d="M81 236h98m-76-6v-10" />
      <circle cx="103" cy="216" r="5" fill="var(--scene-pop)" />
      <circle cx="164" cy="229" r="5" fill="var(--scene-pop)" />
      <path d="M356 150h99v109h-99Z" fill="var(--scene-floor)" />
      <circle cx="406" cy="180" r="17" fill="var(--scene-ink)" />
      <circle cx="406" cy="230" r="21" fill="var(--scene-ink)" />
      <path
        className="scene-ripple"
        d="m328 126 11-12m116 9 12 10m-97-10v-14"
        stroke="var(--scene-pop)"
      />
    </g>
  );
}
