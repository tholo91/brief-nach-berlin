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
