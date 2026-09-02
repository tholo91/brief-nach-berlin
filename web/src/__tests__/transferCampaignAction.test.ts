jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@/lib/campaigns/repository", () => ({
  getCampaignById: jest.fn(),
}));
jest.mock("@/lib/campaigns/session", () => ({
  getCampaignManagementSession: jest.fn(),
}));
jest.mock("@/lib/campaigns/tokens", () => ({
  createCampaignTransferToken: jest.fn(),
  revokeCampaignToken: jest.fn(),
}));
jest.mock("@/lib/email/sendCampaignCreatorEmail", () => ({
  sendCampaignCreatorEmail: jest.fn(),
}));

import { transferCampaignAction } from "@/lib/actions/transferCampaign";
import { getCampaignById } from "@/lib/campaigns/repository";
import { getCampaignManagementSession } from "@/lib/campaigns/session";
import { createCampaignTransferToken } from "@/lib/campaigns/tokens";
import { sendCampaignCreatorEmail } from "@/lib/email/sendCampaignCreatorEmail";

const campaign = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "sichere-schulwege",
  creatorEmail: "owner@example.org",
  title: "Sichere Schulwege",
  creatorName: "Initiative Beispiel",
  status: "active",
};

function form(recipientEmail: string): FormData {
  const data = new FormData();
  data.set("campaignId", campaign.id);
  data.set("recipientEmail", recipientEmail);
  return data;
}

describe("transferCampaignAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getCampaignManagementSession).mockResolvedValue({
      campaignId: campaign.id,
      creatorEmail: campaign.creatorEmail,
      iat: 1,
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    jest.mocked(getCampaignById).mockResolvedValue(campaign as never);
    jest.mocked(createCampaignTransferToken).mockResolvedValue({
      token: "transfer-token",
      record: { id: "token-1" } as never,
    });
    jest.mocked(sendCampaignCreatorEmail).mockResolvedValue({ success: true });
  });

  it("sends a takeover email for an active campaign", async () => {
    const result = await transferCampaignAction(form("ngo@example.org"));

    expect(result).toMatchObject({ ok: true });
    expect(createCampaignTransferToken).toHaveBeenCalledWith(
      campaign.id,
      "ngo@example.org"
    );
    expect(sendCampaignCreatorEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "transfer",
        recipientEmail: "ngo@example.org",
        adminCopy: true,
      })
    );
  });

  it.each(["archived", "blocked", "draft", "awaiting_email_verification"])(
    "rejects a %s campaign",
    async (status) => {
      jest.mocked(getCampaignById).mockResolvedValue({ ...campaign, status } as never);

      const result = await transferCampaignAction(form("ngo@example.org"));

      expect(result).toMatchObject({ ok: false });
      expect(createCampaignTransferToken).not.toHaveBeenCalled();
    }
  );
});
