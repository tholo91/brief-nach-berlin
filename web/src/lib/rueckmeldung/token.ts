// This module is intentionally usable from the last-call tsx script.
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export const RUECKMELDUNG_TOKEN_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;
export const RUECKMELDUNG_COHORT = "lastcall_2026_10" as const;
const MAC_DOMAIN = "rueckmeldung-v1.";
const MAX_LENGTH = 4096;
const envelopeSchema = z.object({
  v: z.literal(1),
  purpose: z.literal("rueckmeldung"),
  email: z.string().trim().toLowerCase().email().max(254),
  cohort: z.literal(RUECKMELDUNG_COHORT),
  iat: z.number().int(),
});

function getSecret(): string {
  const value = process.env.FEEDBACK_TOKEN_SECRET;
  if (!value) throw new Error("FEEDBACK_TOKEN_SECRET environment variable is not set");
  return value;
}
function b64url(value: Buffer): string {
  return value.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function sign(body: string): string {
  return b64url(createHmac("sha256", getSecret()).update(`${MAC_DOMAIN}${body}`, "utf8").digest());
}

export function createRueckmeldungToken(
  email: string,
  cohort: typeof RUECKMELDUNG_COHORT = RUECKMELDUNG_COHORT,
  nowSeconds = Math.floor(Date.now() / 1000),
): string {
  const payload = { v: 1, purpose: "rueckmeldung", email: email.trim().toLowerCase(), cohort, iat: nowSeconds };
  const body = b64url(Buffer.from(JSON.stringify(payload), "utf8"));
  return `${body}.${sign(body)}`;
}

export function verifyRueckmeldungToken(
  token: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): { email: string; cohort: typeof RUECKMELDUNG_COHORT } | null {
  if (token.length > MAX_LENGTH) return null;
  const dot = token.indexOf(".");
  if (dot < 1 || dot === token.length - 1) return null;
  const body = token.slice(0, dot);
  let expected: Buffer;
  try { expected = Buffer.from(sign(body)); } catch { return null; }
  const actual = Buffer.from(token.slice(dot + 1));
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const padded = body.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - body.length % 4) % 4);
    const parsed = envelopeSchema.safeParse(JSON.parse(Buffer.from(padded, "base64").toString("utf8")));
    if (!parsed.success || parsed.data.iat > nowSeconds + 30 || nowSeconds - parsed.data.iat > RUECKMELDUNG_TOKEN_MAX_AGE_SECONDS) return null;
    return { email: parsed.data.email, cohort: parsed.data.cohort };
  } catch { return null; }
}
