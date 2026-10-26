import { and, desc, eq, sql } from "drizzle-orm";
import { createHash } from "node:crypto";
import type { Express } from "express";
import express from "express";
import { dailyStats, dailyVisitors } from "../drizzle/schema";
import { getAdminDevice } from "./auth";
import { db } from "./db";
import { ENV } from "./env";
import { allowRequest } from "./rate-limit";

// Counts page views and daily visitors. A visitor is a salted hash of the IP and browser, kept only for the current day.
// The owner's own admin browser is not counted.
const dayOf = (date = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh" }).format(date);

export function registerVisitRoute(app: Express) {
  app.post("/api/visit", express.json({ limit: "1kb" }), (req, res) => {
    if (getAdminDevice(req)) return res.status(204).end();
    const ip = req.ip ?? "unknown";
    if (!allowRequest(`visit:${ip}`, 60, 60 * 1000)) return res.status(429).end();
    const day = dayOf();
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
  const days = db.select().from(dailyStats).orderBy(desc(dailyStats.day)).limit(14).all();
  return { today: days.find((row) => row.day === today) ?? { day: today, views: 0, visitors: 0 }, days };
}
