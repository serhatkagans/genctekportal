type Entry = { count: number; resetAt: number; blockedUntil: number };
const buckets = new Map<string, Entry>();

export function checkRateLimit(key: string, options = { limit: 5, windowMs: 15 * 60_000 }, now = Date.now()) {
  const existing = buckets.get(key);
  if (existing?.blockedUntil && existing.blockedUntil > now) return { allowed: false, retryAfterMs: existing.blockedUntil - now };
  const entry = !existing || existing.resetAt <= now ? { count: 0, resetAt: now + options.windowMs, blockedUntil: 0 } : existing;
  entry.count += 1;
  if (entry.count > options.limit) entry.blockedUntil = now + Math.min(options.windowMs * 4, options.windowMs * (entry.count - options.limit));
  buckets.set(key, entry);
  return { allowed: entry.blockedUntil === 0, remaining: Math.max(0, options.limit - entry.count), retryAfterMs: Math.max(0, entry.blockedUntil - now) };
}

export function resetRateLimit(key: string) { buckets.delete(key); }
