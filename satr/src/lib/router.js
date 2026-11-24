import { useEffect, useState } from "react";

export function useHashRoute() {
  const c = () =>
    window.location.hash.startsWith("#/")
      ? window.location.hash.slice(1)
      : null;
  const [r, o] = useState(() => c() ?? "/");
  useEffect(() => {
    const f = () => {
      const g = c();
      if (g !== null) {
        o(g);
        window.scrollTo({
          top: 0,
        });
      }
    };
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  return r;
}
