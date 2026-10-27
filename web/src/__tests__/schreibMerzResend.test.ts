jest.mock("@/lib/mistral", () => ({}));
jest.mock("@/lib/campaigns/repository", () => ({
  getPublicCampaignBySlug: jest.fn(),
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
import { getPublicCampaignBySlug } from "@/lib/campaigns/repository";
import {
  prepareLetterEmail,
  sendLetterEmail,
} from "@/lib/email/sendLetterEmail";
import { getBundeskanzlerRecipient } from "@/lib/lookup/bundeskanzlerRecipient";
import { createGenerationProof } from "@/lib/letterSignals/token";
import type { WizardData } from "@/lib/types/wizard";

const mockedGetPublicCampaignBySlug = jest.mocked(getPublicCampaignBySlug);
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

function proofFor(letterText: string, campaignSlug = "schreib-merz") {
  return createGenerationProof({
    letterId: "11111111-1111-4111-8111-111111111111",
    issueText: data.issueText,
    plz: data.plz,
    recipient: getBundeskanzlerRecipient(),
    letterText,
    campaignSlug,
  });
}

describe("Schreib-Merz resend", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.LETTER_SIGNAL_TOKEN_SECRET = "schreib-merz-resend-test-secret";
    mockedGetPublicCampaignBySlug.mockResolvedValue(activeCampaign());
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
        proofFor("Sehr geehrter Herr Bundeskanzler,\n\nmein Brief."),
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
    expect(mockedPrepareLetterEmail.mock.calls[0][0].audience).toBeUndefined();
    expect(mockedSendLetterEmail).toHaveBeenCalledTimes(1);
  });

  it("passes the youth audience through to the email", async () => {
    const letter = "Sehr geehrter Herr Bundeskanzler,\n\nmein Brief.";
    await expect(
      resendLetterAction(
        { ...data, audience: "jung", klasse: 9 },
        { kind: "bundeskanzler" },
        letter,
        proofFor(letter),
      ),
    ).resolves.toEqual({ success: true });

    expect(mockedPrepareLetterEmail).toHaveBeenCalledWith(
      expect.objectContaining({ audience: "jung" }),
    );
  });

  it("ignores the youth audience without a valid Klasse", async () => {
    const letter = "Sehr geehrter Herr Bundeskanzler,\n\nmein Brief.";
    await resendLetterAction(
      { ...data, audience: "jung" },
      { kind: "bundeskanzler" },
      letter,
      proofFor(letter),
    );

    expect(mockedPrepareLetterEmail.mock.calls[0][0].audience).toBeUndefined();
  });

  it("does not resend when the campaign is inactive", async () => {
    mockedGetPublicCampaignBySlug.mockResolvedValue(null);

    await expect(
      resendLetterAction(data, { kind: "bundeskanzler" }, "Brieftext", proofFor("Brieftext")),
    ).resolves.toEqual({
      error: "validation",
      message: "Diese Kampagne ist aktuell nicht aktiv.",
    });
    expect(mockedPrepareLetterEmail).not.toHaveBeenCalled();
    expect(mockedSendLetterEmail).not.toHaveBeenCalled();
  });

  it("does not reuse the chancellor selection for another campaign", async () => {
    mockedGetPublicCampaignBySlug.mockResolvedValue(
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
        proofFor("Brieftext", "andere-kampagne"),
      ),
    ).resolves.toMatchObject({ error: "validation" });
    expect(mockedPrepareLetterEmail).not.toHaveBeenCalled();
    expect(mockedSendLetterEmail).not.toHaveBeenCalled();
  });
});
