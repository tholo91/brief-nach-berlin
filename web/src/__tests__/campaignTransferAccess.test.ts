jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@/lib/campaigns/tokens", () => ({
  getUsableCampaignTransferToken: jest.fn(),
  getUsableCampaignToken: jest.fn(),
}));
jest.mock("@/lib/campaigns/repository", () => ({
  getCampaignById: jest.fn(),
}));
jest.mock("@/lib/campaigns/session", () => ({
  CAMPAIGN_MANAGEMENT_SESSION_COOKIE: "bnb_campaign_management_session",
  createCampaignManagementSessionValue: jest.fn(() => "session"),
}));

import { NextRequest } from "next/server";
import { GET } from "@/app/(site)/kampagne/verwalten/zugang/route";
import { getUsableCampaignTransferToken } from "@/lib/campaigns/tokens";

describe("campaign transfer access", () => {
  it("does not consume a transfer token on GET", async () => {
    jest.mocked(getUsableCampaignTransferToken).mockResolvedValue({
      campaignId: "11111111-1111-4111-8111-111111111111",
      kind: "transfer",
    } as never);

    const response = await GET(
      new NextRequest(
        "http://localhost/kampagne/verwalten/zugang?token=transfer-token"
      )
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "/kampagne/verwalten/uebernehmen?token=transfer-token"
    );
  });
});
