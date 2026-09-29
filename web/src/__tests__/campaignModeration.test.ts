jest.mock("next/server", () => ({ after: jest.fn() }));
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
jest.mock("@/lib/campaigns/classifyTopic", () => ({ classifyAndSaveCampaignTopic: jest.fn() }));

import { createCampaignDraftAction } from "@/lib/actions/createCampaignDraft";
import {
  createCampaign,
  markPaid,
} from "@/lib/campaigns/repository";
import { createCampaignToken } from "@/lib/campaigns/tokens";
import { moderateText } from "@/lib/moderation/moderateText";
import { sendCampaignCreatorEmail } from "@/lib/email/sendCampaignCreatorEmail";

function fixedCampaignFormData(): FormData {
  const formData = new FormData();
  formData.set("creatorEmail", "creator@example.org");
  formData.set("title", "Eine öffentliche Testkampagne");
  formData.set("issueText", "A".repeat(120));
  formData.set("creatorName", "Test Initiative");
  formData.set("slug", "oeffentliche-testkampagne");
  formData.set("targetLevel", "Fixed");
  formData.set("targetMode", "default");
  formData.set("fixedOrganizationName", "Beispielministerium");
  formData.set("fixedPersonName", "Frau Dr. Erika Beispiel");
  formData.set("fixedSalutation", "Sehr geehrte Frau Dr. Beispiel,");
  formData.set("fixedStreet", "Beispielstraße");
  formData.set("fixedHouseNumber", "1");
  formData.set("fixedPostalCode", "12345");
  formData.set("fixedCity", "Beispielstadt");
  formData.set("responsibilityAccepted", "on");
  formData.set("creationConfirmed", "yes");
  return formData;
}

describe("public campaign moderation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it("verlangt die Privatadressen-Bestätigung bei einem festen Empfänger", async () => {
    const formData = fixedCampaignFormData();

    await expect(createCampaignDraftAction(formData)).resolves.toMatchObject({
      ok: false,
      fieldErrors: {
        fixedAddressAccepted: expect.stringContaining("bestätige"),
      },
    });
    expect(moderateText).not.toHaveBeenCalled();
    expect(createCampaign).not.toHaveBeenCalled();
  });

  it("übergibt ausschließlich die strukturierte feste Adresse an das Repository", async () => {
    const formData = fixedCampaignFormData();
    formData.set("fixedAddressAccepted", "on");
    jest.mocked(moderateText).mockResolvedValue({ flagged: false, categories: [] });
    const campaign = {
      id: "11111111-1111-4111-8111-111111111111",
      slug: "oeffentliche-testkampagne",
      creatorEmail: "creator@example.org",
      title: "Eine öffentliche Testkampagne",
      issueText: "A".repeat(120),
      creatorName: "Test Initiative",
    };
    jest.mocked(createCampaign).mockResolvedValue(campaign as never);
    jest.mocked(markPaid).mockResolvedValue(campaign as never);
    jest.mocked(createCampaignToken).mockResolvedValue({ token: "token" } as never);
    jest.mocked(sendCampaignCreatorEmail).mockResolvedValue({ success: true } as never);

    await expect(createCampaignDraftAction(formData)).resolves.toMatchObject({
      ok: true,
      slug: "oeffentliche-testkampagne",
    });
    expect(createCampaign).toHaveBeenCalledWith(expect.objectContaining({
      targetLevel: "Fixed",
      targetState: null,
      targetPoliticianIds: [],
      targetRecipient: {
        organizationName: "Beispielministerium",
        personName: "Frau Dr. Erika Beispiel",
        salutation: "Sehr geehrte Frau Dr. Beispiel,",
        street: "Beispielstraße",
        houseNumber: "1",
        postalCode: "12345",
        city: "Beispielstadt",
        countryCode: "DE",
      },
    }));
  });
});
