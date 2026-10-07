import { getPublicReviews } from "@/lib/reviews/getPublicReviews";
import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: { from: jest.fn() },
}));

const mockedSupabase = jest.mocked(supabase);

describe("getPublicReviews", () => {
  afterEach(() => jest.clearAllMocks());

  it("keeps individual public reviews consented and non-empty", async () => {
    const query = {
      select: jest.fn(),
      eq: jest.fn(),
      not: jest.fn(),
      gte: jest.fn(),
      order: jest.fn(),
      limit: jest.fn(),
      then: (resolve: (value: unknown) => unknown) =>
        Promise.resolve(resolve({
          data: [
            { id: "allowed", created_at: "2026-08-01T00:00:00Z", rating: 5, body: "Gute Hilfe", display_name: null },
            { id: "blank", created_at: "2026-08-01T00:00:00Z", rating: 4, body: "  ", display_name: null },
          ],
          error: null,
        })),
    };
    for (const method of [query.select, query.eq, query.not, query.gte, query.order, query.limit]) {
      method.mockReturnValue(query);
    }
    mockedSupabase.from.mockReturnValue(query as never);

    await expect(getPublicReviews()).resolves.toEqual([
      { id: "allowed", created_at: "2026-08-01T00:00:00Z", rating: 5, body: "Gute Hilfe", display_name: null },
    ]);
    expect(query.eq).toHaveBeenCalledWith("consent", true);
    expect(query.select).toHaveBeenCalledWith(
      "id, created_at, rating, body, display_name",
    );
  });
});
