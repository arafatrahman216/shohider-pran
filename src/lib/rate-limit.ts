// Best-effort, single-process in-memory rate limiting — good enough for a
// single Node server deployment; a multi-instance deployment would need a
// shared store (e.g. Redis) instead. Still strictly better than no
// protection at all on the two endpoints that most need it: admin login
// (brute force) and public registration submission (spam).

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function sweepExpired(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  // Lazy cleanup so the map doesn't grow unbounded, without needing a
  // background timer (which wouldn't survive serverless cold starts anyway).
  if (Math.random() < 0.01) sweepExpired(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (existing.count >= limit) return false;
  existing.count += 1;
  return true;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
