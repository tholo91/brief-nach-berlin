// Lean, in-memory rate limiter for MVP abuse protection.
//
// Caveats (acknowledged for v1):
// - In-memory state does NOT share across Vercel serverless instances.
//   Attackers hitting different cold-start instances get independent buckets.
// - Buckets are lost on redeploy/scale events.
// - Good enough to stop trivial/accidental abuse and honest repeated clicks.
// - Replace with @vercel/kv or Upstash when traffic warrants.

import { createHash } from "node:crypto";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Salt the IP/email hash so the bucket key is not a recoverable identifier.
// Falls back to a per-process random string if no env var is set, which is
// fine because buckets are per-instance anyway.
const RATE_LIMIT_SALT =
  process.env.RATE_LIMIT_SALT ?? `bnb-${Math.random().toString(36).slice(2)}`;

// Truncated SHA-256 (16 hex chars = 64 bits) is plenty to keep buckets distinct
// for an in-memory limiter and short enough to keep log lines readable.
export function hashIdentifier(value: string): string {
  return createHash("sha256")
    .update(value + ":" + RATE_LIMIT_SALT)
    .digest("hex")
    .slice(0, 16);
}

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
  // Resend per IP: 3 retries per hour. Real users need 1-2 if they typo'd
  // their email or it landed in spam; more is almost always abuse.
  RESEND_PER_IP: { max: 3, windowMs: 60 * 60_000 },
  // Resend per email: 2 retries per hour. Anyone targeting one address
  // hits this even faster.
  RESEND_PER_EMAIL: { max: 2, windowMs: 60 * 60_000 },
  // Reviews per IP: 1 per 10 minutes. Real users rate a given letter once;
  // anything more is noise or abuse.
  REVIEW_PER_IP: { max: 1, windowMs: 10 * 60_000 },
  // Roadmap signups per IP: 3 per 10 minutes. Same person may legitimately
  // sign up for multiple levels (land + kommune); more than 3 in 10 min is
  // almost always a script.
  ROADMAP_SIGNUP_PER_IP: { max: 3, windowMs: 10 * 60_000 },
  // Error reports per IP: 5 per 10 minutes. A user clicking "Fehler melden" a
  // few times during one broken session is legitimate; more is noise.
  REPORT_ERROR_PER_IP: { max: 5, windowMs: 10 * 60_000 },
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
