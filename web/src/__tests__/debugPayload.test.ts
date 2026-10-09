jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@getbrevo/brevo", () => ({
  BrevoClient: jest.fn().mockImplementation(() => ({
    transactionalEmails: { sendTransacEmail: jest.fn() },
  })),
}));
jest.mock("@/lib/feedback/token", () => ({
  signFeedbackToken: jest.fn(() => "signed-feedback-token"),
}));

import { signFeedbackToken } from "@/lib/feedback/token";
import {
  buildDebugPayload,
  getCodeVersion,
  buildResendDebugPayload,
  ISSUE_TEXT_PREVIEW_MAX,
} from "@/lib/email/buildDebugPayload";

const recipient = {
  kind: "mdb" as const,
  level: "Bund" as const,
  firstName: "Serdar",
  lastName: "Yüksel",
  wahlkreisName: "Bochum I",
  party: "SPD",
  id: 1,
  politicianId: 101,
  title: null,
  wahlkreisId: 140,
  postalAddress: "Platz der Republik 1, 11011 Berlin",
  isDirect: true,
  abgeordnetenwatchUrl: null,
};

const issueText = "Anliegen ".repeat(300);

const wizardData = {
  issueText,
  toneLevel: 3,
  letterLength: "1" as const,
  email: "test@example.org",
  plz: "44801",
  party: "",
  ngo: "",
  usedSpeechToText: false,
  tipsOpened: false,
};

const generationResult = {
  selectedRecipient: recipient,
  selectedPolitician: recipient,
  politicalLevel: "Bund" as const,
  wordCount: 220,
  wordCountInRange: true,
  fallbackUsed: false,
  retried: false,
  mdbContextUsed: true,
  model: "mistral-large-latest",
  temperature: 0.4,
  generationMs: 1000,
  letter: "Testbrief",
  topic: null,
};

describe("Debug-Payload", () => {
  it("contains a bounded issue text preview", () => {
    const payload = buildDebugPayload(wizardData, generationResult, 6);

    expect(payload.issueTextLength).toBe(issueText.length);
    expect(payload.issueTextPreview).toBe(issueText.slice(0, ISSUE_TEXT_PREVIEW_MAX));
    expect(payload.issueTextPreview?.length).toBeLessThanOrEqual(ISSUE_TEXT_PREVIEW_MAX);
  });

  it("includes the same bounded preview in resend payloads", () => {
    const payload = buildResendDebugPayload(
      wizardData,
      recipient,
      6,
      "Cached letter text",
    );

    expect(payload.issueTextLength).toBe(issueText.length);
    expect(payload.issueTextPreview).toBe(issueText.slice(0, ISSUE_TEXT_PREVIEW_MAX));
    expect(payload.issueTextPreview?.length).toBeLessThanOrEqual(ISSUE_TEXT_PREVIEW_MAX);
  });

  it("caps the issue text preview at 2000 characters", () => {
    const payload = buildDebugPayload(wizardData, generationResult, 6);

    expect(ISSUE_TEXT_PREVIEW_MAX).toBe(2000);
    expect(issueText.length).toBeGreaterThan(ISSUE_TEXT_PREVIEW_MAX);
    expect(payload.issueTextPreview).toHaveLength(2000);
  });

  describe("codeVersion", () => {
    const original = process.env.VERCEL_GIT_COMMIT_SHA;
    afterEach(() => {
      if (original === undefined) delete process.env.VERCEL_GIT_COMMIT_SHA;
      else process.env.VERCEL_GIT_COMMIT_SHA = original;
    });

    it("uses the first 7 chars of VERCEL_GIT_COMMIT_SHA", () => {
      process.env.VERCEL_GIT_COMMIT_SHA = "290b27e1234567890abcdef";
      expect(getCodeVersion()).toBe("290b27e");
      expect(buildDebugPayload(wizardData, generationResult, 6).codeVersion).toBe("290b27e");
      expect(
        buildResendDebugPayload(wizardData, recipient, 6, "Cached letter text").codeVersion,
      ).toBe("290b27e");
    });

    it("falls back to 'unbekannt' without a commit SHA", () => {
      delete process.env.VERCEL_GIT_COMMIT_SHA;
      expect(getCodeVersion()).toBe("unbekannt");
      expect(buildDebugPayload(wizardData, generationResult, 6).codeVersion).toBe("unbekannt");
    });
  });

  it("keeps issueTextPreview out of the signed feedback token", async () => {
    const originalBrevoKey = process.env.BREVO_API_KEY;
    process.env.BREVO_API_KEY = "test-key";
    const { prepareLetterEmail } = await import("@/lib/email/sendLetterEmail");
    if (originalBrevoKey === undefined) delete process.env.BREVO_API_KEY;
    else process.env.BREVO_API_KEY = originalBrevoKey;
    const debug = buildDebugPayload(wizardData, generationResult, 6);
    expect(debug.issueTextPreview).toBeTruthy();

    prepareLetterEmail({
      recipientEmail: "test@example.org",
      recipient,
      letterText: "Sehr geehrter Herr Yüksel,\n\nTest.",
      issueText,
      debug,
    });

    const signed = (signFeedbackToken as jest.Mock).mock.calls.at(-1)?.[0];
    expect(signed).toBeDefined();
    expect(signed).not.toHaveProperty("issueTextPreview");
    expect(signed).toHaveProperty("issueTextLength", issueText.length);
    // Das Original-Debug-Objekt (Debug-Link) behält den Auszug.
    expect(debug.issueTextPreview).toHaveLength(2000);
  });
});
