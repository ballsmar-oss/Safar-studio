import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export function useAdminData(c, r, o = 0) {
  const [f, g] = useState({
    data: null,
    error: "",
  });
  useEffect(() => {
    let m = true;
    api(c, {
      token: r,
    })
      .then(
        (b) =>
          m &&
          g({
            data: b,
            error: "",
          }),
      )
      .catch(
        (b) =>
          m &&
          g({
            data: null,
            error: b.message,
          }),
      );
    return () => {
      m = false;
    };
  }, [c, r, o]);
  return f;
}
