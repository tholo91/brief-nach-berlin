import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Tokens older than this (in seconds) are rejected on verification.
// 90 days is enough slack for a user to bookmark + come back, but old enough
// that a leaked link doesn't stay valid forever.
const TOKEN_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

function secret(): string {
  const s = process.env.FEEDBACK_TOKEN_SECRET;
  if (!s) throw new Error("FEEDBACK_TOKEN_SECRET environment variable is not set");
  return s;
}

function b64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function signFeedbackToken(payload: object): string {
  // `iat` (issued-at, seconds since epoch) is added inside the signed envelope
  // so verifyFeedbackToken can reject tokens older than TOKEN_MAX_AGE_SECONDS.
  const enriched = { ...payload, iat: Math.floor(Date.now() / 1000) };
  const body = b64url(Buffer.from(JSON.stringify(enriched), "utf8"));
  const mac = b64url(createHmac("sha256", secret()).update(body).digest());
  return `${body}.${mac}`;
}

export function verifyFeedbackToken<T = unknown>(token: string): T | null {
  const dot = token.indexOf(".");
  if (dot < 1 || dot === token.length - 1) return null;
  const body = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = b64url(createHmac("sha256", secret()).update(body).digest());
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const padded =
      body.replace(/-/g, "+").replace(/_/g, "/") +
      "=".repeat((4 - (body.length % 4)) % 4);
    const parsed = JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as
      T & { iat?: number };
    // Reject tokens that don't carry an iat (pre-feature legacy) or are too old.
    // A missing iat would mean the token was minted before this check existed;
    // since we don't have any prod-relevant feedback yet, treat it as invalid.
    if (typeof parsed.iat !== "number") return null;
    const ageSeconds = Math.floor(Date.now() / 1000) - parsed.iat;
    if (ageSeconds > TOKEN_MAX_AGE_SECONDS) return null;
    return parsed as T;
  } catch {
    return null;
  }
}
