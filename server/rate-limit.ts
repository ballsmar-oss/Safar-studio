// Small in-memory limiter for public endpoints (per client IP, resets after the window).
const hits = new Map<string, { count: number; resetAt: number }>();

export function allowRequest(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= max;
}
