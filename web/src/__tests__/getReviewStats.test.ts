import { getReviewStats } from "@/lib/reviews/getReviewStats";
import { getServiceRoleClient } from "@/lib/supabase/server";

jest.mock("@/lib/supabase/server", () => ({
  getServiceRoleClient: jest.fn(),
}));

const mockedGetServiceRoleClient = jest.mocked(getServiceRoleClient);

describe("getReviewStats", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns overall and per-form-status aggregates without row data", async () => {
    const query = {
      select: jest.fn(),
      gte: jest.fn(),
      then: (resolve: (value: unknown) => unknown) =>
        Promise.resolve(resolve({
          data: [
            { rating: 5, full_feedback_submitted: true },
            { rating: 3, full_feedback_submitted: true },
            { rating: 4, full_feedback_submitted: false },
            { rating: 2, full_feedback_submitted: null },
          ],
          error: null,
          count: 4,
        })),
    };
    query.select.mockReturnValue(query);
    query.gte.mockReturnValue(query);
    mockedGetServiceRoleClient.mockReturnValue({
      from: jest.fn(() => query),
    } as never);

    const stats = await getReviewStats();

    expect(query.select).toHaveBeenCalledWith(
      "rating,full_feedback_submitted",
      { count: "exact", head: false },
    );
    expect(stats).toEqual({
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
    });
    expect(stats).not.toHaveProperty("rows");
  });

  it("returns zero-valued groups when there are no reviews", async () => {
    const query = {
      select: jest.fn(),
      gte: jest.fn(),
      then: (resolve: (value: unknown) => unknown) =>
        Promise.resolve(resolve({ data: [], error: null, count: 0 })),
    };
    query.select.mockReturnValue(query);
    query.gte.mockReturnValue(query);
    mockedGetServiceRoleClient.mockReturnValue({
      from: jest.fn(() => query),
    } as never);

    const stats = await getReviewStats();

    expect(stats.totalCount).toBe(0);
    expect(stats.short.totalCount).toBe(0);
    expect(stats.submitted.totalCount).toBe(0);
    expect(stats.short.averageRating).toBe(0);
    expect(stats.submitted.averageRating).toBe(0);
  });
});
