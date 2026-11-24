import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { ENV } from "./env.js";

// مفاتيح التكاملات تنحفظ مشفّرة (AES-256-GCM) وما ترجع للمتصفح أبدًا.
const key = createHash("sha256").update(ENV.settingsSecret).digest();

export function encryptSecret(value) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
  return `enc:v1:${iv.toString("hex")}:${cipher.getAuthTag().toString("hex")}:${encrypted.toString("base64")}`;
}

export function decryptSecret(stored) {
  if (typeof stored !== "string" || !stored.startsWith("enc:v1:")) return "";
  const [, , ivHex, tagHex, data] = stored.split(":");
  try {
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    return Buffer.concat([decipher.update(Buffer.from(data, "base64")), decipher.final()]).toString("utf8");
  } catch {
    return "";
  }
}
