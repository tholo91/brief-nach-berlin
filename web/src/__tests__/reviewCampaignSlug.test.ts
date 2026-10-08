jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@getbrevo/brevo", () => ({
  BrevoClient: jest.fn().mockImplementation(() => ({
    transactionalEmails: { sendTransacEmail: jest.fn() },
  })),
}));
jest.mock("@/lib/feedback/token", () => ({
  signFeedbackToken: jest.fn(() => "signed-feedback-token"),
  verifyFeedbackToken: jest.fn(),
}));
jest.mock("@/lib/supabase/server", () => ({ getServiceRoleClient: jest.fn() }));
jest.mock("@/lib/rateLimit", () => ({
  checkRateLimit: jest.fn(() => ({ allowed: true })),
  getClientIp: jest.fn(async () => "203.0.113.1"),
  hashIdentifier: jest.fn(() => "hash"),
  LIMITS: { REVIEW_PER_IP: { max: 1, windowMs: 1000 } },
}));

import { signFeedbackToken, verifyFeedbackToken } from "@/lib/feedback/token";
import { getServiceRoleClient } from "@/lib/supabase/server";
import { getLandesregierungRecipient } from "@/lib/lookup/landesregierungRecipient";

describe("Kampagnen-Slug im Feedback-Token", () => {
  beforeAll(() => {
    process.env.BREVO_API_KEY = "test-key";
  });

  async function signedPayload(campaign: unknown) {
    const { prepareLetterEmail } = await import("@/lib/email/sendLetterEmail");
    (signFeedbackToken as jest.Mock).mockClear();
    prepareLetterEmail({
      recipientEmail: "test@example.org",
      recipient: getLandesregierungRecipient("HB")!,
      letterText: "Test",
      issueText: "Test",
      debug: { issueTextPreview: "geheim" } as never,
      campaign: campaign as never,
    });
    return (signFeedbackToken as jest.Mock).mock.calls[0][0];
  }

  it("enthält campaignSlug, wenn der Brief aus einer Kampagne stammt", async () => {
    const payload = await signedPayload({ slug: "kampagne-a" });
    expect(payload.campaignSlug).toBe("kampagne-a");
    expect(payload).not.toHaveProperty("issueTextPreview");
  });

  it("enthält kein campaignSlug ohne Kampagne", async () => {
    const payload = await signedPayload(undefined);
    expect(payload).not.toHaveProperty("campaignSlug");
  });
});

describe("submitReview schreibt campaign_slug", () => {
  const upsert = jest.fn(async () => ({ error: null }));

  beforeEach(() => {
    process.env.REVIEW_IP_SALT = "salt";
    upsert.mockClear();
    (getServiceRoleClient as jest.Mock).mockReturnValue({
      from: () => ({ upsert }),
    });
  });

  async function submit(mode: "initial" | "full", payload: object) {
    (verifyFeedbackToken as jest.Mock).mockReturnValue(payload);
    const { submitReviewAction } = await import("@/lib/actions/submitReview");
    const result = await submitReviewAction({
      mode,
      rating: 5,
      token: "x".repeat(30),
    });
    expect(result).toEqual({ success: true });
    return (upsert.mock.calls[0] as unknown[])[0] as Record<string, unknown>;
  }

  it.each(["initial", "full"] as const)("%s: Slug aus dem Token", async (mode) => {
    const row = await submit(mode, { campaignSlug: "kampagne-a" });
    expect(row.campaign_slug).toBe("kampagne-a");
  });

  it.each(["initial", "full"] as const)("%s: alter Token ohne Slug → null", async (mode) => {
    const row = await submit(mode, {});
    expect(row.campaign_slug).toBeNull();
  });
});
