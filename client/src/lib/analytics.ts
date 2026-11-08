// PostHog product analytics. It stays off until VITE_POSTHOG_KEY is set at build time.
// Form fields are never recorded: inputs are masked, and session replay is disabled.
const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const host =
  (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ||
  "https://us.i.posthog.com";

// posthog-js is loaded only when a key is set, so it stays out of the main bundle otherwise.
type PostHog = typeof import("posthog-js").default;
let client: Promise<PostHog> | null = null;
function getClient() {
  if (!key || typeof window === "undefined") return null;
  if (!client) {
    client = import("posthog-js").then(m => {
      const posthog = m.default;
      posthog.init(key, {
        api_host: host,
        person_profiles: "identified_only",
        capture_pageview: false,
        autocapture: {
          dom_event_allowlist: ["click"],
          element_allowlist: ["a", "button"],
        },
        disable_session_recording: true,
        respect_dnt: true,
        mask_all_text: false,
        persistence: "localStorage",
      });
      return posthog;
    });
  }
  return client;
}

export function capturePageView(path: string) {
  // The owner's admin pages are not counted.
  if (!key || path.startsWith("/admin")) return;
  getClient()?.then(posthog =>
    posthog.capture("$pageview", {
      $current_url: window.location.origin + path,
    })
  );
}

export function captureEvent(
  name: string,
  properties?: Record<string, unknown>
) {
  if (!key) return;
  getClient()?.then(posthog => posthog.capture(name, properties));
}
