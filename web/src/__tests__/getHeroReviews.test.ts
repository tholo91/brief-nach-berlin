import { getHeroReviews } from "@/lib/reviews/getHeroReviews";
import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockedSupabase = jest.mocked(supabase);

function makeQuery(result: { data: unknown; error: Error | null }) {
  const query = {
    select: jest.fn(),
    eq: jest.fn(),
    gte: jest.fn(),
    not: jest.fn(),
    order: jest.fn(),
    limit: jest.fn(),
    then: (resolve: (value: typeof result) => unknown) =>
      Promise.resolve(resolve(result)),
  };

  for (const method of [
    query.select,
    query.eq,
    query.gte,
    query.not,
    query.order,
    query.limit,
  ]) {
    method.mockReturnValue(query);
  }

  return query;
}

function review(id: string, rating: 4 | 5) {
  return {
    id,
    created_at: "2026-08-23T00:00:00Z",
    rating,
    body: `Review ${id}`,
    display_name: null,
  };
}

describe("getHeroReviews", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("uses only consented, hero-featured reviews and balances ratings", async () => {
    const query = makeQuery({
      data: [
        review("4a", 4),
        review("4b", 4),
        review("4c", 4),
        review("5a", 5),
        review("5b", 5),
        review("5c", 5),
      ],
      error: null,
    });
    mockedSupabase.from.mockReturnValue(query as never);

    const result = await getHeroReviews();

    expect(mockedSupabase.from).toHaveBeenCalledTimes(1);
    expect(query.eq).toHaveBeenCalledWith("consent", true);
    expect(query.eq).toHaveBeenCalledWith("hero_featured", true);
    expect(query.gte).toHaveBeenCalledWith("rating", 4);
    expect(result).toHaveLength(6);
    expect(result.filter((r) => r.rating === 4)).toHaveLength(3);
    expect(result.filter((r) => r.rating === 5)).toHaveLength(3);
  });

  it("does not fall back to non-featured reviews when none are featured", async () => {
    const query = makeQuery({ data: [], error: null });
    mockedSupabase.from.mockReturnValue(query as never);

    await expect(getHeroReviews()).resolves.toEqual([]);
    expect(mockedSupabase.from).toHaveBeenCalledTimes(1);
  });

  it("returns no reviews when the featured query fails", async () => {
    const query = makeQuery({ data: null, error: new Error("database down") });
    mockedSupabase.from.mockReturnValue(query as never);
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await expect(getHeroReviews()).resolves.toEqual([]);
    expect(mockedSupabase.from).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(
      "[getHeroReviews] query error:",
      "database down"
    );
    errorSpy.mockRestore();
  });
});
