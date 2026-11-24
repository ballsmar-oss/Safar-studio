import { randomInt } from "node:crypto";
import { existsSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Router } from "express";
import {
  categories, changeStock, getOrder, getProduct, getSchoolList, getSettings, insertProduct, listLogs, listOrders, listProducts,
  listSchoolLists, saveSettings, setProductActive, setProductImage, updateOrder, updateProduct, UPLOADS_DIR,
} from "../db.js";
import { ENV } from "../env.js";
import { adminView, carriers, getDefinition, publicConfig, saveConfig, testIntegration, trackingUrl } from "../integrations/index.js";
import { orderPaid, orderStatusChanged } from "../notify.js";
import { EXTENSIONS, fail, parseDataUrl, rateLimit, safeEqual } from "../util.js";
import { baseUrl, handle } from "./helpers.js";

export const adminRouter = Router();

// كل مسارات الإدارة تحتاج التوكن: Authorization: Bearer <ADMIN_TOKEN>
adminRouter.use(rateLimit("admin", 300, 5 * 60 * 1000), (req, res, next) => {
  const token = (req.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token || !safeEqual(token, ENV.adminToken)) return res.status(401).json({ error: "التوكن غلط" });
  next();
});

const STATUSES = ["new", "preparing", "shipped", "delivered", "cancelled"];
const ARTS = ["pencil", "notebook", "backpack", "ruler", "crayons", "eraser", "scissors", "pencilcase", "highlighter", "glue", "sharpener", "geometry"];
const BADGES = ["جديد", "خصم", "الأكثر طلبًا"];

adminRouter.get("/status", (req, res) => res.json({ onlinePayment: publicConfig().onlinePayment }));

// ───────── نظرة عامة ─────────
adminRouter.get("/overview", (req, res) => {
  const orders = listOrders().filter((o) => o.status !== "cancelled");
  const today = new Date().toISOString().slice(0, 10);
  const settings = getSettings();
  const sum = (list) => list.reduce((s, o) => s + o.total, 0);
  const isCounted = (o) => o.paymentMethod === "cod" || o.paymentStatus === "paid";
  res.json({
    ordersToday: orders.filter((o) => o.createdAt.startsWith(today)).length,
    salesToday: sum(orders.filter((o) => o.createdAt.startsWith(today) && isCounted(o))),
    salesTotal: sum(orders.filter(isCounted)),
    openOrders: orders.filter((o) => o.status === "new" || o.status === "preparing").length,
    awaitingPayment: orders.filter((o) => o.paymentStatus === "awaiting_payment").length,
    lowStock: listProducts({ includeHidden: true })
      .filter((p) => p.active && p.stock <= Number(settings.lowStock))
      .map((p) => ({ id: p.id, name: p.name, stock: p.stock })),
  });
});

// ───────── الطلبات ─────────
adminRouter.get("/orders", (req, res) => {
  res.json(
    listOrders().map((o) => ({
      id: o.id, number: o.number, status: o.status, paymentMethod: o.paymentMethod, paymentStatus: o.paymentStatus,
      paymentProvider: o.paymentProvider, customer: o.customer, total: o.total, subtotal: o.subtotal, shipping: o.shipping,
      createdAt: o.createdAt, items: o.items, carrier: o.carrier, trackingNumber: o.trackingNumber,
      trackingUrl: trackingUrl(o.carrier, o.trackingNumber),
    })),
  );
});

adminRouter.get("/carriers", (req, res) => res.json(carriers().map((c) => c.name)));

adminRouter.patch("/orders/:id", (req, res) => {
  const order = getOrder(Number(req.params.id));
  if (!order) fail(404, "الطلب غير موجود");
  const { status, carrier, trackingNumber } = req.body ?? {};
  const changes = {};
  if (status !== undefined) {
    if (!STATUSES.includes(status)) fail(400, "حالة غير صحيحة");
    changes.status = status;
    // الإلغاء يرجّع الكميات للمخزون، والرجوع عن الإلغاء يحجزها من جديد
    if (status === "cancelled" && !order.stockReleased) {
      for (const item of order.items) changeStock(item.id, item.qty);
      changes.stockReleased = true;
    }
    if (status !== "cancelled" && order.stockReleased) {
      for (const item of order.items) changeStock(item.id, -item.qty);
      changes.stockReleased = false;
    }
  }
  if (carrier !== undefined) changes.carrier = String(carrier).trim().slice(0, 80) || null;
  if (trackingNumber !== undefined) changes.trackingNumber = String(trackingNumber).trim().slice(0, 80) || null;
  const updated = updateOrder(order.id, changes);
  if (status !== undefined && status !== order.status) orderStatusChanged(updated, order.status);
  res.json({ ok: true });
});

adminRouter.post("/orders/:id/mark-paid", (req, res) => {
  const order = getOrder(Number(req.params.id));
  if (!order) fail(404, "الطلب غير موجود");
  if (order.paymentStatus !== "paid") orderPaid(updateOrder(order.id, { paymentStatus: "paid" }));
  res.json({ ok: true });
});

// ───────── المنتجات ─────────
adminRouter.get("/products", (req, res) => res.json({ categories, products: listProducts({ includeHidden: true }) }));

function cleanProduct(body, { id, stockFallback = 0 } = {}) {
  const name = String(body.name ?? "").trim();
  const price = Number(body.price);
  const stock = body.stock === undefined || body.stock === "" ? stockFallback : Number(body.stock);
  if (!/^[a-z0-9][a-z0-9-]{1,60}$/.test(id)) fail(400, "المعرّف لازم يكون بالإنجليزي الصغير والأرقام والشرطة فقط، مثل blue-pen");
  if (name.length < 2) fail(400, "اكتب اسم المنتج");
  if (!categories.some((c) => c.id === body.category)) fail(400, "اختر القسم");
  if (!Number.isFinite(price) || price <= 0) fail(400, "اكتب سعر صحيح");
  if (!Number.isInteger(stock) || stock < 0) fail(400, "المخزون لازم يكون رقم صحيح");
  const oldPrice = body.oldPrice ? Number(body.oldPrice) : undefined;
  if (oldPrice !== undefined && (!Number.isFinite(oldPrice) || oldPrice <= price)) fail(400, "سعر قبل الخصم لازم يكون أعلى من السعر");
  const list = (v) => (Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean).slice(0, 20) : []);
  return {
    id,
    name,
    category: body.category,
    price,
    oldPrice,
    art: ARTS.includes(body.art) ? body.art : "notebook",
    tint: /^var\(--color-[a-z-]+\)$|^#[0-9a-f]{3,8}$/i.test(String(body.tint ?? "")) ? body.tint : "var(--color-mint)",
    badge: BADGES.includes(body.badge) ? body.badge : undefined,
    description: String(body.description ?? "").trim(),
    details: list(body.details),
    stock,
    brand: String(body.brand ?? "").trim() || undefined,
    madeIn: String(body.madeIn ?? "").trim() || undefined,
    colors: list(body.colors),
  };
}

adminRouter.post("/products", (req, res) => {
  const id = String(req.body?.id ?? "").trim();
  if (getProduct(id)) fail(409, "فيه منتج بنفس المعرّف");
  res.json(insertProduct({ ...cleanProduct(req.body ?? {}, { id }), active: true }));
});

adminRouter.put("/products/:id", (req, res) => {
  const existing = getProduct(req.params.id);
  if (!existing) fail(404, "المنتج غير موجود");
  res.json(updateProduct(existing.id, cleanProduct(req.body ?? {}, { id: existing.id, stockFallback: existing.stock })));
});

adminRouter.post("/products/:id/active", (req, res) => {
  const existing = getProduct(req.params.id);
  if (!existing) fail(404, "المنتج غير موجود");
  setProductActive(existing.id, Boolean(req.body?.active));
  res.json(getProduct(existing.id));
});

adminRouter.post("/products/:id/image", (req, res) => {
  const existing = getProduct(req.params.id);
  if (!existing) fail(404, "المنتج غير موجود");
  const parsed = parseDataUrl(req.body?.file, ["image/jpeg", "image/png", "image/webp"]);
  if (!parsed) fail(400, "الصورة لازم تكون JPG أو PNG أو WebP");
  if (parsed.buffer.length > 7 * 1024 * 1024) fail(400, "الصورة أكبر من 7 ميجا");
  const name = `${existing.id}-${Date.now()}-${randomInt(1000, 9999)}.${EXTENSIONS[parsed.mime]}`;
  writeFileSync(path.join(UPLOADS_DIR, "products", name), parsed.buffer);
  // نحذف الصورة القديمة لو كانت مرفوعة من اللوحة
  if (existing.image?.startsWith("/uploads/products/")) {
    const old = path.join(UPLOADS_DIR, "products", path.basename(existing.image));
    if (existsSync(old)) unlinkSync(old);
  }
  setProductImage(existing.id, `/uploads/products/${name}`);
  res.json(getProduct(existing.id));
});

// ───────── قوائم المدارس ─────────
adminRouter.get("/school-lists", (req, res) =>
  res.json(listSchoolLists().map((l) => ({ ...l, file: l.file ? `/api/admin/school-lists/${l.id}/file` : null }))),
);

adminRouter.get("/school-lists/:id/file", (req, res) => {
  const list = getSchoolList(Number(req.params.id));
  if (!list?.file) fail(404, "ما فيه ملف");
  res.type(list.fileType ?? "application/octet-stream");
  res.sendFile(path.join(UPLOADS_DIR, "school-lists", path.basename(list.file)));
});

// ───────── الإعدادات ─────────
adminRouter.get("/settings", (req, res) => res.json(getSettings()));

adminRouter.put("/settings", (req, res) => {
  const body = req.body ?? {};
  const values = {};
  if (body.storeName !== undefined) values.storeName = String(body.storeName).trim().slice(0, 60) || "سطر";
  if (body.storeUrl !== undefined) {
    const url = String(body.storeUrl).trim().replace(/\/+$/, "");
    if (url && !/^https?:\/\/[^\s/]+$/.test(url)) fail(400, "رابط الموقع لازم يكون مثل https://satr.sa بدون مسار");
    values.storeUrl = url;
  }
  for (const key of ["shippingFee", "freeShippingMin", "lowStock"]) {
    if (body[key] === undefined) continue;
    const n = Number(body[key]);
    if (!Number.isFinite(n) || n < 0) fail(400, "الأرقام لازم تكون صفر أو أكثر");
    values[key] = n;
  }
  if (body.supportWhatsapp !== undefined) values.supportWhatsapp = String(body.supportWhatsapp).replace(/[^\d+]/g, "").slice(0, 16);
  res.json(saveSettings(values));
});

// ───────── التكاملات ─────────
adminRouter.get("/integrations", (req, res) => {
  res.json({ integrations: adminView(), logs: listLogs(40), feedUrl: `${baseUrl(req)}/feed/products.xml`, callbackUrl: `${baseUrl(req)}/api/payments/moyasar/callback` });
});

adminRouter.put("/integrations/:key", (req, res) => {
  if (!getDefinition(req.params.key)) fail(404, "تكامل غير معروف");
  const { enabled, values, clear } = req.body ?? {};
  saveConfig(req.params.key, { enabled, values: values ?? {}, clear: Array.isArray(clear) ? clear : [] });
  res.json({ ok: true });
});

adminRouter.post(
  "/integrations/:key/test",
  handle(async (req, res) => {
    if (!getDefinition(req.params.key)) fail(404, "تكامل غير معروف");
    try {
      res.json({ ok: true, message: await testIntegration(req.params.key) });
    } catch (error) {
      res.json({ ok: false, message: error?.message ?? String(error) });
    }
  }),
);
