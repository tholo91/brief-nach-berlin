jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));
jest.mock("@/lib/campaigns/repository", () => ({
  getCampaignById: jest.fn(),
}));
jest.mock("@/lib/campaigns/session", () => ({
  setCampaignManagementSession: jest.fn(),
}));
jest.mock("@/lib/campaigns/tokens", () => ({
  consumeCampaignTransfer: jest.fn(),
  createCampaignToken: jest.fn(),
  revokeCampaignToken: jest.fn(),
}));
jest.mock("@/lib/email/sendCampaignCreatorEmail", () => ({
  sendCampaignCreatorEmail: jest.fn(),
}));

import { redirect } from "next/navigation";
import { acceptCampaignTransferAction } from "@/lib/actions/acceptCampaignTransfer";
import { getCampaignById } from "@/lib/campaigns/repository";
import {
  consumeCampaignTransfer,
  createCampaignToken,
} from "@/lib/campaigns/tokens";
import { sendCampaignCreatorEmail } from "@/lib/email/sendCampaignCreatorEmail";

const campaign = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "sichere-schulwege",
  creatorEmail: "ngo@example.org",
  title: "Sichere Schulwege",
  creatorName: "Alte Initiative",
  status: "active",
};

function form(): FormData {
  const data = new FormData();
  data.set("token", "transfer-token");
  return data;
}

describe("acceptCampaignTransferAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(consumeCampaignTransfer).mockResolvedValue({
      campaignId: campaign.id,
      recipientEmail: "NGO@example.org",
    } as never);
    jest.mocked(getCampaignById).mockResolvedValue(campaign as never);
    jest.mocked(createCampaignToken).mockResolvedValue({
      token: "manage-token",
      record: { id: "token-1" } as never,
    });
    jest.mocked(sendCampaignCreatorEmail).mockResolvedValue({ success: true });
  });

  it("sends the management mail after acceptance without the previous owner's name", async () => {
    await acceptCampaignTransferAction(form());

    expect(sendCampaignCreatorEmail).toHaveBeenCalledTimes(1);
    expect(sendCampaignCreatorEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "management",
        recipientEmail: "ngo@example.org",
        token: "manage-token",
        adminCopy: true,
        campaignStatus: "active",
      })
    );
    const params = jest.mocked(sendCampaignCreatorEmail).mock.calls[0][0];
    expect(params).not.toHaveProperty("creatorName");
    expect(redirect).toHaveBeenCalledWith("/kampagne/verwalten?transfer=accepted");
  });
});
