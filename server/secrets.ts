import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { ENV } from "./env";

const key = createHash("sha256").update(ENV.settingsSecret).digest();

export function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return `enc:v1:${iv.toString("hex")}:${cipher.getAuthTag().toString("hex")}:${encrypted.toString("base64")}`;
}

export function decryptSecret(stored: string | null | undefined) {
  if (!stored?.startsWith("enc:v1:")) return null;
  const [, , ivHex, tagHex, data] = stored.split(":");
  try {
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    return Buffer.concat([decipher.update(Buffer.from(data, "base64")), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

export function secretMeta(stored: string | null) {
  return { configured: Boolean(stored) };
}
