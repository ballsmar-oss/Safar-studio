import { TRPCError } from "@trpc/server";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { adminDevices, integrationSettings, leads, paymentRequests, portfolioItems, siteContent, testimonials } from "../drizzle/schema";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { isEmailVerified } from "./auth";
import { db, getPaymentRequestByToken, getPublishedPortfolioItem, getPublicContactSettings, getSettings, listContent, listLeads, listPaymentRequests, listPortfolio, listPublishedPortfolio, listPublishedTestimonials, listTestimonials } from "./db";
import { notifyOwner, sendEmail } from "./mail";
import { createInvoice } from "./moyasar";
import { decryptSecret, encryptSecret, secretMeta } from "./secrets";
import { allowRequest } from "./rate-limit";
import { ENV } from "./env";
import { uploadsDir } from "./uploads";
import fs from "node:fs";
import path from "node:path";

const tooMany = () => new TRPCError({ code: "TOO_MANY_REQUESTS", message: "طلبات كثيرة. حاول بعد قليل." });

const idInput = z.object({ id: z.number().int().positive() });
const webUrl = z.string().url().refine((value) => /^https?:\/\//.test(value), "Only http(s) links are allowed");
const mediaUrl = webUrl.or(z.string().regex(/^\/(uploads|media|brand)\/[\w.-]+$/));
const portfolioInput = z.object({
  title: z.string().min(1).max(180), titleEn: z.string().max(180).optional().nullable(), description: z.string().max(5000).optional().nullable(), descriptionEn: z.string().max(5000).optional().nullable(), category: z.string().min(1).max(80), categoryEn: z.string().max(80).optional().nullable(),
  mediaType: z.enum(["image", "video", "link"]), mediaUrl,
  thumbnailUrl: mediaUrl.optional().nullable(), projectUrl: webUrl.optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(60)).max(8).optional().nullable(), tagsEn: z.array(z.string().trim().min(1).max(60)).max(8).optional().nullable(),
  sideLabel: z.string().max(16).optional().nullable(), sideLabelEn: z.string().max(16).optional().nullable(),
  gallery: z.array(mediaUrl).max(4).optional().nullable(),
  isPublished: z.boolean(), sortOrder: z.number().int().default(0),
});
const testimonialInput = z.object({ name: z.string().min(1).max(160), company: z.string().max(180).optional().nullable(), quote: z.string().min(1).max(5000), rating: z.number().int().min(1).max(5), avatarUrl: mediaUrl.optional().nullable(), isPublished: z.boolean(), sortOrder: z.number().int().default(0) });
const optionalUrl = webUrl.optional().or(z.literal("")).nullable();
const integrationSettingsInput = z.object({
  brandName: z.string().min(1).max(160), officialDomain: z.string().max(255).optional().nullable(), businessEmail: z.string().email().optional().or(z.literal("")).nullable(), freelanceLicenseNumber: z.string().max(80).optional().nullable(), businessCenterNumber: z.string().max(80).optional().nullable(), whatsappNumber: z.string().max(40).optional().nullable(),
  instagramUrl: optionalUrl, linkedinUrl: optionalUrl, tiktokUrl: optionalUrl, senderName: z.string().max(160).optional().nullable(),
  dnsRecords: z.string().max(30000).optional().nullable(), applePayAssociation: z.string().max(30000).optional().nullable(),
  resendApiKey: z.string().max(500).optional(), moyasarPublishableKey: z.string().max(500).optional(), moyasarSecretKey: z.string().max(500).optional(), moyasarWebhookSecret: z.string().max(500).optional(), mode: z.enum(["test", "live"]),
  smtpHost: z.string().max(255).optional().nullable(), smtpPort: z.number().int().min(1).max(65535).optional().nullable(), smtpUser: z.string().max(255).optional().nullable(), smtpPassword: z.string().max(500).optional(),
});
const secretFields = ["resendApiKey", "moyasarPublishableKey", "moyasarSecretKey", "moyasarWebhookSecret", "smtpPassword"] as const;

const fillTemplate = (template: string, values: Record<string, string>) =>
  Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);

export const appRouter = router({
  auth: router({
    me: publicProcedure.query(({ ctx }) => ({ isAdmin: Boolean(ctx.device && isEmailVerified(ctx.device)), deviceRegistered: Boolean(ctx.device) })),
  }),
  publicContent: router({
    all: publicProcedure.query(() => ({ content: listContent(), portfolio: listPublishedPortfolio(), testimonials: listPublishedTestimonials(), settings: getPublicContactSettings() })),
    work: publicProcedure.input(idInput).query(({ input }) => getPublishedPortfolioItem(input.id)),
    getPaymentRequest: publicProcedure.input(z.object({ token: z.string().min(12).max(80) })).query(({ input }) => {
      const request = getPaymentRequestByToken(input.token);
      return request ? { ...request, testMode: (getSettings()?.mode ?? "test") === "test" } : null;
    }),
    // Stand-in for the payment gateway until Moyasar is connected; refused once the site is in live mode.
    simulatePayment: publicProcedure.input(z.object({ token: z.string().min(12).max(80) })).mutation(({ input, ctx }) => {
      if (!allowRequest(`pay:${ctx.req.ip}`, 10, 10 * 60 * 1000)) throw tooMany();
      if ((getSettings()?.mode ?? "test") !== "test") throw new TRPCError({ code: "FORBIDDEN", message: "الدفع التجريبي متوقف في الوضع الحقيقي." });
      const request = getPaymentRequestByToken(input.token);
      if (!request || request.status !== "pending") throw new TRPCError({ code: "BAD_REQUEST", message: "هذا الرابط غير صالح أو مدفوع مسبقًا." });
      db.update(paymentRequests).set({ status: "paid" }).where(eq(paymentRequests.id, request.id)).run();
      void notifyOwner(`تم دفع طلب — ${request.name}`, `${request.name} — ${request.email}\nالخدمة: ${request.service}\nالمبلغ: ${(request.amount / 100).toFixed(2)} ر.س`);
      return { success: true, status: "paid" as const };
    }),
    // Live mode: opens a Moyasar invoice for the request and returns its hosted payment page.
    startPayment: publicProcedure.input(z.object({ token: z.string().min(12).max(80) })).mutation(async ({ input, ctx }) => {
      if (!allowRequest(`pay:${ctx.req.ip}`, 10, 10 * 60 * 1000)) throw tooMany();
      const settings = getSettings();
      if ((settings?.mode ?? "test") !== "live") throw new TRPCError({ code: "FORBIDDEN", message: "الدفع الحقيقي متوقف في الوضع التجريبي." });
      const secretKey = decryptSecret(settings?.moyasarSecretKey);
      if (!secretKey) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "لم يتم ربط مفاتيح Moyasar بعد." });
      const request = getPaymentRequestByToken(input.token);
      if (!request || request.status !== "pending") throw new TRPCError({ code: "BAD_REQUEST", message: "هذا الرابط غير صالح أو مدفوع مسبقًا." });
      const origin = ENV.publicUrl ?? `${ctx.req.protocol}://${ctx.req.get("host")}`;
      try {
        const invoice = await createInvoice(secretKey, { amount: request.amount, description: `${request.service} — ${request.name}`, callbackUrl: `${origin}/api/moyasar/webhook`, backUrl: `${origin}/pay/${request.publicToken}`, metadata: { token: request.publicToken } });
        db.update(paymentRequests).set({ gatewayInvoiceId: invoice.id }).where(eq(paymentRequests.id, request.id)).run();
        return { url: invoice.url };
      } catch (error) {
        console.error(`[moyasar] invoice failed: ${error instanceof Error ? error.message : error}`);
        throw new TRPCError({ code: "BAD_GATEWAY", message: "تعذر فتح صفحة الدفع. حاول مرة ثانية." });
      }
    }),
    createLead: publicProcedure.input(z.object({ name: z.string().min(2).max(160), email: z.string().email(), phone: z.string().max(50).optional(), service: z.string().max(160).optional(), message: z.string().max(5000).optional() })).mutation(({ input, ctx }) => {
      if (!allowRequest(`lead:${ctx.req.ip}`, 5, 60 * 60 * 1000)) throw tooMany();
      const email = input.email.trim().toLowerCase();
      const existing = db.select({ id: leads.id }).from(leads).where(sql`lower(${leads.email}) = ${email}`).get();
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "يوجد تواصل سابق بهذا البريد الإلكتروني. سنعود لك من خلال الطلب المسجل." });
      const result = db.insert(leads).values({ ...input, email, message: input.message?.trim() || undefined }).returning({ id: leads.id }).get();
      void notifyOwner(`طلب تواصل جديد — ${input.name}`, `${input.name} — ${email}${input.phone ? ` — ${input.phone}` : ""}\n${input.service ?? ""}\n${input.message ?? ""}`);
      return { id: result.id, success: true };
    }),
  }),
  admin: router({
    dashboard: adminProcedure.query(() => ({ portfolio: listPortfolio(), testimonials: listTestimonials(), content: listContent(), leads: listLeads(), payments: listPaymentRequests() })),
    integrationSettings: adminProcedure.query(() => {
      const row = getSettings();
      if (!row) return null;
      return { ...row, resendApiKey: secretMeta(row.resendApiKey), moyasarPublishableKey: secretMeta(row.moyasarPublishableKey), moyasarSecretKey: secretMeta(row.moyasarSecretKey), moyasarWebhookSecret: secretMeta(row.moyasarWebhookSecret), smtpPassword: secretMeta(row.smtpPassword) };
    }),
    saveIntegrationSettings: adminProcedure.input(integrationSettingsInput).mutation(({ input }) => {
      const values: Partial<typeof integrationSettings.$inferInsert> = {
        brandName: input.brandName, officialDomain: input.officialDomain || null, businessEmail: input.businessEmail || null, freelanceLicenseNumber: input.freelanceLicenseNumber?.trim() || null, businessCenterNumber: input.businessCenterNumber?.trim() || null, whatsappNumber: input.whatsappNumber?.trim() || null,
        instagramUrl: input.instagramUrl || null, linkedinUrl: input.linkedinUrl || null, tiktokUrl: input.tiktokUrl || null, senderName: input.senderName || null,
        dnsRecords: input.dnsRecords || null, applePayAssociation: input.applePayAssociation || null, mode: input.mode,
        smtpHost: input.smtpHost?.trim() || null, smtpPort: input.smtpPort ?? null, smtpUser: input.smtpUser?.trim() || null,
      };
      for (const key of secretFields) if (input[key]?.trim()) values[key] = encryptSecret(input[key]!.trim());
      const existing = getSettings();
      if (existing) db.update(integrationSettings).set(values).where(eq(integrationSettings.id, existing.id)).run();
      else db.insert(integrationSettings).values(values).run();
      return { success: true } as const;
    }),
    saveContent: adminProcedure.input(z.object({ contentKey: z.string().min(1).max(120), label: z.string().min(1).max(180), contentValue: z.string().max(20000) })).mutation(({ input }) => {
      db.insert(siteContent).values(input).onConflictDoUpdate({ target: siteContent.contentKey, set: { label: input.label, contentValue: input.contentValue } }).run();
      return { success: true };
    }),
    createPortfolio: adminProcedure.input(portfolioInput).mutation(({ input }) => db.insert(portfolioItems).values(input).returning({ id: portfolioItems.id }).get()),
    updatePortfolio: adminProcedure.input(idInput.merge(portfolioInput)).mutation(({ input }) => { const { id, ...values } = input; db.update(portfolioItems).set(values).where(eq(portfolioItems.id, id)).run(); return { success: true }; }),
    deletePortfolio: adminProcedure.input(idInput).mutation(({ input }) => { db.delete(portfolioItems).where(eq(portfolioItems.id, input.id)).run(); return { success: true }; }),
    createTestimonial: adminProcedure.input(testimonialInput).mutation(({ input }) => db.insert(testimonials).values(input).returning({ id: testimonials.id }).get()),
    updateTestimonial: adminProcedure.input(idInput.merge(testimonialInput)).mutation(({ input }) => { const { id, ...values } = input; db.update(testimonials).set(values).where(eq(testimonials.id, id)).run(); return { success: true }; }),
    deleteTestimonial: adminProcedure.input(idInput).mutation(({ input }) => { db.delete(testimonials).where(eq(testimonials.id, input.id)).run(); return { success: true }; }),
    updateLeadStatus: adminProcedure.input(idInput.extend({ status: z.enum(["new", "contacted", "closed"]) })).mutation(({ input }) => { db.update(leads).set({ status: input.status }).where(eq(leads.id, input.id)).run(); return { success: true }; }),
    createPaymentRequest: adminProcedure.input(z.object({ name: z.string().min(2).max(160), email: z.string().email(), phone: z.string().max(50).optional(), service: z.string().min(2).max(160), description: z.string().max(5000).optional(), amount: z.number().int().positive().max(100000000) })).mutation(({ input }) => {
      const publicToken = randomBytes(18).toString("base64url");
      const result = db.insert(paymentRequests).values({ ...input, publicToken }).returning({ id: paymentRequests.id }).get();
      return { id: result.id, publicToken, status: "pending" as const };
    }),
    updatePaymentStatus: adminProcedure.input(idInput.extend({ status: z.enum(["pending", "paid", "failed", "expired"]) })).mutation(({ input }) => { db.update(paymentRequests).set({ status: input.status }).where(eq(paymentRequests.id, input.id)).run(); return { success: true }; }),
    // Emails a message to the customer; {name} {email} {service} {amount} {link} are filled in.
    testEmail: adminProcedure.mutation(async () => {
      const to = getSettings()?.businessEmail;
      if (!to) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "احفظ البريد الرسمي أولًا." });
      const sent = await sendEmail({ to, subject: "اختبار البريد — سَفَر", text: "هذي رسالة اختبار من لوحة التحكم. إذا وصلتك، البريد شغال." });
      if (!sent) throw new TRPCError({ code: "BAD_GATEWAY", message: "ما قدر يرسل. تأكد من إعدادات SMTP أو Resend." });
      return { success: true };
    }),
    emailCustomer: adminProcedure.input(z.object({ to: z.string().email(), subject: z.string().min(1).max(200), template: z.string().min(1).max(10000), values: z.record(z.string(), z.string()), attachmentUrl: z.string().regex(/^\/uploads\/[A-Za-z0-9._-]+$/).max(200).optional() })).mutation(async ({ input }) => {
      let attachments;
      if (input.attachmentUrl) {
        const file = path.join(uploadsDir, path.basename(input.attachmentUrl));
        if (!fs.existsSync(file)) throw new TRPCError({ code: "BAD_REQUEST", message: "ملف العقد غير موجود، ارفعه من جديد." });
        attachments = [{ filename: `Safar-contract${path.extname(file)}`, path: file }];
      }
      const sent = await sendEmail({ to: input.to, subject: input.subject, text: fillTemplate(input.template, input.values), attachments });
      if (!sent) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "البريد غير مفعّل بعد. أضف مفتاح Resend والبريد الرسمي من الإعدادات." });
      return { success: true };
    }),
    devices: adminProcedure.query(({ ctx }) => db.select({ id: adminDevices.id, label: adminDevices.label, createdAt: adminDevices.createdAt, lastSeenAt: adminDevices.lastSeenAt }).from(adminDevices).where(isNull(adminDevices.revokedAt)).orderBy(desc(adminDevices.lastSeenAt)).all().map((device) => ({ ...device, isCurrent: device.id === ctx.device.id }))),
    revokeDevice: adminProcedure.input(idInput).mutation(({ input }) => { db.update(adminDevices).set({ revokedAt: new Date() }).where(and(eq(adminDevices.id, input.id), isNull(adminDevices.revokedAt))).run(); return { success: true }; }),
  }),
});
export type AppRouter = typeof appRouter;
