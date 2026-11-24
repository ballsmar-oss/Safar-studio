import { useEffect, useId, useRef, useState } from "react";

import puzzleImage from "../assets/media/puzzle-mishmish.jpg";

const PZ_INK = "#3b3242";

const GRID = 3;

const CELL = 80;

const TAB = 16;

const PIECE = CELL + TAB * 2;

const WIDTH = 300;

const BOARD_X = (WIDTH - GRID * CELL) / 2;

const BOARD_Y = 24;

const TRAY_SCALE = 0.8;

const TRAY_PIECE = PIECE * TRAY_SCALE;

const TRAY_GAP = 6;

const TRAY_Y = BOARD_Y + GRID * CELL + 22;

const TRAY_X = (WIDTH - (GRID * TRAY_PIECE + (GRID - 1) * TRAY_GAP)) / 2;

const HEIGHT = Math.ceil(TRAY_Y + GRID * (TRAY_PIECE + TRAY_GAP));

const SNAP = 12;

const KNOB_START = 0.39;

const KNOB_R = 0.13;

function shuffle(c) {
  const r = [...c];
  for (let o = r.length - 1; o > 0; o--) {
    const f = Math.floor(Math.random() * (o + 1));
    [r[o], r[f]] = [r[f], r[o]];
  }
  return r;
}

function edgePath(c, r, o, f, g, m, b) {
  const S = (h, E) =>
    `${(c + o * CELL * h + g * CELL * E).toFixed(2)} ${(r + f * CELL * h + m * CELL * E).toFixed(2)}`;
  if (b === 0) {
    return `L${S(1, 0)}`;
  }
  const y = (KNOB_R * CELL).toFixed(2);
  return `L${S(KNOB_START, 0)} A${y} ${y} 0 1 ${b > 0 ? 1 : 0} ${S(1 - KNOB_START, 0)} L${S(1, 0)}`;
}

function slotOf(c) {
  const r = Math.floor(c / GRID);
  const o = c % GRID;
  return {
    x: BOARD_X + o * CELL - TAB,
    y: BOARD_Y + r * CELL - TAB,
  };
}

function isOverBoard(c) {
  const r = c.x + PIECE / 2;
  const o = c.y + PIECE / 2;
  return (
    r > BOARD_X &&
    r < BOARD_X + GRID * CELL &&
    o > BOARD_Y &&
    o < BOARD_Y + GRID * CELL
  );
}

function newPuzzle() {
  const c = () => (Math.random() < 0.5 ? 1 : -1);
  const r = Array.from(
    {
      length: GRID - 1,
    },
    () =>
      Array.from(
        {
          length: GRID,
        },
        c,
      ),
  );
  const o = Array.from(
    {
      length: GRID,
    },
    () =>
      Array.from(
        {
          length: GRID - 1,
        },
        c,
      ),
  );
  const f = [];
  for (let b = 0; b < GRID; b++) {
    for (let S = 0; S < GRID; S++) {
      const y = b === 0 ? 0 : -r[b - 1][S];
      const h = S === GRID - 1 ? 0 : o[b][S];
      const E = b === GRID - 1 ? 0 : r[b][S];
      const z = S === 0 ? 0 : -o[b][S - 1];
      f.push(
        `M0 0 ${edgePath(0, 0, 1, 0, 0, -1, y)} ${edgePath(CELL, 0, 0, 1, 1, 0, h)} ${edgePath(CELL, CELL, -1, 0, 0, 1, E)} ${edgePath(0, CELL, 0, -1, -1, 0, z)} Z`,
      );
    }
  }
  const g = shuffle(
    Array.from(
      {
        length: GRID * GRID,
      },
      (b, S) => S,
    ),
  );
  const m = f.map((b, S) => {
    const y = g[S];
    return {
      x: TRAY_X + (y % GRID) * (TRAY_PIECE + TRAY_GAP),
      y: TRAY_Y + Math.floor(y / GRID) * (TRAY_PIECE + TRAY_GAP),
      moved: false,
      placed: false,
    };
  });
  return {
    paths: f,
    pieces: m,
  };
}

const pct = (c, r) => `${(c / r) * 100}%`;

export function Puzzle({ onDone: c }) {
  const [r, o] = useState(newPuzzle);
  const [f, g] = useState(null);
  const [m, b] = useState("");
  const S = useRef(null);
  const y = useRef(null);
  const h = useRef(false);
  const E = useRef(undefined);
  const z = useRef(c);
  const Q = useId().replace(/:/g, "");
  const Z = r.pieces.filter((W) => W.placed).length;
  useEffect(() => {
    z.current = c;
  });
  useEffect(() => () => window.clearTimeout(E.current), []);
  useEffect(() => {
    if (Z !== 0) {
      if (Z === GRID * GRID) {
        if (!h.current) {
          h.current = true;
          b("كملتها! مشمش يقوم ويمشي...");
          E.current = window.setTimeout(() => z.current(), 1600);
        }
        return;
      }
      b(`تمام! باقي ${GRID * GRID - Z} قطع`);
    }
  }, [Z]);
  function O(W) {
    const P = S.current?.getScreenCTM();
    if (!P) {
      return {
        x: 0,
        y: 0,
      };
    }
    const st = new DOMPoint(W.clientX, W.clientY).matrixTransform(P.inverse());
    return {
      x: st.x,
      y: st.y,
    };
  }
  function C(W) {
    const R = r.pieces[W];
    if (R.placed) {
      return false;
    }
    const P = slotOf(W);
    if (Math.hypot(R.x - P.x, R.y - P.y) > SNAP) {
      return false;
    } else {
      o((st) => ({
        ...st,
        pieces: st.pieces.map((Ct, Vt) =>
          Vt === W
            ? {
                ...Ct,
                x: P.x,
                y: P.y,
                placed: true,
                moved: true,
              }
            : Ct,
        ),
      }));
      return true;
    }
  }
  function w(W, R) {
    if (r.pieces[R].placed) {
      return;
    }
    W.currentTarget.setPointerCapture(W.pointerId);
    const P = O(W);
    const st = r.pieces[R];
    y.current = {
      i: R,
      ox: P.x,
      oy: P.y,
      px: st.x,
      py: st.y,
    };
    g(R);
  }
  function Y(W) {
    const R = y.current;
    if (!R) {
      return;
    }
    const P = O(W);
    const st = R.px + P.x - R.ox;
    const Ct = R.py + P.y - R.oy;
    o((Vt) => ({
      ...Vt,
      pieces: Vt.pieces.map((qt, Ht) =>
        Ht === R.i
          ? {
              ...qt,
              x: st,
              y: Ct,
              moved: true,
            }
          : qt,
      ),
    }));
  }
  function J(W) {
    if (!y.current) {
      return;
    }
    y.current = null;
    g(null);
    const R = r.pieces[W];
    if (!R.placed) {
      if (!C(W) && isOverBoard(R)) {
        b("القطعة ما تركب هنا، جرّب مكان ثاني");
      }
    }
  }
  function et(W, R) {
    if (r.pieces[R].placed) {
      return;
    }
    const P = W.shiftKey ? 16 : 4;
    const Ct = {
      ArrowLeft: [-P, 0],
      ArrowRight: [P, 0],
      ArrowUp: [0, -P],
      ArrowDown: [0, P],
    }[W.key];
    if (Ct) {
      W.preventDefault();
      o((Vt) => ({
        ...Vt,
        pieces: Vt.pieces.map((qt, Ht) =>
          Ht === R
            ? {
                ...qt,
                x: qt.x + Ct[0],
                y: qt.y + Ct[1],
                moved: true,
              }
            : qt,
        ),
      }));
      return;
    }
    if (W.key === "Enter" || W.key === " ") {
      W.preventDefault();
      if (!C(R) && isOverBoard(r.pieces[R])) {
        b("القطعة ما تركب هنا، جرّب مكان ثاني");
      }
    }
  }
  function K() {
    window.clearTimeout(E.current);
    h.current = false;
    g(null);
    b("");
    o(newPuzzle());
  }
  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative w-full select-none"
        style={{
          height: 0,
          paddingTop: `${(HEIGHT / WIDTH) * 100}%`,
        }}
      >
        <svg
          ref={S}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
        >
          <rect
            x={BOARD_X}
            y={BOARD_Y}
            width={GRID * CELL}
            height={GRID * CELL}
            rx="8"
            style={{
              fill: "var(--color-paper)",
            }}
            stroke={PZ_INK}
            strokeWidth="2.5"
          />
          {r.paths.map((W, R) => {
            const P = Math.floor(R / GRID);
            const st = R % GRID;
            return (
              <path
                key={R}
                d={W}
                transform={`translate(${BOARD_X + st * CELL} ${BOARD_Y + P * CELL})`}
                fill="none"
                stroke={PZ_INK}
                strokeOpacity={0.4}
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
            );
          })}
        </svg>
        {r.pieces.map((W, R) => {
          const P = Math.floor(R / GRID);
          const st = R % GRID;
          const Ct = W.moved || W.placed ? PIECE : TRAY_PIECE;
          return (
            <div
              key={R}
              role="button"
              tabIndex={W.placed ? -1 : 0}
              aria-label={
                W.placed
                  ? `قطعة ${R + 1} مركّبة`
                  : `قطعة ${R + 1} من ${GRID * GRID}. اسحبها لمكانها، أو حرّكها بالأسهم واضغط Enter`
              }
              onKeyDown={(Vt) => et(Vt, R)}
              className="absolute outline-none focus-visible:ring-4 focus-visible:ring-pink-deep/60 rounded-md"
              style={{
                left: pct(W.x, WIDTH),
                top: pct(W.y, HEIGHT),
                width: pct(Ct, WIDTH),
                height: pct(Ct, HEIGHT),
                zIndex: f === R ? 3 : W.placed ? 1 : 2,
                transition:
                  f === null
                    ? "left .18s ease, top .18s ease, width .18s ease, height .18s ease"
                    : "none",
              }}
            >
              <svg
                viewBox={`${-TAB} ${-TAB} ${PIECE} ${PIECE}`}
                className="w-full h-full overflow-visible touch-none"
                style={{
                  cursor: W.placed ? "default" : "grab",
                }}
                onPointerDown={(Vt) => w(Vt, R)}
                onPointerMove={Y}
                onPointerUp={() => J(R)}
                onPointerCancel={() => J(R)}
              >
                <defs>
                  <clipPath id={`${Q}-${R}`}>
                    <path d={r.paths[R]} />
                  </clipPath>
                </defs>
                <image
                  href={puzzleImage}
                  x={-st * CELL}
                  y={-P * CELL}
                  width={GRID * CELL}
                  height={GRID * CELL}
                  preserveAspectRatio="xMidYMid slice"
                  clipPath={`url(#${Q}-${R})`}
                />
                <path d={r.paths[R]} fill="transparent" />
                <path
                  d={r.paths[R]}
                  fill="none"
                  stroke={PZ_INK}
                  strokeWidth={2.2}
                  strokeLinejoin="round"
                  pointerEvents="none"
                />
              </svg>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="m-0 text-[15px] font-bold" aria-live="polite">
          {m || "ركّب الصورة، كل قطعة لها مكانها بس"}
        </p>
        <button type="button" className="btn btn-sm" onClick={K}>
          من أول
        </button>
      </div>
    </div>
  );
}
