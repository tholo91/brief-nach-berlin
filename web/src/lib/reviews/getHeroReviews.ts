import { supabase } from "@/lib/supabase";
import { MIN_PUBLIC_REVIEW_DATE, type PublicReview } from "./types";

const HOUR_IN_MS = 60 * 60 * 1000;

function createSeededRandom(seed: number): () => number {
  let state = seed;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], random: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickBalancedReviews(
  reviews: PublicReview[],
  seed: number
): PublicReview[] {
  const random = createSeededRandom(seed);
  const eligible = reviews.filter((r) => r.rating === 4 || r.rating === 5);
  const fourStar = shuffle(
    eligible.filter((r) => r.rating === 4),
    random
  );
  const fiveStar = shuffle(
    eligible.filter((r) => r.rating === 5),
    random
  );
  const perRating = Math.min(6, fourStar.length, fiveStar.length);

  if (perRating === 0) return shuffle(eligible, random).slice(0, 12);

  return shuffle(
    [...fourStar.slice(0, perRating), ...fiveStar.slice(0, perRating)],
    random
  );
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
      ),
      Math.floor(Date.now() / HOUR_IN_MS)
    );
  } catch (err) {
    console.error("[getHeroReviews] unexpected error:", err);
    return [];
  }
}
