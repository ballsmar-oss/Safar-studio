import { useEffect, useRef } from "react";

// A hanging lamp with a pull cord. Drag the handle down (or tap it, or press Enter on it)
// to flip the light. The cord and the lamp move on small springs, drawn straight to the SVG
// every frame so React does not re-render while it moves.

type Props = {
  on: boolean;
  onToggle: (origin: { x: number; y: number }) => void;
  label: string;
};

const ANCHOR = { x: 178, y: 256 }; // where the cord leaves the shade
const REST_Y = 404; // where the handle hangs at rest
const PULL_TO_TOGGLE = 52; // how far (in SVG units) the cord has to go down to count as a pull
const MAX_PULL = 130;

export default function PullLamp({ on, onToggle, label }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const swingRef = useRef<SVGGElement>(null);
  const cordRef = useRef<SVGPathElement>(null);
  const handleRef = useRef<SVGGElement>(null);
  const bulbRef = useRef<SVGPathElement>(null);

  // Motion state lives in a ref: handle offset, its velocity, and the lamp's swing angle.
  const m = useRef({ x: 0, y: 0, vx: 0, vy: 0, a: 0, va: 0, dragging: false, startX: 0, startY: 0, maxY: 0, moved: 0, frame: 0, last: 0 });
  const toggleRef = useRef(onToggle);
  toggleRef.current = onToggle;

  const bulbCenter = () => {
    const r = bulbRef.current?.getBoundingClientRect();
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: window.innerWidth / 2, y: 200 };
  };

  const draw = () => {
    const s = m.current;
    const hx = ANCHOR.x + s.x;
    const hy = REST_Y + s.y;
    // Slack cord bows; a stretched cord runs straight. The bow trails the movement a little.
    const slack = Math.max(0, -s.y) * 0.55 + 5;
    const cx = (ANCHOR.x + hx) / 2 + slack - s.vx * 0.02;
    const cy = (ANCHOR.y + hy) / 2 - s.vy * 0.01;
    cordRef.current?.setAttribute("d", `M${ANCHOR.x} ${ANCHOR.y} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${hx.toFixed(1)} ${hy.toFixed(1)}`);
    const tilt = Math.atan2(hx - cx, hy - cy) * (-180 / Math.PI);
    handleRef.current?.setAttribute("transform", `translate(${hx.toFixed(1)} ${hy.toFixed(1)}) rotate(${tilt.toFixed(1)})`);
    swingRef.current?.setAttribute("transform", `rotate(${s.a.toFixed(2)} 130 0)`);
  };

  const step = (time: number) => {
    const s = m.current;
    const dt = Math.min(0.032, (time - (s.last || time)) / 1000) || 0.016;
    s.last = time;
    if (!s.dragging) {
      // Cord: a springy return to rest, a little under-damped so it bounces.
      s.vx += (-260 * s.x - 11 * s.vx) * dt;
      s.vy += (-300 * s.y - 12 * s.vy) * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
    }
    // Lamp: leans with a sideways pull, then swings back.
    const target = s.dragging ? s.x * 0.05 : 0;
    s.va += (-30 * (s.a - target) - 2.4 * s.va) * dt;
    s.a += s.va * dt;
    draw();
    const settled = !s.dragging && Math.abs(s.x) + Math.abs(s.y) < 0.2 && Math.abs(s.vx) + Math.abs(s.vy) < 1 && Math.abs(s.a) < 0.02 && Math.abs(s.va) < 0.05;
    if (settled) {
      s.x = s.y = s.vx = s.vy = s.a = s.va = 0;
      draw();
      s.frame = 0;
      s.last = 0;
      return;
    }
    s.frame = requestAnimationFrame(step);
  };

  const kick = () => {
    if (!m.current.frame) m.current.frame = requestAnimationFrame(step);
  };

  useEffect(() => {
    draw();
    return () => cancelAnimationFrame(m.current.frame);
  }, []);

  const toSvgUnits = () => {
    const rect = svgRef.current?.getBoundingClientRect();
    return rect && rect.width ? 260 / rect.width : 1;
  };

  // A tap or a key press acts like a short pull: the cord dips, the light flips, it bounces back.
  const quickPull = () => {
    const s = m.current;
    s.vy = 620;
    s.va += (Math.random() - 0.5) * 6;
    kick();
    window.setTimeout(() => toggleRef.current(bulbCenter()), 110);
  };

  const onPointerDown = (event: React.PointerEvent) => {
    const s = m.current;
    (event.currentTarget as Element).setPointerCapture(event.pointerId);
    s.dragging = true;
    s.startX = event.clientX - s.x / toSvgUnits();
    s.startY = event.clientY - s.y / toSvgUnits();
    s.maxY = 0;
    s.moved = 0;
    kick();
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const s = m.current;
    if (!s.dragging) return;
    const k = toSvgUnits();
    const rawX = (event.clientX - s.startX) * k;
    const rawY = (event.clientY - s.startY) * k;
    const nx = 70 * Math.tanh(rawX / 90);
    const ny = rawY > 0 ? MAX_PULL * Math.tanh(rawY / MAX_PULL) : Math.max(-24, rawY * 0.3);
    s.vx = (nx - s.x) * 60;
    s.vy = (ny - s.y) * 60;
    s.x = nx;
    s.y = ny;
    s.maxY = Math.max(s.maxY, ny);
    s.moved = Math.max(s.moved, Math.hypot(rawX, rawY));
  };

  const onPointerUp = () => {
    const s = m.current;
    if (!s.dragging) return;
    s.dragging = false;
    kick();
    if (s.moved < 4) quickPull();
    else if (s.maxY > PULL_TO_TOGGLE) toggleRef.current(bulbCenter());
  };

  return (
    <svg ref={svgRef} className="pull-lamp" viewBox="0 0 260 520" aria-hidden={false} role="group" aria-label={label}>
      <defs>
        <radialGradient id="pl-bulb" cx="50%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#fff6c9" />
          <stop offset="55%" stopColor="#ffd84a" />
          <stop offset="100%" stopColor="#f2b705" />
        </radialGradient>
        <linearGradient id="pl-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--lamp-shade-top)" />
          <stop offset="100%" stopColor="var(--lamp-shade)" />
        </linearGradient>
      </defs>
      <g ref={swingRef}>
        <line x1="130" y1="-400" x2="130" y2="168" stroke="var(--lamp-wire)" strokeWidth="2.2" />
        <rect x="119" y="162" width="22" height="20" rx="3" fill="var(--lamp-cap)" />
        <path d="M44 262 C44 204 90 178 130 178 C170 178 216 204 216 262 Z" fill="url(#pl-shade)" />
        <ellipse cx="130" cy="262" rx="86" ry="5" fill="var(--lamp-rim)" />
        <path ref={bulbRef} className="pull-lamp__bulb" d="M104 263 A26 26 0 0 0 156 263 Z" fill={on ? "url(#pl-bulb)" : "var(--lamp-bulb-off)"} />
        <path ref={cordRef} d="" fill="none" stroke="var(--lamp-cord)" strokeWidth="2" strokeLinecap="round" />
        <g ref={handleRef}>
          <rect className="pull-lamp__handle" x="-9" y="-2" width="18" height="36" rx="9" />
          {/* A bigger invisible target so the handle is easy to grab on a phone. */}
          <rect
            className="pull-lamp__hit"
            x="-34"
            y="-30"
            width="68"
            height="90"
            fill="transparent"
            role="button"
            tabIndex={0}
            aria-label={label}
            aria-pressed={on}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                quickPull();
              }
            }}
          />
        </g>
      </g>
    </svg>
  );
}
