import { useEffect, useState } from "react";

export function useReducedMotion() {
  const [c, r] = useState(false);
  useEffect(() => {
    const o = window.matchMedia("(prefers-reduced-motion: reduce)");
    const f = () => r(o.matches);
    f();
    o.addEventListener("change", f);
    return () => o.removeEventListener("change", f);
  }, []);
  return c;
}
