jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@/lib/campaigns/repository", () => {
  class CampaignRepositoryError extends Error {}
  return {
    CampaignRepositoryError,
    getCampaignById: jest.fn(),
    activateVerifiedCampaign: jest.fn(),
  };
});
jest.mock("@/lib/campaigns/session", () => ({
  getCampaignManagementSession: jest.fn(),
}));

import { resumeCampaignAction } from "@/lib/actions/resumeCampaign";
import { activateVerifiedCampaign, getCampaignById } from "@/lib/campaigns/repository";
import { getCampaignManagementSession } from "@/lib/campaigns/session";

const CAMPAIGN_ID = "11111111-1111-4111-8111-111111111111";
const paused = {
  id: CAMPAIGN_ID,
  slug: "sichere-schulwege",
  creatorEmail: "owner@example.org",
  status: "paused",
  endsAt: null,
};

describe("resumeCampaignAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getCampaignManagementSession).mockResolvedValue({
      campaignId: CAMPAIGN_ID,
      creatorEmail: "owner@example.org",
    } as never);
  });

  it("activates a paused campaign", async () => {
    jest.mocked(getCampaignById).mockResolvedValue(paused as never);
    jest.mocked(activateVerifiedCampaign).mockResolvedValue({ ...paused, status: "active" } as never);

    const result = await resumeCampaignAction(CAMPAIGN_ID);

    expect(result.ok).toBe(true);
    expect(activateVerifiedCampaign).toHaveBeenCalledWith(paused);
  });

  it("rejects a campaign that is not paused", async () => {
    jest.mocked(getCampaignById).mockResolvedValue({ ...paused, status: "active" } as never);

    const result = await resumeCampaignAction(CAMPAIGN_ID);

    expect(result).toEqual({ ok: false, message: "Nur pausierte Kampagnen können fortgesetzt werden." });
    expect(activateVerifiedCampaign).not.toHaveBeenCalled();
  });

  it("rejects without a management session", async () => {
    jest.mocked(getCampaignManagementSession).mockResolvedValue(null as never);

    const result = await resumeCampaignAction(CAMPAIGN_ID);

    expect(result.ok).toBe(false);
    expect(activateVerifiedCampaign).not.toHaveBeenCalled();
  });
});
