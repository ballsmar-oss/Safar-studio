import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { CATEGORIES, SEED_PRODUCTS } from "../shared/catalog.js";
import { ENV } from "./env.js";

mkdirSync(ENV.dataDir, { recursive: true });
export const UPLOADS_DIR = path.join(ENV.dataDir, "uploads");
mkdirSync(path.join(UPLOADS_DIR, "products"), { recursive: true });
mkdirSync(path.join(UPLOADS_DIR, "school-lists"), { recursive: true });

// قاعدة بيانات SQLite — ملف واحد satr.db داخل DATA_DIR. انسخه احتياطيًا وتكون محتفظ بكل شي.
export const db = new DatabaseSync(path.join(ENV.dataDir, "satr.db"));
db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    position INTEGER NOT NULL DEFAULT 0,
    data TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    image TEXT
  );
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    number TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'new',
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL,
    payment_provider TEXT,
    payment_ref TEXT,
    customer TEXT NOT NULL,
    items TEXT NOT NULL,
    subtotal INTEGER NOT NULL,
    shipping INTEGER NOT NULL,
    total INTEGER NOT NULL,
    carrier TEXT,
    tracking_number TEXT,
    stock_released INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS school_lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    stage TEXT NOT NULL,
    text TEXT NOT NULL DEFAULT '',
    file TEXT,
    file_type TEXT,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS integrations (
    key TEXT PRIMARY KEY,
    enabled INTEGER NOT NULL DEFAULT 0,
    config TEXT NOT NULL DEFAULT '{}'
  );
  CREATE TABLE IF NOT EXISTS integration_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    at TEXT NOT NULL,
    integration TEXT NOT NULL,
    event TEXT NOT NULL,
    ok INTEGER NOT NULL,
    message TEXT NOT NULL
  );
`);

export const now = () => new Date().toISOString();

// ───────── الأقسام ─────────
// الأقسام ثابتة في shared/catalog.js (لأن لكل قسم رسمة ولون). عدّلها من هناك.
export const categories = CATEGORIES;

// ───────── المنتجات ─────────
function rowToProduct(row) {
  if (!row) return null;
  return { ...JSON.parse(row.data), id: row.id, stock: row.stock, active: row.active === 1, image: row.image ?? undefined };
}

export const listProducts = ({ includeHidden = false } = {}) =>
  db
    .prepare(`SELECT * FROM products ${includeHidden ? "" : "WHERE active = 1"} ORDER BY position, rowid`)
    .all()
    .map(rowToProduct);

export const getProduct = (id) => rowToProduct(db.prepare("SELECT * FROM products WHERE id = ?").get(id));

const PRODUCT_FIELDS = ["name", "category", "price", "oldPrice", "art", "tint", "badge", "description", "details", "brand", "madeIn", "colors"];
const productData = (product) => JSON.stringify(Object.fromEntries(PRODUCT_FIELDS.filter((k) => product[k] !== undefined).map((k) => [k, product[k]])));

export function insertProduct(product) {
  const position = (db.prepare("SELECT COALESCE(MAX(position), 0) + 1 AS next FROM products").get().next) ?? 0;
  db.prepare("INSERT INTO products (id, position, data, stock, active, image) VALUES (?, ?, ?, ?, ?, ?)").run(
    product.id, position, productData(product), product.stock, product.active === false ? 0 : 1, product.image ?? null,
  );
  return getProduct(product.id);
}

export function updateProduct(id, product) {
  db.prepare("UPDATE products SET data = ?, stock = ? WHERE id = ?").run(productData(product), product.stock, id);
  return getProduct(id);
}

export const setProductActive = (id, active) => db.prepare("UPDATE products SET active = ? WHERE id = ?").run(active ? 1 : 0, id);
export const setProductImage = (id, image) => db.prepare("UPDATE products SET image = ? WHERE id = ?").run(image, id);
export const changeStock = (id, delta) => db.prepare("UPDATE products SET stock = MAX(stock + ?, 0) WHERE id = ?").run(delta, id);

// أول تشغيل: نعبّي المنتجات التجريبية
if (db.prepare("SELECT COUNT(*) AS n FROM products").get().n === 0) {
  for (const product of SEED_PRODUCTS) insertProduct({ ...product, stock: 25, active: true });
}

// ───────── الطلبات ─────────
function rowToOrder(row) {
  if (!row) return null;
  return {
    id: row.id,
    number: row.number,
    status: row.status,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    paymentProvider: row.payment_provider ?? undefined,
    paymentRef: row.payment_ref ?? undefined,
    customer: JSON.parse(row.customer),
    items: JSON.parse(row.items),
    subtotal: row.subtotal,
    shipping: row.shipping,
    total: row.total,
    carrier: row.carrier ?? undefined,
    trackingNumber: row.tracking_number ?? undefined,
    stockReleased: row.stock_released === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const listOrders = () => db.prepare("SELECT * FROM orders ORDER BY id DESC").all().map(rowToOrder);
export const getOrder = (id) => rowToOrder(db.prepare("SELECT * FROM orders WHERE id = ?").get(id));
export const getOrderByNumber = (number) => rowToOrder(db.prepare("SELECT * FROM orders WHERE number = ?").get(number));
export const getOrderByPaymentRef = (ref) => rowToOrder(db.prepare("SELECT * FROM orders WHERE payment_ref = ?").get(ref));

export function insertOrder(order) {
  const at = now();
  const result = db
    .prepare(
      `INSERT INTO orders (number, status, payment_method, payment_status, payment_provider, customer, items, subtotal, shipping, total, created_at, updated_at)
       VALUES (?, 'new', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(order.number, order.paymentMethod, order.paymentStatus, order.paymentProvider ?? null, JSON.stringify(order.customer), JSON.stringify(order.items), order.subtotal, order.shipping, order.total, at, at);
  return getOrder(Number(result.lastInsertRowid));
}

const ORDER_COLUMNS = { status: "status", paymentStatus: "payment_status", paymentRef: "payment_ref", carrier: "carrier", trackingNumber: "tracking_number", stockReleased: "stock_released" };
export function updateOrder(id, changes) {
  const entries = Object.entries(changes).filter(([k]) => ORDER_COLUMNS[k]);
  if (!entries.length) return getOrder(id);
  const sets = entries.map(([k]) => `${ORDER_COLUMNS[k]} = ?`).join(", ");
  const values = entries.map(([k, v]) => (k === "stockReleased" ? (v ? 1 : 0) : v ?? null));
  db.prepare(`UPDATE orders SET ${sets}, updated_at = ? WHERE id = ?`).run(...values, now(), id);
  return getOrder(id);
}

// ───────── قوائم المدارس ─────────
const rowToList = (row) => row && { id: row.id, name: row.name, phone: row.phone, stage: row.stage, text: row.text, file: row.file ?? null, fileType: row.file_type ?? null, createdAt: row.created_at };
export const listSchoolLists = () => db.prepare("SELECT * FROM school_lists ORDER BY id DESC").all().map(rowToList);
export const getSchoolList = (id) => rowToList(db.prepare("SELECT * FROM school_lists WHERE id = ?").get(id));
export function insertSchoolList(list) {
  const result = db
    .prepare("INSERT INTO school_lists (name, phone, stage, text, file, file_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run(list.name, list.phone, list.stage, list.text ?? "", list.file ?? null, list.fileType ?? null, now());
  return Number(result.lastInsertRowid);
}

// ───────── الإعدادات ─────────
export const DEFAULT_SETTINGS = {
  storeName: "سطر",
  storeUrl: "",
  shippingFee: 25,
  freeShippingMin: 150,
  lowStock: 5,
  supportWhatsapp: "",
};

export function getSettings() {
  const rows = db.prepare("SELECT key, value FROM settings").all();
  const saved = Object.fromEntries(rows.map((r) => [r.key, JSON.parse(r.value)]));
  return { ...DEFAULT_SETTINGS, ...saved };
}

export function saveSettings(values) {
  const upsert = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
  for (const [key, value] of Object.entries(values)) if (key in DEFAULT_SETTINGS) upsert.run(key, JSON.stringify(value));
  return getSettings();
}

// ───────── التكاملات ─────────
export function getIntegrationRow(key) {
  const row = db.prepare("SELECT * FROM integrations WHERE key = ?").get(key);
  return { enabled: row?.enabled === 1, config: row ? JSON.parse(row.config) : {} };
}

export function saveIntegrationRow(key, enabled, config) {
  db.prepare("INSERT INTO integrations (key, enabled, config) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET enabled = excluded.enabled, config = excluded.config").run(
    key, enabled ? 1 : 0, JSON.stringify(config),
  );
}

export function addLog(integration, event, ok, message) {
  db.prepare("INSERT INTO integration_logs (at, integration, event, ok, message) VALUES (?, ?, ?, ?, ?)").run(now(), integration, event, ok ? 1 : 0, String(message).slice(0, 500));
  db.prepare("DELETE FROM integration_logs WHERE id NOT IN (SELECT id FROM integration_logs ORDER BY id DESC LIMIT 300)").run();
}

export const listLogs = (limit = 50) =>
  db.prepare("SELECT * FROM integration_logs ORDER BY id DESC LIMIT ?").all(limit).map((r) => ({ ...r, ok: r.ok === 1 }));
