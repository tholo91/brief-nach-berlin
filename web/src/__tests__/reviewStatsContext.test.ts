import { getReviewGroupStats } from "@/components/reviews/ReviewStatsContext";
import type { ReviewStats } from "@/lib/reviews/types";

const stats: ReviewStats = {
  averageRating: 3.5,
  totalCount: 4,
  distribution: { 1: 0, 2: 1, 3: 1, 4: 1, 5: 1 },
  short: {
    averageRating: 3,
    totalCount: 2,
    distribution: { 1: 0, 2: 1, 3: 0, 4: 1, 5: 0 },
  },
  submitted: {
    averageRating: 4,
    totalCount: 2,
    distribution: { 1: 0, 2: 0, 3: 1, 4: 0, 5: 1 },
  },
};

describe("review stats selection", () => {
  it("selects the matching count, average, and star distribution", () => {
    expect(getReviewGroupStats(stats, "submitted")).toEqual(stats.submitted);
    expect(getReviewGroupStats(stats, "short")).toEqual(stats.short);
  });
});
