jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@/lib/campaigns/repository", () => ({
  getCampaignById: jest.fn(),
  setCampaignMilestoneMailsEnabled: jest.fn(),
}));
jest.mock("@/lib/campaigns/session", () => ({
  getCampaignManagementSession: jest.fn(),
}));

import { revalidatePath } from "next/cache";
import { setMilestoneMailsAction } from "@/lib/actions/setMilestoneMails";
import {
  getCampaignById,
  setCampaignMilestoneMailsEnabled,
} from "@/lib/campaigns/repository";
import { getCampaignManagementSession } from "@/lib/campaigns/session";

const CAMPAIGN_ID = "11111111-1111-4111-8111-111111111111";
const campaign = {
  id: CAMPAIGN_ID,
  slug: "sichere-schulwege",
  creatorEmail: "owner@example.org",
  status: "active",
  endsAt: null as string | null,
};

describe("setMilestoneMailsAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-10-09T10:00:00.000Z"));
    jest.mocked(getCampaignManagementSession).mockResolvedValue({
      campaignId: CAMPAIGN_ID,
      creatorEmail: "Owner@Example.org",
      iat: 1,
      exp: 4_000_000_000,
    });
    jest.mocked(getCampaignById).mockResolvedValue(campaign as never);
    jest.mocked(setCampaignMilestoneMailsEnabled).mockResolvedValue(campaign as never);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("rejects a missing session without touching the repository", async () => {
    jest.mocked(getCampaignManagementSession).mockResolvedValue(null);

    await expect(setMilestoneMailsAction(CAMPAIGN_ID, false)).resolves.toEqual({
      ok: false,
      message: "Der Verwaltungszugriff ist abgelaufen. Bitte öffne den Link aus der E-Mail erneut.",
    });
    expect(getCampaignById).not.toHaveBeenCalled();
    expect(setCampaignMilestoneMailsEnabled).not.toHaveBeenCalled();
  });

  it("rejects a session for another campaign", async () => {
    await expect(
      setMilestoneMailsAction("22222222-2222-4222-8222-222222222222", false),
    ).resolves.toEqual({
      ok: false,
      message: "Dieser Verwaltungslink gehört nicht zu dieser Kampagne.",
    });
    expect(setCampaignMilestoneMailsEnabled).not.toHaveBeenCalled();
  });

  it("rejects a creator email mismatch", async () => {
    jest.mocked(getCampaignById).mockResolvedValue({
      ...campaign,
      creatorEmail: "someone-else@example.org",
    } as never);

    await expect(setMilestoneMailsAction(CAMPAIGN_ID, false)).resolves.toEqual({
      ok: false,
      message: "Dieser Verwaltungslink ist nicht mehr gültig.",
    });
    expect(setCampaignMilestoneMailsEnabled).not.toHaveBeenCalled();
  });

  it("rejects an ended campaign", async () => {
    jest.mocked(getCampaignById).mockResolvedValue({
      ...campaign,
      endsAt: "2026-10-01T10:00:00.000Z",
    } as never);

    await expect(setMilestoneMailsAction(CAMPAIGN_ID, false)).resolves.toEqual({
      ok: false,
      message: "Diese Kampagne ist beendet und kann nicht mehr geändert werden.",
    });
    expect(setCampaignMilestoneMailsEnabled).not.toHaveBeenCalled();
  });

  it("rejects a non-boolean value", async () => {
    await expect(
      setMilestoneMailsAction(CAMPAIGN_ID, "off" as unknown as boolean),
    ).resolves.toMatchObject({ ok: false });
    expect(setCampaignMilestoneMailsEnabled).not.toHaveBeenCalled();
  });

  it.each([
    [true, "Meilenstein-Mails sind an."],
    [false, "Meilenstein-Mails sind aus."],
  ])("saves %s and revalidates the management page", async (enabled, message) => {
    await expect(setMilestoneMailsAction(CAMPAIGN_ID, enabled)).resolves.toEqual({
      ok: true,
      message,
    });
    expect(setCampaignMilestoneMailsEnabled).toHaveBeenCalledWith(CAMPAIGN_ID, enabled);
    expect(revalidatePath).toHaveBeenCalledWith("/kampagne/verwalten");
  });

  it("reports a repository error without leaking details and without revalidating", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      jest.mocked(setCampaignMilestoneMailsEnabled).mockRejectedValue(new Error("db down"));

      await expect(setMilestoneMailsAction(CAMPAIGN_ID, false)).resolves.toEqual({
        ok: false,
        message: "Die Einstellung konnte gerade nicht gespeichert werden.",
      });
      expect(revalidatePath).not.toHaveBeenCalled();
      expect(JSON.stringify(spy.mock.calls)).not.toContain("owner@example.org");
    } finally {
      spy.mockRestore();
    }
  });
});
