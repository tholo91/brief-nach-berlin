import { supabase } from "@/lib/supabase";
import { MIN_PUBLIC_REVIEW_DATE, type PublicReview } from "./types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickBalancedReviews(reviews: PublicReview[]): PublicReview[] {
  const eligible = reviews.filter((r) => r.rating === 4 || r.rating === 5);
  const fourStar = shuffle(eligible.filter((r) => r.rating === 4));
  const fiveStar = shuffle(eligible.filter((r) => r.rating === 5));
  const perRating = Math.min(6, fourStar.length, fiveStar.length);

  if (perRating === 0) return shuffle(eligible).slice(0, 12);

  return shuffle([
    ...fourStar.slice(0, perRating),
    ...fiveStar.slice(0, perRating),
  ]);
}

/**
 * Fetches hand-curated hero reviews (hero_featured = true, rating >= 4).
 */
export async function getHeroReviews(): Promise<PublicReview[]> {
  try {
    const { data: featured, error: featuredError } = await supabase
      .from("reviews")
      .select("id, created_at, rating, body, display_name")
      .eq("consent", true)
      .eq("hero_featured", true)
      .gte("rating", 4)
      .not("body", "is", null)
      .gte("created_at", MIN_PUBLIC_REVIEW_DATE)
      .order("created_at", { ascending: false })
      .limit(30);

    if (featuredError) {
      console.error("[getHeroReviews] query error:", featuredError.message);
      return [];
    }

    return pickBalancedReviews(
      ((featured as PublicReview[]) ?? []).filter(
        (r) => r.body && r.body.trim().length > 0
      )
    );
  } catch (err) {
    console.error("[getHeroReviews] unexpected error:", err);
    return [];
  }
}
