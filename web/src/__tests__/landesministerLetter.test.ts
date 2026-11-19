/**
 * Landesminister als Empfänger (Schulmodus): Prompt, Anrede, Mail-Vorbereitung.
 * Mistral gemockt, Ministerdaten als Inline-Fixture.
 */

jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@/lib/mistral", () => ({
  mistral: { chat: { complete: jest.fn() } },
  withMistralRetry: <T,>(_label: string, fn: () => Promise<T>) => fn(),
  MISTRAL_MODELS: { letter: "mistral-large-latest", levelRouting: "mistral-small-latest" },
  MistralStageError: class extends Error {},
}));
jest.mock("@getbrevo/brevo", () => ({
  BrevoClient: jest.fn().mockImplementation(() => ({
    transactionalEmails: { sendTransacEmail: jest.fn() },
  })),
}));
jest.mock("@/lib/feedback/token", () => ({
  signFeedbackToken: jest.fn(() => "signed-feedback-token"),
}));
jest.mock("../../data/landesminister.json", () => ({
  lastUpdated: "2026-11-19",
  states: {
    HB: {
      stateName: "Bremen",
      ministers: [
        {
          ressorts: ["bildung"],
          officeName: "Die Senatorin für Kinder und Bildung",
          name: "Test Bildung",
          title: "Senatorin für Kinder und Bildung",
          salutation: "Sehr geehrte Frau Senatorin Bildung,",
          addressLines: ["Senatorin Test Bildung", "Die Senatorin für Kinder und Bildung", "Teststraße 1", "28195 Bremen"],
          source: { title: "Fixture", url: "https://example.org/bildung", verifiedAt: "2026-11-19" },
        },
      ],
    },
  },
}));

import { mistral } from "@/lib/mistral";
import { buildSystemPrompt, buildUserPrompt, generateLetter } from "@/lib/generation/generateLetter";
import { getLandesministerRecipient } from "@/lib/lookup/landesministerRecipient";
import { recipientEnvelope } from "@/lib/lookup/recipientEnvelope";
import { buildEmailHtml, buildLetterEmailText } from "@/lib/email/buildEmailHtml";
import type { GenerateLetterInput } from "@/lib/types/wizard";

const minister = getLandesministerRecipient("HB", "bildung")!;

function input(): GenerateLetterInput {
  return {
    issueText: "Unsere Schultoiletten sind kaputt.",
    politicians: [],
    level: "Land",
    landesminister: minister,
    youth: { klasse: 7, viaClassLink: true },
  };
}

describe("Landesminister im Prompt", () => {
  it("nutzt die Anrede aus den Daten und neutrale Partei-Hinweise", () => {
    const system = buildSystemPrompt(input());
    expect(system).toContain('Anrede: exakt "Sehr geehrte Frau Senatorin Bildung,"');
    expect(system).toContain("Fachministerin oder den zuständigen Fachminister");
    expect(system).not.toContain("PARTEI-BEWUSSTES FRAMING");
    expect(system).not.toContain("Bewahrung des Bewährten");
  });

  it("gibt das Amt im Empfängerblock mit", () => {
    const user = buildUserPrompt(input(), 80, 120, 3);
    expect(user).toContain('"anrede": "Sehr geehrte Frau Senatorin Bildung,"');
    expect(user).toContain('"amt": "Die Senatorin für Kinder und Bildung"');
    expect(user).toContain('"ort": "Bremen"');
  });
});

describe("generateLetter mit Landesminister", () => {
  beforeEach(() => (mistral.chat.complete as jest.Mock).mockReset());

  it("setzt die Anrede aus den Daten und gibt den Minister als Empfänger zurück", async () => {
    const body = Array.from({ length: 100 }, (_, i) => `Wort${i}`).join(" ");
    (mistral.chat.complete as jest.Mock).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              selected_politician_id: 0,
              letter: `Sehr geehrte Damen und Herren,\n\n${body}`,
            }),
          },
        },
      ],
    });

    const result = await generateLetter(input());

    expect(result.selectedRecipient).toMatchObject({ kind: "landesminister", ressort: "bildung" });
    expect(result.letter.startsWith("Sehr geehrte Frau Senatorin Bildung,")).toBe(true);
    expect(result.selectedPolitician).toBeNull();
  });
});

describe("Landesminister: Umschlag und Mail", () => {
  const originalBrevoKey = process.env.BREVO_API_KEY;
  beforeAll(() => {
    process.env.BREVO_API_KEY = "test-key";
  });
  afterAll(() => {
    if (originalBrevoKey === undefined) delete process.env.BREVO_API_KEY;
    else process.env.BREVO_API_KEY = originalBrevoKey;
  });

  it("Umschlag zeigt die Anschrift aus den Daten", () => {
    expect(recipientEnvelope(minister)).toEqual({
      lines: ["Senatorin Test Bildung", "Die Senatorin für Kinder und Bildung", "Teststraße 1", "28195 Bremen"],
      complete: true,
    });
  });

  it("Mail-Vorbereitung zeigt Name und Postanschrift wie bei der Regierungsspitze", async () => {
    const { prepareLetterEmail } = await import("@/lib/email/sendLetterEmail");
    const { params } = prepareLetterEmail({
      recipientEmail: "schule@example.org",
      recipient: minister,
      letterText: `${minister.salutation}\n\nTest.`,
      issueText: "Testanliegen",
      debug: {} as never,
      audience: "jung",
    });

    expect(params).toMatchObject({
      recipientKind: "landesregierung",
      politicianName: "Test Bildung",
      politicianTitle: "Senatorin für Kinder und Bildung",
      politicianParty: null,
      politicianAbgeordnetenwatchUrl: null,
      bundeslandKey: "HB",
      politicianPostalAddress: minister.postalAddress,
      governmentSource: {
        addressee: "head",
        addressLines: minister.address.addressLines,
        officeName: "Die Senatorin für Kinder und Bildung",
        url: "https://example.org/bildung",
      },
    });
    const html = buildEmailHtml(params);
    expect(html).toContain("<strong>Senatorin Test Bildung</strong><br>");
    expect(html).toContain("Teststraße 1<br>28195 Bremen");
    expect(buildLetterEmailText(params)).toContain("Postanschrift:\nSenatorin Test Bildung");
  });
});
