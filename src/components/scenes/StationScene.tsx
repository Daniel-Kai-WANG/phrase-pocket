export function StationScene() {
  return (
    <g stroke="var(--scene-ink)" strokeWidth="3" strokeLinejoin="round">
      <path
        d="M0 130 91 63l80 67 95-92 121 92 65-49 68 49v114H0Z"
        fill="var(--scene-floor)"
        stroke="none"
      />
      <path
        d="m228 75 38-37 49 37-29-7-20 11-18-13Z"
        fill="var(--scene-cream)"
        stroke="none"
      />
      <rect
        x="34"
        y="145"
        width="311"
        height="99"
        rx="29"
        fill="var(--scene-cream)"
      />
      <path d="M36 218h307" stroke="var(--scene-pop)" strokeWidth="12" />
      {[61, 124, 187].map((x) => (
        <rect
          key={x}
          x={x}
          y="164"
          width="44"
          height="33"
          rx="8"
          fill="var(--scene-water)"
        />
      ))}
      <rect
        x="264"
        y="161"
        width="48"
        height="83"
        rx="12"
        fill="var(--scene-floor)"
      />
      <circle cx="91" cy="247" r="12" fill="var(--scene-ink)" />
      <circle cx="284" cy="247" r="12" fill="var(--scene-ink)" />
      <path d="M0 263h520m-510 10h500" />
      <path d="M422 229V109m-40 0h80V73h-80Z" fill="var(--scene-pop)" />
      <path d="M398 91h47m-9-8 9 8-9 8" />
    </g>
  );
}
