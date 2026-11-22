import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import { Suspense, lazy, useEffect, useRef } from "react";
import { capturePageView } from "@/lib/analytics";
import ErrorBoundary from "./components/ErrorBoundary";
import { TopLoader } from "./components/TopLoader";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
// Only the home page loads up front. The other pages are split into their own files and load when opened.
const Admin = lazy(() => import("@/pages/Admin"));
const Pay = lazy(() => import("@/pages/Pay"));
const Works = lazy(() => import("@/pages/Works"));
const Work = lazy(() => import("@/pages/Work"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Counts a page view on every page change. The server skips the owner's admin browser.
function ViewTracker() {
  const [location] = useLocation();
  const first = useRef(true);
  useEffect(() => {
    capturePageView(location);
    // The first view of a page load carries the source: a utm_source tag, or the referring site's host.
    let body: Record<string, unknown> = {};
    if (first.current) {
      first.current = false;
      const utmSource = new URLSearchParams(window.location.search).get("utm_source") ?? undefined;
      let referrer: string | undefined;
      try { referrer = document.referrer ? new URL(document.referrer).host : undefined; } catch { referrer = undefined; }
      body = { first: true, utmSource, referrer };
    }
    fetch("/api/visit", { method: "POST", keepalive: true, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => {});
  }, [location]);
  return null;
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={null}>
    <Switch>
      <Route path={"/"} component={Home} />
            <Route path={"/works"} component={Works} />
      <Route path={"/works/:id"} component={Work} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/pay"} component={Pay} />
      <Route path={"/pay/:token"} component={Pay} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <TopLoader />
      <ViewTracker />
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
