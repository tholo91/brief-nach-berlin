import "server-only";
import { getServiceRoleClient } from "@/lib/supabase/server";
import {
  aggregateInternalStats,
  DEFAULT_STATS_FILTER,
  type InternalLetterSignalRow,
  type InternalReviewRow,
  type InternalStats,
  type StatsFilter,
} from "./aggregate";

export async function getInternalStats(
  filter: StatsFilter = DEFAULT_STATS_FILTER,
): Promise<InternalStats> {
  const client = getServiceRoleClient();
  const [reviewsResult, signalsResult, counterResult, campaignsResult] =
    await Promise.all([
      client
        .from("reviews")
        .select(
          "created_at,rating,letter_sent,full_feedback_submitted,feedback_tags,political_self_efficacy,political_powerlessness_frequency,debug_payload,letter_id",
        ),
      client
        .from("letter_signals")
        .select(
          "created_at,consented_at,generated_at,campaign_slug,topic_categories,topic_labels,political_level,bundesland_key,plz_prefix,letter_id",
        )
        .eq("status", "contributed"),
      client
        .from("counters")
        .select("value")
        .eq("key", "letter_count")
        .maybeSingle(),
      client
        .from("campaigns")
        .select("slug,title")
        .eq("status", "active")
        .eq("moderation_status", "approved"),
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
  if (campaignsResult.error) {
    throw new Error(
      `Internal campaign label lookup failed: ${campaignsResult.error.message}`,
    );
  }

  const campaignLabels: Record<string, string> = {};
  for (const campaign of campaignsResult.data ?? []) {
    if (campaign.slug && campaign.title) {
      campaignLabels[String(campaign.slug)] = String(campaign.title);
    }
  }

  return aggregateInternalStats(
    (reviewsResult.data ?? []) as InternalReviewRow[],
    counterResult.data?.value ?? 0,
    new Date().toISOString(),
    (signalsResult.data ?? []) as InternalLetterSignalRow[],
    filter,
    campaignLabels,
  );
}