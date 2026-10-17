import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import { createRoot } from "react-dom/client";
import "@/index.css";

// The works and testimonials here are sample data; they are not saved anywhere.
createRoot(document.getElementById("root")!).render(
  <TooltipProvider>
    <Toaster />
    <Home />
  </TooltipProvider>
);
