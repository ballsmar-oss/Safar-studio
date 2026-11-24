import { createHmac } from "node:crypto";
import { request } from "./http.js";

// يرسل كل حدث (طلب جديد، تغيّر حالة، دفع، قائمة مدرسة) لرابط تختاره — مثل Zapier أو Make أو n8n.
// التوقيع في الهيدر X-Satr-Signature = sha256=HMAC(المفتاح، نص الطلب) عشان تتأكد إنه منّا.
export function deliver(cfg, event, data) {
  const body = JSON.stringify({ event, data, sentAt: new Date().toISOString() });
  const headers = { "Content-Type": "application/json", "X-Satr-Event": event };
  if (cfg.secret) headers["X-Satr-Signature"] = `sha256=${createHmac("sha256", cfg.secret).update(body).digest("hex")}`;
  return request(cfg.url, { method: "POST", headers, body, timeout: 15_000 });
}

export async function test(cfg) {
  await deliver(cfg, "ping", { message: "تجربة من متجر سطر" });
  return "انرسل حدث تجريبي (ping) للرابط";
}
