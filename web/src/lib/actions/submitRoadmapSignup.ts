"use server";

// DSGVO note:
// This Server Action persists three things and nothing else:
//   - email          (the address we will notify exactly once)
//   - ebene          (which political level the user wants to hear about)
//   - ip_hash        (HMAC-SHA256 of the request IP, REVIEW_IP_SALT, irreversible,
//                     used purely for rate-limit dedupe across requests)
//   - user_agent     (coarse, for abuse triage)
// After the one-shot launch notification has gone out (see notified_at column),
// the row is purged by an admin cleanup. No newsletter, no profile, no
// long-term retention, no third-party sharing.

import { createHmac } from "node:crypto";
import { z } from "zod";
import { getServiceRoleClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp, LIMITS } from "@/lib/rateLimit";

const EBENE_VALUES = ["land", "kommune", "eu", "alle"] as const;
export type RoadmapEbene = (typeof EBENE_VALUES)[number];

const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  ebene: z.enum(EBENE_VALUES),
});

export type SubmitRoadmapSignupResult =
  | { ok: true; alreadySignedUp: boolean }
  | {
      ok: false;
      error: "validation" | "rate_limited" | "server_error";
      message: string;
      retryAfterSeconds?: number;
    };

export async function submitRoadmapSignupAction(
  input: unknown
): Promise<SubmitRoadmapSignupResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "validation",
      message: "Bitte gib eine gültige E-Mail-Adresse ein.",
    };
  }
  const { email, ebene } = parsed.data;

  const ip = await getClientIp();
  const limit = checkRateLimit(
    `roadmap_signup:ip:${ip}`,
    LIMITS.ROADMAP_SIGNUP_PER_IP.max,
    LIMITS.ROADMAP_SIGNUP_PER_IP.windowMs
  );
  if (!limit.allowed) {
    return {
      ok: false,
      error: "rate_limited",
      message:
        "Du hast dich gerade schon mehrfach eingetragen. Bitte versuch es in ein paar Minuten noch einmal.",
      retryAfterSeconds: limit.retryAfterSeconds,
    };
  }

  // DSGVO: the IP hash must be irreversible. SHA-256 of an IPv4 is
  // brute-forceable because the keyspace is only 2^32. Require a salt;
  // refuse to write otherwise. REVIEW_IP_SALT is shared with submitReview,
  // already documented in the release checklist.
  const salt = process.env.REVIEW_IP_SALT;
  if (!salt) {
    console.error(
      "[submitRoadmapSignup] REVIEW_IP_SALT not set, refusing to write to keep IP irreversible"
    );
    return {
      ok: false,
      error: "server_error",
      message:
        "Anmeldung gerade nicht verfügbar. Bitte versuch es in ein paar Minuten erneut.",
    };
  }
  const ipHash = createHmac("sha256", salt).update(ip).digest("hex");

  let userAgent: string | null = null;
  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    userAgent = h.get("user-agent");
  } catch {
    // headers() is request-scoped; if not available, drop the field silently.
  }

  try {
    const supabase = getServiceRoleClient();
    const { error } = await supabase.from("roadmap_signups").insert({
      email,
      ebene,
      ip_hash: ipHash,
      user_agent: userAgent,
    });

    if (error) {
      // Postgres unique_violation: (email, ebene) already present. Friendly
      // success so a repeat tap reassures the user instead of scaring them.
      if (error.code === "23505") {
        return { ok: true, alreadySignedUp: true };
      }
      console.error("[submitRoadmapSignup] insert failed:", error);
      return {
        ok: false,
        error: "server_error",
        message:
          "Anmeldung konnte nicht gespeichert werden. Bitte versuch es noch einmal.",
      };
    }

    return { ok: true, alreadySignedUp: false };
  } catch (err) {
    console.error("[submitRoadmapSignup] unexpected error:", err);
    return {
      ok: false,
      error: "server_error",
      message: "Etwas ist schiefgelaufen. Bitte versuch es noch einmal.",
    };
  }
}
