"use server";

import { getServiceRoleClient } from "@/lib/supabase/server";
import {
  verifyGenerationProof,
  verifyLetterSignalContext,
  hashLetterSignalEmail,
} from "@/lib/letterSignals/token";
import {
  generationProofInputSchema,
  letterSignalInputSchema,
} from "@/lib/letterSignals/types";
import { checkRateLimit, getClientIp, hashIdentifier, LIMITS } from "@/lib/rateLimit";
import { getPlzMapPoint } from "@/lib/letterSignals/plzMapPoint";

type SignalActionResult =
  | { success: true; mapPoint?: { x: number; y: number }; created?: boolean }
  | { error: "invalid_context" | "rate_limited" | "server_error" };

const LETTER_SIGNAL_CONSENT_VERSION = "letter-signals-2026-09-v2-clear-email-exact-map";

export async function createLetterSignalAction(input: unknown): Promise<SignalActionResult> {
  const parsedInput = letterSignalInputSchema.safeParse(input);
  if (!parsedInput.success) return { error: "invalid_context" };

  const context = verifyLetterSignalContext(parsedInput.data.contextToken);
  if (!context) return { error: "invalid_context" };
  const generationProof = parsedInput.data.generationProof
    ? verifyGenerationProof(parsedInput.data.generationProof)
    : null;
  if (parsedInput.data.generationProof && generationProof?.letterId !== context.letterId) {
    return { error: "invalid_context" };
  }

  try {
    const normalizedEmail = parsedInput.data.email.trim().toLowerCase();
    if (hashLetterSignalEmail(normalizedEmail) !== context.emailLookupHash) {
      return { error: "invalid_context" };
    }
    const ipLimit = checkRateLimit(
      `letter-signal:ip:${hashIdentifier(await getClientIp())}`,
      LIMITS.LETTER_SIGNALS_PER_IP.max,
      LIMITS.LETTER_SIGNALS_PER_IP.windowMs,
    );
    if (!ipLimit.allowed) return { error: "rate_limited" };
    const emailLimit = checkRateLimit(
      `letter-signal:email:${context.emailLookupHash}`,
      LIMITS.LETTER_SIGNALS_PER_EMAIL.max,
      LIMITS.LETTER_SIGNALS_PER_EMAIL.windowMs,
    );
    if (!emailLimit.allowed) return { error: "rate_limited" };

    const { data, error } = await getServiceRoleClient()
      .from("letter_signals")
      .upsert(
        {
          letter_id: context.letterId,
          consented_at: new Date().toISOString(),
          consent_version: LETTER_SIGNAL_CONSENT_VERSION,
          status: "contributed",
          plz: context.plz,
          plz_prefix: context.plz.slice(0, 2),
          bundesland_key: context.bundeslandKey,
          political_level: context.politicalLevel,
          recipient_kind: context.recipientKind,
          topic_categories: context.topicCategories,
          topic_labels: context.topicLabels,
          topic_taxonomy_version: context.topicTaxonomyVersion,
          topic_source: context.topicSource,
          topic_model: context.topicModel,
          campaign_slug: context.campaignSlug,
          email_normalized: normalizedEmail,
          email_lookup_hash: context.emailLookupHash,
          generated_at: generationProof ? new Date().toISOString() : null,
        },
        { onConflict: "letter_id", ignoreDuplicates: true },
      )
      .select("plz_prefix");
    if (error) {
      console.error("[letter-signals] contribution insert failed", error.message);
      return { error: "server_error" };
    }
    const mapPoint = getPlzMapPoint(context.plz);
    return {
      success: true,
      ...(mapPoint ? { mapPoint: { x: mapPoint[0], y: mapPoint[1] } } : {}),
      created: (data ?? []).length > 0,
    };
  } catch (error) {
    console.error("[letter-signals] contribution insert failed", error);
    return { error: "server_error" };
  }
}

export async function markLetterSignalGeneratedAction(input: unknown): Promise<SignalActionResult> {
  const parsedInput = generationProofInputSchema.safeParse(input);
  if (!parsedInput.success) return { error: "invalid_context" };

  const proof = verifyGenerationProof(parsedInput.data.generationProof);
  if (!proof) return { error: "invalid_context" };

  try {
    const client = getServiceRoleClient();
    const { data, error } = await client
      .from("letter_signals")
      .update({ generated_at: new Date().toISOString() })
      .eq("letter_id", proof.letterId)
      .select("letter_id");
    if (error) {
      console.error("[letter-signals] finalize failed", error.message);
      return { error: "server_error" };
    }
    if ((data ?? []).length === 0) {
      return { error: "invalid_context" };
    }
    return { success: true };
  } catch (error) {
    console.error("[letter-signals] finalize failed", error);
    return { error: "server_error" };
  }
}
