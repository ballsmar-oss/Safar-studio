import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

const createdAt = () => integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date());
const updatedAt = () => integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()).$onUpdateFn(() => new Date());

export const siteContent = sqliteTable("siteContent", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  contentKey: text("contentKey").notNull().unique(),
  contentValue: text("contentValue").notNull(),
  label: text("label").notNull(),
  updatedAt: updatedAt(),
});

export const portfolioItems = sqliteTable("portfolioItems", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  titleEn: text("titleEn"),
  description: text("description"),
  descriptionEn: text("descriptionEn"),
  category: text("category").notNull().default("عام"),
  categoryEn: text("categoryEn"),
  mediaType: text("mediaType", { enum: ["image", "video", "link"] }).notNull().default("image"),
  mediaUrl: text("mediaUrl").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  projectUrl: text("projectUrl"),
  // Works deck on the homepage: yellow labels on the card, the vertical side label, and extra images shown around the deck on desktop.
  tags: text("tags", { mode: "json" }).$type<string[]>(),
  tagsEn: text("tagsEn", { mode: "json" }).$type<string[]>(),
  sideLabel: text("sideLabel"),
  sideLabelEn: text("sideLabelEn"),
  gallery: text("gallery", { mode: "json" }).$type<string[]>(),
  isPublished: integer("isPublished", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sortOrder").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const testimonials = sqliteTable("testimonials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  company: text("company"),
  quote: text("quote").notNull(),
  rating: integer("rating").notNull().default(5),
  avatarUrl: text("avatarUrl"),
  isPublished: integer("isPublished", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sortOrder").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const paymentRequests = sqliteTable("paymentRequests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  publicToken: text("publicToken").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  service: text("service").notNull(),
  description: text("description"),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("SAR"),
  status: text("status", { enum: ["pending", "paid", "failed", "expired"] }).notNull().default("pending"),
  gatewayInvoiceId: text("gatewayInvoiceId"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  service: text("service"),
  message: text("message"),
  status: text("status", { enum: ["new", "contacted", "closed"] }).notNull().default("new"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const integrationSettings = sqliteTable("integrationSettings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  brandName: text("brandName").notNull().default("سَفَر"),
  officialDomain: text("officialDomain"),
  businessEmail: text("businessEmail"),
  freelanceLicenseNumber: text("freelanceLicenseNumber"),
  businessCenterNumber: text("businessCenterNumber"),
  whatsappNumber: text("whatsappNumber"),
  instagramUrl: text("instagramUrl"),
  linkedinUrl: text("linkedinUrl"),
  tiktokUrl: text("tiktokUrl"),
  senderName: text("senderName"),
  dnsRecords: text("dnsRecords"),
  applePayAssociation: text("applePayAssociation"),
  resendApiKey: text("resendApiKey"),
  moyasarPublishableKey: text("moyasarPublishableKey"),
  moyasarSecretKey: text("moyasarSecretKey"),
  moyasarWebhookSecret: text("moyasarWebhookSecret"),
  moyasarTestPublishableKey: text("moyasarTestPublishableKey"),
  moyasarTestSecretKey: text("moyasarTestSecretKey"),
  moyasarTestWebhookSecret: text("moyasarTestWebhookSecret"),
  smtpHost: text("smtpHost"),
  smtpPort: integer("smtpPort"),
  smtpUser: text("smtpUser"),
  smtpPassword: text("smtpPassword"),
  mode: text("mode", { enum: ["test", "live"] }).notNull().default("test"),
  updatedAt: updatedAt(),
});

// Browsers allowed into /admin. Only a hash of each device's cookie is stored.
export const adminDevices = sqliteTable("adminDevices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tokenHash: text("tokenHash").notNull().unique(),
  label: text("label").notNull(),
  createdAt: createdAt(),
  lastSeenAt: integer("lastSeenAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  revokedAt: integer("revokedAt", { mode: "timestamp" }),
  verifiedAt: integer("verifiedAt", { mode: "timestamp" }),
});

export type SiteContent = typeof siteContent.$inferSelect;
export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type PaymentRequest = typeof paymentRequests.$inferSelect;
export type IntegrationSettings = typeof integrationSettings.$inferSelect;
export type AdminDevice = typeof adminDevices.$inferSelect;

// Daily visit counts. day is YYYY-MM-DD (Riyadh time). Visitors are counted once per day from a salted hash of IP and browser,
// so no IP address or name is stored.
export const dailyStats = sqliteTable("dailyStats", {
  day: text("day").primaryKey(),
  views: integer("views").notNull().default(0),
  visitors: integer("visitors").notNull().default(0),
});

export const dailyVisitors = sqliteTable("dailyVisitors", {
  day: text("day").notNull(),
  hash: text("hash").notNull(),
}, (table) => [primaryKey({ columns: [table.day, table.hash] })]);

// Visits by where they came from (tiktok, instagram, snapchat, google, direct, ...), per day. Only the source name is stored.
export const dailySources = sqliteTable("dailySources", {
  day: text("day").notNull(),
  source: text("source").notNull(),
  visits: integer("visits").notNull().default(0),
}, (table) => [primaryKey({ columns: [table.day, table.source] })]);
