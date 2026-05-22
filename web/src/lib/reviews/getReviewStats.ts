import "server-only";
import { getServiceRoleClient } from "@/lib/supabase/server";
import type { RatingDistribution, ReviewStats } from "./types";

const EMPTY_STATS: ReviewStats = {
  averageRating: 0,
  totalCount: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

/**
 * Returns aggregate rating statistics using the service role client.
 * NEVER returns row data -- only computed aggregates (avg, count, distribution).
 */
export async function getReviewStats(): Promise<ReviewStats> {
  try {
    const client = getServiceRoleClient();

    // Fetch only the rating column for all rows (service role bypasses RLS)
    const { data, error, count } = await client
      .from("reviews")
      .select("rating", { count: "exact", head: false });

    if (error) {
      console.error("[getReviewStats] Supabase error:", error.message);
      return EMPTY_STATS;
    }

    if (!data || data.length === 0) return EMPTY_STATS;

    const totalCount = count ?? data.length;
    const distribution: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;

    for (const row of data) {
      const r = row.rating as 1 | 2 | 3 | 4 | 5;
      if (r >= 1 && r <= 5) {
        distribution[r] = (distribution[r] ?? 0) + 1;
        sum += r;
      }
    }

    const averageRating = Math.round((sum / data.length) * 10) / 10;

    return { averageRating, totalCount, distribution };
  } catch (err) {
    console.error("[getReviewStats] Unexpected error:", err);
    return EMPTY_STATS;
  }
}
