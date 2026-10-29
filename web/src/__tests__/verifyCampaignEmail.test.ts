jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("next/server", () => ({
  after: jest.fn((callback: () => unknown) => {
    void callback();
  }),
}));
jest.mock("@/lib/campaigns/repository", () => {
  class CampaignRepositoryError extends Error {}
  return {
    CampaignRepositoryError,
    blockCampaign: jest.fn(),
    getCampaignById: jest.fn(),
    markEmailVerified: jest.fn(),
  };
});
jest.mock("@/lib/campaigns/tokens", () => ({
  createCampaignToken: jest.fn(),
  getUsableCampaignTokenForCampaign: jest.fn(),
  getUsableCampaignToken: jest.fn(),
  revokeCampaignToken: jest.fn(),
  revokeCampaignTokensForCampaign: jest.fn(),
}));
jest.mock("@/lib/moderation/moderateText", () => ({
  moderateText: jest.fn(),
}));
jest.mock("@/lib/email/sendCampaignCreatorEmail", () => ({
  sendCampaignCreatorEmail: jest.fn(),
}));
jest.mock("@/lib/email/sendCampaignApprovalAdminNotice", () => ({
  sendCampaignApprovalAdminNotice: jest.fn(),
}));
jest.mock("@/lib/mistral", () => ({}));

import { verifyCampaignEmailAction } from "@/lib/actions/verifyCampaignEmail";
import { getCampaignById, markEmailVerified } from "@/lib/campaigns/repository";
import {
  createCampaignToken,
  getUsableCampaignToken,
  getUsableCampaignTokenForCampaign,
} from "@/lib/campaigns/tokens";
import { moderateText } from "@/lib/moderation/moderateText";
import { sendCampaignCreatorEmail } from "@/lib/email/sendCampaignCreatorEmail";
import { sendCampaignApprovalAdminNotice } from "@/lib/email/sendCampaignApprovalAdminNotice";

const campaign = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "sichere-schulwege",
  title: "Sichere Schulwege",
  creatorName: "Initiative Beispiel",
  creatorEmail: "owner@example.org",
  issueText: "Bitte sichere Schulwege schaffen.",
  description: null,
  moderationCategories: [] as string[],
  status: "awaiting_email_verification",
  emailVerifiedAt: null as string | null,
};

describe("verifyCampaignEmailAction admin notice", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getUsableCampaignToken as jest.Mock).mockResolvedValue({ campaignId: campaign.id });
    (moderateText as jest.Mock).mockResolvedValue({ flagged: false, categories: [] });
    (createCampaignToken as jest.Mock).mockResolvedValue({ token: "t", record: { id: "r" } });
    (sendCampaignCreatorEmail as jest.Mock).mockResolvedValue({ success: true });
  });

  it("notifies Thomas once on the first verification", async () => {
    (getCampaignById as jest.Mock).mockResolvedValue(campaign);
    (markEmailVerified as jest.Mock).mockResolvedValue({
      ...campaign,
      status: "awaiting_approval",
      emailVerifiedAt: "2026-10-29T10:00:00Z",
    });

    const result = await verifyCampaignEmailAction("tok");

    expect(result.status).toBe("awaiting_approval");
    expect(sendCampaignApprovalAdminNotice).toHaveBeenCalledTimes(1);
    expect(sendCampaignApprovalAdminNotice).toHaveBeenCalledWith(
      expect.objectContaining({ id: campaign.id, slug: campaign.slug })
    );
  });

  it("does not notify again when the link is clicked a second time", async () => {
    (getCampaignById as jest.Mock).mockResolvedValue({
      ...campaign,
      status: "awaiting_approval",
      emailVerifiedAt: "2026-10-29T10:00:00Z",
    });
    (getUsableCampaignTokenForCampaign as jest.Mock).mockResolvedValue({ id: "m" });

    const result = await verifyCampaignEmailAction("tok");

    expect(result.status).toBe("awaiting_approval");
    expect(markEmailVerified).not.toHaveBeenCalled();
    expect(sendCampaignApprovalAdminNotice).not.toHaveBeenCalled();
  });

  it("does not notify when the management mail failed", async () => {
    (getCampaignById as jest.Mock).mockResolvedValue(campaign);
    (markEmailVerified as jest.Mock).mockResolvedValue({ ...campaign, status: "awaiting_approval" });
    (sendCampaignCreatorEmail as jest.Mock).mockResolvedValue({ success: false });

    const result = await verifyCampaignEmailAction("tok");

    expect(result.status).toBe("error");
    expect(sendCampaignApprovalAdminNotice).not.toHaveBeenCalled();
  });
});
