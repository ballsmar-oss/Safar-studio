import { useEffect, useState } from "react";

// The calico cat's walk cycle, cut from the reference recording: 75 frames (walk-frames/f00.webp to f74.webp).
export const WALK_FRAME_COUNT = 75;
export const walkFrameSrc = (index: number) => `/brand/walk-frames/f${String(index).padStart(2, "0")}.webp`;

// Every frame is downloaded and decoded once, and the images are kept here, so switching frames never waits on the network.
let preloaded: Promise<HTMLImageElement[]> | null = null;
function preloadFrames() {
  if (!preloaded) {
    preloaded = Promise.all(
      Array.from({ length: WALK_FRAME_COUNT }, (_, index) => {
        const img = new Image();
        img.src = walkFrameSrc(index);
        return img.decode().then(() => img, () => img);
      }),
    );
  }
  return preloaded;
}

// Returns the frame to show. The animation starts only after every frame is ready, so it never stalls on the first loop.
export function useWalkFrame(fps: number) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let id = 0;
    let cancelled = false;
    preloadFrames().then(() => {
      if (cancelled) return;
      id = window.setInterval(() => setFrame((current) => (current + 1) % WALK_FRAME_COUNT), 1000 / fps);
    });
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [fps]);
  return frame;
}
