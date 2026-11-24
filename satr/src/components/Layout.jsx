import { CartDrawer, MenuDrawer } from "./Drawers";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { TopLoader } from "./TopLoader";
import { useStore } from "../lib/store";

export function Layout({ route: c, children: r }) {
  const { panel: o } = useStore();
  return (
    <>
      <div
        style={{
          display: "contents",
        }}
        inert={o !== null}
      >
        <a
          href="#main"
          onClick={(f) => {
            f.preventDefault();
            document.getElementById("main")?.focus();
          }}
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 z-[70] btn btn-sm"
        >
          تخطَّ إلى المحتوى
        </a>
        <Header route={c} />
        <main id="main" tabIndex={-1} className="outline-none">
          <TopLoader route={c} />
          {r}
        </main>
        <Footer />
      </div>
      <MenuDrawer route={c} />
      <CartDrawer />
    </>
  );
}
