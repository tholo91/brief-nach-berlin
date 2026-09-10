jest.mock("@/lib/campaigns/repository", () => ({
  getActiveCampaignBySlug: jest.fn(),
}));
jest.mock("@/lib/rateLimit", () => ({
  checkRateLimit: jest.fn(() => ({ allowed: true })),
  getClientIp: jest.fn(async () => "127.0.0.1"),
  hashIdentifier: jest.fn((value: string) => `hash:${value}`),
  LIMITS: {
    RESEND_PER_IP: { max: 3, windowMs: 3_600_000 },
    RESEND_PER_EMAIL: { max: 2, windowMs: 3_600_000 },
  },
}));
jest.mock("@/lib/email/buildDebugPayload", () => ({
  buildResendDebugPayload: jest.fn(() => ({})),
}));
jest.mock("@/lib/email/sendLetterEmail", () => ({
  prepareLetterEmail: jest.fn(() => ({ params: { recipientKind: "bundeskanzler" } })),
  sendLetterEmail: jest.fn(async () => ({ success: true, messageId: "message-id" })),
}));

import { resendLetterAction } from "@/lib/actions/resendLetter";
import { getActiveCampaignBySlug } from "@/lib/campaigns/repository";
import {
  prepareLetterEmail,
  sendLetterEmail,
} from "@/lib/email/sendLetterEmail";
import type { WizardData } from "@/lib/types/wizard";

const mockedGetActiveCampaignBySlug = jest.mocked(getActiveCampaignBySlug);
const mockedPrepareLetterEmail = jest.mocked(prepareLetterEmail);
const mockedSendLetterEmail = jest.mocked(sendLetterEmail);

const data: WizardData = {
  plz: "50667",
  email: "test@example.org",
  issueText: "Bezahlbarer Wohnraum ist für junge Menschen wichtig.",
  letterLength: "1",
  campaign: {
    slug: "schreib-merz",
    title: "Schreib Merz",
    targetLevel: "Bund",
  },
};

function activeCampaign(slug = "schreib-merz") {
  return { slug, targetLevel: "Bund", targetPoliticianIds: [] } as never;
}

describe("Schreib-Merz resend", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetActiveCampaignBySlug.mockResolvedValue(activeCampaign());
    mockedPrepareLetterEmail.mockReturnValue({
      params: { recipientKind: "bundeskanzler" } as never,
      feedbackToken: "feedback-token",
    });
    mockedSendLetterEmail.mockResolvedValue({
      success: true,
      messageId: "message-id",
    });
  });

  it("re-resolves the trusted chancellor before sending", async () => {
    await expect(
      resendLetterAction(
        data,
        { kind: "bundeskanzler" },
        "Sehr geehrter Herr Bundeskanzler,\n\nmein Brief.",
      ),
    ).resolves.toEqual({ success: true });

    expect(mockedPrepareLetterEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        recipient: expect.objectContaining({
          kind: "bundeskanzler",
          label: "Bundeskanzler Friedrich Merz",
          postalAddress:
            "Bundeskanzleramt, Bundeskanzler, Friedrich Merz, Willy-Brandt-Straße 1, 10557 Berlin",
        }),
        campaign: data.campaign,
      }),
    );
    expect(mockedSendLetterEmail).toHaveBeenCalledTimes(1);
  });

  it("does not resend when the campaign is inactive", async () => {
    mockedGetActiveCampaignBySlug.mockResolvedValue(null);

    await expect(
      resendLetterAction(data, { kind: "bundeskanzler" }, "Brieftext"),
    ).resolves.toEqual({
      error: "validation",
      message: "Diese Kampagne ist aktuell nicht aktiv.",
    });
    expect(mockedPrepareLetterEmail).not.toHaveBeenCalled();
    expect(mockedSendLetterEmail).not.toHaveBeenCalled();
  });

  it("does not reuse the chancellor selection for another campaign", async () => {
    mockedGetActiveCampaignBySlug.mockResolvedValue(
      activeCampaign("andere-kampagne"),
    );

    await expect(
      resendLetterAction(
        {
          ...data,
          campaign: { ...data.campaign!, slug: "andere-kampagne" },
        },
        { kind: "bundeskanzler" },
        "Brieftext",
      ),
    ).resolves.toMatchObject({ error: "validation" });
    expect(mockedPrepareLetterEmail).not.toHaveBeenCalled();
    expect(mockedSendLetterEmail).not.toHaveBeenCalled();
  });
});
