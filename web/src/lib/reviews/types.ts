/**
 * Cutoff date for public-facing reviews and aggregate stats.
 * Prompt-Rewrite landed 2026-05-20/21 (commits c9b09dc, 26abb48, 6b5a411).
 * Earlier reviews are stale signal for the post-rewrite product.
 */
export const MIN_PUBLIC_REVIEW_DATE = "2026-05-21T00:00:00Z";

export type PublicReview = {
  id: string;
  created_at: string;
  rating: number;
  body: string;
  display_name: string | null;
};

export type RatingDistribution = Record<1 | 2 | 3 | 4 | 5, number>;

export type ReviewStats = {
  averageRating: number;
  totalCount: number;
  distribution: RatingDistribution;
};
