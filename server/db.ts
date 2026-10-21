import { and, asc, desc, eq } from "drizzle-orm";
import { drizzle, type SQLJsDatabase } from "drizzle-orm/sql-js";
import { migrate } from "drizzle-orm/sql-js/migrator";
import initSqlJs, { type Database as SqlFile } from "sql.js";
import fs from "node:fs";
import path from "node:path";
import * as schema from "../drizzle/schema";
import { integrationSettings, leads, paymentRequests, portfolioItems, siteContent, testimonials } from "../drizzle/schema";
import { ENV } from "./env";

// SQLite runs in-process through sql.js (WebAssembly), so it needs no native build step.
// The database lives in memory and is written to DATA_DIR/safar.db every few seconds and on exit.
fs.mkdirSync(ENV.dataDir, { recursive: true });
const dbFile = path.join(ENV.dataDir, "safar.db");

export let db!: SQLJsDatabase<typeof schema>;
let sqlite!: SqlFile;

// Opens the database. Call once at startup, before the server accepts requests.
export async function openDb() {
  const SQL = await initSqlJs();
  sqlite = fs.existsSync(dbFile) ? new SQL.Database(fs.readFileSync(dbFile)) : new SQL.Database();
  sqlite.run("PRAGMA foreign_keys = ON;");
  db = drizzle(sqlite, { schema });
  const saver = setInterval(save, 3000);
  saver.unref();
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.once(signal, () => { save(); process.exit(0); });
  }
  process.once("exit", save);
}

function save() {
  if (!sqlite) return;
  const tmp = `${dbFile}.tmp`;
  fs.writeFileSync(tmp, Buffer.from(sqlite.export()));
  fs.renameSync(tmp, dbFile);
}

export function runMigrations() {
  migrate(db, { migrationsFolder: path.resolve(import.meta.dirname, "..", "drizzle", "migrations") });
  save();
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
    freelanceLicenseNumber: settings?.freelanceLicenseNumber ?? null,
    businessCenterNumber: settings?.businessCenterNumber ?? null,
    whatsappNumber: settings?.whatsappNumber ?? null,
    instagramUrl: settings?.instagramUrl ?? null,
    linkedinUrl: settings?.linkedinUrl ?? null,
    tiktokUrl: settings?.tiktokUrl ?? null,
  };
}

export function getPaymentRequestByToken(publicToken: string) {
  return db.select().from(paymentRequests).where(eq(paymentRequests.publicToken, publicToken)).get() ?? null;
}
