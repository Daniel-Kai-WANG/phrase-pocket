export function Companion({
  celebrate = false,
  className = "",
}: {
  celebrate?: boolean;
  className?: string;
}) {
  return (
    <svg
      className={`companion ${celebrate ? "celebrating" : ""} ${className}`}
      viewBox="0 0 180 180"
      fill="none"
      aria-hidden="true"
    >
      <ellipse
        className="companion-shadow"
        cx="90"
        cy="158"
        rx="48"
        ry="9"
        fill="currentColor"
        opacity=".12"
      />
      <g className="companion-body">
        <path
          d="m53 125-8 26h22l10-22m34-2 8 24h22l-13-29"
          fill="var(--scene-ink)"
        />
        <path
          className="companion-hand"
          d="m135 98 15-12 9 5 5-10"
          stroke="var(--scene-ink)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="m41 98-16 14"
          stroke="var(--scene-ink)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M38 73c0-31 21-49 51-49s53 19 53 49v26c0 25-23 41-49 41H76l-24 13 3-22c-12-7-17-18-17-32Z"
          fill="var(--companion-color)"
          stroke="var(--scene-ink)"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M51 66c4-15 15-23 29-25"
          stroke="white"
          strokeWidth="7"
          strokeLinecap="round"
          opacity=".65"
        />
        <g className="companion-eyes" fill="var(--scene-ink)">
          <rect x="66" y="73" width="10" height="17" rx="5" />
          <rect x="107" y="73" width="10" height="17" rx="5" />
        </g>
        <ellipse cx="58" cy="98" rx="9" ry="5" fill="var(--scene-pop)" />
        <ellipse cx="123" cy="98" rx="9" ry="5" fill="var(--scene-pop)" />
        <path
          d={celebrate ? "M80 99h22c0 19-22 19-22 0Z" : "M83 103q8 9 16 0"}
          fill={celebrate ? "var(--scene-ink)" : "none"}
          stroke="var(--scene-ink)"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>
      {celebrate && (
        <g
          className="confetti"
          stroke="var(--scene-pop)"
          strokeWidth="5"
          strokeLinecap="round"
        >
          <path d="m22 40-6-8m143 13 7-9M85 11V4m-63 69H12m151-6h9" />
          <path d="m37 20 3 7m95-9-3 7" stroke="var(--companion-color)" />
        </g>
      )}
    </svg>
  );
}
