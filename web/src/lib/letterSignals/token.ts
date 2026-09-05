import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { letterSignalContextSchema, type LetterSignalContext } from "./types";
import { createLetterSignalEmailHash } from "./emailHash";
import type { Recipient } from "@/lib/lookup/rathausRecipient";

const TOKEN_MAX_AGE_SECONDS = 24 * 60 * 60;
const TOKEN_MAX_LENGTH = 4096;
const MAX_FUTURE_SKEW_SECONDS = 30;

const envelopeSchema = z.object({
  v: z.literal(1),
  purpose: z.enum(["letter_signal_context", "letter_signal_generated"]),
  iat: z.number().int(),
  payload: z.unknown(),
});

const generationProofPayloadSchema = z.object({
  letterId: z.string().uuid(),
  issueBinding: z.string().regex(/^[a-f0-9]{64}$/),
  plz: z.string().regex(/^\d{5}$/),
  recipientBinding: z.string().regex(/^[a-f0-9]{64}$/),
  letterBinding: z.string().regex(/^[a-f0-9]{64}$/),
  campaignSlug: z.string().trim().min(1).max(120).nullable(),
});

type GenerationProofPayload = z.infer<typeof generationProofPayloadSchema>;

function tokenSecret(): string {
  const value = process.env.LETTER_SIGNAL_TOKEN_SECRET ?? process.env.FEEDBACK_TOKEN_SECRET;
  if (!value) throw new Error("LETTER_SIGNAL_TOKEN_SECRET / FEEDBACK_TOKEN_SECRET is not set");
  return value;
}

function emailHashSecret(): string {
  const value = process.env.LETTER_SIGNAL_EMAIL_HASH_SECRET;
  if (!value) throw new Error("LETTER_SIGNAL_EMAIL_HASH_SECRET is not set");
  return value;
}

function b64url(input: Buffer): string {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function signEnvelope(purpose: "letter_signal_context" | "letter_signal_generated", payload: unknown, now: number): string {
  const body = b64url(Buffer.from(JSON.stringify({ v: 1, purpose, iat: now, payload }), "utf8"));
  const mac = b64url(createHmac("sha256", tokenSecret()).update(body).digest());
  return `${body}.${mac}`;
}

function verifyEnvelope(
  token: string,
  expectedPurpose: "letter_signal_context" | "letter_signal_generated",
  now: number,
): unknown | null {
  if (token.length > TOKEN_MAX_LENGTH) return null;
  const dot = token.indexOf(".");
  if (dot < 1 || dot === token.length - 1) return null;
  const body = token.slice(0, dot);
  const mac = token.slice(dot + 1);

  let expected: string;
  try {
    expected = b64url(createHmac("sha256", tokenSecret()).update(body).digest());
  } catch {
    return null;
  }
  const actualBuffer = Buffer.from(mac);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const padded = body.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (body.length % 4)) % 4);
    const decoded = JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
    const envelope = envelopeSchema.safeParse(decoded);
    if (!envelope.success || envelope.data.purpose !== expectedPurpose) return null;
    if (envelope.data.iat > now + MAX_FUTURE_SKEW_SECONDS) return null;
    if (now - envelope.data.iat > TOKEN_MAX_AGE_SECONDS) return null;
    return envelope.data.payload;
  } catch {
    return null;
  }
}

export function hashLetterSignalEmail(email: string): string {
  return createLetterSignalEmailHash(email, emailHashSecret());
}

export function bindLetterSignalIssue(issueText: string): string {
  return createHmac("sha256", tokenSecret())
    .update(`letter-signal-issue-v1:${issueText.trim().replace(/\s+/g, " ")}`, "utf8")
    .digest("hex");
}

function bindGenerationValue(purpose: string, value: string): string {
  return createHmac("sha256", tokenSecret())
    .update(`letter-signal-${purpose}-v1:${value.trim().replace(/\s+/g, " ")}`, "utf8")
    .digest("hex");
}

function recipientProofValue(recipient: Recipient): string {
  if (recipient.kind === "mdb" || recipient.kind === "mdl") {
    return `${recipient.kind}:${recipient.id}`;
  }
  if (recipient.kind === "landesregierung") {
    return `${recipient.kind}:${recipient.bundeslandKey}`;
  }
  const localKey = recipient.address.source === "destatis"
    ? recipient.address.ags
    : `${recipient.plz}:${recipient.gemeindeName}`;
  return `${recipient.kind}:${localKey}`;
}

export function createLetterSignalContext(
  context: LetterSignalContext,
  nowSeconds = Math.floor(Date.now() / 1000),
): string {
  return signEnvelope("letter_signal_context", letterSignalContextSchema.parse(context), nowSeconds);
}

export function verifyLetterSignalContext(
  token: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): LetterSignalContext | null {
  const payload = verifyEnvelope(token, "letter_signal_context", nowSeconds);
  const parsed = letterSignalContextSchema.safeParse(payload);
  return parsed.success ? parsed.data : null;
}

export function createGenerationProof(
  input: string | {
    letterId: string;
    issueText: string;
    plz: string;
    recipient: Recipient;
    letterText: string;
    campaignSlug: string | null;
  },
  nowSeconds = Math.floor(Date.now() / 1000),
): string {
  const payload: GenerationProofPayload = typeof input === "string"
    ? {
        letterId: input,
        issueBinding: bindLetterSignalIssue(""),
        plz: "00000",
        recipientBinding: bindGenerationValue("recipient", ""),
        letterBinding: bindGenerationValue("letter", ""),
        campaignSlug: null,
      }
    : {
        letterId: input.letterId,
        issueBinding: bindLetterSignalIssue(input.issueText),
        plz: input.plz,
        recipientBinding: bindGenerationValue("recipient", recipientProofValue(input.recipient)),
        letterBinding: bindGenerationValue("letter", input.letterText),
        campaignSlug: input.campaignSlug,
      };
  return signEnvelope("letter_signal_generated", generationProofPayloadSchema.parse(payload), nowSeconds);
}

export function verifyGenerationProof(
  token: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): GenerationProofPayload | null {
  const payload = verifyEnvelope(token, "letter_signal_generated", nowSeconds);
  const parsed = generationProofPayloadSchema.safeParse(payload);
  return parsed.success ? parsed.data : null;
}

export function doesGenerationProofMatch(
  proof: GenerationProofPayload,
  input: {
    issueText: string;
    plz: string;
    recipient: Recipient;
    letterText: string;
    campaignSlug: string | null;
  },
): boolean {
  return (
    proof.issueBinding === bindLetterSignalIssue(input.issueText) &&
    proof.plz === input.plz &&
    proof.recipientBinding === bindGenerationValue("recipient", recipientProofValue(input.recipient)) &&
    proof.letterBinding === bindGenerationValue("letter", input.letterText) &&
    proof.campaignSlug === input.campaignSlug
  );
}
