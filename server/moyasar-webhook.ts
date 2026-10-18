import type { Express } from "express";
import { timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { paymentRequests } from "../drizzle/schema";
import { db, getSettings } from "./db";
import { notifyOwner } from "./mail";
import { getInvoice } from "./moyasar";
import { decryptSecret } from "./secrets";
import { allowRequest } from "./rate-limit";

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

// Moyasar calls this when a payment changes. We accept it only with the webhook secret we saved,
// then confirm the invoice's status with Moyasar before marking the request as paid.
export function registerMoyasarWebhook(app: Express) {
  app.post("/api/moyasar/webhook", async (req, res) => {
    if (!allowRequest(`moyasar:${req.ip}`, 60, 60 * 1000)) return res.status(429).end();
    const settings = getSettings();
    const webhookSecret = decryptSecret(settings?.moyasarWebhookSecret);
    const secretKey = decryptSecret(settings?.moyasarSecretKey);
    const body = (req.body ?? {}) as { secret_token?: unknown; invoice_id?: unknown };
    if (!webhookSecret || !secretKey || typeof body.secret_token !== "string" || !same(body.secret_token, webhookSecret)) return res.status(401).end();
    if (typeof body.invoice_id !== "string") return res.status(200).end();
    try {
      const invoice = await getInvoice(secretKey, body.invoice_id);
      if (invoice.status !== "paid") return res.status(200).end();
      const request = db.select().from(paymentRequests).where(eq(paymentRequests.gatewayInvoiceId, invoice.id)).get();
      if (request && request.status === "pending") {
        db.update(paymentRequests).set({ status: "paid" }).where(eq(paymentRequests.id, request.id)).run();
        void notifyOwner(`تم دفع طلب — ${request.name}`, `${request.name} — ${request.email}\nالخدمة: ${request.service}\nالمبلغ: ${(request.amount / 100).toFixed(2)} ر.س`);
      }
      return res.status(200).end();
    } catch (error) {
      console.error(`[moyasar] webhook failed: ${error instanceof Error ? error.message : error}`);
      return res.status(500).end();
    }
  });
}
