import { useEffect, useRef, useState } from "react";

// Open eyes drawn over a sleeping cat. Tapping the cat wakes it; the pupils look down while the page
// scrolls down and up while it scrolls up. Scrolling the cat out of view puts it back to sleep.
type Eye = { x: number; y: number; rx: number; ry: number };
type Props = {
  width: number; // size of the cat image in pixels; the eyes are placed in these coordinates
  height: number;
  eyes: Eye[];
  hit: { left: string; top: string; width: string; height: string }; // tap area, in % of the image
  label: string;
};

// Renders only the eye layer and the tap area. The parent draws the image and must be the same size as it.
export default function SleepyCat({ width, height, eyes, hit, label }: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [awake, setAwake] = useState(false);
  const [look, setLook] = useState<-1 | 0 | 1>(0);

  useEffect(() => {
    const element = buttonRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        setAwake(false);
        setLook(0);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!awake) return;
    let last = window.scrollY;
    let timer = 0;
    const onScroll = () => {
      const now = window.scrollY;
      if (now === last) return;
      setLook(now > last ? 1 : -1);
      last = now;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setLook(0), 700);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
  }, [awake]);

  return (
    <>
      <svg className={`sleepy-eyes${awake ? " is-open" : ""}`} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        {eyes.map((eye, i) => (
          <g key={i}>
            <ellipse cx={eye.x} cy={eye.y} rx={eye.rx} ry={eye.ry} className="sleepy-white" />
            <g className="sleepy-pupil" style={{ transform: `translateY(${look * eye.ry * 0.45}px)` }}>
              <circle cx={eye.x} cy={eye.y} r={eye.ry * 0.64} className="sleepy-iris" />
              <circle cx={eye.x + eye.rx * 0.22} cy={eye.y - eye.ry * 0.3} r={eye.ry * 0.26} className="sleepy-shine" />
            </g>
          </g>
        ))}
      </svg>
      <button
        ref={buttonRef}
        type="button"
        className="sleepy-hit"
        style={{ left: hit.left, top: hit.top, width: hit.width, height: hit.height }}
        aria-label={label}
        aria-pressed={awake}
        onClick={() => setAwake(true)}
      />
    </>
  );
}
