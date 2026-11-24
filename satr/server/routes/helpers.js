import { getSettings } from "../db.js";
import { ENV } from "../env.js";

// رابط الموقع: من الإعدادات، أو PUBLIC_URL، أو من الطلب نفسه
export function baseUrl(req) {
  const fromSettings = getSettings().storeUrl.replace(/\/+$/, "");
  return fromSettings || ENV.publicUrl || `${req.protocol}://${req.get("host")}`;
}

// يلف الدوال async عشان أي خطأ يرجع JSON بدل ما يطيّح السيرفر
export const handle = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
