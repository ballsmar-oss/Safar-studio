import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Admin from "@/pages/Admin";
import { createRoot } from "react-dom/client";
import "./preview.css";

// Uploads stay in the browser in the preview.
const realFetch = window.fetch.bind(window);
window.fetch = async (input, init) => {
  if (String(input).endsWith("/api/upload") && init?.body instanceof Blob) {
    return new Response(JSON.stringify({ url: URL.createObjectURL(init.body) }), { headers: { "Content-Type": "application/json" } });
  }
  return realFetch(input, init);
};

createRoot(document.getElementById("root")!).render(
  <TooltipProvider>
    <Toaster />
    <Admin />
  </TooltipProvider>
);
