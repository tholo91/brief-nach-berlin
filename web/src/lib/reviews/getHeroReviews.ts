import { supabase } from "@/lib/supabase";
import { MIN_PUBLIC_REVIEW_DATE, type PublicReview } from "./types";

/**
 * Fetches hand-curated hero reviews (hero_featured = true, rating >= 4).
 * Falls back to the latest 5-star reviews if none are curated yet.
 * Uses the anon client — RLS ensures only consented rows are returned.
 */
export async function getHeroReviews(): Promise<PublicReview[]> {
  try {
    const { data: featured, error: featuredError } = await supabase
      .from("reviews")
      .select("id, created_at, rating, body, display_name")
      .eq("hero_featured", true)
      .gte("rating", 4)
      .not("body", "is", null)
      .gte("created_at", MIN_PUBLIC_REVIEW_DATE)
      .order("created_at", { ascending: false })
      .limit(6);

    if (!featuredError && featured && featured.length > 0) {
      return (featured as PublicReview[]).filter(
        (r) => r.body && r.body.trim().length > 0
      );
    }

    // Fallback: top-rated recent reviews
    const { data: fallback, error: fallbackError } = await supabase
      .from("reviews")
      .select("id, created_at, rating, body, display_name")
      .eq("rating", 5)
      .not("body", "is", null)
      .gte("created_at", MIN_PUBLIC_REVIEW_DATE)
      .order("created_at", { ascending: false })
      .limit(4);

    if (fallbackError) {
      console.error("[getHeroReviews] fallback error:", fallbackError.message);
      return [];
    }

    return ((fallback as PublicReview[]) ?? []).filter(
      (r) => r.body && r.body.trim().length > 0
    );
  } catch (err) {
    console.error("[getHeroReviews] unexpected error:", err);
    return [];
  }
}
