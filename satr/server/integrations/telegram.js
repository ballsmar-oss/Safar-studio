import { request } from "./http.js";

// تنبيهات تيليجرام لك أنت: كل طلب جديد أو قائمة مدرسة توصلك رسالة فورية
export const send = (cfg, text) =>
  request(`https://api.telegram.org/bot${cfg.botToken}/sendMessage`, {
    method: "POST",
    json: { chat_id: cfg.chatId, text, disable_web_page_preview: true },
  });

export async function test(cfg) {
  await send(cfg, "✅ تم ربط تنبيهات متجر سطر بنجاح");
  return "وصلت رسالة تجريبية على تيليجرام";
}
