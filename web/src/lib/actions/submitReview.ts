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
  // 'initial': silent submit triggered by the email-link star click, only
  // writes `rating` (+ token metadata). On conflict: no-op.
  // 'full':    user pressed Submit on the form, overwrites all fields.
  mode: z.enum(["initial", "full"]).default("full"),
  rating: z.number().int().min(1).max(5),
  body: z.string().max(500).default(""),
  displayName: z.string().max(80).default(""),
  consent: z.boolean().default(false),
  // Nullable: 'initial' mode submits without a Ja/Nein selection, and a user
  // who only filled the body but skipped the radio should still be able to
  // submit the form.
  letterSent: z.boolean().nullable().default(null),
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
        | "server_error";
      message: string;
      retryAfterSeconds?: number;
    };

export async function submitReviewAction(
  input: unknown
): Promise<SubmitReviewResult> {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "validation", message: "Ungültige Eingabe." };
  }
  const data = parsed.data;

  const payload = verifyFeedbackToken<LetterDebugPayload & { source?: string }>(
    data.token
  );
  if (!payload) {
    return {
      error: "invalid_token",
      message:
        "Dieser Bewertungs-Link ist nicht mehr gültig oder ist abgelaufen.",
    };
  }

  // Backlog-Kampagne: send-backlog-followup.ts signiert pro Empfänger:in einen
  // eigenen Token (Email im Payload, unique debug_token). Wir erkennen den
  // Token am `source`-Feld und markieren die Zeile mit feedback_tags
  // ["backlog_campaign"], damit sie später vom regulären Letter-Feedback
  // unterscheidbar ist. Der UNIQUE-Dedup-Pfad und der Silent-Auto-Submit
  // funktionieren ansonsten identisch zur Letter-Mail.
  const isBacklog = payload.source === "backlog_2026_05";

  const ip = await getClientIp();
  // Rate-limit only the user-driven full submit. The 'initial' mode is
  // triggered automatically on page mount; throttling it would consume the
  // IP budget before the user gets a chance to submit the actual form.
  // Idempotency is guaranteed via the UNIQUE(debug_token) + ignoreDuplicates
  // upsert path, so spam is impossible without a valid signed token.
  if (data.mode === "full" && !data.bypassRateLimit) {
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
    const userTags = data.feedbackTags?.length ? data.feedbackTags : [];
    const tagsForInsert = isBacklog
      ? Array.from(new Set([...userTags, "backlog_campaign"]))
      : userTags;

    // Metadata derived from the signed token. Identical for both modes —
    // 'initial' and 'full' over the same token resolve the same values, so
    // overwriting on a 'full' upsert is a no-op for these columns.
    const tokenMeta = {
      email: payload.userEmail ? payload.userEmail.toLowerCase() : null,
      politician_id:
        payload.politicianId != null ? String(payload.politicianId) : null,
      plz: payload.plz ?? null,
      debug_payload: payload,
      debug_token: data.token,
      ip_hash: ipHash,
    };

    if (data.mode === "initial") {
      // ignoreDuplicates: existing row for this debug_token is left untouched.
      // Crucial race protection: a 'full' submit that already happened (with
      // body, tags, letter_sent) cannot be overwritten by a delayed 'initial'.
      //
      // DSGVO: `consent` defaults to TRUE at the DB level (legacy from when
      // every form-submit was opt-in). For the silent auto-submit there is
      // no active user consent, so we must set it to FALSE explicitly.
      const { error } = await supabase
        .from("reviews")
        .upsert(
          {
            rating: data.rating,
            consent: false,
            ...tokenMeta,
          },
          { onConflict: "debug_token", ignoreDuplicates: true }
        );
      if (error) {
        console.error("[submitReview] initial upsert failed:", error);
        return {
          error: "server_error",
          message: "Bewertung konnte nicht gespeichert werden.",
        };
      }
      return { success: true };
    }

    // mode === 'full': user pressed Submit. Overwrite any prior 'initial' row.
    const { error } = await supabase.from("reviews").upsert(
      {
        rating: data.rating,
        // Empty string → null so the column reflects "no comment", not "blank string".
        body: data.body.trim() || null,
        consent: data.consent,
        letter_sent: data.letterSent,
        // Empty array → null so the row doesn't show "{}" in the DB for "no chips".
        feedback_tags: tagsForInsert.length ? tagsForInsert : null,
        display_name: data.displayName.trim() || null,
        ...tokenMeta,
      },
      { onConflict: "debug_token", ignoreDuplicates: false }
    );
    if (error) {
      console.error("[submitReview] full upsert failed:", error);
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
