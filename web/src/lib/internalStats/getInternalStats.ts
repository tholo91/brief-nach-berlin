import "server-only";
import { getServiceRoleClient } from "@/lib/supabase/server";
import {
  aggregateInternalStats,
  type InternalReviewRow,
  type InternalStats,
} from "./aggregate";

export async function getInternalStats(): Promise<InternalStats> {
  const client = getServiceRoleClient();
  const [reviewsResult, counterResult] = await Promise.all([
    client
      .from("reviews")
      .select(
        "created_at,rating,letter_sent,full_feedback_submitted,feedback_tags,debug_payload",
      ),
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

  return aggregateInternalStats(
    (reviewsResult.data ?? []) as InternalReviewRow[],
    counterResult.data?.value ?? 0,
  );
}
