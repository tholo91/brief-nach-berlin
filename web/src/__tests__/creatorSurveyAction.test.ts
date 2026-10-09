jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("next/server", () => ({
  after: jest.fn((callback: () => unknown) => {
    void callback();
  }),
}));
jest.mock("@/lib/campaigns/repository", () => ({
  getCampaignById: jest.fn(),
}));
jest.mock("@/lib/campaigns/session", () => ({
  getCampaignManagementSession: jest.fn(),
}));
jest.mock("@/lib/campaigns/creatorSurveyRepository", () => ({
  getCreatorSurvey: jest.fn(),
  upsertCreatorSurvey: jest.fn(),
}));
jest.mock("@/lib/email/sendCreatorSurveyAdminEmail", () => ({
  sendCreatorSurveyAdminEmail: jest.fn(),
}));

import { revalidatePath } from "next/cache";
import { submitCreatorSurveyAction } from "@/lib/actions/submitCreatorSurvey";
import { getCampaignById } from "@/lib/campaigns/repository";
import { getCampaignManagementSession } from "@/lib/campaigns/session";
import {
  getCreatorSurvey,
  upsertCreatorSurvey,
} from "@/lib/campaigns/creatorSurveyRepository";
import { sendCreatorSurveyAdminEmail } from "@/lib/email/sendCreatorSurveyAdminEmail";

const CAMPAIGN_ID = "11111111-1111-4111-8111-111111111111";
const campaign = {
  id: CAMPAIGN_ID,
  slug: "sichere-schulwege",
  title: "Sichere Schulwege",
  creatorName: "Initiative Beispiel",
  creatorEmail: "owner@example.org",
  status: "active",
  letterCount: 500,
  endsAt: null as string | null,
};

const validInput = {
  reasons: ["handschrift"],
  concerns: ["keine"],
  statements: {
    einfacherEinstieg: "stimmt",
    handschriftWirkt: null,
    schnellEingerichtet: null,
    wiederKampagne: "teils",
  },
  quote: "Das hat uns Mut gemacht.",
  consentQuote: true,
  consentAggregate: true,
  helpOffers: ["gemeinsamer_post"],
};

async function flush() {
  await new Promise((resolve) => setImmediate(resolve));
}

describe("submitCreatorSurveyAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getCampaignManagementSession).mockResolvedValue({
      campaignId: CAMPAIGN_ID,
      creatorEmail: "Owner@Example.org",
      iat: 1,
      exp: 4_000_000_000,
    });
    jest.mocked(getCampaignById).mockResolvedValue(campaign as never);
    jest.mocked(getCreatorSurvey).mockResolvedValue(null);
    jest.mocked(upsertCreatorSurvey).mockResolvedValue(undefined as never);
    jest.mocked(sendCreatorSurveyAdminEmail).mockResolvedValue({ success: true });
  });

  it("asks for a fresh link when the session is gone and touches nothing", async () => {
    jest.mocked(getCampaignManagementSession).mockResolvedValue(null);

    const result = await submitCreatorSurveyAction(CAMPAIGN_ID, validInput);

    expect(result).toMatchObject({ ok: false, code: "session_expired" });
    expect(getCampaignById).not.toHaveBeenCalled();
    expect(upsertCreatorSurvey).not.toHaveBeenCalled();
  });

  it("rejects a session for another campaign", async () => {
    const result = await submitCreatorSurveyAction(
      "22222222-2222-4222-8222-222222222222",
      validInput,
    );

    expect(result).toMatchObject({ ok: false, code: "forbidden" });
    expect(upsertCreatorSurvey).not.toHaveBeenCalled();
  });

  it("rejects a creator email mismatch", async () => {
    jest.mocked(getCampaignById).mockResolvedValue({
      ...campaign,
      creatorEmail: "someone-else@example.org",
    } as never);

    const result = await submitCreatorSurveyAction(CAMPAIGN_ID, validInput);

    expect(result).toMatchObject({ ok: false, code: "forbidden" });
    expect(upsertCreatorSurvey).not.toHaveBeenCalled();
  });

  it("rejects a campaign that is not eligible", async () => {
    jest.mocked(getCampaignById).mockResolvedValue({ ...campaign, letterCount: 499 } as never);

    const result = await submitCreatorSurveyAction(CAMPAIGN_ID, validInput);

    expect(result).toMatchObject({ ok: false, code: "forbidden" });
    expect(upsertCreatorSurvey).not.toHaveBeenCalled();
  });

  it.each([
    ["keine plus another concern", { ...validInput, concerns: ["keine", "ki_spam"] }],
    ["a 301 character quote", { ...validInput, quote: "a".repeat(301) }],
    ["not an object", "hallo"],
  ])("rejects invalid input: %s", async (_label, payload) => {
    const result = await submitCreatorSurveyAction(CAMPAIGN_ID, payload);

    expect(result).toMatchObject({ ok: false, code: "invalid" });
    expect(upsertCreatorSurvey).not.toHaveBeenCalled();
  });

  it("stores the quote consent as false when there is no quote", async () => {
    const result = await submitCreatorSurveyAction(CAMPAIGN_ID, {
      ...validInput,
      quote: "   ",
      consentQuote: true,
    });

    expect(result).toEqual({ ok: true });
    const [, answers, consentQuoteAt] = jest.mocked(upsertCreatorSurvey).mock.calls[0]!;
    expect(answers.consentQuote).toBe(false);
    expect(answers.quote).toBeNull();
    expect(consentQuoteAt).toBeNull();
  });

  it("stamps consent_quote_at when the quote is released", async () => {
    await submitCreatorSurveyAction(CAMPAIGN_ID, validInput);

    const [campaignId, answers, consentQuoteAt] = jest.mocked(upsertCreatorSurvey).mock.calls[0]!;
    expect(campaignId).toBe(CAMPAIGN_ID);
    expect(answers.consentQuote).toBe(true);
    expect(typeof consentQuoteAt).toBe("string");
    expect(revalidatePath).toHaveBeenCalledWith("/kampagne/verwalten");
    expect(revalidatePath).toHaveBeenCalledWith("/kampagne/verwalten/feedback");
  });

  it("accepts an ended campaign with 50 letters", async () => {
    jest.mocked(getCampaignById).mockResolvedValue({
      ...campaign,
      letterCount: 50,
      endsAt: "2026-01-01T00:00:00.000Z",
    } as never);

    const result = await submitCreatorSurveyAction(CAMPAIGN_ID, validInput);

    expect(result).toEqual({ ok: true });
    expect(upsertCreatorSurvey).toHaveBeenCalledTimes(1);
  });

  it("sends the admin mail once for the first submit", async () => {
    await submitCreatorSurveyAction(CAMPAIGN_ID, validInput);
    await flush();

    expect(sendCreatorSurveyAdminEmail).toHaveBeenCalledTimes(1);
    expect(sendCreatorSurveyAdminEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        isUpdate: false,
        campaign: expect.objectContaining({
          slug: "sichere-schulwege",
          creatorEmail: "owner@example.org",
        }),
      }),
    );
  });

  it("sends no mail when the answers did not change, but a mail when they did", async () => {
    await submitCreatorSurveyAction(CAMPAIGN_ID, validInput);
    await flush();
    const [, saved, savedAt] = jest.mocked(upsertCreatorSurvey).mock.calls[0]!;
    jest.mocked(sendCreatorSurveyAdminEmail).mockClear();
    jest.mocked(getCreatorSurvey).mockResolvedValue({
      ...saved,
      consentQuoteAt: savedAt,
      createdAt: "2026-10-09T10:00:00.000Z",
      updatedAt: "2026-10-09T10:00:00.000Z",
    });

    await submitCreatorSurveyAction(CAMPAIGN_ID, validInput);
    await flush();
    expect(sendCreatorSurveyAdminEmail).not.toHaveBeenCalled();

    await submitCreatorSurveyAction(CAMPAIGN_ID, { ...validInput, quote: "Neuer Satz." });
    await flush();
    expect(sendCreatorSurveyAdminEmail).toHaveBeenCalledTimes(1);
    expect(sendCreatorSurveyAdminEmail).toHaveBeenCalledWith(
      expect.objectContaining({ isUpdate: true }),
    );
  });

  it("still reports success when the admin mail fails", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      jest.mocked(sendCreatorSurveyAdminEmail).mockRejectedValue(new Error("brevo down"));
      await expect(submitCreatorSurveyAction(CAMPAIGN_ID, validInput)).resolves.toEqual({ ok: true });
      await flush();

      jest.mocked(sendCreatorSurveyAdminEmail).mockResolvedValue({ success: false });
      await expect(submitCreatorSurveyAction(CAMPAIGN_ID, validInput)).resolves.toEqual({ ok: true });
      await flush();
    } finally {
      spy.mockRestore();
    }
  });

  it("reports an error without leaking answers when the upsert throws", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      jest.mocked(upsertCreatorSurvey).mockRejectedValue(new Error("db down"));

      const result = await submitCreatorSurveyAction(CAMPAIGN_ID, validInput);

      expect(result).toMatchObject({ ok: false, code: "error" });
      expect(sendCreatorSurveyAdminEmail).not.toHaveBeenCalled();
      const logged = JSON.stringify(spy.mock.calls);
      expect(logged).not.toContain("Das hat uns Mut gemacht");
      expect(logged).not.toContain("owner@example.org");
    } finally {
      spy.mockRestore();
    }
  });
});
