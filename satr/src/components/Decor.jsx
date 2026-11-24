export function Squiggle({ className: c = "squiggle", color: r }) {
  return (
    <svg
      viewBox="0 0 56 12"
      className={c}
      style={
        r
          ? {
              color: r,
            }
          : undefined
      }
      aria-hidden="true"
    >
      <path
        d="M2 7c6-6 10-6 13 0s7 6 13 0 10-6 13 0 7 6 13 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function WavyEdge({ fill: c, flip: r = false }) {
  return (
    <svg
      viewBox="0 0 240 16"
      preserveAspectRatio="none"
      className="w-full h-4"
      style={
        r
          ? {
              transform: "scaleY(-1)",
            }
          : undefined
      }
      aria-hidden="true"
    >
      <path
        d="M0 16V8c6 0 6-6 12-6s6 6 12 6 6-6 12-6 6 6 12 6 6-6 12-6 6 6 12 6 6-6 12-6 6 6 12 6 6-6 12-6 6 6 12 6 6-6 12-6 6 6 12 6 6-6 12-6 6 6 12 6 6-6 12-6 6 6 12 6 6-6 12-6 6 6 12 6 6-6 12-6 6 6 12 6 6-6 12-6 6 6 12 6V16z"
        fill={c}
      />
      <path
        d="M0 8c6 0 6-6 12-6s6 6 12 6 6-6 12-6 6 6 12 6 6-6 12-6 6 6 12 6 6-6 12-6 6 6 12 6 6-6 12-6 6 6 12 6 6-6 12-6 6 6 12 6 6-6 12-6 6 6 12 6 6-6 12-6 6 6 12 6 6-6 12-6 6 6 12 6 6-6 12-6 6 6 12 6 6-6 12-6 6 6 12 6"
        fill="none"
        stroke="#3b3242"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function Star({ className: c }) {
  return (
    <svg viewBox="0 0 40 40" className={c} aria-hidden="true">
      <path
        d="M20 3l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z"
        fill="#fdecaa"
        stroke="#3b3242"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Heart({ className: c }) {
  return (
    <svg viewBox="0 0 24 24" className={c} aria-hidden="true">
      <path
        d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z"
        fill="#f198aa"
        stroke="#3b3242"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PaperClip({ className: c }) {
  return (
    <svg viewBox="0 0 30 60" className={c} aria-hidden="true">
      <path
        d="M10 50V14a7 7 0 0114 0v34a11 11 0 01-22 0V18"
        fill="none"
        stroke="#3b3242"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Marquee({ words: c }) {
  const r = [...c, ...c, ...c, ...c];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {r.map((o, f) => (
          <span key={f}>
            {o}
            <Heart className="w-4 h-4" />
          </span>
        ))}
      </div>
    </div>
  );
}
