import { and, desc, eq, like, sql } from "drizzle-orm";
import { createHash } from "node:crypto";
import type { Express } from "express";
import express from "express";
import { dailySources, dailyStats, dailyVisitors } from "../drizzle/schema";
import { getAdminDevice } from "./auth";
import { db } from "./db";
import { ENV } from "./env";
import { allowRequest } from "./rate-limit";

// Counts page views and daily visitors. A visitor is a salted hash of the IP and browser, kept only for the current day.
// The owner's own admin browser is not counted.
const dayOf = (date = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh" }).format(date);

// Groups a visit by where it came from: a utm_source tag wins, otherwise the referring site decides.
const KNOWN_SOURCES: [RegExp, string][] = [
  [/tiktok/i, "tiktok"],
  [/instagram|instagr\.am/i, "instagram"],
  [/snapchat|snap\.com/i, "snapchat"],
  [/google/i, "google"],
  [/facebook|fb\.com|fb\.me/i, "facebook"],
  [/youtube|youtu\.be/i, "youtube"],
  [/twitter|x\.com|t\.co/i, "x"],
];
export function classifySource(utmSource: unknown, referrer: unknown) {
  const tag = typeof utmSource === "string" ? utmSource.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 30) : "";
  if (tag) return tag;
  const host = typeof referrer === "string" ? referrer.replace(/^https?:\/\//, "").split("/")[0] : "";
  if (!host) return "direct";
  if (host.includes("safarstudio.sa")) return "internal";
  return KNOWN_SOURCES.find(([pattern]) => pattern.test(host))?.[1] ?? "other";
}

export function registerVisitRoute(app: Express) {
  app.post("/api/visit", express.json({ limit: "1kb" }), (req, res) => {
    if (getAdminDevice(req)) return res.status(204).end();
    const ip = req.ip ?? "unknown";
    if (!allowRequest(`visit:${ip}`, 60, 60 * 1000)) return res.status(429).end();
    const day = dayOf();
    // Only the first call of a page load carries the source (utm tag and referrer).
    if (req.body?.first === true) {
      const source = classifySource(req.body?.utmSource, req.body?.referrer);
      db.insert(dailySources).values({ day, source, visits: 1 })
        .onConflictDoUpdate({ target: [dailySources.day, dailySources.source], set: { visits: sql`${dailySources.visits} + 1` } }).run();
    }
    db.insert(dailyStats).values({ day, views: 1, visitors: 0 })
      .onConflictDoUpdate({ target: dailyStats.day, set: { views: sql`${dailyStats.views} + 1` } }).run();
    const hash = createHash("sha256").update(`${ENV.settingsSecret}|${day}|${ip}|${req.headers["user-agent"] ?? ""}`).digest("hex");
    const seen = db.select().from(dailyVisitors).where(and(eq(dailyVisitors.day, day), eq(dailyVisitors.hash, hash))).get();
    if (!seen) {
      db.insert(dailyVisitors).values({ day, hash }).run();
      db.update(dailyStats).set({ visitors: sql`${dailyStats.visitors} + 1` }).where(eq(dailyStats.day, day)).run();
    }
    res.status(204).end();
  });
}

export function getVisitStats() {
  const today = dayOf();
  const month = today.slice(0, 7);
  const all = db.select().from(dailyStats).orderBy(desc(dailyStats.day)).all();
  const days = all.slice(0, 14);
  // Monthly visitors add up each day's count, so a person who visits on two days is counted twice.
  const thisMonth = all.filter((row) => row.day.startsWith(month));
  const monthVisitors = thisMonth.reduce((sum, row) => sum + row.visitors, 0);
  const sourceRows = db.select().from(dailySources).where(like(dailySources.day, `${month}%`)).all();
  const bySource = (rows: typeof sourceRows) => Object.entries(rows.reduce<Record<string, number>>((acc, row) => ({ ...acc, [row.source]: (acc[row.source] ?? 0) + row.visits }), {})).sort((a, b) => b[1] - a[1]).map(([source, visits]) => ({ source, visits }));
  return {
    today: all.find((row) => row.day === today) ?? { day: today, views: 0, visitors: 0 },
    monthVisitors,
    days,
    sourcesToday: bySource(sourceRows.filter((row) => row.day === today)),
    sourcesMonth: bySource(sourceRows),
  };
}
