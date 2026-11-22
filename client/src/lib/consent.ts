// Cookie consent for Google Tag Manager (Google Ads conversion tracking).
// The tag loads only after the visitor accepts. The choice is kept in this browser only.
export const GTM_ID = "GTM-T9LZKXRV";
const KEY = "safar-consent";

export type Consent = "granted" | "denied";

export function getConsent(): Consent | null {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function setConsent(value: Consent) {
  try {
    window.localStorage.setItem(KEY, value);
  } catch {
    // Storage can be blocked; the banner will show again next visit.
  }
  if (value === "granted") loadGtm();
}

let loaded = false;
export function loadGtm() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  const w = window as Window & { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(script);
}
