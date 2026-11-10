export function RiversideScene() {
  return (
    <g stroke="var(--scene-ink)" strokeWidth="3" strokeLinecap="round">
      <path
        d="M0 212q146-38 252 11t268-2v99H0Z"
        fill="var(--scene-water)"
        stroke="none"
      />
      <path d="M45 195h430M67 194v-28q170-174 388 0v28M85 148v47m51-85v85m54-110v110m58-118v118m60-109v109m60-84v84m55-44v44" />
      <path
        d="M0 264q91-10 205 14t315-19v61H0Z"
        fill="var(--scene-floor)"
        stroke="none"
      />
      <path
        className="scene-ripple"
        d="M50 233h49m37 11h71m130-15h66m20 18h49"
        stroke="var(--scene-cream)"
      />
      <path d="M29 227V97m-9 0h18V77H20Z" fill="var(--scene-pop)" />
      <path d="M432 273v-37m49 37v-37m-57-9h65m-65 12h65" strokeWidth="7" />
    </g>
  );
}
