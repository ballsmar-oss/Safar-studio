import { request } from "./http.js";

// ميسّر: مدى، Apple Pay، STC Pay، فيزا وماستركارد — https://docs.moyasar.com
const API = "https://api.moyasar.com/v1";
const auth = (secretKey) => ({ Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}` });

// نسوي فاتورة ونحوّل العميل لصفحة الدفع حقت ميسّر
export function createInvoice(cfg, { amount, description, callbackUrl, successUrl, backUrl, metadata }) {
  return request(`${API}/invoices`, {
    method: "POST",
    headers: auth(cfg.secretKey),
    json: {
      amount: Math.round(amount * 100), // بالهللة
      currency: "SAR",
      description,
      callback_url: callbackUrl,
      success_url: successUrl,
      back_url: backUrl,
      metadata,
    },
  });
}

export const getInvoice = (cfg, id) => request(`${API}/invoices/${encodeURIComponent(id)}`, { headers: auth(cfg.secretKey) });

export async function test(cfg) {
  await request(`${API}/payments?page=1&limit=1`, { headers: auth(cfg.secretKey), timeout: 15_000 });
  return cfg.secretKey.startsWith("sk_live_") ? "المفتاح شغّال (وضع حقيقي)" : "المفتاح شغّال (وضع تجريبي)";
}
