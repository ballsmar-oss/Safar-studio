import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { TopLoader } from "./components/TopLoader";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Admin from "@/pages/Admin";
import Pay from "@/pages/Pay";
import Works from "@/pages/Works";
import Work from "@/pages/Work";

// Counts a page view on every page change. The server skips the owner's admin browser.
function ViewTracker() {
  const [location] = useLocation();
  useEffect(() => {
    fetch("/api/visit", { method: "POST", keepalive: true, headers: { "Content-Type": "application/json" }, body: "{}" }).catch(() => {});
  }, [location]);
  return null;
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
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
