import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Home from "@/pages/Home";
import Works from "@/pages/Works";
import { createRoot } from "react-dom/client";
import { Route, Router, Switch } from "wouter";
import "@/index.css";

const base = import.meta.env.BASE_URL === "./" ? "" : import.meta.env.BASE_URL.replace(/\/$/, "");

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <Toaster />
        <Router base={base}>
          <Switch>
            <Route path="/works" component={Works} />
            <Route component={Home} />
          </Switch>
        </Router>
      </TooltipProvider>
    </ThemeProvider>
  </ErrorBoundary>
);
