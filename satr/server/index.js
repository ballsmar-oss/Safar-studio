import { existsSync } from "node:fs";
import path from "node:path";
import express from "express";
import { ROOT, ENV } from "./env.js";
import { UPLOADS_DIR } from "./db.js";
import { adminRouter } from "./routes/admin.js";
import { feedRouter } from "./routes/feed.js";
import { paymentsRouter } from "./routes/payments.js";
import { publicRouter } from "./routes/public.js";

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");
// الصور والملفات المرفوعة تجي كـ data URL، فنسمح بحجم أكبر من الافتراضي
app.use(express.json({ limit: "12mb" }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

app.use("/api/admin", adminRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api", publicRouter);
app.use("/api", (req, res) => res.status(404).json({ error: "المسار غير موجود" }));
app.use("/feed", feedRouter);

// صور المنتجات المرفوعة من لوحة التحكم (ملفات قوائم المدارس خاصة وما تنعرض هنا)
app.use("/uploads/products", express.static(path.join(UPLOADS_DIR, "products"), { maxAge: "7d", index: false }));
// صور المنتجات المضمّنة في المشروع، لملف المنتجات (الكتالوج)
app.use("/catalog-images", express.static(path.join(ROOT, "src/assets/products"), { maxAge: "7d", index: false }));

if (ENV.isProduction) {
  const dist = path.join(ROOT, "dist");
  if (!existsSync(path.join(dist, "index.html"))) throw new Error("شغّل npm run build قبل npm start");
  app.use("/assets", express.static(path.join(dist, "assets"), { maxAge: "1y", immutable: true }));
  app.use(express.static(dist, { index: false }));
  app.get("*", (req, res) => res.sendFile(path.join(dist, "index.html")));
} else {
  const { createServer } = await import("vite");
  const vite = await createServer({ root: ROOT, server: { middlewareMode: true }, appType: "spa" });
  app.use(vite.middlewares);
}

// أي خطأ: نرجّع رسالة واضحة بالعربي بدل ما يطيح السيرفر
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error?.type === "entity.too.large") return res.status(413).json({ error: "الملف أكبر من المسموح" });
  if (error?.type === "entity.parse.failed") return res.status(400).json({ error: "بيانات غير صحيحة" });
  const status = Number(error?.status) || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({ error: status >= 500 ? "صار خطأ في السيرفر، جرّب مرة ثانية." : error.message });
});

app.listen(ENV.port, () => {
  console.log(`سطر شغّال على http://localhost:${ENV.port}`);
  if (!ENV.isProduction) console.log(`لوحة التحكم: http://localhost:${ENV.port}/#/admin — التوكن: ${ENV.adminToken}`);
});
