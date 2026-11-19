jest.mock("@/lib/mistral", () => ({}));
jest.mock("@/lib/campaigns/repository", () => ({ getLandingCampaigns: jest.fn() }));

import { getHomeCampaigns } from "@/lib/campaigns/homeCampaigns";
import type { LandingCampaign } from "@/lib/campaigns/landing";

const campaign = { slug: "test" } as unknown as LandingCampaign;

describe("getHomeCampaigns", () => {
  const originalPhase = process.env.NEXT_PHASE;
  beforeEach(() => jest.spyOn(console, "error").mockImplementation(() => {}));
  afterEach(() => {
    if (originalPhase === undefined) delete process.env.NEXT_PHASE;
    else process.env.NEXT_PHASE = originalPhase;
    jest.restoreAllMocks();
  });

  it("returns campaigns after one failed attempt", async () => {
    const load = jest.fn().mockRejectedValueOnce(new Error("timeout")).mockResolvedValueOnce([campaign]);
    await expect(getHomeCampaigns(load)).resolves.toEqual([campaign]);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("throws on repeated failure so ISR keeps the last good page", async () => {
    delete process.env.NEXT_PHASE;
    const load = jest.fn().mockRejectedValue(new Error("down"));
    await expect(getHomeCampaigns(load)).rejects.toThrow("down");
  });

  it("falls back to an empty list during the production build", async () => {
    process.env.NEXT_PHASE = "phase-production-build";
    const load = jest.fn().mockRejectedValue(new Error("down"));
    await expect(getHomeCampaigns(load)).resolves.toEqual([]);
  });
});
