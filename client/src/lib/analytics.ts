import posthog from "posthog-js";

// PostHog product analytics. It stays off until VITE_POSTHOG_KEY is set at build time.
// Form fields are never recorded: inputs are masked, and session replay is disabled.
const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const host = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || "https://us.i.posthog.com";

if (key && typeof window !== "undefined") {
  posthog.init(key, {
    api_host: host,
    person_profiles: "identified_only",
    capture_pageview: false,
    autocapture: { dom_event_allowlist: ["click"], element_allowlist: ["a", "button"] },
    disable_session_recording: true,
    respect_dnt: true,
    mask_all_text: false,
    persistence: "localStorage",
  });
}

export function capturePageView(path: string) {
  // The owner's admin pages are not counted.
  if (key && !path.startsWith("/admin")) posthog.capture("$pageview", { $current_url: window.location.origin + path });
}

export function captureEvent(name: string, properties?: Record<string, unknown>) {
  if (key) posthog.capture(name, properties);
}
