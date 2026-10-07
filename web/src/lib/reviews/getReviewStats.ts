import "server-only";
import { getServiceRoleClient } from "@/lib/supabase/server";
import {
  MIN_PUBLIC_REVIEW_DATE,
  type RatingDistribution,
  type ReviewStats,
} from "./types";

const EMPTY_STATS: ReviewStats = {
  averageRating: 0,
  totalCount: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  short: {
    averageRating: 0,
    totalCount: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  },
  submitted: {
    averageRating: 0,
    totalCount: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  },
};

function emptySummary() {
  return {
    averageRating: 0,
    totalCount: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as ReviewStats["distribution"],
  };
}

/**
 * Returns aggregate rating statistics using the service role client.
 * NEVER returns row data -- only computed aggregates (avg, count, distribution).
 */
export async function getReviewStats(): Promise<ReviewStats> {
  try {
    const client = getServiceRoleClient();

    // Fetch only rating and completion status; return aggregates, never rows.
    const { data, error, count } = await client
      .from("reviews")
      .select("rating,full_feedback_submitted", { count: "exact", head: false })
      .gte("created_at", MIN_PUBLIC_REVIEW_DATE);

    if (error) {
      console.error("[getReviewStats] Supabase error:", error.message);
      return EMPTY_STATS;
    }

    if (!data || data.length === 0) return EMPTY_STATS;

    const distribution: RatingDistribution = emptySummary().distribution;
    const short = emptySummary();
    const submitted = emptySummary();
    let sum = 0;

    for (const row of data) {
      const r = row.rating as 1 | 2 | 3 | 4 | 5;
      const group = row.full_feedback_submitted === true ? submitted : short;
      group.totalCount += 1;
      if (r >= 1 && r <= 5) {
        distribution[r] = (distribution[r] ?? 0) + 1;
        sum += r;
        group.distribution[r] = (group.distribution[r] ?? 0) + 1;
        group.averageRating += r;
      }
    }

    const totalCount = count ?? data.length;
    const averageRating = data.length > 0 ? Math.round((sum / data.length) * 10) / 10 : 0;
    for (const group of [short, submitted]) {
      const ratingCount = Object.values(group.distribution).reduce((total, value) => total + value, 0);
      group.averageRating = ratingCount > 0
        ? Math.round((group.averageRating / ratingCount) * 10) / 10
        : 0;
    }

    return { averageRating, totalCount, distribution, short, submitted };
  } catch (err) {
    console.error("[getReviewStats] Unexpected error:", err);
    return EMPTY_STATS;
  }
}
