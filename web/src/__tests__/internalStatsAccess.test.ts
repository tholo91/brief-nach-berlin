import { isInternalStatsAuthorized } from "@/lib/internalStats/access";

describe("internal stats access", () => {
  const validHeader = `Basic ${Buffer.from("thomas:correct horse").toString("base64")}`;

  it("fails closed when credentials are not configured", () => {
    expect(isInternalStatsAuthorized(validHeader, undefined, undefined)).toBe(false);
  });

  it("accepts the configured Basic Auth credentials", () => {
    expect(isInternalStatsAuthorized(validHeader, "thomas", "correct horse")).toBe(true);
  });

  it("rejects wrong credentials", () => {
    expect(isInternalStatsAuthorized(validHeader, "thomas", "wrong password")).toBe(false);
  });
});
