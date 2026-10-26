import "dotenv/config";
import path from "node:path";

const isProduction = process.env.NODE_ENV === "production";

function required(name: string, devFallback: string) {
  const value = process.env[name]?.trim();
  if (value) return value;
  if (isProduction) throw new Error(`${name} must be set in production (see .env.example)`);
  return devFallback;
}

export const ENV = {
  isProduction,
  port: Number(process.env.PORT || 3000),
  // The public address of the site, e.g. https://safarstudio.sa. Used in payment links.
  publicUrl: process.env.PUBLIC_URL?.trim().replace(/\/$/, "") || undefined,
  dataDir: path.resolve(process.env.DATA_DIR || "data"),
  // The storage plan size in GB, shown on the admin dashboard meter (default 1 GB).
  storageLimitBytes: Math.round(Number(process.env.STORAGE_LIMIT_GB || 1) * 1024 * 1024 * 1024),
  // Opening /admin/connect/<this key> once marks the browser as an admin device.
  adminSetupKey: required("ADMIN_SETUP_KEY", "dev-setup-key"),
  // The owner email that receives the sign-in code for /admin.
  adminEmail: process.env.ADMIN_EMAIL?.trim() || undefined,
  // Encrypts API keys saved from the dashboard. Changing it makes saved keys unreadable.
  settingsSecret: required("SETTINGS_SECRET", "dev-settings-secret"),
};
