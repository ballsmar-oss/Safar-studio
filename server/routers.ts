import { z } from "zod";
import { notifyOwner } from "./_core/notification";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb, getPaymentRequestByToken, getPublicContactSettings, listContent, listLeads, listPaymentRequests, listPortfolio, listPublishedPortfolio, listPublishedTestimonials, listTestimonials } from "./db";
import { integrationSettings, leads, paymentRequests, portfolioItems, siteContent, testimonials } from "../drizzle/schema";
import { storagePut } from "./storage";
import { TRPCError } from "@trpc/server";
import { createCipheriv, createHash, randomBytes } from "node:crypto";

const idInput = z.object({ id: z.number().int().positive() });
const portfolioInput = z.object({
  title: z.string().min(1).max(180), description: z.string().max(5000).optional().nullable(), category: z.string().min(1).max(80),
  mediaType: z.enum(["image", "video", "link"]), mediaUrl: z.string().url().or(z.string().startsWith("/manus-storage/")),
  thumbnailUrl: z.string().url().or(z.string().startsWith("/manus-storage/")).optional().nullable(), projectUrl: z.string().url().optional().nullable(),
  isPublished: z.boolean(), sortOrder: z.number().int().default(0),
});
const testimonialInput = z.object({ name: z.string().min(1).max(160), company: z.string().max(180).optional().nullable(), quote: z.string().min(1).max(5000), rating: z.number().int().min(1).max(5), avatarUrl: z.string().url().or(z.string().startsWith("/manus-storage/")).optional().nullable(), isPublished: z.boolean(), sortOrder: z.number().int().default(0) });
const integrationSettingsInput = z.object({
  brandName: z.string().min(1).max(160), officialDomain: z.string().max(255).optional().nullable(), githubPagesUsername: z.string().max(160).optional().nullable(), businessEmail: z.string().email().optional().or(z.literal("")).nullable(), whatsappNumber: z.string().max(40).optional().nullable(), instagramUrl: z.string().url().optional().or(z.literal("")).nullable(), linkedinUrl: z.string().url().optional().or(z.literal("")).nullable(), tiktokUrl: z.string().url().optional().or(z.literal("")).nullable(), senderName: z.string().max(160).optional().nullable(),
  dnsRecords: z.string().max(30000).optional().nullable(), applePayAssociation: z.string().max(30000).optional().nullable(),
  resendApiKey: z.string().max(500).optional(), moyasarPublishableKey: z.string().max(500).optional(), moyasarSecretKey: z.string().max(500).optional(), moyasarWebhookSecret: z.string().max(500).optional(), cloudflareApiToken: z.string().max(500).optional(), cloudflareZoneId: z.string().max(120).optional().nullable(), mode: z.enum(["test", "live"]),
});

const settingsKey = createHash("sha256").update(process.env.JWT_SECRET || process.env.BUILT_IN_FORGE_API_KEY || "safar-development-key").digest();
function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", settingsKey, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return `enc:v1:${iv.toString("hex")}:${cipher.getAuthTag().toString("hex")}:${encrypted.toString("base64")}`;
}
function secretMeta(value: string | null) {
  if (!value) return { configured: false, last4: null };
  const raw = value.startsWith("enc:v1:") ? "configured" : value;
  return { configured: true, last4: raw === "configured" ? "••••" : raw.slice(-4) };
}

export const appRouter = router({
  system: router({
    notifyOwner: publicProcedure.input(z.object({ title: z.string(), content: z.string() })).mutation(({ input }) => notifyOwner(input)),
  }),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const options = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...options, maxAge: -1 }); return { success: true } as const; }),
  }),
  publicContent: router({
    all: publicProcedure.query(async () => ({ content: await listContent(), portfolio: await listPublishedPortfolio(), testimonials: await listPublishedTestimonials(), settings: await getPublicContactSettings() })),
    getPaymentRequest: publicProcedure.input(z.object({ token: z.string().min(12).max(80) })).query(({ input }) => getPaymentRequestByToken(input.token)),
    createPaymentRequest: publicProcedure.input(z.object({ name: z.string().min(2).max(160), email: z.string().email(), phone: z.string().max(50).optional(), service: z.string().min(2).max(160), description: z.string().max(5000).optional(), amount: z.number().int().positive().max(100000000) })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const publicToken = crypto.randomUUID().replace(/-/g, "");
      const [result] = await db.insert(paymentRequests).values({ ...input, publicToken });
      await notifyOwner({ title: "طلب دفع تجريبي جديد من سَفَر", content: `${input.name} — ${input.email}\nالخدمة: ${input.service}\nالمبلغ: ${(input.amount / 100).toFixed(2)} SAR` });
      return { id: result.insertId, publicToken, status: "pending" as const };
    }),
    simulatePayment: publicProcedure.input(z.object({ token: z.string().min(12).max(80) })).mutation(async ({ input }) => {
      const db = await getDb(); if (!db) throw new Error("Database unavailable");
      await db.update(paymentRequests).set({ status: "paid" }).where((await import("drizzle-orm")).eq(paymentRequests.publicToken, input.token));
      return { success: true, status: "paid" as const };
    }),
    createLead: publicProcedure.input(z.object({ name: z.string().min(2).max(160), email: z.string().email(), phone: z.string().max(50).optional(), service: z.string().max(160).optional(), message: z.string().max(5000).optional() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const normalizedEmail = input.email.trim().toLowerCase();
      const existing = await db.select({ id: leads.id }).from(leads).where((await import("drizzle-orm")).sql`lower(${leads.email}) = ${normalizedEmail}`).limit(1);
      if (existing.length) throw new TRPCError({ code: "CONFLICT", message: "يوجد تواصل سابق بهذا البريد الإلكتروني. سنعود لك من خلال الطلب المسجل." });
      const [result] = await db.insert(leads).values({ ...input, email: normalizedEmail, message: input.message?.trim() || undefined });
      await notifyOwner({ title: "طلب تواصل جديد من سَفَر", content: `${input.name} — ${normalizedEmail}${input.phone ? ` — ${input.phone}` : ""}\n${input.service ?? ""}\n${input.message ?? ""}` });
      return { id: result.insertId, success: true };
    }),
  }),
  admin: router({
    dashboard: adminProcedure.query(async () => ({ portfolio: await listPortfolio(), testimonials: await listTestimonials(), content: await listContent(), leads: await listLeads(), payments: await listPaymentRequests() })),
    integrationSettings: adminProcedure.query(async () => {
      const db = await getDb(); if (!db) throw new Error("Database unavailable");
      const [row] = await db.select().from(integrationSettings).limit(1);
      return row ? { ...row, resendApiKey: secretMeta(row.resendApiKey), moyasarPublishableKey: secretMeta(row.moyasarPublishableKey), moyasarSecretKey: secretMeta(row.moyasarSecretKey), moyasarWebhookSecret: secretMeta(row.moyasarWebhookSecret), cloudflareApiToken: secretMeta(row.cloudflareApiToken) } : null;
    }),
    saveIntegrationSettings: adminProcedure.input(integrationSettingsInput).mutation(async ({ input }) => {
      const db = await getDb(); if (!db) throw new Error("Database unavailable");
      const [existing] = await db.select().from(integrationSettings).limit(1);
      const secrets = ["resendApiKey", "moyasarPublishableKey", "moyasarSecretKey", "moyasarWebhookSecret", "cloudflareApiToken"] as const;
      const values: Record<string, unknown> = { brandName: input.brandName, officialDomain: input.officialDomain || null, githubPagesUsername: input.githubPagesUsername?.trim() || null, businessEmail: input.businessEmail || null, whatsappNumber: input.whatsappNumber?.trim() || null, instagramUrl: input.instagramUrl || null, linkedinUrl: input.linkedinUrl || null, tiktokUrl: input.tiktokUrl || null, senderName: input.senderName || null, dnsRecords: input.dnsRecords || null, applePayAssociation: input.applePayAssociation || null, cloudflareZoneId: input.cloudflareZoneId || null, mode: input.mode };
      for (const key of secrets) if (input[key]?.trim()) values[key] = encryptSecret(input[key].trim());
      if (existing) await db.update(integrationSettings).set(values).where((await import("drizzle-orm")).eq(integrationSettings.id, existing.id));
      else await db.insert(integrationSettings).values(values as typeof integrationSettings.$inferInsert);
      return { success: true } as const;
    }),
    saveContent: adminProcedure.input(z.object({ contentKey: z.string().min(1).max(120), label: z.string().min(1).max(180), contentValue: z.string().max(20000) })).mutation(async ({ input }) => {
      const db = await getDb(); if (!db) throw new Error("Database unavailable");
      await db.insert(siteContent).values(input).onDuplicateKeyUpdate({ set: { label: input.label, contentValue: input.contentValue } });
      return { success: true };
    }),
    createPortfolio: adminProcedure.input(portfolioInput).mutation(async ({ input }) => { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const [result] = await db.insert(portfolioItems).values(input); return { id: result.insertId }; }),
    updatePortfolio: adminProcedure.input(idInput.merge(portfolioInput)).mutation(async ({ input }) => { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const { id, ...values } = input; await db.update(portfolioItems).set(values).where((await import("drizzle-orm")).eq(portfolioItems.id, id)); return { success: true }; }),
    deletePortfolio: adminProcedure.input(idInput).mutation(async ({ input }) => { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.delete(portfolioItems).where((await import("drizzle-orm")).eq(portfolioItems.id, input.id)); return { success: true }; }),
    createTestimonial: adminProcedure.input(testimonialInput).mutation(async ({ input }) => { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const [result] = await db.insert(testimonials).values(input); return { id: result.insertId }; }),
    updateTestimonial: adminProcedure.input(idInput.merge(testimonialInput)).mutation(async ({ input }) => { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const { id, ...values } = input; await db.update(testimonials).set(values).where((await import("drizzle-orm")).eq(testimonials.id, id)); return { success: true }; }),
    deleteTestimonial: adminProcedure.input(idInput).mutation(async ({ input }) => { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.delete(testimonials).where((await import("drizzle-orm")).eq(testimonials.id, input.id)); return { success: true }; }),
    updateLeadStatus: adminProcedure.input(idInput.extend({ status: z.enum(["new", "contacted", "closed"]) })).mutation(async ({ input }) => { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.update(leads).set({ status: input.status }).where((await import("drizzle-orm")).eq(leads.id, input.id)); return { success: true }; }),
    updatePaymentStatus: adminProcedure.input(idInput.extend({ status: z.enum(["pending", "paid", "failed", "expired"]) })).mutation(async ({ input }) => { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.update(paymentRequests).set({ status: input.status }).where((await import("drizzle-orm")).eq(paymentRequests.id, input.id)); return { success: true }; }),
    sendPaymentLink: adminProcedure.input(z.object({ token: z.string().min(12).max(80), customerName: z.string().min(1), customerEmail: z.string().email(), service: z.string().min(1), amount: z.string().min(1), message: z.string().min(1), link: z.string().url() })).mutation(async ({ input }) => {
      const content = input.message.replaceAll("{name}", input.customerName).replaceAll("{email}", input.customerEmail).replaceAll("{service}", input.service).replaceAll("{amount}", input.amount).replaceAll("{link}", input.link);
      const sent = await notifyOwner({ title: `تجربة إرسال رابط دفع — ${input.customerName}`, content: `إلى العميل: ${input.customerEmail}\n\n${content}\n\nالرابط: ${input.link}` });
      return { success: sent, recipient: "بريد مالك المشروع" };
    }),
    uploadMedia: adminProcedure.input(z.object({ fileName: z.string().min(1).max(180), contentType: z.string().min(1).max(120), dataUrl: z.string().startsWith("data:").max(45_000_000) })).mutation(async ({ input, ctx }) => {
      const match = input.dataUrl.match(/^data:[^;]+;base64,(.+)$/); if (!match) throw new Error("Invalid data URL");
      const buffer = Buffer.from(match[1], "base64"); if (buffer.length > 32 * 1024 * 1024) throw new Error("الملف أكبر من 32MB");
      const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
      const uploaded = await storagePut(`portfolio/${ctx.user.id}-${safeName}`, buffer, input.contentType);
      return uploaded;
    }),
  }),
});
export type AppRouter = typeof appRouter;
