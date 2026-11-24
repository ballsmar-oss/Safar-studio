import { request } from "./http.js";
import { internationalPhone } from "../util.js";

// رسائل SMS عن طريق تقنيات (Taqnyat) — https://dev.taqnyat.sa
// اسم المرسل لازم يكون معتمد في حسابك عندهم.
const API = "https://api.taqnyat.sa";

export const send = (cfg, phone, body) =>
  request(`${API}/v1/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.apiKey}` },
    json: { recipients: [internationalPhone(phone)], body, sender: cfg.sender },
  });

export async function test(cfg) {
  const data = await request(`${API}/account/balance`, { headers: { Authorization: `Bearer ${cfg.apiKey}` } });
  return data?.balance !== undefined ? `المفتاح شغّال — الرصيد ${data.balance} ${data.currency ?? ""}`.trim() : "المفتاح شغّال";
}
