import "server-only";
import { fetchAllRows } from "@/lib/supabase/fetchAllRows";
import { getServiceRoleClient } from "@/lib/supabase/server";
import {
  buildCampaignCreatorStats,
  CREATOR_STATS_HOUR_COLUMNS,
  CREATOR_STATS_REVIEW_COLUMNS,
  CREATOR_STATS_SIGNAL_COLUMNS,
  type CampaignCreatorStatsView,
  type CampaignFeedbackRow,
  type CampaignLetterHourRow,
  type CampaignSignalRow,
} from "./creatorStatsView";
import type { Campaign } from "./schema";

// The pure builder and constants live in creatorStatsView.ts (no server-only),
// so scripts can import them. Re-exported here so existing imports keep working.
export * from "./creatorStatsView";

async function loadReviewRows(slug: string): Promise<CampaignFeedbackRow[] | null> {
  try {
    const { data, error } = await getServiceRoleClient()
      .from("reviews")
      .select(CREATOR_STATS_REVIEW_COLUMNS)
      .eq("campaign_slug", slug)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[creatorStats] reviews query failed:", error.message);
      return null;
    }
    return (data ?? []) as CampaignFeedbackRow[];
  } catch (error) {
    console.error(
      "[creatorStats] reviews query threw:",
      error instanceof Error ? error.message : "unknown error",
    );
    return null;
  }
}

async function loadSignalRows(slug: string): Promise<CampaignSignalRow[] | null> {
  try {
    const client = getServiceRoleClient();
    const { data, error } = await fetchAllRows((from, to) =>
      client
        .from("letter_signals")
        .select(CREATOR_STATS_SIGNAL_COLUMNS)
        .eq("campaign_slug", slug)
        .order("id")
        .range(from, to),
    );

    if (error) {
      console.error("[creatorStats] letter_signals query failed:", error.message);
      return null;
    }
    return (data ?? []) as CampaignSignalRow[];
  } catch (error) {
    console.error(
      "[creatorStats] letter_signals query threw:",
      error instanceof Error ? error.message : "unknown error",
    );
    return null;
  }
}

async function loadHourRows(slug: string): Promise<CampaignLetterHourRow[] | null> {
  try {
    const client = getServiceRoleClient();
    const { data, error } = await fetchAllRows((from, to) =>
      client
        .from("campaign_letter_hours")
        .select(CREATOR_STATS_HOUR_COLUMNS)
        .eq("campaign_slug", slug)
        .order("hour")
        .range(from, to),
    );

    if (error) {
      console.error("[creatorStats] campaign_letter_hours query failed:", error.message);
      return null;
    }
    return (data ?? []) as CampaignLetterHourRow[];
  } catch (error) {
    console.error(
      "[creatorStats] campaign_letter_hours query threw:",
      error instanceof Error ? error.message : "unknown error",
    );
    return null;
  }
}

/**
 * Reads only this campaign's reviews, letter signals and letter hour rows,
 * each with a fixed column list. Signals and hour rows are paged via
 * fetchAllRows; reviews are one response (PostgREST 1000-row cap, accepted
 * limit for now).
 */
export async function getCampaignCreatorStats(
  campaign: Pick<Campaign, "slug" | "letterCount">,
  ended: boolean,
  now: Date = new Date(),
): Promise<CampaignCreatorStatsView> {
  const [rows, signalRows, hourRows] = await Promise.all([
    loadReviewRows(campaign.slug),
    loadSignalRows(campaign.slug),
    loadHourRows(campaign.slug),
  ]);
  return buildCampaignCreatorStats({
    rows,
    signalRows,
    hourRows,
    now,
    letterCount: campaign.letterCount,
    ended,
  });
}
