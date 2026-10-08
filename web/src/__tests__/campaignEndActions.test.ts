jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("next/server", () => ({ after: jest.fn() }));
jest.mock("@/lib/campaigns/repository", () => {
  class CampaignRepositoryError extends Error {}
  return {
    CampaignRepositoryError,
    getCampaignById: jest.fn(),
    endCampaignNow: jest.fn(),
    setCampaignEndsAt: jest.fn(),
    pauseCampaign: jest.fn(),
    publishCampaignEdits: jest.fn(),
    saveAwaitingApprovalCampaignEdits: jest.fn(),
  };
});
jest.mock("@/lib/campaigns/session", () => ({
  getCampaignManagementSession: jest.fn(),
}));
jest.mock("@/lib/moderation/moderateText", () => ({ moderateText: jest.fn() }));
jest.mock("@/lib/supabase/server", () => ({ getServiceRoleClient: jest.fn() }));
jest.mock("@/lib/lookup/plzLookup", () => ({ getBundestagPoliticiansByIds: jest.fn(() => []) }));
jest.mock("@/lib/campaigns/classifyTopic", () => ({ classifyAndSaveCampaignTopic: jest.fn() }));

import { revalidatePath } from "next/cache";
import {
  endCampaignAction,
  updateCampaignEndDateAction,
} from "@/lib/actions/campaignEnd";
import { pauseCampaignAction } from "@/lib/actions/pauseCampaign";
import { updateCampaignAction } from "@/lib/actions/updateCampaign";
import {
  endCampaignNow,
  getCampaignById,
  pauseCampaign,
  setCampaignEndsAt,
} from "@/lib/campaigns/repository";
import { getCampaignManagementSession } from "@/lib/campaigns/session";
import { moderateText } from "@/lib/moderation/moderateText";

const CAMPAIGN_ID = "11111111-1111-4111-8111-111111111111";
const ENDED_MESSAGE = "Diese Kampagne ist beendet und kann nicht mehr geändert werden.";

const campaign = {
  id: CAMPAIGN_ID,
  slug: "sichere-schulwege",
  creatorEmail: "owner@example.org",
  title: "Sichere Schulwege",
  status: "active",
  endsAt: null as string | null,
};

describe("campaign end actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-10-08T10:00:00.000Z"));
    jest.mocked(getCampaignManagementSession).mockResolvedValue({
      campaignId: CAMPAIGN_ID,
      creatorEmail: campaign.creatorEmail,
      iat: 1,
      exp: 4_000_000_000,
    });
    jest.mocked(getCampaignById).mockResolvedValue(campaign as never);
    jest.mocked(endCampaignNow).mockResolvedValue(campaign as never);
    jest.mocked(setCampaignEndsAt).mockResolvedValue(campaign as never);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("endCampaignAction", () => {
    it("rejects a missing session without touching the repository", async () => {
      jest.mocked(getCampaignManagementSession).mockResolvedValue(null);

      await expect(endCampaignAction(CAMPAIGN_ID)).resolves.toMatchObject({ ok: false });
      expect(getCampaignById).not.toHaveBeenCalled();
      expect(endCampaignNow).not.toHaveBeenCalled();
    });

    it("rejects a foreign campaign id", async () => {
      await expect(
        endCampaignAction("22222222-2222-4222-8222-222222222222"),
      ).resolves.toMatchObject({ ok: false });
      expect(endCampaignNow).not.toHaveBeenCalled();
    });

    it("rejects a mismatched creator email", async () => {
      jest.mocked(getCampaignById).mockResolvedValue({
        ...campaign,
        creatorEmail: "other@example.org",
      } as never);

      await expect(endCampaignAction(CAMPAIGN_ID)).resolves.toMatchObject({ ok: false });
      expect(endCampaignNow).not.toHaveBeenCalled();
    });

    it("ends the campaign for the owner and revalidates the public surfaces", async () => {
      await expect(endCampaignAction(CAMPAIGN_ID)).resolves.toEqual({
        ok: true,
        message: "Kampagne beendet. Die Seite zeigt ab jetzt den Endstand.",
      });
      expect(endCampaignNow).toHaveBeenCalledWith(CAMPAIGN_ID);
      expect(revalidatePath).toHaveBeenCalledWith("/kampagne/sichere-schulwege");
      expect(revalidatePath).toHaveBeenCalledWith("/kampagne/verwalten");
      expect(revalidatePath).toHaveBeenCalledWith("/kampagne");
      expect(revalidatePath).toHaveBeenCalledWith("/");
    });

    it("refuses an already ended campaign", async () => {
      jest.mocked(getCampaignById).mockResolvedValue({
        ...campaign,
        endsAt: "2026-10-01T21:59:59.000Z",
      } as never);

      await expect(endCampaignAction(CAMPAIGN_ID)).resolves.toEqual({
        ok: false,
        message: ENDED_MESSAGE,
      });
      expect(endCampaignNow).not.toHaveBeenCalled();
    });
  });

  describe("updateCampaignEndDateAction", () => {
    it("returns the parse message for a past or invalid date", async () => {
      await expect(updateCampaignEndDateAction(CAMPAIGN_ID, "2026-10-07")).resolves.toEqual({
        ok: false,
        message: "Das Enddatum darf nicht in der Vergangenheit liegen.",
      });
      await expect(updateCampaignEndDateAction(CAMPAIGN_ID, "2026-02-30")).resolves.toEqual({
        ok: false,
        message: "Bitte wähle ein gültiges Datum.",
      });
      expect(setCampaignEndsAt).not.toHaveBeenCalled();
    });

    it("saves a future end date and reports it", async () => {
      await expect(updateCampaignEndDateAction(CAMPAIGN_ID, "2026-10-22")).resolves.toEqual({
        ok: true,
        message: "Enddatum gespeichert: 22. Oktober 2026.",
      });
      expect(setCampaignEndsAt).toHaveBeenCalledWith(CAMPAIGN_ID, "2026-10-22T21:59:59.000Z");
    });

    it("removes the end date for an empty value", async () => {
      await expect(updateCampaignEndDateAction(CAMPAIGN_ID, "")).resolves.toEqual({
        ok: true,
        message: "Enddatum entfernt. Die Kampagne läuft ohne festes Ende.",
      });
      expect(setCampaignEndsAt).toHaveBeenCalledWith(CAMPAIGN_ID, null);
    });

    it("refuses an ended campaign", async () => {
      jest.mocked(getCampaignById).mockResolvedValue({
        ...campaign,
        endsAt: "2026-10-01T21:59:59.000Z",
      } as never);

      await expect(updateCampaignEndDateAction(CAMPAIGN_ID, "2026-10-22")).resolves.toEqual({
        ok: false,
        message: ENDED_MESSAGE,
      });
      expect(setCampaignEndsAt).not.toHaveBeenCalled();
    });
  });

  describe("guards on existing actions", () => {
    const ended = { ...campaign, endsAt: "2026-10-01T21:59:59.000Z" };

    it("updateCampaignAction rejects an ended campaign before moderation", async () => {
      jest.mocked(getCampaignById).mockResolvedValue(ended as never);
      const form = new FormData();
      form.set("campaignId", CAMPAIGN_ID);
      form.set("title", "Neuer Titel");
      form.set("issueText", "Ein ausreichend langes, neues Anliegen für diese Kampagne.");

      await expect(updateCampaignAction(form)).resolves.toEqual({
        ok: false,
        message: ENDED_MESSAGE,
      });
      expect(moderateText).not.toHaveBeenCalled();
    });

    it("pauseCampaignAction rejects an ended campaign", async () => {
      jest.mocked(getCampaignById).mockResolvedValue(ended as never);

      await expect(pauseCampaignAction(CAMPAIGN_ID)).resolves.toEqual({
        ok: false,
        message: ENDED_MESSAGE,
      });
      expect(pauseCampaign).not.toHaveBeenCalled();
    });
  });
});
