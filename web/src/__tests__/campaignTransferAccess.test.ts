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
import {
  getUsableCampaignToken,
  getUsableCampaignTransferToken,
} from "@/lib/campaigns/tokens";
import { getCampaignById } from "@/lib/campaigns/repository";

const CAMPAIGN_ID = "11111111-1111-4111-8111-111111111111";

async function visit(query: string) {
  return GET(
    new NextRequest(`http://localhost/kampagne/verwalten/zugang?${query}`)
  );
}

describe("campaign transfer access", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(getUsableCampaignTransferToken).mockResolvedValue(null);
  });

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

  describe("ziel", () => {
    beforeEach(() => {
      jest.mocked(getUsableCampaignToken).mockResolvedValue({
        campaignId: CAMPAIGN_ID,
        kind: "manage",
      } as never);
      jest.mocked(getCampaignById).mockResolvedValue({
        id: CAMPAIGN_ID,
        creatorEmail: "owner@example.org",
      } as never);
    });

    it("jumps to the feedback form after the session cookie is set", async () => {
      const response = await visit("token=manage-token&ziel=feedback");

      expect(response.status).toBe(303);
      expect(response.headers.get("location")).toBe("/kampagne/verwalten/feedback");
      expect(response.headers.get("set-cookie")).toContain(
        "bnb_campaign_management_session"
      );
    });

    it.each(["https://evil.example", "__proto__", "constructor", "%2F%2Fevil.example"])(
      "ignores the unknown target %s",
      async (ziel) => {
        const response = await visit(`token=manage-token&ziel=${ziel}`);

        expect(response.headers.get("location")).toBe("/kampagne/verwalten");
        expect(response.headers.get("set-cookie")).toContain(
          "bnb_campaign_management_session"
        );
      }
    );

    it("stays on the manage page without a ziel", async () => {
      const response = await visit("token=manage-token");

      expect(response.headers.get("location")).toBe("/kampagne/verwalten");
    });

    it("does not jump or set a cookie for an invalid token", async () => {
      jest.mocked(getUsableCampaignToken).mockResolvedValue(null);

      const response = await visit("token=bad-token&ziel=feedback");

      expect(response.headers.get("location")).toBe("/kampagne/verwalten");
      expect(response.headers.get("set-cookie")).toBeNull();
    });
  });
});
