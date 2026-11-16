import { useEffect, useRef } from "react";
import "./desert-footer.css";

/**
 * Closing scene above the footer: an old TV sits on a Sadu rug on a dune,
 * with Najdi mud houses and palms behind it. Scrolling down moves the sky
 * from afternoon to evening (sun sets, stars and moon appear, windows light up)
 * and the TV powers off at nightfall.
 */

const STARS = Array.from({ length: 70 }, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  return {
    x: r(1) * 1440,
    y: -320 + r(2) * 650,
    s: 0.6 + r(3) * 1.5,
    d: (r(4) * 4).toFixed(2),
  };
});

const PALMS = [
  { x: 250, y: 492, h: 150, lean: -14 },
  { x: 318, y: 488, h: 118, lean: 10 },
  { x: 470, y: 486, h: 96, lean: -6 },
  { x: 1215, y: 474, h: 132, lean: 12 },
  { x: 1300, y: 480, h: 104, lean: -10 },
];

const HOUSES = [
  { x: 905, w: 120, h: 92, base: 482 },
  { x: 1012, w: 92, h: 128, base: 482 },
  { x: 1092, w: 128, h: 80, base: 484 },
];

function Palm({
  x,
  y,
  h,
  lean,
}: {
  x: number;
  y: number;
  h: number;
  lean: number;
}) {
  const tx = x + lean;
  const ty = y - h;
  const fronds = [-170, -140, -112, -80, -52, -22, 8, 200, 168].map(
    (deg, i) => {
      const a = (deg * Math.PI) / 180;
      const len = h * (0.42 + (i % 3) * 0.06);
      const ex = tx + Math.cos(a) * len;
      const ey = ty + Math.sin(a) * len * 0.55 + len * 0.42;
      const mx = (tx + ex) / 2;
      const my = (ty + ey) / 2 - len * 0.32;
      return `M${tx} ${ty} Q${mx} ${my - 7} ${ex} ${ey} Q${mx} ${my + 6} ${tx} ${ty}Z`;
    }
  );
  return (
    <g>
      <path
        d={`M${x} ${y} Q${x + lean * 0.2} ${y - h * 0.55} ${tx} ${ty}`}
        className="dsc-trunk"
        strokeWidth={h / 18}
      />
      {fronds.map((d, i) => (
        <path key={i} d={d} className="dsc-frond" />
      ))}
      <circle cx={tx - 4} cy={ty + 7} r={4} className="dsc-dates" />
      <circle cx={tx + 5} cy={ty + 8} r={3.5} className="dsc-dates" />
    </g>
  );
}

function House({
  x,
  w,
  h,
  base,
}: {
  x: number;
  w: number;
  h: number;
  base: number;
}) {
  const top = base - h;
  const teeth = Math.floor(w / 14);
  const step = w / teeth;
  let crest = `M${x} ${top}`;
  for (let i = 0; i < teeth; i++)
    crest += ` L${x + step * i + step / 2} ${top - 11} L${x + step * (i + 1)} ${top}`;
  crest += ` L${x + w} ${top + 4} L${x} ${top + 4}Z`;
  const vents = Array.from(
    { length: Math.max(2, Math.floor(w / 26)) },
    (_, i) => x + 14 + i * 24
  );
  const winY = top + h * 0.42;
  return (
    <g>
      <rect x={x} y={top} width={w} height={h + 8} className="dsc-mud" />
      <path d={crest} className="dsc-mud" />
      <rect x={x} y={top + 6} width={w} height={4} className="dsc-mud-line" />
      {vents.map(vx => (
        <path
          key={vx}
          d={`M${vx} ${top + 22} l6 -9 l6 9Z`}
          className="dsc-vent"
        />
      ))}
      <rect
        x={x + w * 0.2}
        y={winY}
        width={13}
        height={17}
        rx={2}
        className="dsc-window"
      />
      <rect
        x={x + w * 0.62}
        y={winY}
        width={13}
        height={17}
        rx={2}
        className="dsc-window"
      />
    </g>
  );
}

/** Lit windows are drawn above the evening tint so they keep their warmth. */
function HouseLights({
  x,
  w,
  h,
  base,
}: {
  x: number;
  w: number;
  h: number;
  base: number;
}) {
  const winY = base - h + h * 0.42;
  return (
    <g className="dsc-lights">
      {[x + w * 0.2, x + w * 0.62].map(wx => (
        <g key={wx}>
          <circle cx={wx + 6.5} cy={winY + 8} r={24} fill="url(#dsc-lamp)" />
          <rect
            x={wx}
            y={winY}
            width={13}
            height={17}
            rx={2}
            className="dsc-window-lit"
          />
        </g>
      ))}
    </g>
  );
}

export default function DesertFooterScene({ isArabic }: { isArabic: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);
  // keep the moon on the opposite side from the text block
  const moonX = isArabic ? 540 : 900;

  useEffect(() => {
    const track = trackRef.current;
    const root = rootRef.current;
    if (!track || !root) return;
    let frame = 0;
    let off = false;
    let lastClock = "";

    const update = () => {
      frame = 0;
      // The stage is sticky inside a taller track: progress is how far it has
      // travelled while pinned (0 when it pins, 1 when the track releases it).
      const t = track.getBoundingClientRect();
      const r = root.getBoundingClientRect();
      const range = t.height - r.height;
      const p =
        range > 0 ? Math.min(1, Math.max(0, (r.top - t.top) / range)) : 0;
      const night = Math.min(1, Math.max(0, (p - 0.5) / 0.35));
      const glow = Math.max(0, 1 - Math.abs(p - 0.55) * 2.6);
      root.style.setProperty("--p", p.toFixed(3));
      root.style.setProperty("--night", night.toFixed(3));
      root.style.setProperty("--glow", glow.toFixed(3));

      if (!off && p > 0.86) off = true;
      else if (off && p < 0.78) off = false;
      root.classList.toggle("is-off", off);

      // Riyadh clock from 4:30 pm to 7:30 pm
      const mins = Math.round(16 * 60 + 30 + p * 180);
      const hh = Math.floor(mins / 60) - 12;
      const mm = String(mins % 60).padStart(2, "0");
      const label = `${hh}:${mm} ${isArabic ? "م" : "PM"}`;
      if (label !== lastClock && clockRef.current) {
        lastClock = label;
        clockRef.current.textContent = label;
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    let listening = false;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !listening) {
        listening = true;
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        update();
      } else if (!entry.isIntersecting && listening) {
        listening = false;
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
    });
    io.observe(track);
    update();

    return () => {
      io.disconnect();
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isArabic]);

  return (
    <div ref={trackRef} className="dsc-track">
      <section
        ref={rootRef}
        className="dsc"
        dir={isArabic ? "rtl" : "ltr"}
        aria-label={isArabic ? "مشهد ختامي" : "Closing scene"}
      >
        <div className="dsc-sky dsc-sky--day" />
        <div className="dsc-sky dsc-sky--glow" />
        <div className="dsc-sky dsc-sky--night" />

        <div className="dsc-copy">
          <span className="dsc-clock">
            {isArabic ? "الرياض" : "Riyadh"} ·{" "}
            <span ref={clockRef}>4:30 {isArabic ? "م" : "PM"}</span>
          </span>
          <h2>
            {isArabic ? "قبل ما تطفي الشاشة…" : "Before the screen goes dark…"}
          </h2>
          <p>
            {isArabic
              ? "خلّ فكرتك تبدأ رحلتها معنا، من أول خطوة لين الإطلاق."
              : "Let your idea start its journey with us, from the first step to launch."}
          </p>
          <a href="#contact" className="dsc-cta">
            {isArabic ? "ابدأ رحلتك" : "Start your journey"}
          </a>
        </div>

        <svg
          className="dsc-art"
          viewBox="0 0 1440 640"
          preserveAspectRatio="xMidYMax slice"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="dsc-lamp">
              <stop offset="0" stopColor="#ffc864" stopOpacity=".55" />
              <stop offset="1" stopColor="#ffc864" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="dsc-tvglow">
              <stop offset="0" stopColor="#9fe3d8" stopOpacity=".5" />
              <stop offset="1" stopColor="#9fe3d8" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="dsc-screen-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2f9c95" />
              <stop offset=".62" stopColor="#f6cf86" />
              <stop offset="1" stopColor="#e9935b" />
            </linearGradient>
            <linearGradient id="dsc-wood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#9a6438" />
              <stop offset="1" stopColor="#6e4122" />
            </linearGradient>
            <pattern
              id="dsc-sadu"
              width="26"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <rect width="26" height="28" fill="#a3262b" />
              <rect y="8" width="26" height="12" fill="#1d1414" />
              <path
                d="M0 20 L6.5 8 L13 20Z M13 20 L19.5 8 L26 20Z"
                fill="#f3e6cf"
              />
              <rect y="3" width="26" height="2" fill="#f3e6cf" />
              <rect y="23" width="26" height="2" fill="#e7b04a" />
            </pattern>
            <pattern
              id="dsc-scan"
              width="4"
              height="4"
              patternUnits="userSpaceOnUse"
            >
              <rect width="4" height="2" fill="rgba(0,0,0,.16)" />
            </pattern>
            <mask id="dsc-crescent">
              <rect width="1440" height="640" fill="#fff" />
              <circle cx={moonX + 12} cy="96" r="23" fill="#000" />
            </mask>
            <mask id="dsc-crescent-narrow">
              <rect width="1440" height="640" fill="#fff" />
              <circle cx="870" cy="283" r="19" fill="#000" />
            </mask>
            <clipPath id="dsc-screen-clip">
              <rect x="642" y="372" width="122" height="96" rx="18" />
            </clipPath>
          </defs>

          {/* sun sinks behind the dunes */}
          <g className="dsc-sun">
            <circle cx="330" cy="190" r="70" fill="#fff3c4" opacity=".25" />
            <circle cx="330" cy="190" r="44" fill="#ffe79a" />
            <circle
              cx="330"
              cy="190"
              r="44"
              fill="#ff9a52"
              className="dsc-sun-warm"
            />
          </g>

          <path
            className="dsc-dune-far"
            d="M0 470 C200 430 400 440 560 455 C760 470 950 418 1200 428 C1320 433 1400 444 1440 450 L1440 640 L0 640Z"
          />

          {HOUSES.map(h => (
            <House key={h.x} {...h} />
          ))}
          {PALMS.map(p => (
            <Palm key={p.x} {...p} />
          ))}

          <path
            className="dsc-dune-mid"
            d="M0 515 C250 462 420 470 600 482 C800 494 1000 470 1440 480 L1440 640 L0 640Z"
          />
          <path
            className="dsc-dune-near"
            d="M0 640 L0 545 C280 506 520 496 720 500 C930 504 1150 520 1440 534 L1440 640Z"
          />
          <path
            className="dsc-ridge"
            d="M120 532 C330 506 540 497 720 500 C900 503 1080 512 1300 528"
          />

          {/* evening tint over the land */}
          <rect className="dsc-dusk" y="-1200" width="1440" height="1840" />

          <g className="dsc-stars">
            {STARS.map((s, i) => (
              <circle
                key={i}
                cx={s.x}
                cy={s.y}
                r={s.s}
                style={{ animationDelay: `${s.d}s` }}
              />
            ))}
          </g>
          <g className="dsc-moon dsc-moon--wide">
            <circle
              cx={moonX}
              cy="104"
              r="26"
              fill="#fff6d8"
              mask="url(#dsc-crescent)"
            />
          </g>
          <g className="dsc-moon dsc-moon--narrow">
            <circle
              cx="860"
              cy="290"
              r="22"
              fill="#fff6d8"
              mask="url(#dsc-crescent-narrow)"
            />
          </g>

          {HOUSES.map(h => (
            <HouseLights key={`lit-${h.x}`} {...h} />
          ))}

          {/* glow of the screen on the sand */}
          <ellipse
            cx="720"
            cy="512"
            rx="190"
            ry="34"
            fill="url(#dsc-tvglow)"
            className="dsc-tv-sandglow"
          />

          {/* Sadu rug */}
          <g className="dsc-rug">
            <path
              d="M572 500 L868 500 L892 524 L548 524Z"
              fill="url(#dsc-sadu)"
            />
            <path
              d="M548 524 L892 524"
              stroke="#f3e6cf"
              strokeWidth="2"
              strokeDasharray="2 4"
            />
          </g>

          {/* the TV */}
          <g className="dsc-tv">
            <path d="M700 340 L668 288" className="dsc-antenna" />
            <path d="M716 340 L752 280" className="dsc-antenna" />
            <circle cx="668" cy="288" r="3.5" fill="#d8c7a4" />
            <circle cx="752" cy="280" r="3.5" fill="#d8c7a4" />
            <path
              d="M660 494 L652 508 M800 494 L808 508"
              className="dsc-legs"
            />
            <rect
              x="624"
              y="340"
              width="196"
              height="156"
              rx="16"
              fill="url(#dsc-wood)"
            />
            <rect
              x="630"
              y="346"
              width="184"
              height="144"
              rx="12"
              fill="none"
              stroke="#b77d4b"
              strokeOpacity=".5"
            />
            <rect
              x="634"
              y="364"
              width="138"
              height="112"
              rx="22"
              fill="#2a1d14"
            />
            <rect
              x="778"
              y="362"
              width="32"
              height="116"
              rx="6"
              fill="#4b2f1a"
            />
            <circle cx="794" cy="382" r="8" fill="#d8c7a4" />
            <circle cx="794" cy="382" r="2" fill="#4b2f1a" />
            <circle cx="794" cy="408" r="6" fill="#d8c7a4" />
            <g stroke="#2a1d14" strokeWidth="1.5">
              <path d="M784 428 H804 M784 434 H804 M784 440 H804 M784 446 H804 M784 452 H804" />
            </g>
            <circle cx="794" cy="466" r="3" className="dsc-power-led" />

            <g clipPath="url(#dsc-screen-clip)">
              <rect x="642" y="372" width="122" height="96" fill="#0b0d0e" />
              <g className="dsc-screen-content">
                <rect
                  x="642"
                  y="372"
                  width="122"
                  height="96"
                  fill="url(#dsc-screen-sky)"
                />
                <circle cx="733" cy="404" r="11" fill="#fff1bf" />
                <path
                  d="M642 452 C670 438 700 440 724 446 C742 450 754 446 764 442 L764 468 L642 468Z"
                  fill="#d79a5c"
                />
                <path
                  d="M668 448 Q670 430 672 420"
                  stroke="#5a3b22"
                  strokeWidth="2.5"
                  fill="none"
                />
                <path
                  d="M672 420 q-12 -2 -18 6 M672 420 q12 -3 18 4 M672 420 q-6 -9 -15 -9 M672 420 q6 -10 15 -8"
                  stroke="#2f5d3a"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
                <text
                  x="728"
                  y="440"
                  textAnchor="middle"
                  className="dsc-screen-title"
                >
                  سَفَر
                </text>
                <rect
                  x="642"
                  y="372"
                  width="122"
                  height="96"
                  fill="url(#dsc-scan)"
                />
                <rect
                  x="642"
                  y="372"
                  width="122"
                  height="10"
                  fill="rgba(255,255,255,.12)"
                  className="dsc-roll"
                />
              </g>
              <circle
                cx="703"
                cy="420"
                r="3"
                fill="#fff"
                className="dsc-off-dot"
              />
              <rect
                x="642"
                y="372"
                width="122"
                height="96"
                fill="none"
                stroke="rgba(255,255,255,.18)"
                strokeWidth="6"
                rx="18"
              />
            </g>
          </g>

          {/* dallah and cups */}
          <g className="dsc-dallah" transform="translate(860 504)">
            <path d="M-12 -22 C-26 -26 -30 -40 -40 -56 L-37 -57 C-28 -44 -22 -33 -10 -30Z" />
            <path d="M-18 0 C-22 -10 -20 -22 -10 -28 L-7 -40 C-12 -44 -13 -48 -11 -50 L11 -50 C13 -48 12 -44 7 -40 L10 -28 C20 -22 22 -10 18 0Z" />
            <path d="M-9 -50 C-8 -58 8 -58 9 -50Z M0 -57 L-2.5 -60 L0 -69 L2.5 -60Z" />
            <path
              d="M14 -18 C30 -22 28 -44 10 -46"
              fill="none"
              strokeWidth="3"
            />
            <path
              d="M28 0 L40 0 L42 -9 L26 -9Z M46 0 L58 0 L60 -9 L44 -9Z"
              className="dsc-finjan"
            />
          </g>
        </svg>
      </section>
    </div>
  );
}
