jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@/lib/supabase/server", () => ({ getServiceRoleClient: jest.fn() }));
jest.mock("next/cache", () => ({
  unstable_cache: <T,>(fn: () => Promise<T>) => fn,
}));

import { GET } from "@/app/api/letter-signals/map/route";
import { getServiceRoleClient } from "@/lib/supabase/server";
import { getPlzMapPoint } from "@/lib/letterSignals/plzMapPoint";

function mockRpcPages(...pages: { data: unknown; error: unknown }[]) {
  const range = jest.fn();
  for (const page of pages) range.mockResolvedValueOnce(page);
  jest.mocked(getServiceRoleClient).mockReturnValue({
    rpc: jest.fn().mockReturnValue({ range }),
  } as never);
  return range;
}

describe("public letter signal map endpoint", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns projected counts without exposing postcodes", async () => {
    mockRpcPages({
      data: [
        { plz: "28203", contribution_count: 4 },
        { plz: "10115", contribution_count: 2 },
      ],
      error: null,
    });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe(
      "public, max-age=60, stale-while-revalidate=60",
    );
    expect(response.headers.get("vercel-cdn-cache-control")).toBe(
      "max-age=300, stale-while-revalidate=60",
    );
    const body = await response.json();
    expect(body).toEqual({
      points: [
        { x: getPlzMapPoint("28203")![0], y: getPlzMapPoint("28203")![1], count: 4 },
        { x: getPlzMapPoint("10115")![0], y: getPlzMapPoint("10115")![1], count: 2 },
      ],
      totalContributions: 6,
      postcodeAreas: 2,
    });
    expect(JSON.stringify(body)).not.toContain("28203");
    expect(JSON.stringify(body)).not.toContain("10115");
  });

  it("reads every page so postcodes beyond the first 1,000 rows appear", async () => {
    const fullPage = Array.from({ length: 1000 }, () => ({
      plz: "10115",
      contribution_count: 1,
    }));
    const range = mockRpcPages(
      { data: fullPage, error: null },
      { data: [{ plz: "80331", contribution_count: 3 }], error: null },
    );

    const body = await (await GET()).json();

    expect(range).toHaveBeenCalledTimes(2);
    expect(range).toHaveBeenNthCalledWith(1, 0, 999);
    expect(range).toHaveBeenNthCalledWith(2, 1000, 1999);
    expect(body.points).toContainEqual({
      x: getPlzMapPoint("80331")![0],
      y: getPlzMapPoint("80331")![1],
      count: 3,
    });
    expect(body.totalContributions).toBe(1003);
    expect(body.postcodeAreas).toBe(1001);
  });

  it("reports an unavailable aggregation without leaking database details", async () => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    mockRpcPages({
      data: null,
      error: { message: "private database detail" },
    });

    const response = await GET();

    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({
      points: [],
      totalContributions: 0,
      postcodeAreas: 0,
    });
  });
});
