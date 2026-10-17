import express, { type Express } from "express";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { getAdminDevice } from "./auth";
import { ENV } from "./env";

export const uploadsDir = path.join(ENV.dataDir, "uploads");
const MAX_BYTES = 300 * 1024 * 1024;
const ALLOWED = /^(image\/(png|jpe?g|gif|webp|avif)|video\/(mp4|webm|quicktime))$/;

// Files go to DATA_DIR/uploads on the server and are served from /uploads/<name>.
export function registerUploads(app: Express) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  app.use("/uploads", express.static(uploadsDir, { maxAge: "30d", immutable: true, fallthrough: false }));

  app.post("/api/upload", (req, res, next) => {
    if (!getAdminDevice(req)) return res.status(404).end();
    const type = String(req.headers["content-type"] ?? "").split(";")[0].trim();
    if (!ALLOWED.test(type)) return res.status(415).json({ error: "نوع الملف غير مدعوم. ارفع صورة أو فيديو." });
    next();
  }, express.raw({ type: () => true, limit: MAX_BYTES }), (req, res) => {
    const original = decodeURIComponent(String(req.headers["x-file-name"] ?? "file"));
    const ext = path.extname(original).toLowerCase().replace(/[^.a-z0-9]/g, "").slice(0, 8);
    const base = path.basename(original, path.extname(original)).replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 60) || "file";
    const name = `${base}-${randomBytes(4).toString("hex")}${ext}`;
    fs.writeFileSync(path.join(uploadsDir, name), req.body as Buffer);
    res.json({ url: `/uploads/${name}` });
  });
}
