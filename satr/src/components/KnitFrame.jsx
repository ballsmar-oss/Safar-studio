import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "../lib/hooks";

const KNIT_PAD = 15;

const KNIT_INSET = 9;

const KNIT_RADIUS = 20;

const STITCH_GAP = 7.5;

const KNIT_SPEED = 9;

const FLOWER_GAP = 80;

const KNIT_INK = "#3b3242";

const YARN = {
  loop: "#7dba67",
  edge: "#2f5a2a",
  shine: "#b9e2a3",
  crevice: "#2c4f27",
};

function knitTrack(c, r) {
  const o = KNIT_INSET;
  const f = KNIT_INSET;
  const g = c - KNIT_INSET;
  const m = r - KNIT_INSET;
  const b = Math.min(KNIT_RADIUS, (g - o) / 2, (m - f) / 2);
  const S = g - o - b * 2;
  const y = m - f - b * 2;
  const h = S * 2 + y * 2 + Math.PI * 2 * b;
  const E = `M${o + b} ${f}h${S}a${b} ${b} 0 0 1 ${b} ${b}v${y}a${b} ${b} 0 0 1 ${-b} ${b}h${-S}a${b} ${b} 0 0 1 ${-b} ${-b}v${-y}a${b} ${b} 0 0 1 ${b} ${-b}Z`;
  const z = (Math.PI / 2) * b;
  const Q = (C, w, Y, J) => ({
    x: C + Math.cos(Y + J / b) * b,
    y: w + Math.sin(Y + J / b) * b,
  });
  const Z = [
    [
      S,
      (C) => ({
        x: o + b + C,
        y: f,
      }),
    ],
    [z, (C) => Q(g - b, f + b, -Math.PI / 2, C)],
    [
      y,
      (C) => ({
        x: g,
        y: f + b + C,
      }),
    ],
    [z, (C) => Q(g - b, m - b, 0, C)],
    [
      S,
      (C) => ({
        x: g - b - C,
        y: m,
      }),
    ],
    [z, (C) => Q(o + b, m - b, Math.PI / 2, C)],
    [
      y,
      (C) => ({
        x: o,
        y: m - b - C,
      }),
    ],
    [z, (C) => Q(o + b, f + b, Math.PI, C)],
  ];
  return {
    d: E,
    lap: h,
    at: (C) => {
      let w = ((C % h) + h) % h;
      for (const [Y, J] of Z) {
        if (w <= Y) {
          return J(w);
        }
        w -= Y;
      }
      return Z[0][1](0);
    },
  };
}

function Stitch({ id: c }) {
  const r = (o) => (
    <g transform={`translate(0 ${o * 2.7}) rotate(${o * -26})`}>
      <ellipse
        rx="4.5"
        ry="3"
        fill={YARN.loop}
        stroke={YARN.edge}
        strokeWidth="0.8"
      />
      <path
        d="M-2.6 -1.4 Q0 -2.7 2.4 -1.5"
        fill="none"
        stroke={YARN.shine}
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </g>
  );
  return (
    <g id={c}>
      {r(-1)}
      {r(1)}
    </g>
  );
}

function PinkFlower() {
  return (
    <g>
      {[0, 72, 144, 216, 288].map((c) => (
        <circle
          key={c}
          cx="0"
          cy="-3"
          r="2.5"
          fill="#f7a9b8"
          stroke={KNIT_INK}
          strokeWidth="0.8"
          transform={`rotate(${c})`}
        />
      ))}
      <circle r="1.8" fill="#fdd56b" stroke={KNIT_INK} strokeWidth="0.7" />
    </g>
  );
}

function CreamFlower() {
  return (
    <g>
      {[45, 135, 225, 315].map((c) => (
        <ellipse
          key={c}
          cx="0"
          cy="-2.9"
          rx="2.1"
          ry="2.7"
          fill="#fff3c4"
          stroke={KNIT_INK}
          strokeWidth="0.8"
          transform={`rotate(${c})`}
        />
      ))}
      <circle r="1.5" fill="#f198aa" stroke={KNIT_INK} strokeWidth="0.7" />
    </g>
  );
}

function Needle() {
  return (
    <g>
      <line
        x1="-11"
        y1="0"
        x2="10"
        y2="0"
        stroke="#8e96a3"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <line
        x1="-11"
        y1="-0.4"
        x2="10"
        y2="-0.4"
        stroke="#e6eaf0"
        strokeWidth="0.5"
        strokeLinecap="round"
      />
      <circle
        cx="11.2"
        cy="0"
        r="1.9"
        fill="#f198aa"
        stroke={KNIT_INK}
        strokeWidth="0.7"
      />
    </g>
  );
}

function Clip() {
  return (
    <g>
      <path
        d="M-2.4 -3.2 V2.2 A1.9 1.9 0 0 0 1.4 2.2 V-2.4 A1.1 1.1 0 0 0 -0.7 -2.4 V1.9"
        fill="none"
        stroke={KNIT_INK}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M-2.4 -3.2 V2.2 A1.9 1.9 0 0 0 1.4 2.2 V-2.4 A1.1 1.1 0 0 0 -0.7 -2.4 V1.9"
        fill="none"
        stroke="#d9dee6"
        strokeWidth="0.6"
        strokeLinecap="round"
      />
    </g>
  );
}

export function KnitFrame({ children: c, className: r = "" }) {
  const o = useRef(null);
  const [f, g] = useState(null);
  const m = useReducedMotion();
  const b = `knit-${useId().replace(/:/g, "")}`;
  useLayoutEffect(() => {
    const S = o.current;
    if (!S) {
      return;
    }
    const y = () => {
      const E = Math.round(S.offsetWidth);
      const z = Math.round(S.offsetHeight);
      g((Q) =>
        Q && Q.w === E && Q.h === z
          ? Q
          : {
              w: E,
              h: z,
            },
      );
    };
    y();
    const h = new ResizeObserver(y);
    h.observe(S);
    return () => h.disconnect();
  }, []);
  return (
    <div
      ref={o}
      className={`relative isolate flex flex-col ${r}`}
      style={{
        padding: KNIT_PAD,
      }}
    >
      {f && f.w > KNIT_PAD * 4 && f.h > KNIT_PAD * 4 && (
        <KnitBorder id={b} w={f.w} h={f.h} reduced={m} />
      )}
      {c}
    </div>
  );
}

function KnitBorder({ id: c, w: r, h: o, reduced: f }) {
  const g = useRef(null);
  const m = knitTrack(r, o);
  const b = Math.max(12, Math.round(m.lap / STITCH_GAP));
  const S = Math.max(4, Math.round(m.lap / FLOWER_GAP));
  const y = m.lap / KNIT_SPEED;
  const h = `${y.toFixed(2)}s`;
  const E = (Z, O) => `-${((y * Z) / O).toFixed(3)}s`;
  useEffect(() => {
    const Z = g.current;
    if (!Z || f) {
      return;
    }
    const O = new IntersectionObserver(([C]) =>
      C.isIntersecting ? Z.unpauseAnimations() : Z.pauseAnimations(),
    );
    O.observe(Z);
    return () => O.disconnect();
  }, [f]);
  const z = (Z, O) =>
    f ? null : (
      <animateMotion
        dur={h}
        begin={E(Z, O)}
        repeatCount="indefinite"
        rotate="auto"
      >
        <mpath href={`#${c}-path`} />
      </animateMotion>
    );
  const Q = (Z, O, C = false) => {
    const w = (Z * m.lap) / O;
    const Y = m.at(w);
    const J = m.at(w + 0.5);
    const et = C ? (Math.atan2(J.y - Y.y, J.x - Y.x) * 180) / Math.PI : 0;
    return `translate(${Y.x.toFixed(1)} ${Y.y.toFixed(1)}) rotate(${et.toFixed(1)})`;
  };
  return (
    <svg
      ref={g}
      className="absolute inset-0 -z-10 pointer-events-none overflow-visible"
      width={r}
      height={o}
      viewBox={`0 0 ${r} ${o}`}
      aria-hidden="true"
    >
      <defs>
        <Stitch id={`${c}-v`} />
      </defs>
      <path id={`${c}-path`} d={m.d} fill="none" stroke="none" />
      <path
        d={m.d}
        fill="none"
        stroke={YARN.crevice}
        strokeWidth={9}
        strokeLinejoin="round"
      />
      {Array.from(
        {
          length: b,
        },
        (Z, O) =>
          f ? (
            <use key={O} href={`#${c}-v`} transform={Q(O, b, true)} />
          ) : (
            <use key={O} href={`#${c}-v`}>
              {z(O, b)}
            </use>
          ),
      )}
      {[0.22, 0.72].map((Z, O) => {
        const C = m.at(Z * m.lap);
        const w = m.at(Z * m.lap + 0.5);
        const Y = (Math.atan2(w.y - C.y, w.x - C.x) * 180) / Math.PI;
        if (f) {
          return (
            <g
              key={`needle-${O}`}
              transform={`translate(${C.x.toFixed(1)} ${C.y.toFixed(1)}) rotate(${(Y - 35).toFixed(1)})`}
            >
              <g transform="scale(1.45)">
                <Needle />
              </g>
            </g>
          );
        } else {
          return (
            <g key={`needle-${O}`}>
              <animateMotion
                dur={h}
                begin={E(Z, 1)}
                repeatCount="indefinite"
                rotate="auto"
              >
                <mpath href={`#${c}-path`} />
              </animateMotion>
              <g transform="rotate(-35) scale(1.45)">
                <Needle />
              </g>
            </g>
          );
        }
      })}
      {Array.from(
        {
          length: 3,
        },
        (Z, O) => {
          const C = (O + 0.6) / 3;
          const w = C * m.lap;
          const Y = m.at(w);
          const J = m.at(w + 0.5);
          const et = (Math.atan2(J.y - Y.y, J.x - Y.x) * 180) / Math.PI;
          if (f) {
            return (
              <g
                key={`clip-${O}`}
                transform={`translate(${Y.x.toFixed(1)} ${Y.y.toFixed(1)}) rotate(${(et - 55).toFixed(1)})`}
              >
                <g transform="scale(1.6)">
                  <Clip />
                </g>
              </g>
            );
          } else {
            return (
              <g key={`clip-${O}`}>
                <animateMotion
                  dur={h}
                  begin={E(C, 1)}
                  repeatCount="indefinite"
                  rotate="auto"
                >
                  <mpath href={`#${c}-path`} />
                </animateMotion>
                <g transform="rotate(-55) scale(1.6)">
                  <Clip />
                </g>
              </g>
            );
          }
        },
      )}
      {Array.from(
        {
          length: S,
        },
        (Z, O) => {
          const C = O % 2 === 0 ? PinkFlower : CreamFlower;
          if (f) {
            return (
              <g key={O} transform={Q(O, S)}>
                <C />
              </g>
            );
          } else {
            return (
              <g key={O}>
                {z(O, S)}
                <C />
              </g>
            );
          }
        },
      )}
    </svg>
  );
}
