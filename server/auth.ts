import { parse as parseCookies } from "cookie";
import { and, eq, isNull } from "drizzle-orm";
import type { Express, Request, Response } from "express";
import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import express from "express";
import { adminDevices, type AdminDevice } from "../drizzle/schema";
import { db } from "./db";
import { ENV } from "./env";
import { sendEmail } from "./mail";

// Admin access is tied to a browser, not a password: opening /admin/connect/<ADMIN_SETUP_KEY>
// once stores a random token in an httpOnly cookie, and /admin then opens directly on that
// device. Everyone else gets the normal "page not found".

const COOKIE = "safar_admin";
const MAX_AGE_MS = 400 * 24 * 60 * 60 * 1000; // the longest lifetime browsers accept
const sha256 = (value: string) => createHash("sha256").update(value).digest();

// A registered browser also needs the owner's email code once; the verification then lasts a while.
const VERIFY_DAYS = 30;
const CODE_TTL_MS = 10 * 60 * 1000;
const codes = new Map<number, { hash: string; expiresAt: number; tries: number; sentAt: number }>();

export function isEmailVerified(device: AdminDevice) {
  return Boolean(device.verifiedAt && Date.now() - device.verifiedAt.getTime() < VERIFY_DAYS * 24 * 60 * 60 * 1000);
}

function setDeviceCookie(req: Request, res: Response, token: string) {
  res.cookie(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: req.secure, path: "/", maxAge: MAX_AGE_MS });
}

export function getAdminDevice(req: Request): AdminDevice | null {
  const token = parseCookies(req.headers.cookie ?? "")[COOKIE];
  if (!token) return null;
  const device = db.select().from(adminDevices)
    .where(and(eq(adminDevices.tokenHash, sha256(token).toString("hex")), isNull(adminDevices.revokedAt)))
    .get();
  if (!device) return null;
  if (Date.now() - device.lastSeenAt.getTime() > 60 * 60 * 1000) {
    db.update(adminDevices).set({ lastSeenAt: new Date() }).where(eq(adminDevices.id, device.id)).run();
  }
  return device;
}

function describeDevice(userAgent = "") {
  const os = /iPhone/.test(userAgent) ? "iPhone" : /iPad/.test(userAgent) ? "iPad" : /Android/.test(userAgent) ? "Android"
    : /Mac OS X/.test(userAgent) ? "Mac" : /Windows/.test(userAgent) ? "Windows" : /Linux/.test(userAgent) ? "Linux" : "جهاز";
  const browser = /Edg\//.test(userAgent) ? "Edge" : /CriOS|Chrome\//.test(userAgent) ? "Chrome" : /FxiOS|Firefox\//.test(userAgent) ? "Firefox"
    : /Safari\//.test(userAgent) ? "Safari" : "متصفح";
  return `${os} · ${browser}`;
}

const attempts = new Map<string, { count: number; resetAt: number }>();
function tooManyAttempts(ip: string) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 10;
}

export function registerAdminRoutes(app: Express) {
  app.get("/admin/connect/:key", (req, res, next) => {
    const ip = req.ip ?? "unknown";
    const valid = !tooManyAttempts(ip) && timingSafeEqual(sha256(req.params.key), sha256(ENV.adminSetupKey));
    if (!valid) return next(); // falls through to the 404 below, same as any unknown page
    const token = randomBytes(32).toString("base64url");
    db.insert(adminDevices).values({ tokenHash: sha256(token).toString("hex"), label: describeDevice(req.headers["user-agent"]) }).run();
    setDeviceCookie(req, res, token);
    res.redirect("/admin");
  });

  // Sends a one-time code to the owner's email. Only for a registered device.
  app.post("/admin/login/send", async (req, res) => {
    const device = getAdminDevice(req);
    if (!device) return res.status(404).end();
    if (!ENV.adminEmail) return res.status(500).json({ message: "ADMIN_EMAIL غير مضبوط على السيرفر." });
    const now = Date.now();
    const last = codes.get(device.id);
    if (last && now - last.sentAt < 60 * 1000) return res.status(429).json({ message: "انتظر دقيقة قبل ما تطلب رمز جديد." });
    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    codes.set(device.id, { hash: sha256(code).toString("hex"), expiresAt: now + CODE_TTL_MS, tries: 0, sentAt: now });
    try {
      await sendEmail({ to: ENV.adminEmail, subject: "رمز الدخول للوحة سَفَر", text: `رمز الدخول: ${code}\nصالح لمدة ١٠ دقايق. إذا ما طلبته أنت، تجاهل هالرسالة.` });
    } catch {
      codes.delete(device.id);
      return res.status(500).json({ message: "تعذر إرسال الرمز. حاول بعد قليل." });
    }
    res.json({ sent: true });
  });

  // Checks the code. Five wrong tries cancel it; success marks the device as verified.
  app.post("/admin/login/verify", express.json({ limit: "1kb" }), (req, res) => {
    const device = getAdminDevice(req);
    if (!device) return res.status(404).end();
    const entry = codes.get(device.id);
    if (!entry || entry.expiresAt < Date.now()) return res.status(400).json({ message: "الرمز منتهي. اطلب رمز جديد." });
    entry.tries += 1;
    if (entry.tries > 5) {
      codes.delete(device.id);
      return res.status(429).json({ message: "محاولات كثيرة. اطلب رمز جديد." });
    }
    const given = sha256(String(req.body?.code ?? "").trim());
    if (!timingSafeEqual(given, Buffer.from(entry.hash, "hex"))) return res.status(400).json({ message: "الرمز غير صحيح." });
    codes.delete(device.id);
    db.update(adminDevices).set({ verifiedAt: new Date() }).where(eq(adminDevices.id, device.id)).run();
    res.json({ verified: true });
  });

  // /admin looks like a missing page to anyone without a registered device.
  app.use("/admin", (req, res, next) => {
    const token = parseCookies(req.headers.cookie ?? "")[COOKIE];
    if (token && getAdminDevice(req)) setDeviceCookie(req, res, token); // keep the device signed in
    else res.status(404);
    next();
  });
}

export function currentDeviceId(req: Request) {
  return getAdminDevice(req)?.id ?? null;
}
