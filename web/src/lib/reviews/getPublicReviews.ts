import { supabase } from "@/lib/supabase";
import { MIN_PUBLIC_REVIEW_DATE, type PublicReview } from "./types";

/**
 * Fetches public, consented reviews with a non-empty body.
 * Uses the anon client, which is RLS-bounded (consent = TRUE)
 * and column-restricted (id, created_at, rating, body, display_name).
 */
export async function getPublicReviews(limit = 30): Promise<PublicReview[]> {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("id, created_at, rating, body, display_name")
      .eq("consent", true)
      .not("body", "is", null)
      .gte("created_at", MIN_PUBLIC_REVIEW_DATE)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[getPublicReviews] Supabase error:", error.message);
      return [];
    }

    if (!data) return [];

    // Secondary JS filter: ensure body is non-empty after trimming
    return (data as PublicReview[]).filter(
      (r) => r.body && r.body.trim().length > 0
    );
  } catch (err) {
    console.error("[getPublicReviews] Unexpected error:", err);
    return [];
  }
}
