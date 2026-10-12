// No Next.js server guard import here: the tsx mail script mints these tokens and that guard throws outside Next.
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

// 90 days: long enough that the Rueckfrage-Mail or Last-Call-Mail link still works when the reader comes back later.
export const DATA_DELETION_TOKEN_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;
const TOKEN_MAX_LENGTH = 4096;
const MAX_FUTURE_SKEW_SECONDS = 30;
// Domain separation: the shared FEEDBACK_TOKEN_SECRET also signs feedback tokens, which accept any payload with an iat.
const MAC_DOMAIN = "data-deletion-v1.";

const envelopeSchema = z.object({
  v: z.literal(1),
  purpose: z.literal("data_deletion"),
  email: z.string().trim().toLowerCase().email().max(254),
  iat: z.number().int(),
});

function secret(): string {
  const value = process.env.FEEDBACK_TOKEN_SECRET;
  if (!value) throw new Error("FEEDBACK_TOKEN_SECRET environment variable is not set");
  return value;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function mac(body: string): string {
  return b64url(createHmac("sha256", secret()).update(`${MAC_DOMAIN}${body}`, "utf8").digest());
}

export function createDataDeletionToken(
  email: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): string {
  const envelope = {
    v: 1,
    purpose: "data_deletion",
    email: email.trim().toLowerCase(),
    iat: nowSeconds,
  };
  const body = b64url(Buffer.from(JSON.stringify(envelope), "utf8"));
  return `${body}.${mac(body)}`;
}

export function verifyDataDeletionToken(
  token: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): { email: string } | null {
  if (token.length > TOKEN_MAX_LENGTH) return null;
  const dot = token.indexOf(".");
  if (dot < 1 || dot === token.length - 1) return null;
  const body = token.slice(0, dot);
  const actualMac = token.slice(dot + 1);

  let expectedMac: string;
  try {
    expectedMac = mac(body);
  } catch {
    return null;
  }
  const actual = Buffer.from(actualMac);
  const expected = Buffer.from(expectedMac);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

  try {
    const padded = body.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (body.length % 4)) % 4);
    const parsed = envelopeSchema.safeParse(JSON.parse(Buffer.from(padded, "base64").toString("utf8")));
    if (!parsed.success) return null;
    if (parsed.data.iat > nowSeconds + MAX_FUTURE_SKEW_SECONDS) return null;
    if (nowSeconds - parsed.data.iat > DATA_DELETION_TOKEN_MAX_AGE_SECONDS) return null;
    return { email: parsed.data.email };
  } catch {
    return null;
  }
}
