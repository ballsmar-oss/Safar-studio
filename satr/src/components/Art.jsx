import { resolveProductImage } from "../lib/product-images";

const INK = "#3b3242";

const stroke = {
  stroke: INK,
  strokeWidth: 3,
  strokeLinejoin: "round",
  strokeLinecap: "round",
};

export function Art({ kind: c, className: r }) {
  return (
    <svg viewBox="0 0 120 120" className={r} aria-hidden="true">
      {ART[c]}
    </svg>
  );
}

const ART = {
  pencil: (
    <g transform="rotate(-35 60 60)">
      <rect
        x="20"
        y="48"
        width="62"
        height="24"
        rx="3"
        fill="#fdd56b"
        {...stroke}
      />
      <path d="M20 56h62M20 64h62" {...stroke} strokeWidth={2} />
      <rect
        x="10"
        y="48"
        width="12"
        height="24"
        rx="4"
        fill="#f198aa"
        {...stroke}
      />
      <path d="M82 48l22 12-22 12z" fill="#f5d9b8" {...stroke} />
      <path d="M97 56l7 4-7 4z" fill={INK} />
    </g>
  ),
  notebook: (
    <g>
      <rect
        x="28"
        y="18"
        width="66"
        height="86"
        rx="8"
        fill="#f7c6cf"
        {...stroke}
      />
      <rect x="40" y="18" width="10" height="86" fill="#f198aa" {...stroke} />
      <rect
        x="58"
        y="38"
        width="28"
        height="16"
        rx="4"
        fill="#fffdf8"
        {...stroke}
      />
      <path d="M86 18v30l-6-5-6 5V18" fill="#8fc7b2" {...stroke} />
    </g>
  ),
  backpack: (
    <g>
      <path d="M44 30c0-12 32-12 32 0" fill="none" {...stroke} />
      <rect
        x="26"
        y="28"
        width="68"
        height="78"
        rx="20"
        fill="#8fc7b2"
        {...stroke}
      />
      <rect
        x="38"
        y="64"
        width="44"
        height="30"
        rx="8"
        fill="#cbe4da"
        {...stroke}
      />
      <path d="M38 76h44" {...stroke} />
      <circle cx="60" cy="46" r="5" fill="#fdecaa" {...stroke} />
    </g>
  ),
  ruler: (
    <g transform="rotate(-30 60 60)">
      <rect
        x="8"
        y="46"
        width="104"
        height="28"
        rx="4"
        fill="#cbe4da"
        {...stroke}
      />
      {[18, 28, 38, 48, 58, 68, 78, 88, 98].map((c, r) => (
        <path
          key={c}
          d={`M${c} 46v${r % 2 ? 7 : 12}`}
          {...stroke}
          strokeWidth={2.5}
        />
      ))}
    </g>
  ),
  crayons: (
    <g>
      {[
        ["#f198aa", 30],
        ["#fdd56b", 50],
        ["#8fc7b2", 70],
        ["#b9a3ea", 90],
      ].map(([c, r], o) => (
        <g key={o} transform={`rotate(${(o - 1.5) * 6} ${r} 90)`}>
          <path d={`M${+r - 8} 100V44l8-18 8 18v56z`} fill={c} {...stroke} />
          <path
            d={`M${+r - 8} 58h16M${+r - 8} 86h16`}
            {...stroke}
            strokeWidth={2}
          />
        </g>
      ))}
    </g>
  ),
  eraser: (
    <g transform="rotate(-18 60 60)">
      <rect
        x="18"
        y="40"
        width="84"
        height="40"
        rx="8"
        fill="#fffdf8"
        {...stroke}
      />
      <path
        d="M18 48a8 8 0 018-8h30v40H26a8 8 0 01-8-8z"
        fill="#f7c6cf"
        {...stroke}
      />
      <path d="M70 54h20M70 64h14" {...stroke} strokeWidth={2.5} />
    </g>
  ),
  scissors: (
    <g>
      <path
        d="M58 60L92 18M62 60L28 18"
        fill="none"
        {...stroke}
        strokeWidth={5}
      />
      <circle cx="42" cy="86" r="14" fill="#f198aa" {...stroke} />
      <circle cx="78" cy="86" r="14" fill="#f198aa" {...stroke} />
      <circle cx="42" cy="86" r="6" fill="#fffdf8" {...stroke} />
      <circle cx="78" cy="86" r="6" fill="#fffdf8" {...stroke} />
      <path d="M50 74l10-14 10 14" fill="none" {...stroke} />
      <circle cx="60" cy="60" r="3" fill={INK} />
    </g>
  ),
  pencilcase: (
    <g>
      <rect
        x="14"
        y="40"
        width="92"
        height="50"
        rx="22"
        fill="#dccef4"
        {...stroke}
      />
      <path d="M26 52h68" {...stroke} strokeDasharray="5 5" />
      <circle cx="92" cy="52" r="5" fill="#fdecaa" {...stroke} />
      <path d="M92 57v14" {...stroke} />
      <path d="M40 70h24" {...stroke} strokeWidth={2.5} />
    </g>
  ),
  highlighter: (
    <g>
      {[
        ["#f7c6cf", 36, -12],
        ["#fdecaa", 60, 0],
        ["#cbe4da", 84, 12],
      ].map(([c, r, o], f) => (
        <g key={f} transform={`rotate(${o} ${r} 64)`}>
          <rect
            x={+r - 11}
            y="34"
            width="22"
            height="66"
            rx="6"
            fill={c}
            {...stroke}
          />
          <path d={`M${+r - 8} 34l3-14h10l3 14`} fill="#fffdf8" {...stroke} />
          <path d={`M${+r - 11} 50h22`} {...stroke} strokeWidth={2} />
        </g>
      ))}
    </g>
  ),
  glue: (
    <g>
      <rect
        x="40"
        y="44"
        width="40"
        height="62"
        rx="8"
        fill="#fdecaa"
        {...stroke}
      />
      <rect
        x="44"
        y="20"
        width="32"
        height="26"
        rx="6"
        fill="#8fc7b2"
        {...stroke}
      />
      <rect
        x="48"
        y="64"
        width="24"
        height="22"
        rx="4"
        fill="#fffdf8"
        {...stroke}
      />
    </g>
  ),
  sharpener: (
    <g>
      <rect
        x="24"
        y="36"
        width="72"
        height="56"
        rx="12"
        fill="#dccef4"
        {...stroke}
      />
      <circle cx="46" cy="58" r="10" fill="#fffdf8" {...stroke} />
      <circle cx="76" cy="58" r="7" fill="#fffdf8" {...stroke} />
      <path d="M24 76h72" {...stroke} />
    </g>
  ),
  geometry: (
    <g>
      <path d="M18 98h70L18 28z" fill="#cbe4da" {...stroke} />
      <path d="M32 84h26L32 58z" fill="#fffdf8" {...stroke} />
      <path
        d="M58 98a36 36 0 0172 0"
        transform="translate(-26 0)"
        fill="#fdecaa"
        {...stroke}
      />
      <path
        d="M86 98a10 10 0 0120 0"
        transform="translate(-14 0)"
        fill="#fffdf8"
        {...stroke}
      />
    </g>
  ),
};

export function ProductArt({ product: c, className: r }) {
  const o = resolveProductImage(c.image);
  if (o) {
    return (
      <img
        src={o}
        alt=""
        loading="lazy"
        draggable={false}
        className="block w-full h-full object-contain p-[12%]"
      />
    );
  } else {
    return (
      <Art
        kind={c.art}
        className={r ?? "absolute inset-[17%] w-[66%] h-[66%]"}
      />
    );
  }
}
