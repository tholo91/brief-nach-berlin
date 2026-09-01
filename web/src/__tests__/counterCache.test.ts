const mockRevalidateTag = jest.fn();
const mockRpc = jest.fn();
const mockFrom = jest.fn();

jest.mock("next/cache", () => ({
  revalidateTag: mockRevalidateTag,
  unstable_cache: (fn: () => Promise<number>) => {
    let cached: number | undefined;
    return async () => {
      if (cached === undefined) cached = await fn();
      return cached;
    };
  },
}));

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: mockFrom,
    rpc: mockRpc,
  },
}));

import { getLetterCount, incrementLetterCounters } from "@/lib/counter";

describe("letter counter caching", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: jest.fn().mockResolvedValue({ data: { value: 41 }, error: null }),
        }),
      }),
    });
  });

  it("invalidates the counter after an increment", async () => {
    mockRpc.mockResolvedValue({ data: 42, error: null });

    await expect(incrementLetterCounters()).resolves.toBe(42);

    expect(mockRpc).toHaveBeenCalledWith("increment_letter_counters", {
      campaign_slug: null,
    });
    expect(mockRevalidateTag).toHaveBeenCalledWith("letter-count", "max");
  });

  it("returns the last known value when Supabase cannot be read", async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: jest.fn().mockResolvedValue({ data: null, error: { message: "temporary outage" } }),
        }),
      }),
    });

    await expect(getLetterCount()).resolves.toBe(1770);
  });

  it("reuses the cached public counter value", async () => {
    await expect(getLetterCount()).resolves.toBe(41);
    await expect(getLetterCount()).resolves.toBe(41);

    expect(mockFrom).toHaveBeenCalledTimes(1);
  });
});
