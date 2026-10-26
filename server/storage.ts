import fs from "node:fs";
import path from "node:path";
import { ENV } from "./env";

// Shows how much of the server's disk the site uses. The data folder holds the database and uploads,
// and the disk numbers show what is left on the whole server. Results are cached for 15 seconds.
const CACHE_MS = 15 * 1000;
let cached: { at: number; value: StorageUsage } | null = null;

export type StorageUsage = {
  dataBytes: number;
  databaseBytes: number;
  uploadsBytes: number;
  uploadsCount: number;
  diskTotalBytes: number;
  diskFreeBytes: number;
  limitBytes: number;
  checkedAt: number;
};

function folderSize(dir: string): { bytes: number; files: number } {
  let bytes = 0;
  let files = 0;
  if (!fs.existsSync(dir)) return { bytes, files };
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const inner = folderSize(full);
      bytes += inner.bytes;
      files += inner.files;
    } else if (entry.isFile()) {
      bytes += fs.statSync(full).size;
      files += 1;
    }
  }
  return { bytes, files };
}

export function getStorageUsage(): StorageUsage {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.value;
  const databaseFile = path.join(ENV.dataDir, "safar.db");
  const databaseBytes = fs.existsSync(databaseFile) ? fs.statSync(databaseFile).size : 0;
  const uploads = folderSize(path.join(ENV.dataDir, "uploads"));
  const data = folderSize(ENV.dataDir);
  const disk = fs.statfsSync(ENV.dataDir);
  const value: StorageUsage = {
    dataBytes: data.bytes,
    databaseBytes,
    uploadsBytes: uploads.bytes,
    uploadsCount: uploads.files,
    diskTotalBytes: disk.blocks * disk.bsize,
    diskFreeBytes: disk.bavail * disk.bsize,
    limitBytes: ENV.storageLimitBytes,
    checkedAt: Date.now(),
  };
  cached = { at: Date.now(), value };
  return value;
}
