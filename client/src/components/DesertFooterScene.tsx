import { useEffect, useRef, useState } from "react";
import { Camera, Flashlight, Lock } from "lucide-react";
import "./desert-footer.css";

/**
 * Closing scene above the footer, styled as an iPhone lock screen.
 * The wallpaper is a rendered desert scene (old TV on a Sadu rug, dallah,
 * Najdi houses). Scrolling crossfades the afternoon render into the night
 * render, and the TV screen powers off at nightfall.
 */

const DAY_SRC = "/media/scene/day.webp";
const NIGHT_SRC = "/media/scene/night.webp";
// Image size and the TV glass inside it, in image pixels.
const IMG_W = 1672;
const IMG_H = 941;
const SCREEN = { x: 692, y: 527, w: 244, h: 203, r: 30 };

// Extra stars for the sky above the image on tall (phone) screens.
const STARS = Array.from({ length: 40 }, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  return {
    x: r(1) * 100,
    y: r(2) * 100,
    s: 0.5 + r(3) * 1.1,
    d: (r(4) * 4).toFixed(2),
  };
});

function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function StatusBar() {
  return (
    <div className="dsc-status" dir="ltr" aria-hidden="true">
      <span className="dsc-carrier">SAFAR</span>
      <span className="dsc-status-icons">
        <svg width="18" height="12" viewBox="0 0 18 12">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12">
          <path d="M8 2.3c2.4 0 4.6.9 6.2 2.5l1.1-1.2A10.4 10.4 0 0 0 8 .6 10.4 10.4 0 0 0 .7 3.6l1.1 1.2A8.7 8.7 0 0 1 8 2.3Z" />
          <path d="M8 5.6c1.5 0 2.9.6 3.9 1.6l1.2-1.2A7.1 7.1 0 0 0 8 3.9 7.1 7.1 0 0 0 2.9 6l1.2 1.2c1-1 2.4-1.6 3.9-1.6Z" />
          <path d="M10.6 8.4A3.7 3.7 0 0 0 8 7.3c-1 0-1.9.4-2.6 1.1L8 11.2l2.6-2.8Z" />
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13">
          <rect
            x=".5"
            y=".5"
            width="23"
            height="12"
            rx="3.8"
            fill="none"
            stroke="currentColor"
            strokeOpacity=".4"
          />
          <rect x="2" y="2" width="20" height="9" rx="2.5" />
          <path
            d="M25 4.5v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2Z"
            fillOpacity=".45"
          />
        </svg>
      </span>
    </div>
  );
}

export default function DesertFooterScene({ isArabic }: { isArabic: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);
  const [torch, setTorch] = useState(false);

  const dateLabel = new Intl.DateTimeFormat(
    isArabic ? "ar-SA-u-ca-islamic-umalqura-nu-latn" : "en-US",
    { weekday: "long", day: "numeric", month: "long" }
  ).format(new Date());

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
      const night = smoothstep(0.15, 0.85, p);
      const glow = Math.max(0, 1 - Math.abs(p - 0.45) * 3);
      root.style.setProperty("--p", p.toFixed(3));
      root.style.setProperty("--night", night.toFixed(3));
      root.style.setProperty("--glow", glow.toFixed(3));

      if (!off && p > 0.8) off = true;
      else if (off && p < 0.72) off = false;
      root.classList.toggle("is-off", off);
      root.classList.toggle("is-dark", night > 0.5);

      // Riyadh clock from 4:30 pm to 7:30 pm
      const mins = Math.round(16 * 60 + 30 + p * 180);
      const label = `${Math.floor(mins / 60) - 12}:${String(mins % 60).padStart(2, "0")}`;
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
  }, []);

  return (
    <div ref={trackRef} className="dsc-track">
      <section
        ref={rootRef}
        className={`dsc${torch ? " is-torch" : ""}`}
        dir={isArabic ? "rtl" : "ltr"}
        aria-label={isArabic ? "مشهد ختامي" : "Closing scene"}
      >
        {/* sky above the image on tall screens */}
        <div className="dsc-sky dsc-sky--day" />
        <div className="dsc-sky dsc-sky--night">
          <svg className="dsc-stars" aria-hidden="true">
            {STARS.map((s, i) => (
              <circle
                key={i}
                cx={`${s.x}%`}
                cy={`${s.y}%`}
                r={s.s}
                style={{ animationDelay: `${s.d}s` }}
              />
            ))}
          </svg>
        </div>

        <div className="dsc-photo" aria-hidden="true">
          <img
            src={DAY_SRC}
            alt=""
            className="dsc-img"
            loading="lazy"
            decoding="async"
          />
          <img
            src={NIGHT_SRC}
            alt=""
            className="dsc-img dsc-img--night"
            loading="lazy"
            decoding="async"
          />
          <div className="dsc-glow" />
          <svg
            className="dsc-overlay"
            viewBox={`0 0 ${IMG_W} ${IMG_H}`}
            preserveAspectRatio="xMidYMax slice"
          >
            <defs>
              <clipPath id="dsc-glass">
                <rect
                  x={SCREEN.x}
                  y={SCREEN.y}
                  width={SCREEN.w}
                  height={SCREEN.h}
                  rx={SCREEN.r}
                />
              </clipPath>
              <radialGradient id="dsc-spill">
                <stop offset="0" stopColor="#bfe3ff" stopOpacity=".55" />
                <stop offset="1" stopColor="#bfe3ff" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* light from the screen on the rug once it gets dark */}
            <ellipse
              cx="830"
              cy="800"
              rx="330"
              ry="70"
              fill="url(#dsc-spill)"
              className="dsc-spill"
            />
            {/* the TV keeps showing color bars until it powers off */}
            <g clipPath="url(#dsc-glass)">
              <g className="dsc-screen-on">
                <image href={DAY_SRC} width={IMG_W} height={IMG_H} />
              </g>
              <circle
                cx={SCREEN.x + SCREEN.w / 2}
                cy={SCREEN.y + SCREEN.h / 2}
                r="5"
                fill="#fff"
                className="dsc-off-dot"
              />
            </g>
          </svg>
          <div className="dsc-torch" />
        </div>

        <div className="dsc-ui">
          <StatusBar />

          <div className="dsc-lock">
            <Lock
              size={15}
              strokeWidth={2.4}
              className="dsc-lock-icon"
              aria-hidden="true"
            />
            <span className="dsc-date">{dateLabel}</span>
            <span className="dsc-time" ref={clockRef} dir="ltr">
              4:30
            </span>
          </div>

          <a href="#contact" className="dsc-notif">
            <span className="dsc-notif-icon" aria-hidden="true">
              س
            </span>
            <span className="dsc-notif-body">
              <span className="dsc-notif-top">
                <strong>{isArabic ? "سَفَر" : "SAFAR"}</strong>
                <time>{isArabic ? "الآن" : "now"}</time>
              </span>
              <span className="dsc-notif-title">
                {isArabic
                  ? "قبل ما تطفي الشاشة…"
                  : "Before the screen goes dark…"}
              </span>
              <span className="dsc-notif-text">
                {isArabic
                  ? "خلّ فكرتك تبدأ رحلتها معنا. اضغط وابدأ رحلتك."
                  : "Let your idea start its journey with us. Tap to begin."}
              </span>
            </span>
          </a>

          <div className="dsc-quick">
            <button
              type="button"
              className="dsc-quick-btn"
              aria-pressed={torch}
              aria-label={isArabic ? "الكشاف" : "Flashlight"}
              onClick={() => setTorch(v => !v)}
            >
              <Flashlight size={22} strokeWidth={2} />
            </button>
            <a
              href="/works"
              className="dsc-quick-btn"
              aria-label={isArabic ? "أعمالنا" : "Our work"}
            >
              <Camera size={22} strokeWidth={2} />
            </a>
          </div>
          <span className="dsc-home-bar" aria-hidden="true" />
        </div>
      </section>
    </div>
  );
}
