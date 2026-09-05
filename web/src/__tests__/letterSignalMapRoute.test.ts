jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@/lib/supabase/server", () => ({ getServiceRoleClient: jest.fn() }));

import { GET } from "@/app/api/letter-signals/map/route";
import { getServiceRoleClient } from "@/lib/supabase/server";
import { getPlzMapPoint } from "@/lib/letterSignals/plzMapPoint";

describe("public letter signal map endpoint", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns projected counts without exposing postcodes", async () => {
    jest.mocked(getServiceRoleClient).mockReturnValue({
      rpc: jest.fn().mockResolvedValue({
        data: [
          { plz: "28203", contribution_count: 4 },
          { plz: "10115", contribution_count: 2 },
        ],
        error: null,
      }),
    } as never);

    const response = await GET();

    expect(response.status).toBe(200);
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

  it("reports an unavailable aggregation without leaking database details", async () => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    jest.mocked(getServiceRoleClient).mockReturnValue({
      rpc: jest.fn().mockResolvedValue({
        data: null,
        error: { message: "private database detail" },
      }),
    } as never);

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
