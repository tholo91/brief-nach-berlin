jest.mock("@/lib/campaigns/repository", () => ({
  CampaignRepositoryError: class extends Error {},
  createCampaign: jest.fn(),
  deleteCampaign: jest.fn(),
  markPaid: jest.fn(),
}));
jest.mock("@/lib/campaigns/tokens", () => ({ createCampaignToken: jest.fn() }));
jest.mock("@/lib/lookup/plzLookup", () => ({ getBundestagPoliticiansByIds: jest.fn(() => []) }));
jest.mock("@/lib/moderation/moderateText", () => ({ moderateText: jest.fn() }));
jest.mock("@/lib/email/sendCampaignCreatorEmail", () => ({ sendCampaignCreatorEmail: jest.fn() }));
jest.mock("@/lib/supabase/server", () => ({ getServiceRoleClient: jest.fn() }));

import { createCampaignDraftAction } from "@/lib/actions/createCampaignDraft";
import { createCampaign } from "@/lib/campaigns/repository";
import { moderateText } from "@/lib/moderation/moderateText";

describe("public campaign moderation", () => {
  it("blockiert weiterhin markierte Kampagnentexte vor der Veröffentlichung", async () => {
    jest.mocked(moderateText).mockResolvedValue({
      flagged: true,
      categories: ["hate_and_discrimination"],
    });
    const formData = new FormData();
    formData.set("creatorEmail", "creator@example.org");
    formData.set("title", "Eine öffentliche Testkampagne");
    formData.set("issueText", "A".repeat(120));
    formData.set("creatorName", "Test Initiative");
    formData.set("slug", "oeffentliche-testkampagne");
    formData.set("targetLevel", "Bund");
    formData.set("targetMode", "default");
    formData.set("responsibilityAccepted", "on");
    formData.set("creationConfirmed", "yes");

    await expect(createCampaignDraftAction(formData)).resolves.toMatchObject({
      ok: false,
      message: expect.stringContaining("nicht veröffentlicht"),
    });
    expect(moderateText).toHaveBeenCalledWith("A".repeat(120));
    expect(createCampaign).not.toHaveBeenCalled();
  });
});
