const INK = "#3b3242";

// A small cat in the site's own colors. Its legs, tail and body animate through the classes in index.css.
export function WalkingCat({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} aria-hidden="true" overflow="visible">
      <g className="walk-legs-a">
        <path d="M18 28v9M40 28v9" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      </g>
      <g className="walk-legs-b">
        <path d="M24 28v9M46 28v9" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      </g>
      <path className="walk-tail" d="M50 20c8-2 10-10 6-14" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      <rect x="14" y="14" width="38" height="17" rx="8.5" fill="#f6b98a" stroke={INK} strokeWidth="2.5" />
      <path d="M6 8l2-7 6 5M20 8l-1-7-6 5" fill="#f6b98a" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="13" cy="15" r="10" fill="#f6b98a" stroke={INK} strokeWidth="2.5" />
      <circle cx="9.5" cy="14" r="1.8" fill={INK} />
      <circle cx="16" cy="14" r="1.8" fill={INK} />
      <ellipse cx="7.5" cy="18.5" rx="2.2" ry="1.4" fill="#f7a9b8" />
      <path d="M11.5 18.5l1.5 1.5 1.5-1.5" fill="none" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
