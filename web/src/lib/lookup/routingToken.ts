import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { RoutingResultSchema, type RoutingResult } from "./levelRouter";

// Kurzlebiger, HMAC-signierter Token für das Routing-Prefetch (LOCK-10):
// Der Client startet das Routing nach Wizard-Step-1, darf dem Server aber
// kein rohes Routing-Objekt unterschieben. Der Token bindet das Ergebnis an
// den SHA-256-Hash des Anliegen-Texts; weicht der finale Text ab oder ist der
// Token älter als 15 Minuten, routet der Server serverseitig neu.

const TOKEN_MAX_AGE_SECONDS = 15 * 60;
const SCHEMA_VERSION = 1;

function secret(): string {
  const s = process.env.ROUTING_TOKEN_SECRET ?? process.env.FEEDBACK_TOKEN_SECRET;
  if (!s) throw new Error("ROUTING_TOKEN_SECRET / FEEDBACK_TOKEN_SECRET is not set");
  return s;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Normalisiert + hasht das Anliegen (gleiche Normalisierung wie routeToLevel-Input). */
export function hashRoutingIssue(issueText: string): string {
  const normalized = issueText.trim().replace(/\s+/g, " ").slice(0, 1500);
  return createHash("sha256").update(normalized, "utf8").digest("hex");
}

export function signRoutingToken(args: {
  issueHash: string;
  routing: RoutingResult;
}): string {
  const payload = {
    v: SCHEMA_VERSION,
    issueHash: args.issueHash,
    routing: args.routing,
    iat: Math.floor(Date.now() / 1000),
  };
  const body = b64url(Buffer.from(JSON.stringify(payload), "utf8"));
  const mac = b64url(createHmac("sha256", secret()).update(body).digest());
  return `${body}.${mac}`;
}

/**
 * Gibt das Routing-Ergebnis zurück, wenn Signatur, Alter, Schema-Version und
 * Issue-Hash passen — sonst null (Aufrufer routet dann serverseitig neu).
 */
export function verifyRoutingToken(token: string, issueText: string): RoutingResult | null {
  const dot = token.indexOf(".");
  if (dot < 1 || dot === token.length - 1) return null;
  const body = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  let expected: string;
  try {
    expected = b64url(createHmac("sha256", secret()).update(body).digest());
  } catch {
    return null;
  }
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const padded =
      body.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (body.length % 4)) % 4);
    const parsed = JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as {
      v?: number;
      issueHash?: string;
      routing?: unknown;
      iat?: number;
    };
    if (parsed.v !== SCHEMA_VERSION) return null;
    if (typeof parsed.iat !== "number") return null;
    if (Math.floor(Date.now() / 1000) - parsed.iat > TOKEN_MAX_AGE_SECONDS) return null;
    if (parsed.issueHash !== hashRoutingIssue(issueText)) return null;
    const routing = RoutingResultSchema.safeParse(parsed.routing);
    return routing.success ? routing.data : null;
  } catch {
    return null;
  }
}
