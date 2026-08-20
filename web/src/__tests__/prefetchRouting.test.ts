process.env.ROUTING_TOKEN_SECRET = "test-secret-fuer-routing-token";
process.env.LANDTAG_ROUTING_ENABLED = "true";
process.env.LETTER_PROMPT_LEVEL_AWARE = "true";

jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@/lib/lookup/levelRouter", () => ({
  routeToLevel: jest.fn(),
  RoutingResultSchema: {
    safeParse: jest.fn((value) => ({ success: true, data: value })),
  },
}));
jest.mock("@/lib/rateLimit", () => ({
  checkRateLimit: jest.fn(),
  getClientIp: jest.fn(),
  hashIdentifier: jest.fn(),
  LIMITS: { ROUTING_PREFETCH_PER_IP: { max: 10, windowMs: 3_600_000 } },
}));

import { prefetchRoutingAction } from "@/lib/actions/prefetchRouting";
import { routeToLevel } from "@/lib/lookup/levelRouter";
import { checkRateLimit, getClientIp, hashIdentifier } from "@/lib/rateLimit";

const mockedRouteToLevel = jest.mocked(routeToLevel);
const mockedCheckRateLimit = jest.mocked(checkRateLimit);
const mockedGetClientIp = jest.mocked(getClientIp);
const mockedHashIdentifier = jest.mocked(hashIdentifier);

describe("prefetchRoutingAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.LANDTAG_ROUTING_ENABLED = "true";
    process.env.LETTER_PROMPT_LEVEL_AWARE = "true";
    mockedGetClientIp.mockResolvedValue("203.0.113.10");
    mockedHashIdentifier.mockReturnValue("hashed-ip");
    mockedCheckRateLimit.mockReturnValue({ allowed: true });
    mockedRouteToLevel.mockResolvedValue({
      primary: { level: "Land", confidence: "high" },
      reasoning: "Bildungspolitik ist Ländersache.",
    });
  });

  it("hasht die Client-IP und limitiert vor dem bezahlten Routing-Aufruf", async () => {
    mockedCheckRateLimit.mockReturnValue({ allowed: false, retryAfterSeconds: 60 });

    await expect(prefetchRoutingAction("Lehrermangel   an unserer Schule")).resolves.toBeNull();

    expect(mockedGetClientIp).toHaveBeenCalledTimes(1);
    expect(mockedHashIdentifier).toHaveBeenCalledWith("203.0.113.10");
    expect(mockedCheckRateLimit).toHaveBeenCalledWith(
      "routing-prefetch:ip:hashed-ip",
      10,
      3_600_000
    );
    expect(mockedRouteToLevel).not.toHaveBeenCalled();
  });

  it("routet exakt den normalisierten Text, an den der Token gebunden wird", async () => {
    const result = await prefetchRoutingAction("  Lehrermangel   an unserer Schule  ");

    expect(result?.token).toEqual(expect.any(String));
    expect(mockedRouteToLevel).toHaveBeenCalledWith(
      "Lehrermangel an unserer Schule",
      expect.any(AbortSignal)
    );
  });

  it("routet auch ohne frühere Release-Flags", async () => {
    process.env.LANDTAG_ROUTING_ENABLED = "false";

    await expect(prefetchRoutingAction("Lehrermangel an unserer Schule")).resolves.toMatchObject({
      token: expect.any(String),
    });

    expect(mockedGetClientIp).toHaveBeenCalled();
    expect(mockedRouteToLevel).toHaveBeenCalled();
  });

  it("routet auch ohne früheren Ebenen-Prompt-Schalter", async () => {
    process.env.LETTER_PROMPT_LEVEL_AWARE = "false";

    await expect(prefetchRoutingAction("Lehrermangel an unserer Schule")).resolves.toMatchObject({
      token: expect.any(String),
    });

    expect(mockedGetClientIp).toHaveBeenCalled();
    expect(mockedRouteToLevel).toHaveBeenCalled();
  });
});
