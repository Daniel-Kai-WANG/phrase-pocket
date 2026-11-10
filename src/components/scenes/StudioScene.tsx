export function StudioScene() {
  return (
    <g stroke="var(--scene-ink)" strokeWidth="3" strokeLinejoin="round">
      <rect
        x="49"
        y="56"
        width="187"
        height="145"
        rx="12"
        fill="var(--scene-cream)"
      />
      <path
        d="M69 169V94h36v75m14 0V73h43v96m15 0v-60h39v60"
        fill="var(--scene-floor)"
        stroke="none"
      />
      <path d="M143 56v145M49 126h187" />
      <rect
        x="308"
        y="80"
        width="153"
        height="104"
        rx="9"
        fill="var(--scene-cream)"
      />
      <path
        d="M328 102h25v25h-25Zm49 6h27v25h-27Zm44-9h23v25h-23Z"
        fill="var(--scene-pop)"
        stroke="none"
      />
      <path d="m339 143 20 14 28-16 22 11 29-18" />
      <path d="M46 235h252m-231 0v54m208-54v54" strokeWidth="8" />
      <path d="m93 231-7-60h100l8 60Zm-19 3h134" fill="var(--scene-floor)" />
      <circle
        className="scene-spark"
        cx="138"
        cy="201"
        r="9"
        fill="var(--scene-pop)"
        stroke="none"
      />
      <path
        d="M433 247v-42m0 22q-33-40-32-11 0 19 32 20m0-17q29-38 32-11-3 20-32 20"
        fill="var(--scene-floor)"
      />
      <path d="m413 245 5 40h33l5-40Z" fill="var(--scene-pop)" />
    </g>
  );
}
