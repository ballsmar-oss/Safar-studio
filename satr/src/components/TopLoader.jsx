import { useEffect, useState } from "react";
import { WalkingCat } from "./Cat";

const MIN_LOADER_MS = 700;

function windowLoaded() {
  return new Promise((c) => {
    if (document.readyState === "complete") {
      return c();
    }
    window.addEventListener("load", () => c(), {
      once: true,
    });
  });
}

const twoFrames = () =>
  new Promise((c) =>
    requestAnimationFrame(() => requestAnimationFrame(() => c())),
  );

const wait = (c) => new Promise((r) => window.setTimeout(r, c));

export function TopLoader({ route: c }) {
  const [r, o] = useState(0.06);
  const [f, g] = useState("loading");
  useEffect(() => {
    let m = false;
    g("loading");
    o(0.06);
    const b = window.setInterval(() => o((S) => S + (0.88 - S) * 0.12), 160);
    Promise.all([
      windowLoaded(),
      document.fonts.ready,
      twoFrames(),
      wait(MIN_LOADER_MS),
    ]).then(async () => {
      if (!m) {
        window.clearInterval(b);
        o(1);
        g("done");
        await wait(450);
        if (!m) {
          g("hidden");
        }
      }
    });
    return () => {
      m = true;
      window.clearInterval(b);
    };
  }, [c]);
  if (f === "hidden") {
    return null;
  } else {
    return (
      <div
        className={`top-loader ${f === "done" ? "is-done" : ""}`}
        role="progressbar"
        aria-label="جاري تحميل الصفحة"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(r * 100)}
      >
        <div
          className="top-loader-bar"
          style={{
            width: `${r * 100}%`,
          }}
        >
          <WalkingCat className="top-loader-cat" />
        </div>
      </div>
    );
  }
}
