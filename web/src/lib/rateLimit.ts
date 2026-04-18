// Lean, in-memory rate limiter for MVP abuse protection.
//
// Caveats (acknowledged for v1):
// - In-memory state does NOT share across Vercel serverless instances.
//   Attackers hitting different cold-start instances get independent buckets.
// - Buckets are lost on redeploy/scale events.
// - Good enough to stop trivial/accidental abuse and honest repeated clicks.
// - Replace with @vercel/kv or Upstash when traffic warrants.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Periodically prune expired buckets so the Map doesn't grow unbounded.
// Runs at most once per 5 minutes per instance.
let lastPrune = 0;
function maybePrune(now: number) {
  if (now - lastPrune < 5 * 60_000) return;
  lastPrune = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
  remaining?: number;
}

export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  maybePrune(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }
  if (bucket.count >= max) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }
  bucket.count++;
  return { allowed: true, remaining: max - bucket.count };
}

// Common limits used across the app.
export const LIMITS = {
  // Per email: 3 letters per 24 hours. Humans don't legitimately write more
  // than a handful; scripts hammering the same address hit this fast.
  LETTERS_PER_EMAIL: { max: 3, windowMs: 24 * 60 * 60_000 },
  // Per IP: 10 letter generations per hour. Covers shared households/offices
  // behind NAT while stopping scripted abuse from a single origin.
  LETTERS_PER_IP: { max: 10, windowMs: 60 * 60_000 },
  // Per IP: 30 transcription calls per hour. Voxtral is more expensive; users
  // typically record once or twice per session.
  TRANSCRIBE_PER_IP: { max: 30, windowMs: 60 * 60_000 },
} as const;

export async function getClientIp(): Promise<string> {
  // Runtime-dynamic import so this module stays usable from non-request code.
  const { headers } = await import("next/headers");
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  const real = h.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
