import {
  buildDebugPayload,
  buildResendDebugPayload,
} from "@/lib/email/buildDebugPayload";

const recipient = {
  kind: "mdb" as const,
  level: "Bund" as const,
  firstName: "Serdar",
  lastName: "Yüksel",
  wahlkreisName: "Bochum I",
  party: "SPD",
  id: 1,
};

const issueText = "Anliegen ".repeat(100);

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
};

describe("Debug-Payload", () => {
  it("contains the issue text length but never its content", () => {
    const payload = buildDebugPayload(wizardData, generationResult, 6);

    expect(payload.issueTextLength).toBe(issueText.length);
    expect(JSON.stringify(payload)).not.toContain(issueText.slice(0, 80));
  });

  it("keeps the issue text out of resend payloads", () => {
    const payload = buildResendDebugPayload(
      wizardData,
      recipient,
      6,
      "Cached letter text",
    );

    expect(payload.issueTextLength).toBe(issueText.length);
    expect(JSON.stringify(payload)).not.toContain(issueText.slice(0, 80));
  });
});
