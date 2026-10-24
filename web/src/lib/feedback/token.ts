import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { deflateRawSync, inflateRawSync } from "node:zlib";

// Tokens older than this (in seconds) are rejected on verification.
// 90 days is enough slack for a user to bookmark + come back, but old enough
// that a leaked link doesn't stay valid forever.
const TOKEN_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

// Legacy bodies are uncompressed base64url JSON and always start with "e"
// (base64 of "{"), so the "z" prefix of compressed bodies is unambiguous.
const COMPRESSED_PREFIX = "z";
const MAX_INFLATED_BYTES = 64 * 1024;

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

function fromB64url(s: string): Buffer {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4);
  return Buffer.from(padded, "base64");
}

// Optional pro Token-Art: `macDomain` trennt die MAC-Domäne (ein Token einer Art
// ist für eine andere ungültig), `maxAgeSeconds` überschreibt die Standard-Gültigkeit.
export interface TokenOptions {
  macDomain?: string;
  maxAgeSeconds?: number;
}

export function signFeedbackToken(payload: object, opts?: TokenOptions): string {
  // `iat` (issued-at, seconds since epoch) is added inside the signed envelope
  // so verifyFeedbackToken can reject tokens older than TOKEN_MAX_AGE_SECONDS.
  const enriched = { ...payload, iat: Math.floor(Date.now() / 1000) };
  const body =
    COMPRESSED_PREFIX +
    b64url(deflateRawSync(Buffer.from(JSON.stringify(enriched), "utf8"), { level: 9 }));
  const mac = b64url(createHmac("sha256", secret()).update((opts?.macDomain ?? "") + body).digest());
  return `${body}.${mac}`;
}

export function verifyFeedbackToken<T = unknown>(token: string, opts?: TokenOptions): T | null {
  const dot = token.indexOf(".");
  if (dot < 1 || dot === token.length - 1) return null;
  const body = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = b64url(createHmac("sha256", secret()).update((opts?.macDomain ?? "") + body).digest());
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const bytes = body.startsWith(COMPRESSED_PREFIX)
      ? inflateRawSync(fromB64url(body.slice(COMPRESSED_PREFIX.length)), {
          maxOutputLength: MAX_INFLATED_BYTES,
        })
      : fromB64url(body);
    const parsed = JSON.parse(bytes.toString("utf8")) as T & { iat?: number };
    // Reject tokens that don't carry an iat (pre-feature legacy) or are too old.
    // A missing iat would mean the token was minted before this check existed;
    // since we don't have any prod-relevant feedback yet, treat it as invalid.
    if (typeof parsed.iat !== "number") return null;
    const ageSeconds = Math.floor(Date.now() / 1000) - parsed.iat;
    if (ageSeconds > (opts?.maxAgeSeconds ?? TOKEN_MAX_AGE_SECONDS)) return null;
    return parsed as T;
  } catch {
    return null;
  }
}
