import { NextRequest } from "next/server";
import { isInternalStatsCookieValid } from "@/lib/internalStats/access";

describe("stats password unlock route", () => {
  const originalPassword = process.env.INTERNAL_STATS_PASSWORD;
  let GET: typeof import("@/app/stats/unlock/route").GET;
  let POST: typeof import("@/app/stats/unlock/route").POST;

  beforeAll(async () => {
    ({ GET, POST } = await import("@/app/stats/unlock/route"));
  });

  afterAll(() => {
    if (originalPassword === undefined) delete process.env.INTERNAL_STATS_PASSWORD;
    else process.env.INTERNAL_STATS_PASSWORD = originalPassword;
  });

  it("rejects password-bearing GET requests", async () => {
    process.env.INTERNAL_STATS_PASSWORD = "correct horse";
    const response = GET();

    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("POST");
    expect(response.cookies.get("bnb_stats_access")).toBeUndefined();
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
  });

  it("authenticates a normal form POST and redirects to the dashboard", async () => {
    process.env.INTERNAL_STATS_PASSWORD = "correct horse";
    const response = await POST(new NextRequest("https://brief-nach-berlin.de/stats/unlock", {
      method: "POST",
      body: new URLSearchParams({ password: "correct horse" }),
    }));

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/stats");
    expect(isInternalStatsCookieValid(response.cookies.get("bnb_stats_access")?.value, "correct horse")).toBe(true);
  });
});
