import { request } from "./http.js";

// البريد عن طريق Resend — https://resend.com
export const send = (cfg, { to, subject, text }) =>
  request("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.apiKey}` },
    json: { from: cfg.from, to: (to ?? cfg.ownerEmail).split(/[,،\s]+/).filter(Boolean), subject, text },
  });

export async function test(cfg) {
  await send(cfg, { subject: "تجربة بريد متجر سطر", text: "إذا وصلتك هذي الرسالة، فالبريد مربوط صح ✅" });
  return `انرسلت رسالة تجريبية إلى ${cfg.ownerEmail}`;
}
