import { timingSafeEqual } from "node:crypto";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const fail = (status, message) => {
  throw new HttpError(status, message);
};

// يحوّل أي صيغة جوال سعودي إلى 05xxxxxxxx
export const normalizePhone = (phone) => String(phone ?? "").replace(/\D/g, "").replace(/^966/, "0");
export const isSaudiMobile = (phone) => /^(05\d{8}|9665\d{8}|\+9665\d{8})$/.test(String(phone ?? "").replace(/[\s-]/g, ""));
// 05xxxxxxxx → 9665xxxxxxxx (صيغة واتساب والرسائل)
export const internationalPhone = (phone) => `966${normalizePhone(phone).replace(/^0/, "")}`;

export const formatSar = (amount) => `${Number(amount).toLocaleString("ar-SA")} ر.س`;

export function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}

// data:image/png;base64,... → { mime, buffer }
export function parseDataUrl(value, allowed) {
  const match = /^data:([a-z]+\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/.exec(String(value ?? ""));
  if (!match || !allowed.includes(match[1])) return null;
  return { mime: match[1], buffer: Buffer.from(match[2], "base64") };
}

export const EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

// حد بسيط لعدد الطلبات من نفس الجهاز، عشان ما ينضرب الموقع بطلبات وهمية
const buckets = new Map();
export function rateLimit(name, max, windowMs) {
  return (req, res, next) => {
    const key = `${name}:${req.ip}`;
    const now = Date.now();
    const bucket = buckets.get(key);
    if (!bucket || bucket.reset < now) {
      buckets.set(key, { count: 1, reset: now + windowMs });
      return next();
    }
    if (bucket.count >= max) return res.status(429).json({ error: "طلبات كثيرة، انتظر شوي وجرّب مرة ثانية." });
    bucket.count += 1;
    next();
  };
}
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) if (bucket.reset < now) buckets.delete(key);
}, 60_000).unref();
