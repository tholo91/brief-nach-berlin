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
  letterCount: 321,
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

  it("passes the letter count and inviter, not the old owner as greeting name", async () => {
    await transferCampaignAction(form("ngo@example.org"));

    const params = jest.mocked(sendCampaignCreatorEmail).mock.calls[0][0];
    expect(params).toMatchObject({
      letterCount: 321,
      inviterName: "Initiative Beispiel",
      campaignStatus: "active",
    });
    expect(params).not.toHaveProperty("creatorName");
  });

  it("tells the sender that the new address still has to confirm", async () => {
    const result = await transferCampaignAction(form("ngo@example.org"));

    expect(result).toEqual({
      ok: true,
      message: "Die Übernahme-E-Mail wurde verschickt. Die neue Adresse muss den Link noch bestätigen.",
    });
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

  it("rejects an ended campaign", async () => {
    jest.mocked(getCampaignById).mockResolvedValue({
      ...campaign,
      endsAt: "2026-01-01T22:59:59.000Z",
    } as never);

    const result = await transferCampaignAction(form("ngo@example.org"));

    expect(result).toMatchObject({ ok: false });
    expect(createCampaignTransferToken).not.toHaveBeenCalled();
  });
});
