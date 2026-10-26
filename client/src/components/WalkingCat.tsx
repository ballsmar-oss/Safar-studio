import { useEffect, useRef, useState } from "react";

// A calico cat that walks back and forth along the poster, pausing now and then to look up or to the left.
// The eyes sit over the cat's own eyes (image pixels, cat-walk.png is 646 x 440).
const EYES = [{ x: 523, y: 96, rx: 16, ry: 14 }, { x: 596, y: 93, rx: 15, ry: 14 }];
const GAZES = [
  { x: 0, y: -1 },
  { x: -1, y: 0 },
  { x: -1, y: -1 },
  { x: 0, y: 0 },
];
const TRACK_START = 4; // percent of the poster width
const TRACK_END = 70; // the cat's left edge stops here (its width is 24%)
const SPEED = 7; // percent per second

export default function WalkingCat() {
  const [left, setLeft] = useState(TRACK_START + 20);
  const [facing, setFacing] = useState(1);
  const [walking, setWalking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [gaze, setGaze] = useState(GAZES[3]);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    let current = TRACK_START + 20;
    const next = () => {
      // Walk to a random spot on the track.
      const target = TRACK_START + Math.random() * (TRACK_END - TRACK_START);
      const distance = Math.abs(target - current);
      setFacing(target >= current ? 1 : -1);
      setDuration(distance / SPEED);
      setWalking(true);
      setLeft(target);
      current = target;
      timer.current = window.setTimeout(() => {
        // Stop, then look up or to the left before walking again.
        setWalking(false);
        setGaze(GAZES[Math.floor(Math.random() * GAZES.length)]);
        timer.current = window.setTimeout(next, 1800 + Math.random() * 2200);
      }, distance / SPEED * 1000);
    };
    timer.current = window.setTimeout(next, 600);
    return () => window.clearTimeout(timer.current);
  }, []);

  return (
    <div className={`walk-cat${walking ? " is-walking" : ""}`} style={{ left: `${left}%`, transform: `scaleX(${facing})`, ["--walk-duration" as string]: `${duration}s` }} aria-hidden="true">
      <div className="walk-cat-inner">
        <img src="/brand/cat-walk.png" alt="" draggable={false} />
        <svg className="walk-cat-eyes" viewBox="0 0 646 440">
          {EYES.map((eye, i) => (
            <g key={i}>
              <ellipse cx={eye.x} cy={eye.y} rx={eye.rx} ry={eye.ry} className="walk-cat-white" />
              <g className="walk-cat-pupil" style={{ transform: `translate(${gaze.x * 4}px, ${gaze.y * 3}px)` }}>
                <circle cx={eye.x} cy={eye.y} r={7.5} className="walk-cat-iris" />
                <circle cx={eye.x + 2.5} cy={eye.y - 2.5} r={2.4} className="walk-cat-shine" />
              </g>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
