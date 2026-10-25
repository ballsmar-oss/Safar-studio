import { useEffect, useState } from "react";
import { useLocation } from "wouter";

// A thin striped line across the top of the page on every page change, with the cat walking on its edge.
const MIN_VISIBLE_MS = 700;

function pageLoaded() {
  return new Promise<void>((resolve) => {
    if (document.readyState === "complete") return resolve();
    window.addEventListener("load", () => resolve(), { once: true });
  });
}
const nextPaint = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

export function TopLoader() {
  const [route] = useLocation();
  const [progress, setProgress] = useState(0.06);
  const [phase, setPhase] = useState<"loading" | "done" | "hidden">("loading");

  useEffect(() => {
    let cancelled = false;
    setPhase("loading");
    setProgress(0.06);
    const trickle = window.setInterval(() => setProgress((p) => p + (0.88 - p) * 0.12), 160);

    Promise.all([pageLoaded(), document.fonts.ready, nextPaint(), wait(MIN_VISIBLE_MS)]).then(async () => {
      if (cancelled) return;
      window.clearInterval(trickle);
      setProgress(1);
      setPhase("done");
      await wait(450);
      if (!cancelled) setPhase("hidden");
    });

    return () => {
      cancelled = true;
      window.clearInterval(trickle);
    };
  }, [route]);

  if (phase === "hidden") return null;
  return (
    <div
      className={`top-loader ${phase === "done" ? "is-done" : ""}`}
      role="progressbar"
      aria-label="جاري تحميل الصفحة"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
    >
      <div className="top-loader-bar" style={{ width: `${progress * 100}%` }}>
        <img className="top-loader-cat" src="/brand/cat-open.png" alt="" width="40" />
      </div>
    </div>
  );
}
