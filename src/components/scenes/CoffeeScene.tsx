export function CoffeeScene() {
  return (
    <g stroke="var(--scene-ink)" strokeWidth="3" strokeLinejoin="round">
      <rect
        x="52"
        y="95"
        width="263"
        height="161"
        rx="8"
        fill="var(--scene-cream)"
      />
      <path d="M42 123h284l-20-43H62Z" fill="var(--scene-pop)" />
      <path
        d="m99 81-9 42m63-42-4 42m60-42 5 42m50-42 12 42"
        stroke="var(--scene-cream)"
        strokeWidth="19"
      />
      <rect
        x="78"
        y="151"
        width="94"
        height="69"
        rx="7"
        fill="var(--scene-sky)"
      />
      <rect
        x="197"
        y="148"
        width="79"
        height="108"
        rx="9"
        fill="var(--scene-floor)"
      />
      <circle cx="258" cy="202" r="3" fill="var(--scene-ink)" />
      <path
        d="M107 175h25v16q-12 13-25 0Zm25 4h8q9 10-8 12"
        fill="var(--scene-cream)"
      />
      <path
        className="scene-steam"
        d="m112 164 2-10m12 10 2-10"
        strokeLinecap="round"
      />
      <path d="M391 230h59m-31 0v48m-34 0h68" strokeWidth="5" />
      <path d="M396 209h22v20h-22z" fill="var(--scene-pop)" />
    </g>
  );
}
