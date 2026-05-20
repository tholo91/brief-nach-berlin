"use server";

import { createHmac } from "node:crypto";
import { z } from "zod";
import { getServiceRoleClient } from "@/lib/supabase/server";
import { verifyFeedbackToken } from "@/lib/feedback/token";
import {
  FEEDBACK_TAG_SLUGS,
  type FeedbackTagSlug,
} from "@/lib/feedback/feedbackTags";
import { checkRateLimit, getClientIp, LIMITS } from "@/lib/rateLimit";
import type { LetterDebugPayload } from "@/lib/email/sendLetterEmail";

// Zod requires a non-empty tuple for z.enum. Cast via [first, ...rest] so the
// type is `[FeedbackTagSlug, ...FeedbackTagSlug[]]`, which z.enum accepts.
const [firstTagSlug, ...restTagSlugs] = FEEDBACK_TAG_SLUGS;
const feedbackTagSchema = z.enum([firstTagSlug, ...restTagSlugs] as [
  FeedbackTagSlug,
  ...FeedbackTagSlug[],
]);

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  body: z.string().max(500),
  displayName: z.string().max(80),
  consent: z.boolean(),
  // Pflichtfeld. Form blockt submit bis Ja/Nein gesetzt ist.
  letterSent: z.boolean(),
  // Quick-Tap-Chips: multi-select, server-side allowlist via z.enum.
  feedbackTags: z.array(feedbackTagSchema).max(8).optional(),
  token: z.string().min(20).max(4000),
  // Set by the client after the user dismissed the rate-limit warning and
  // confirmed they want to submit anyway. The unique-token DB constraint
  // still prevents true duplicates; this only suppresses the IP throttle.
  bypassRateLimit: z.boolean().optional(),
});

export type SubmitReviewResult =
  | { success: true }
  | {
      error:
        | "invalid_token"
        | "validation"
        | "rate_limited"
        | "already_submitted"
        | "server_error";
      message: string;
      retryAfterSeconds?: number;
    };

// Postgres unique-violation SQLSTATE.
const PG_UNIQUE_VIOLATION = "23505";

export async function submitReviewAction(
  input: unknown
): Promise<SubmitReviewResult> {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "validation", message: "Ungültige Eingabe." };
  }
  const data = parsed.data;

  const payload = verifyFeedbackToken<LetterDebugPayload>(data.token);
  if (!payload) {
    return {
      error: "invalid_token",
      message:
        "Dieser Bewertungs-Link ist nicht mehr gültig oder ist abgelaufen.",
    };
  }

  const ip = await getClientIp();
  if (!data.bypassRateLimit) {
    const limit = checkRateLimit(
      `review:ip:${ip}`,
      LIMITS.REVIEW_PER_IP.max,
      LIMITS.REVIEW_PER_IP.windowMs
    );
    if (!limit.allowed) {
      return {
        error: "rate_limited",
        message:
          "Du hast gerade eben schon eine Bewertung abgegeben. Wenn du trotzdem eine zweite abschicken möchtest, klick einfach nochmal.",
        retryAfterSeconds: limit.retryAfterSeconds,
      };
    }
  }

  // DSGVO: the IP hash must be irreversible. SHA-256 of an IPv4 is brute-forceable
  // because the keyspace is only 2^32. Require a salt; refuse to write otherwise.
  // The release checklist sets REVIEW_IP_SALT before prod traffic.
  const salt = process.env.REVIEW_IP_SALT;
  if (!salt) {
    console.error(
      "[submitReview] REVIEW_IP_SALT not set — refusing to write to keep IP irreversible"
    );
    return {
      error: "server_error",
      message: "Bewertungen sind gerade nicht verfügbar. Bitte später erneut.",
    };
  }
  const ipHash = createHmac("sha256", salt).update(ip).digest("hex");

  try {
    const supabase = getServiceRoleClient();
    const { error } = await supabase.from("reviews").insert({
      rating: data.rating,
      // Empty string → null so the column reflects "no comment", not "blank string".
      body: data.body.trim() || null,
      consent: data.consent,
      letter_sent: data.letterSent,
      // Empty array → null so the row doesn't show "{}" in the DB for "no chips".
      feedback_tags: data.feedbackTags?.length ? data.feedbackTags : null,
      display_name: data.displayName.trim() || null,
      // Source of truth for these three fields is the signed token, never the
      // client form. Spoofing email/politicianId is therefore impossible.
      email: payload.userEmail ? payload.userEmail.toLowerCase() : null,
      politician_id:
        payload.politicianId != null ? String(payload.politicianId) : null,
      plz: payload.plz ?? null,
      debug_payload: payload,
      debug_token: data.token,
      ip_hash: ipHash,
    });
    if (error) {
      // Unique-violation on debug_token → token already redeemed.
      if (error.code === PG_UNIQUE_VIOLATION) {
        return {
          error: "already_submitted",
          message:
            "Du hast diesen Brief schon bewertet. Danke dir nochmal dafür!",
        };
      }
      console.error("[submitReview] supabase insert failed:", error);
      return {
        error: "server_error",
        message: "Bewertung konnte nicht gespeichert werden.",
      };
    }
    return { success: true };
  } catch (err) {
    console.error("[submitReview] unexpected error:", err);
    return {
      error: "server_error",
      message: "Etwas ist schiefgelaufen. Bitte versuche es erneut.",
    };
  }
}
