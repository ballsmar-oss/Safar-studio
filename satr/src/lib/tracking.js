// التحليلات وبكسلات الإعلانات: Google Analytics 4، Tag Manager، Google Ads، Meta، تيك توك، سناب.
// المعرّفات تجي من لوحة التحكم ← التكاملات ← "التحليلات وبكسلات الإعلانات". اللي ما له معرّف ما ينحمّل.
let config = null;
let queue = [];

function loadScript(src) {
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

export function initTracking(tracking) {
  if (config || !tracking || !Object.keys(tracking).length) return;
  config = tracking;
  const w = window;

  if (config.gtm) {
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    loadScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(config.gtm)}`);
  }
  if (config.ga4 || config.googleAds) {
    w.dataLayer = w.dataLayer || [];
    w.gtag = function gtag() {
      w.dataLayer.push(arguments);
    };
    w.gtag("js", new Date());
    const first = config.ga4 || config.googleAds.split("/")[0];
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(first)}`);
    if (config.ga4) w.gtag("config", config.ga4, { send_page_view: false });
    if (config.googleAds) w.gtag("config", config.googleAds.split("/")[0]);
  }
  if (config.metaPixel) {
    const fbq = (w.fbq = function () {
      fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
    });
    if (!w._fbq) w._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    loadScript("https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", config.metaPixel);
  }
  if (config.tiktokPixel) {
    const ttq = (w.ttq = w.ttq || []);
    ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"];
    ttq.setAndDefer = (t, e) => {
      t[e] = function () {
        t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };
    for (const m of ttq.methods) ttq.setAndDefer(ttq, m);
    loadScript(`https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${encodeURIComponent(config.tiktokPixel)}&lib=ttq`);
  }
  if (config.snapPixel) {
    const snaptr = (w.snaptr = function () {
      snaptr.handleRequest ? snaptr.handleRequest.apply(snaptr, arguments) : snaptr.queue.push(arguments);
    });
    snaptr.queue = [];
    loadScript("https://sc-static.net/scevent.min.js");
    snaptr("init", config.snapPixel, {});
  }

  const pending = queue;
  queue = [];
  for (const [event, data] of pending) track(event, data);
}

const items = (lines) =>
  lines.map((l) => ({ item_id: l.id, item_name: l.name, price: l.price, quantity: l.qty, item_variant: l.color }));

// event: page_view | view_item | add_to_cart | begin_checkout | purchase
export function track(event, data = {}) {
  if (!config) {
    queue.push([event, data]);
    if (queue.length > 30) queue.shift();
    return;
  }
  const w = window;
  const value = data.value ?? 0;
  const lines = data.items ?? [];
  const ids = lines.map((l) => l.id);
  try {
    if (event === "page_view") {
      if (config.ga4) w.gtag?.("event", "page_view", { page_location: location.href, page_title: document.title });
      if (config.gtm) w.dataLayer.push({ event: "virtual_page_view", page: location.hash || "#/" });
      w.fbq?.("track", "PageView");
      w.ttq?.page();
      w.snaptr?.("track", "PAGE_VIEW");
      return;
    }
    const gaEvent = { currency: "SAR", value, items: items(lines) };
    if (config.ga4) w.gtag?.("event", event, event === "purchase" ? { ...gaEvent, transaction_id: data.orderNumber } : gaEvent);
    if (config.gtm) w.dataLayer.push({ event, ecommerce: event === "purchase" ? { ...gaEvent, transaction_id: data.orderNumber } : gaEvent });
    const meta = { view_item: "ViewContent", add_to_cart: "AddToCart", begin_checkout: "InitiateCheckout", purchase: "Purchase" }[event];
    w.fbq?.("track", meta, { currency: "SAR", value, content_ids: ids, content_type: "product" });
    const tiktok = { view_item: "ViewContent", add_to_cart: "AddToCart", begin_checkout: "InitiateCheckout", purchase: "CompletePayment" }[event];
    w.ttq?.track(tiktok, { currency: "SAR", value, contents: lines.map((l) => ({ content_id: l.id, content_name: l.name, quantity: l.qty, price: l.price })) });
    const snap = { view_item: "VIEW_CONTENT", add_to_cart: "ADD_CART", begin_checkout: "START_CHECKOUT", purchase: "PURCHASE" }[event];
    w.snaptr?.("track", snap, { currency: "SAR", price: value, item_ids: ids, transaction_id: data.orderNumber });
    if (event === "purchase" && config.googleAds?.includes("/")) {
      w.gtag?.("event", "conversion", { send_to: config.googleAds, value, currency: "SAR", transaction_id: data.orderNumber });
    }
  } catch (error) {
    console.warn("tracking", error);
  }
}
