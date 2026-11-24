import { request } from "./http.js";
import { internationalPhone } from "../util.js";

// واتساب للأعمال (WhatsApp Cloud API من Meta) — https://developers.facebook.com/docs/whatsapp/cloud-api
// الرسائل للعميل لازم تكون "قوالب" معتمدة من Meta. نرسل قيم القالب بالترتيب المكتوب في وصف كل حقل.
const API = "https://graph.facebook.com/v21.0";

export function sendTemplate(cfg, phone, template, params) {
  return request(`${API}/${encodeURIComponent(cfg.phoneNumberId)}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.accessToken}` },
    json: {
      messaging_product: "whatsapp",
      to: internationalPhone(phone),
      type: "template",
      template: {
        name: template,
        language: { code: cfg.language || "ar" },
        components: params.length ? [{ type: "body", parameters: params.map((text) => ({ type: "text", text: String(text) })) }] : [],
      },
    },
  });
}

export async function test(cfg) {
  const info = await request(`${API}/${encodeURIComponent(cfg.phoneNumberId)}?fields=display_phone_number,verified_name`, {
    headers: { Authorization: `Bearer ${cfg.accessToken}` },
  });
  return `متصل بالرقم ${info.display_phone_number ?? ""} ${info.verified_name ? `(${info.verified_name})` : ""}`.trim();
}
