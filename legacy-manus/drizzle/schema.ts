import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const siteContent = mysqlTable("siteContent", {
  id: int("id").autoincrement().primaryKey(),
  contentKey: varchar("contentKey", { length: 120 }).notNull().unique(),
  contentValue: text("contentValue").notNull(),
  label: varchar("label", { length: 180 }).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const portfolioItems = mysqlTable("portfolioItems", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 80 }).notNull().default("عام"),
  mediaType: mysqlEnum("mediaType", ["image", "video", "link"]).notNull().default("image"),
  mediaUrl: text("mediaUrl").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  projectUrl: text("projectUrl"),
  isPublished: boolean("isPublished").notNull().default(true),
  sortOrder: int("sortOrder").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const testimonials = mysqlTable("testimonials", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  company: varchar("company", { length: 180 }),
  quote: text("quote").notNull(),
  rating: int("rating").notNull().default(5),
  avatarUrl: text("avatarUrl"),
  isPublished: boolean("isPublished").notNull().default(true),
  sortOrder: int("sortOrder").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const paymentRequests = mysqlTable("paymentRequests", {
  id: int("id").autoincrement().primaryKey(),
  publicToken: varchar("publicToken", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  service: varchar("service", { length: 160 }).notNull(),
  description: text("description"),
  amount: int("amount").notNull(),
  currency: varchar("currency", { length: 8 }).notNull().default("SAR"),
  status: mysqlEnum("status", ["pending", "paid", "failed", "expired"]).notNull().default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  service: varchar("service", { length: 160 }),
  message: text("message"),
  status: mysqlEnum("status", ["new", "contacted", "closed"]).notNull().default("new"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const integrationSettings = mysqlTable("integrationSettings", {
  id: int("id").autoincrement().primaryKey(),
  brandName: varchar("brandName", { length: 160 }).notNull().default("سَفَر"),
  officialDomain: varchar("officialDomain", { length: 255 }),
  githubPagesUsername: varchar("githubPagesUsername", { length: 160 }),
  businessEmail: varchar("businessEmail", { length: 320 }),
  whatsappNumber: varchar("whatsappNumber", { length: 40 }),
  instagramUrl: varchar("instagramUrl", { length: 500 }),
  linkedinUrl: varchar("linkedinUrl", { length: 500 }),
  tiktokUrl: varchar("tiktokUrl", { length: 500 }),
  senderName: varchar("senderName", { length: 160 }),
  dnsRecords: text("dnsRecords"),
  applePayAssociation: text("applePayAssociation"),
  resendApiKey: text("resendApiKey"),
  moyasarPublishableKey: text("moyasarPublishableKey"),
  moyasarSecretKey: text("moyasarSecretKey"),
  moyasarWebhookSecret: text("moyasarWebhookSecret"),
  cloudflareApiToken: text("cloudflareApiToken"),
  cloudflareZoneId: varchar("cloudflareZoneId", { length: 120 }),
  mode: mysqlEnum("mode", ["test", "live"]).notNull().default("test"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SiteContent = typeof siteContent.$inferSelect;
export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type PaymentRequest = typeof paymentRequests.$inferSelect;
export type IntegrationSettings = typeof integrationSettings.$inferSelect;
