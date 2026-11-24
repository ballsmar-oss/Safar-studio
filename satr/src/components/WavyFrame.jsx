import { useId } from "react";
import { useReducedMotion } from "../lib/hooks";

const FRAME = 200;

const FRAME_INSET = 12;

const FRAME_RADIUS = 26;

const WAVE_AMP = 4;

const WAVES = 20;

const FRAME_STEPS = 240;

const FRAME_FLOWERS = 8;

const FRAME_SPEED = 26;

const FRAME_INK = "#3b3242";

const FRAME_CREAM = "#fffdf8";

const FRAME_SIDE = FRAME - (FRAME_INSET + FRAME_RADIUS) * 2;

const FRAME_CORNER = (Math.PI / 2) * FRAME_RADIUS;

const FRAME_LAP = FRAME_SIDE * 4 + FRAME_CORNER * 4;

function framePoint(c) {
  const r = FRAME_INSET + FRAME_RADIUS;
  const o = FRAME - FRAME_INSET - FRAME_RADIUS;
  const f = [
    {
      cx: o,
      cy: r,
      from: -Math.PI / 2,
    },
    {
      cx: o,
      cy: o,
      from: 0,
    },
    {
      cx: r,
      cy: o,
      from: Math.PI / 2,
    },
    {
      cx: r,
      cy: r,
      from: Math.PI,
    },
  ];
  const g = [
    {
      x: r,
      y: FRAME_INSET,
      dx: 1,
      dy: 0,
    },
    {
      x: FRAME - FRAME_INSET,
      y: r,
      dx: 0,
      dy: 1,
    },
    {
      x: o,
      y: FRAME - FRAME_INSET,
      dx: -1,
      dy: 0,
    },
    {
      x: FRAME_INSET,
      y: o,
      dx: 0,
      dy: -1,
    },
  ];
  let m = ((c % FRAME_LAP) + FRAME_LAP) % FRAME_LAP;
  for (let b = 0; b < 4; b++) {
    if (m <= FRAME_SIDE) {
      const S = g[b];
      return {
        x: S.x + S.dx * m,
        y: S.y + S.dy * m,
        nx: S.dy,
        ny: -S.dx,
      };
    }
    m -= FRAME_SIDE;
    if (m <= FRAME_CORNER) {
      const S = f[b];
      const y = S.from + m / FRAME_RADIUS;
      return {
        x: S.cx + Math.cos(y) * FRAME_RADIUS,
        y: S.cy + Math.sin(y) * FRAME_RADIUS,
        nx: Math.cos(y),
        ny: Math.sin(y),
      };
    }
    m -= FRAME_CORNER;
  }
  return {
    x: FRAME_INSET + FRAME_RADIUS,
    y: FRAME_INSET,
    nx: 0,
    ny: -1,
  };
}

function wavyPoint(c) {
  const r = framePoint(c);
  const o = WAVE_AMP * Math.sin((c / FRAME_LAP) * WAVES * Math.PI * 2);
  return {
    x: r.x + r.nx * o,
    y: r.y + r.ny * o,
  };
}

const FRAME_PATH = (() => {
  let c = "";
  for (let r = 0; r <= FRAME_STEPS; r++) {
    const o = wavyPoint((r / FRAME_STEPS) * FRAME_LAP);
    c += `${r ? "L" : "M"}${o.x.toFixed(2)} ${o.y.toFixed(2)}`;
  }
  return c + "Z";
})();

function FramePinkFlower() {
  return (
    <g>
      {[0, 72, 144, 216, 288].map((c) => (
        <circle
          key={c}
          cx="0"
          cy="-2.6"
          r="2.1"
          fill="#f7a9b8"
          stroke={FRAME_INK}
          strokeWidth="0.7"
          transform={`rotate(${c})`}
        />
      ))}
      <circle r="1.5" fill="#fdd56b" stroke={FRAME_INK} strokeWidth="0.6" />
    </g>
  );
}

function FrameMintFlower() {
  return (
    <g>
      {[0, 90, 180, 270].map((c) => (
        <ellipse
          key={c}
          cx="0"
          cy="-2.4"
          rx="1.8"
          ry="2.2"
          fill="#8fc7b2"
          stroke={FRAME_INK}
          strokeWidth="0.7"
          transform={`rotate(${c})`}
        />
      ))}
      <circle r="1.2" fill={FRAME_CREAM} stroke={FRAME_INK} strokeWidth="0.6" />
    </g>
  );
}

export function WavyFrame({ className: c = "" }) {
  const r = useReducedMotion();
  const o = `band-${useId().replace(/:/g, "")}`;
  return (
    <svg
      viewBox={`0 0 ${FRAME} ${FRAME}`}
      className={`wavy-frame ${c}`}
      aria-hidden="true"
    >
      <path
        id={o}
        d={FRAME_PATH}
        fill="none"
        stroke={FRAME_INK}
        strokeWidth={12.5}
        strokeLinejoin="round"
      />
      <path
        d={FRAME_PATH}
        fill="none"
        stroke={FRAME_CREAM}
        strokeWidth={7.5}
        strokeLinejoin="round"
      />
      <path
        d={FRAME_PATH}
        fill="none"
        stroke={FRAME_INK}
        strokeOpacity={0.35}
        strokeWidth={0.8}
        strokeDasharray="2 2.4"
      />
      {Array.from(
        {
          length: FRAME_FLOWERS,
        },
        (f, g) => {
          const Flower = g % 2 === 0 ? FramePinkFlower : FrameMintFlower;
          if (r) {
            const b = wavyPoint((g * FRAME_LAP) / FRAME_FLOWERS);
            return (
              <g
                key={g}
                transform={`translate(${b.x.toFixed(2)} ${b.y.toFixed(2)})`}
              >
                <Flower />
              </g>
            );
          }
          return (
            <g key={g}>
              <animateMotion
                dur={`${FRAME_SPEED}s`}
                begin={`-${((FRAME_SPEED * g) / FRAME_FLOWERS).toFixed(2)}s`}
                repeatCount="indefinite"
                rotate="auto"
              >
                <mpath href={`#${o}`} />
              </animateMotion>
              <Flower />
            </g>
          );
        },
      )}
    </svg>
  );
}
