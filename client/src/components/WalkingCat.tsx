import { useEffect, useState } from "react";

// The calico cat's walk cycle, cut from the reference recording: 75 frames (walk-frames/f00.webp to f74.webp),
// played in a loop so its legs, tail, head and eyes move exactly as in the recording.
const FRAME_COUNT = 75;
const FPS = 8;
const frameSrc = (index: number) => `/brand/walk-frames/f${String(index).padStart(2, "0")}.webp`;

export default function WalkingCat() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    // Load the whole cycle up front, so the loop never waits on the network.
    for (let index = 0; index < FRAME_COUNT; index++) new Image().src = frameSrc(index);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setFrame((current) => (current + 1) % FRAME_COUNT), 1000 / FPS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="walk-cat" aria-hidden="true">
      <img src={frameSrc(frame)} alt="" draggable={false} />
    </div>
  );
}
