import { NextRequest } from "next/server";
import { isInternalStatsCookieValid } from "@/lib/internalStats/access";

describe("stats password URL unlock route", () => {
  const originalPassword = process.env.INTERNAL_STATS_PASSWORD;
  let GET: typeof import("@/app/stats/unlock/route").GET;

  beforeAll(async () => {
    ({ GET } = await import("@/app/stats/unlock/route"));
  });

  afterAll(() => {
    if (originalPassword === undefined) delete process.env.INTERNAL_STATS_PASSWORD;
    else process.env.INTERNAL_STATS_PASSWORD = originalPassword;
  });

  it("sets the existing cookie and redirects to a clean stats URL for the correct password", async () => {
    process.env.INTERNAL_STATS_PASSWORD = "correct horse";
    const response = GET(
      new NextRequest("https://brief-nach-berlin.de/stats/unlock?pw=correct%20horse"),
    );
    const location = response.headers.get("location");
    const cookie = response.cookies.get("bnb_stats_access");

    expect(response.status).toBe(303);
    expect(location).toBe("https://brief-nach-berlin.de/stats");
    expect(cookie?.value).toBeTruthy();
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.path).toBe("/stats");
    expect(isInternalStatsCookieValid(cookie?.value, process.env.INTERNAL_STATS_PASSWORD)).toBe(true);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
  });

  it("does not unlock and removes the supplied password for an invalid password", async () => {
    process.env.INTERNAL_STATS_PASSWORD = "correct horse";
    const response = GET(new NextRequest("https://brief-nach-berlin.de/stats/unlock?pw=wrong"));

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://brief-nach-berlin.de/stats?error=1");
    expect(response.cookies.get("bnb_stats_access")).toBeUndefined();
  });

  it("fails closed when no password is configured", async () => {
    delete process.env.INTERNAL_STATS_PASSWORD;
    const response = GET(new NextRequest("https://brief-nach-berlin.de/stats/unlock?pw=anything"));

    expect(response.headers.get("location")).toBe("https://brief-nach-berlin.de/stats?error=1");
    expect(response.cookies.get("bnb_stats_access")).toBeUndefined();
  });
});
