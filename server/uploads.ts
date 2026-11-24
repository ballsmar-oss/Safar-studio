import express, { type Express } from "express";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { getAdminDevice } from "./auth";
import { ENV } from "./env";

export const uploadsDir = path.join(ENV.dataDir, "uploads");
const MAX_BYTES = 300 * 1024 * 1024;
// The saved extension comes from the content type, never from the file name, so a file cannot be stored as .html or .svg.
const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
  "application/pdf": ".pdf",
};

// Files go to DATA_DIR/uploads on the server and are served from /uploads/<name>.
export function registerUploads(app: Express) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  app.use("/uploads", express.static(uploadsDir, { maxAge: "30d", immutable: true, fallthrough: false }));

  app.post("/api/upload", (req, res, next) => {
    if (!getAdminDevice(req)) return res.status(404).end();
    const type = String(req.headers["content-type"] ?? "").split(";")[0].trim();
    if (!EXTENSION_BY_TYPE[type]) return res.status(415).json({ error: "نوع الملف غير مدعوم. ارفع صورة أو فيديو أو PDF." });
    next();
  }, express.raw({ type: () => true, limit: MAX_BYTES }), (req, res) => {
    const original = decodeURIComponent(String(req.headers["x-file-name"] ?? "file"));
    const ext = EXTENSION_BY_TYPE[String(req.headers["content-type"] ?? "").split(";")[0].trim()];
    const base = path.basename(original, path.extname(original)).replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 60) || "file";
    const name = `${base}-${randomBytes(4).toString("hex")}${ext}`;
    fs.writeFileSync(path.join(uploadsDir, name), req.body as Buffer);
    res.json({ url: `/uploads/${name}` });
  });
}
