import {
  createInternalStatsCookieValue,
  isInternalStatsCookieValid,
  isInternalStatsPasswordValid,
} from "@/lib/internalStats/access";

describe("internal stats access", () => {
  const configuredPassword = "correct horse";

  it("fails closed when credentials are not configured", () => {
    expect(isInternalStatsPasswordValid("anything", undefined)).toBe(false);
    expect(isInternalStatsCookieValid("anything", undefined)).toBe(false);
  });

  it("accepts the configured password and derived cookie", () => {
    expect(isInternalStatsPasswordValid(configuredPassword, configuredPassword)).toBe(true);
    expect(
      isInternalStatsCookieValid(
        createInternalStatsCookieValue(configuredPassword),
        configuredPassword,
      ),
    ).toBe(true);
  });

  it("rejects wrong passwords and cookies", () => {
    expect(isInternalStatsPasswordValid("wrong password", configuredPassword)).toBe(false);
    expect(isInternalStatsCookieValid("wrong cookie", configuredPassword)).toBe(false);
  });
});
