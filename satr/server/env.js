import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// يقرأ ملف .env لو موجود (بدون مكتبات إضافية). المتغيرات الموجودة في النظام لها الأولوية.
const envFile = path.join(ROOT, ".env");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!match || process.env[match[1]] !== undefined) continue;
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}

const isProduction = process.env.NODE_ENV === "production";

function required(name, devFallback) {
  const value = process.env[name];
  if (value) return value;
  if (!isProduction) return devFallback;
  throw new Error(`المتغير ${name} مطلوب في ملف .env`);
}

export const ENV = {
  isProduction,
  port: Number(process.env.PORT ?? 3000),
  dataDir: path.resolve(ROOT, process.env.DATA_DIR ?? "data"),
  // التوكن اللي تدخل فيه لوحة التحكم
  adminToken: required("ADMIN_TOKEN", "dev-admin-token"),
  // مفتاح تشفير مفاتيح التكاملات المحفوظة في قاعدة البيانات. لا تغيّره بعد التشغيل وإلا تضيع المفاتيح المحفوظة.
  settingsSecret: required("SETTINGS_SECRET", "dev-settings-secret"),
  // رابط الموقع العام، مثل https://satr.sa — يُستخدم في روابط الدفع والتتبع وملف المنتجات
  publicUrl: (process.env.PUBLIC_URL ?? "").replace(/\/+$/, ""),
};
