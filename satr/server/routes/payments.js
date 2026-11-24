import { Router } from "express";
import { getOrderByNumber, getOrderByPaymentRef, updateOrder } from "../db.js";
import { getConfig } from "../integrations/index.js";
import * as moyasar from "../integrations/moyasar.js";
import * as tabby from "../integrations/tabby.js";
import { orderPaid } from "../notify.js";
import { handle } from "./helpers.js";

export const paymentsRouter = Router();

function markPaid(order) {
  if (order.paymentStatus === "paid") return;
  const updated = updateOrder(order.id, { paymentStatus: "paid" });
  orderPaid(updated);
}

// ما نصدّق أي بيانات توصلنا من المتصفح: نسأل ميسّر مباشرة عن حالة الفاتورة
async function verifyMoyasar(order) {
  if (!order?.paymentRef || order.paymentProvider !== "moyasar" || order.paymentStatus === "paid") return;
  const invoice = await moyasar.getInvoice(getConfig("moyasar").values, order.paymentRef);
  if (invoice.status === "paid" && invoice.amount === Math.round(order.total * 100) && invoice.currency === "SAR") markPaid(order);
}

// العميل يرجع من صفحة ميسّر بعد الدفع
paymentsRouter.get(
  "/moyasar/return",
  handle(async (req, res) => {
    const order = getOrderByNumber(String(req.query.order ?? ""));
    if (order) await verifyMoyasar(order).catch((e) => console.error(`[moyasar] ${e.message}`));
    res.redirect(`/#/order/${encodeURIComponent(order?.number ?? "")}`);
  }),
);

// ميسّر يبلغنا من سيرفره لما تندفع الفاتورة (حتى لو العميل سكّر الصفحة)
paymentsRouter.post(
  "/moyasar/callback",
  handle(async (req, res) => {
    const id = req.body?.id ?? req.body?.invoice_id ?? req.body?.data?.invoice_id;
    const order = typeof id === "string" ? getOrderByPaymentRef(id) : null;
    if (order) await verifyMoyasar(order);
    res.json({ ok: true });
  }),
);

// العميل يرجع من تابي: نتأكد من الدفع ثم نعمل capture
paymentsRouter.get(
  "/tabby/return",
  handle(async (req, res) => {
    const order = getOrderByNumber(String(req.query.order ?? ""));
    if (order?.paymentProvider === "tabby" && order.paymentRef && order.paymentStatus !== "paid" && req.query.result === "success") {
      try {
        const cfg = getConfig("tabby").values;
        const payment = await tabby.getPayment(cfg, order.paymentRef);
        const amountOk = Number(payment.amount) === Number(order.total.toFixed(2));
        if (payment.status === "AUTHORIZED" && amountOk) {
          await tabby.capturePayment(cfg, order.paymentRef, order.total);
          markPaid(order);
        } else if (payment.status === "CLOSED" && amountOk) {
          markPaid(order);
        }
      } catch (error) {
        console.error(`[tabby] ${order.number}: ${error.message}`);
      }
    }
    res.redirect(`/#/order/${encodeURIComponent(order?.number ?? "")}`);
  }),
);
