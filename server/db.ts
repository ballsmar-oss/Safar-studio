import { asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, integrationSettings, leads, paymentRequests, portfolioItems, siteContent, testimonials, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); }
    catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId || user.email?.toLowerCase() === "ballsmar@gmail.com") { values.role = "admin"; updateSet.role = "admin"; }
  values.lastSignedIn ??= new Date();
  if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listPublishedPortfolio() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(portfolioItems).where(eq(portfolioItems.isPublished, true)).orderBy(asc(portfolioItems.sortOrder), desc(portfolioItems.createdAt));
}
export async function listPortfolio() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(portfolioItems).orderBy(asc(portfolioItems.sortOrder), desc(portfolioItems.createdAt));
}
export async function listPublishedTestimonials() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(testimonials).where(eq(testimonials.isPublished, true)).orderBy(asc(testimonials.sortOrder), desc(testimonials.createdAt));
}
export async function listTestimonials() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(testimonials).orderBy(asc(testimonials.sortOrder), desc(testimonials.createdAt));
}
export async function listContent() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(siteContent).orderBy(asc(siteContent.contentKey));
}
export async function listLeads() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).orderBy(desc(leads.createdAt));
}

export async function listPaymentRequests() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paymentRequests).orderBy(desc(paymentRequests.createdAt));
}

export async function getPublicContactSettings() {
  const db = await getDb();
  if (!db) return { whatsappNumber: null };
  const [settings] = await db.select({ whatsappNumber: integrationSettings.whatsappNumber, instagramUrl: integrationSettings.instagramUrl, linkedinUrl: integrationSettings.linkedinUrl, tiktokUrl: integrationSettings.tiktokUrl }).from(integrationSettings).limit(1);
  return { whatsappNumber: settings?.whatsappNumber ?? null, instagramUrl: settings?.instagramUrl ?? null, linkedinUrl: settings?.linkedinUrl ?? null, tiktokUrl: settings?.tiktokUrl ?? null };
}

export async function getPaymentRequestByToken(publicToken: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(paymentRequests).where(eq(paymentRequests.publicToken, publicToken)).limit(1);
  return result[0];
}
