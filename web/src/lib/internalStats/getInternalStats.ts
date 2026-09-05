import "server-only";
import { getServiceRoleClient } from "@/lib/supabase/server";
import {
  aggregateInternalStats,
  type InternalLetterSignalRow,
  type InternalReviewRow,
  type InternalStats,
} from "./aggregate";

export async function getInternalStats(): Promise<InternalStats> {
  const client = getServiceRoleClient();
  const [reviewsResult, signalsResult, counterResult] = await Promise.all([
    client
      .from("reviews")
      .select(
        "created_at,rating,letter_sent,full_feedback_submitted,feedback_tags,political_self_efficacy,political_powerlessness_frequency,debug_payload,letter_id",
      ),
    client
      .from("letter_signals")
      .select("generated_at,topic_categories,topic_labels,political_level,bundesland_key,plz_prefix,letter_id")
      .eq("status", "contributed"),
    client
      .from("counters")
      .select("value")
      .eq("key", "letter_count")
      .maybeSingle(),
  ]);

  if (reviewsResult.error) {
    throw new Error(`Internal review stats failed: ${reviewsResult.error.message}`);
  }
  if (counterResult.error) {
    throw new Error(`Internal letter count failed: ${counterResult.error.message}`);
  }
  if (signalsResult.error) {
    throw new Error(`Internal letter signal stats failed: ${signalsResult.error.message}`);
  }

  return aggregateInternalStats(
    (reviewsResult.data ?? []) as InternalReviewRow[],
    counterResult.data?.value ?? 0,
    new Date().toISOString(),
    (signalsResult.data ?? []) as InternalLetterSignalRow[],
  );
}
