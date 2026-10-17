import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Admin from "@/pages/Admin";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import Pay from "@/pages/Pay";
import Work from "@/pages/Work";
import Works from "@/pages/Works";
import { createRoot } from "react-dom/client";
import { Route, Router, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import "@/index.css";

// One preview for the whole site: the address after # picks the page, like the real routes.
// The data is sample data kept in the page; changes in the dashboard show on the other pages until reload.
createRoot(document.getElementById("root")!).render(
  <TooltipProvider>
    <Toaster />
    <Router hook={useHashLocation}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/works" component={Works} />
        <Route path="/works/:id" component={Work} />
        <Route path="/admin" component={Admin} />
        <Route path="/pay/:token" component={Pay} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  </TooltipProvider>
);
