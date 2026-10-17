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
  dataDir: path.resolve(process.env.DATA_DIR || "data"),
  // Opening /admin/connect/<this key> once marks the browser as an admin device.
  adminSetupKey: required("ADMIN_SETUP_KEY", "dev-setup-key"),
  // Encrypts API keys saved from the dashboard. Changing it makes saved keys unreadable.
  settingsSecret: required("SETTINGS_SECRET", "dev-settings-secret"),
};
