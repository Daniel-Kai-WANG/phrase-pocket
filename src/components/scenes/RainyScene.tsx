export function RainyScene() {
  return (
    <g stroke="var(--scene-ink)" strokeWidth="3" strokeLinejoin="round">
      <rect
        x="55"
        y="38"
        width="203"
        height="168"
        rx="64"
        fill="var(--scene-water)"
      />
      <path d="M155 38v168M55 132h203" />
      <g className="scene-rain" stroke="var(--scene-cream)">
        <path d="m84 77-6 12m35-32-6 12m76-2-6 12m43 16-6 12m-117 49-6 12m39-22-6 12m53 12-6 12m44-32-6 12" />
      </g>
      <path d="M341 239V98m-40 0 17-44h46l18 44Z" fill="var(--scene-pop)" />
      <path d="M314 243h53" strokeWidth="6" />
      <rect
        x="69"
        y="213"
        width="142"
        height="63"
        rx="25"
        fill="var(--scene-floor)"
      />
      <rect
        x="58"
        y="224"
        width="30"
        height="57"
        rx="13"
        fill="var(--scene-pop)"
      />
      <rect
        x="190"
        y="224"
        width="30"
        height="57"
        rx="13"
        fill="var(--scene-pop)"
      />
      <path d="M89 276v16m100-16v16" />
      <path d="M409 265h60m-30 0v30" strokeWidth="6" />
      <path d="M427 243h21v21h-21Zm21 5h8v10h-8" fill="var(--scene-cream)" />
    </g>
  );
}
