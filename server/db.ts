import Database from "better-sqlite3";
import { and, asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import fs from "node:fs";
import path from "node:path";
import * as schema from "../drizzle/schema";
import { integrationSettings, leads, paymentRequests, portfolioItems, siteContent, testimonials } from "../drizzle/schema";
import { ENV } from "./env";

fs.mkdirSync(ENV.dataDir, { recursive: true });
const sqlite = new Database(path.join(ENV.dataDir, "safar.db"));
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

export function runMigrations() {
  migrate(db, { migrationsFolder: path.resolve(import.meta.dirname, "..", "drizzle", "migrations") });
}

export const listPublishedPortfolio = () => db.select().from(portfolioItems).where(eq(portfolioItems.isPublished, true)).orderBy(asc(portfolioItems.sortOrder), desc(portfolioItems.createdAt)).all();
export const listPortfolio = () => db.select().from(portfolioItems).orderBy(asc(portfolioItems.sortOrder), desc(portfolioItems.createdAt)).all();
export const getPublishedPortfolioItem = (id: number) => db.select().from(portfolioItems).where(and(eq(portfolioItems.id, id), eq(portfolioItems.isPublished, true))).get() ?? null;
export const listPublishedTestimonials = () => db.select().from(testimonials).where(eq(testimonials.isPublished, true)).orderBy(asc(testimonials.sortOrder), desc(testimonials.createdAt)).all();
export const listTestimonials = () => db.select().from(testimonials).orderBy(asc(testimonials.sortOrder), desc(testimonials.createdAt)).all();
export const listContent = () => db.select().from(siteContent).orderBy(asc(siteContent.contentKey)).all();
export const listLeads = () => db.select().from(leads).orderBy(desc(leads.createdAt)).all();
export const listPaymentRequests = () => db.select().from(paymentRequests).orderBy(desc(paymentRequests.createdAt)).all();
export const getSettings = () => db.select().from(integrationSettings).limit(1).get();

export function getPublicContactSettings() {
  const settings = getSettings();
  return {
    businessEmail: settings?.businessEmail ?? null,
    whatsappNumber: settings?.whatsappNumber ?? null,
    instagramUrl: settings?.instagramUrl ?? null,
    linkedinUrl: settings?.linkedinUrl ?? null,
    tiktokUrl: settings?.tiktokUrl ?? null,
  };
}

export function getPaymentRequestByToken(publicToken: string) {
  return db.select().from(paymentRequests).where(eq(paymentRequests.publicToken, publicToken)).get() ?? null;
}
