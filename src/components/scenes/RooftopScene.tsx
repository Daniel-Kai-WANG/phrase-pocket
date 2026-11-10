export function RooftopScene() {
  return (
    <g stroke="var(--scene-ink)" strokeWidth="3" strokeLinecap="round">
      <path
        d="M0 170h43V98h47v72h36v-40h39v40h59v-65h37v65h42v-48h54v48h44V92h53v78h66v91H0Z"
        fill="var(--scene-floor)"
        stroke="none"
      />
      <path d="M18 39q237 128 483 0" stroke="var(--scene-cream)" />
      {[55, 125, 196, 267, 338, 409, 479].map((x, i) => (
        <circle
          className="scene-spark"
          key={x}
          cx={x}
          cy={[59, 81, 95, 101, 94, 78, 51][i]}
          r="8"
          fill="var(--scene-pop)"
          stroke="none"
        />
      ))}
      <path
        d="M22 208h476m-459 0v65m85-65v65m95-65v65m95-65v65m95-65v65m70-65v65"
        stroke="var(--scene-cream)"
      />
      <ellipse cx="124" cy="236" rx="62" ry="15" fill="var(--scene-pop)" />
      <path d="M124 251v42m-22 0h44" />
      <path
        d="m92 205 4 28h16l4-28Zm42 0 4 28h16l4-28Z"
        fill="var(--scene-cream)"
      />
    </g>
  );
}
