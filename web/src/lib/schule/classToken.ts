import "server-only";
import { z } from "zod";
import { signFeedbackToken, verifyFeedbackToken } from "@/lib/feedback/token";
import { hashIdentifier } from "@/lib/rateLimit";

export const CLASS_TOKEN_MAX_AGE_SECONDS = 14 * 24 * 60 * 60;

// Trennt Klassen-Tokens von Feedback-Tokens: gleiches Secret, andere MAC-Eingabe.
const MAC_DOMAIN = "class-link-v1.";
const MAX_TOKEN_LENGTH = 512;
const OPTS = { macDomain: MAC_DOMAIN, maxAgeSeconds: CLASS_TOKEN_MAX_AGE_SECONDS };

const payloadSchema = z.object({
  v: z.literal(1),
  k: z.number().int().min(7).max(13),
  p: z.string().regex(/^\d{5}$/),
  iat: z.number(),
});

export function signClassToken({ klasse, plz }: { klasse: number; plz: string }): string {
  return signFeedbackToken({ v: 1, k: klasse, p: plz }, OPTS);
}

export function verifyClassToken(
  token: unknown
): { klasse: number; plz: string; issuedAt: number; bucketId: string } | null {
  if (typeof token !== "string" || token.length === 0 || token.length > MAX_TOKEN_LENGTH) {
    return null;
  }
  try {
    const parsed = payloadSchema.safeParse(verifyFeedbackToken(token, OPTS));
    if (!parsed.success) return null;
    return {
      klasse: parsed.data.k,
      plz: parsed.data.p,
      issuedAt: parsed.data.iat,
      bucketId: hashIdentifier(token),
    };
  } catch {
    return null;
  }
}
