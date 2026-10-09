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
});
