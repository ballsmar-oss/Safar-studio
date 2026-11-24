import { randomInt } from "node:crypto";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { Router } from "express";
import { categories, changeStock, getOrderByNumber, getProduct, getSettings, insertOrder, insertSchoolList, listProducts, updateOrder, UPLOADS_DIR } from "../db.js";
import { carriers, getConfig, publicConfig, trackingUrl } from "../integrations/index.js";
import * as moyasar from "../integrations/moyasar.js";
import * as tabby from "../integrations/tabby.js";
import { orderCreated, schoolListCreated } from "../notify.js";
import { EXTENSIONS, fail, isSaudiMobile, normalizePhone, parseDataUrl, rateLimit } from "../util.js";
import { baseUrl, handle } from "./helpers.js";

export const publicRouter = Router();

const MAX_UPLOAD = 7 * 1024 * 1024;
const STAGES = ["kg", "primary", "middle", "high"];

publicRouter.get("/catalog", (req, res) => {
  const settings = getSettings();
  const config = publicConfig();
  res.json({
    categories,
    products: listProducts(),
    onlinePayment: config.onlinePayment,
    tabby: config.tabby,
    tracking: config.tracking,
    shipping: { fee: Number(settings.shippingFee), freeMin: Number(settings.freeShippingMin) },
  });
});

publicRouter.get("/products/:id", (req, res) => {
  const product = getProduct(req.params.id);
  if (!product || !product.active) fail(404, "المنتج غير موجود");
  res.json(product);
});

function orderNumber() {
  const d = new Date();
  for (;;) {
    const number = `SA-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${randomInt(1000, 10000)}`;
    if (!getOrderByNumber(number)) return number;
  }
}

function validCustomer(c) {
  const text = (v, min) => typeof v === "string" && v.trim().length >= min;
  if (!c || !text(c.name, 2) || !isSaudiMobile(c.phone) || !text(c.city, 2) || !text(c.district, 2) || !text(c.address, 3)) {
    fail(400, "في حقول ناقصة في عنوان التوصيل، راجعها.");
  }
  return { name: c.name.trim(), phone: normalizePhone(c.phone), city: c.city.trim(), district: c.district.trim(), address: c.address.trim() };
}

publicRouter.post(
  "/orders",
  rateLimit("orders", 20, 10 * 60 * 1000),
  handle(async (req, res) => {
    const body = req.body ?? {};
    if (!Array.isArray(body.items) || !body.items.length) fail(400, "السلة فاضية");
    if (body.items.length > 60) fail(400, "الطلب فيه منتجات كثيرة");
    const payment = ["cod", "online", "tabby"].includes(body.payment) ? body.payment : fail(400, "اختر طريقة الدفع");
    if (payment === "online" && !getConfig("moyasar").active) fail(400, "الدفع الإلكتروني غير مفعّل حالياً، اختر الدفع عند الاستلام.");
    if (payment === "tabby" && !getConfig("tabby").active) fail(400, "تابي غير مفعّل حالياً، اختر طريقة ثانية.");
    const customer = validCustomer(body.customer);

    // نجمع الكميات لنفس المنتج واللون، ونتأكد من المخزون
    const items = body.items.map((line) => {
      const qty = Number(line?.qty);
      if (!Number.isInteger(qty) || qty < 1 || qty > 99) fail(400, "كمية غير صحيحة");
      const product = getProduct(String(line.id ?? ""));
      if (!product || !product.active) fail(400, `المنتج ${line.id} ما عاد متوفر.`);
      const colors = product.colors ?? [];
      if (colors.length && (!line.color || !colors.includes(line.color))) fail(400, `اختر لون «${product.name}».`);
      if (!colors.length && line.color) fail(400, `«${product.name}» ما له ألوان.`);
      return { id: product.id, name: product.name, price: product.price, qty, color: line.color || undefined };
    });
    const needed = new Map();
    for (const item of items) needed.set(item.id, (needed.get(item.id) ?? 0) + item.qty);
    for (const [id, qty] of needed) {
      const product = getProduct(id);
      if (product.stock < qty) fail(409, `الكمية المطلوبة من «${product.name}» أكثر من المتوفر (${product.stock}).`);
    }

    const settings = getSettings();
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const shipping = subtotal >= Number(settings.freeShippingMin) ? 0 : Number(settings.shippingFee);
    let order = insertOrder({
      number: orderNumber(),
      paymentMethod: payment === "cod" ? "cod" : "online",
      paymentStatus: payment === "cod" ? "cod" : "awaiting_payment",
      paymentProvider: payment === "cod" ? null : payment === "tabby" ? "tabby" : "moyasar",
      customer,
      items,
      subtotal,
      shipping,
      total: subtotal + shipping,
    });
    // نحجز الكمية من المخزون مباشرة
    for (const [id, qty] of needed) changeStock(id, -qty);

    let paymentUrl = null;
    const base = baseUrl(req);
    try {
      if (payment === "online") {
        const invoice = await moyasar.createInvoice(getConfig("moyasar").values, {
          amount: order.total,
          description: `طلب ${order.number} من متجر سطر`,
          callbackUrl: `${base}/api/payments/moyasar/callback`,
          successUrl: `${base}/api/payments/moyasar/return?order=${encodeURIComponent(order.number)}`,
          backUrl: `${base}/#/order/${encodeURIComponent(order.number)}`,
          metadata: { order: order.number },
        });
        order = updateOrder(order.id, { paymentRef: invoice.id });
        paymentUrl = invoice.url;
      }
      if (payment === "tabby") {
        const back = (result) => `${base}/api/payments/tabby/return?order=${encodeURIComponent(order.number)}&result=${result}`;
        const session = await tabby.createSession(getConfig("tabby").values, { order, successUrl: back("success"), cancelUrl: back("cancel"), failureUrl: back("failure") });
        order = updateOrder(order.id, { paymentRef: session.paymentId });
        paymentUrl = session.url;
      }
    } catch (error) {
      // فشل إنشاء الدفع: نلغي الطلب ونرجّع المخزون
      updateOrder(order.id, { status: "cancelled", stockReleased: true });
      for (const [id, qty] of needed) changeStock(id, qty);
      console.error(`[payment] ${order.number}: ${error.message}`);
      fail(502, payment === "tabby" && !/^\d{3} /.test(error.message) ? error.message : "ما قدرنا نفتح صفحة الدفع، جرّب مرة ثانية أو اختر الدفع عند الاستلام.");
    }

    orderCreated(order);
    res.json({ number: order.number, total: order.total, paymentUrl });
  }),
);

publicRouter.post("/orders/track", rateLimit("track", 30, 10 * 60 * 1000), (req, res) => {
  const { number, phone } = req.body ?? {};
  const order = getOrderByNumber(String(number ?? "").trim().toUpperCase());
  if (!order || order.customer.phone !== normalizePhone(phone)) fail(404, "ما لقينا طلب بهذا الرقم والجوال");
  res.json({
    number: order.number,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    total: order.total,
    subtotal: order.subtotal,
    shipping: order.shipping,
    createdAt: order.createdAt,
    city: order.customer.city,
    items: order.items,
    carrier: order.carrier,
    trackingNumber: order.trackingNumber,
    trackingUrl: trackingUrl(order.carrier, order.trackingNumber),
  });
});

publicRouter.get("/orders/:number", (req, res) => {
  const order = getOrderByNumber(String(req.params.number).toUpperCase());
  if (!order) fail(404, "ما لقينا طلب بهذا الرقم");
  res.json({ number: order.number, status: order.status, paymentStatus: order.paymentStatus, paymentMethod: order.paymentMethod, total: order.total, createdAt: order.createdAt });
});

publicRouter.post("/school-lists", rateLimit("lists", 10, 10 * 60 * 1000), (req, res) => {
  const { name, phone, stage, text, file } = req.body ?? {};
  if (typeof name !== "string" || name.trim().length < 2) fail(400, "اكتب اسمك");
  if (!isSaudiMobile(phone)) fail(400, "رقم الجوال لازم يبدأ بـ 05 ويكون 10 أرقام");
  if (!STAGES.includes(stage)) fail(400, "اختر المرحلة الدراسية");
  const cleanText = typeof text === "string" ? text.trim().slice(0, 5000) : "";
  let stored = null;
  let fileType = null;
  if (file) {
    const parsed = parseDataUrl(file, ["image/jpeg", "image/png", "image/webp", "application/pdf"]);
    if (!parsed) fail(400, "الملف لازم يكون صورة أو PDF");
    if (parsed.buffer.length > MAX_UPLOAD) fail(400, "الملف أكبر من 7 ميجا، صغّره أو صوّر القائمة بجودة أقل.");
    stored = `${Date.now()}-${randomInt(1e6, 1e7)}.${EXTENSIONS[parsed.mime]}`;
    fileType = parsed.mime;
    writeFileSync(path.join(UPLOADS_DIR, "school-lists", stored), parsed.buffer);
  }
  if (!stored && !cleanText) fail(400, "ارفع صورة القائمة أو اكتب الأدوات المطلوبة.");
  const id = insertSchoolList({ name: name.trim(), phone: normalizePhone(phone), stage, text: cleanText, file: stored, fileType });
  schoolListCreated({ id, name: name.trim(), phone: normalizePhone(phone), stage, text: cleanText, file: stored });
  res.json({ id });
});

publicRouter.get("/carriers", (req, res) => res.json(carriers().map((c) => c.name)));
