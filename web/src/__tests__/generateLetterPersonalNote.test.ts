jest.mock("next/server", () => ({
  ...jest.requireActual("next/server"),
  after: jest.fn(),
}));
jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@/lib/lookup/resolveRecipient", () => ({ resolveRecipientSelection: jest.fn() }));
jest.mock("@/lib/lookup/routingToken", () => ({ verifyRoutingToken: jest.fn() }));
jest.mock("@/lib/moderation/moderateText", () => ({ moderateText: jest.fn() }));
jest.mock("@/lib/generation/generateLetter", () => ({
  ...jest.requireActual("@/lib/generation/generateLetter"),
  generateLetter: jest.fn(),
}));
jest.mock("@/lib/enrichment/fetchMdbContext", () => ({ fetchMdbContext: jest.fn() }));
jest.mock("@/lib/email/sendLetterEmail", () => ({
  sendLetterEmail: jest.fn(),
  prepareLetterEmail: jest.fn(),
}));
jest.mock("@/lib/email/sendFollowupEmail", () => ({ sendFollowupEmail: jest.fn() }));
jest.mock("@/lib/email/computeFollowupSlot", () => ({ computeFollowupSlot: jest.fn() }));
jest.mock("@/lib/email/buildDebugPayload", () => ({ buildDebugPayload: jest.fn() }));
jest.mock("@/lib/rateLimit", () => {
  const mockCheckRateLimit = jest.fn();
  return {
    checkRateLimit: mockCheckRateLimit,
    checkOriginRateLimit: jest.fn(() => mockCheckRateLimit()),
    hashIdentifier: jest.fn(),
    LIMITS: {
      LETTERS_PER_IP: { max: 10, windowMs: 3_600_000 },
      LETTERS_PER_EMAIL: { max: 3, windowMs: 86_400_000 },
    },
  };
});
jest.mock("@/lib/counter", () => ({ incrementLetterCounters: jest.fn() }));
jest.mock("@/lib/campaigns/repository", () => ({ getPublicCampaignBySlug: jest.fn() }));
jest.mock("@/lib/campaigns/milestoneNotification", () => ({
  claimAndSendCampaignMilestone: jest.fn(),
}));
jest.mock("@/lib/campaigns/globalLetterMilestoneNotification", () => ({
  claimAndSendGlobalLetterMilestone: jest.fn(),
}));
jest.mock("@/lib/actions/letterSignals", () => ({
  markLetterSignalGeneratedAction: jest.fn(async () => ({ ok: true })),
}));
// Mistral wird nie echt aufgerufen: nur Stubs, damit das ESM-SDK nicht geladen wird.
jest.mock("@/lib/mistral", () => ({
  mistral: { chat: { complete: jest.fn() } },
  withMistralRetry: <T,>(_label: string, fn: () => Promise<T>) => fn(),
  MISTRAL_MODELS: { letter: "test-model" },
  MistralProviderUnavailableError: class extends Error {},
  MistralStageError: class extends Error {
    readonly stage: string;
    constructor(stage: string, cause: unknown) {
      super(`Mistral ${stage} failed`, { cause });
      this.stage = stage;
    }
  },
}));

import { POST } from "@/app/api/generate-letter/route";
import { buildUserPrompt, generateLetter } from "@/lib/generation/generateLetter";
import { resolveRecipientSelection } from "@/lib/lookup/resolveRecipient";
import { checkRateLimit, hashIdentifier } from "@/lib/rateLimit";
import { getPublicCampaignBySlug } from "@/lib/campaigns/repository";
import { incrementLetterCounters } from "@/lib/counter";
import { prepareLetterEmail, sendLetterEmail } from "@/lib/email/sendLetterEmail";
import type { GenerateLetterInput } from "@/lib/types/wizard";
import type { Politician } from "@/lib/types/politician";

const NOTE = "Meine Kinder sind direkt betroffen: Sie fahren jeden Tag damit zur Schule.";

function politician(): Politician {
  return {
    id: 1,
    politicianId: 100,
    firstName: "Erika",
    lastName: "Mustermann",
    title: null,
    party: "SPD",
    wahlkreisId: 55,
    wahlkreisName: "Bremen I",
    level: "Bund",
    postalAddress: "Platz der Republik 1, 11011 Berlin",
    isDirect: true,
    abgeordnetenwatchUrl: null,
    committees: [],
  };
}

function prompt(overrides: Partial<GenerateLetterInput> = {}): string {
  return buildUserPrompt(
    {
      issueText: "Die Bahn muss im ländlichen Raum endlich häufiger fahren, dafür brauchen wir Geld.",
      politicians: [politician()],
      ...overrides,
    },
    200,
    280,
    3,
  );
}

describe("buildUserPrompt mit personalNote", () => {
  it("fügt den Block <persoenlich> nur mit Notiz bei Kampagnenbriefen ein", () => {
    const withNote = prompt({ fromCampaign: true, personalNote: NOTE });
    expect(withNote).toContain(`<persoenlich>\n${NOTE}\n</persoenlich>`);
    expect(withNote).toContain("Beginne den Brief mit dieser Betroffenheit");
    expect(withNote).toContain("Forderung und Fakten kommen aus dem <transkript>");
    expect(withNote).toContain("wörtlich im <transkript> oder in <persoenlich> stehen");
  });

  it("lässt den Prompt ohne Notiz unverändert", () => {
    const campaign = prompt({ fromCampaign: true });
    expect(campaign).not.toContain("persoenlich");
    expect(campaign).toContain("wörtlich im <transkript> stehen");
    expect(prompt({ fromCampaign: true, personalNote: undefined })).toBe(campaign);
    expect(prompt({ fromCampaign: true, personalNote: "   " })).toBe(campaign);

    const plain = prompt();
    expect(plain).not.toContain("persoenlich");
    expect(prompt({ personalNote: undefined })).toBe(plain);
  });

  it("ignoriert eine Notiz bei freien Briefen", () => {
    expect(prompt({ personalNote: NOTE })).toBe(prompt());
  });
});

describe("generate-letter Route und personalNote", () => {
  const recipient = {
    kind: "rathaus" as const,
    level: "Kommune" as const,
    recipientKind: "buergermeisteramt" as const,
    gemeindeName: "Musterstadt",
    plz: "28203",
    label: "Bürgermeisteramt Musterstadt",
    postalAddress: "Musterstraße 1",
    address: { source: "fallback" as const },
  };
  const mainText =
    "Der Nahverkehr auf dem Land muss ausgebaut werden, damit niemand ohne Auto abgehängt wird.";
  const variantText =
    "Wer auf dem Land lebt, braucht verlässliche Busse und Bahnen, sonst bleibt nur das Auto.";
  const campaign = {
    slug: "nahverkehr",
    issueText: mainText,
    issueTextAlternatives: [variantText],
    issueTextAlternativesBase: mainText,
    targetLevel: "Bund",
    targetState: null,
    targetRecipient: null,
    targetPoliticianIds: [],
    topic: null,
    endsAt: null,
    logoPath: null,
    letterCount: 3,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.LANDTAG_ROUTING_ENABLED = "false";
    process.env.LETTER_PROMPT_LEVEL_AWARE = "true";
    process.env.LETTER_SIGNAL_TOKEN_SECRET = "personal-note-test-secret";
    process.env.LETTER_SIGNAL_EMAIL_HASH_SECRET = "personal-note-email-test-secret";
    jest.mocked(checkRateLimit).mockReturnValue({ allowed: true });
    jest.mocked(hashIdentifier).mockReturnValue("hashed");
    jest.mocked(incrementLetterCounters).mockResolvedValue(4);
    jest.mocked(resolveRecipientSelection).mockReturnValue({
      ok: true,
      availableCount: 1,
      relation: "institutional",
      recipient,
    });
    jest.mocked(generateLetter).mockResolvedValue({
      letter: "Ein normaler Brief.",
      topic: null,
      selectedRecipient: recipient,
      selectedPolitician: null,
      politicalLevel: "Kommune",
      wordCount: 4,
      wordCountInRange: false,
      fallbackUsed: false,
      mdbContextUsed: false,
      retried: false,
      model: "test-model",
      temperature: 0,
      generationMs: 1,
    });
    jest.mocked(prepareLetterEmail).mockReturnValue({ params: {}, feedbackToken: "t" } as never);
    jest.mocked(sendLetterEmail).mockResolvedValue({ success: false });
  });

  function post(issueText: string, personalNote: unknown, withCampaign = true) {
    return POST({
      json: async () => ({
        wizardData: {
          plz: "28203",
          email: "test@example.org",
          issueText,
          letterLength: "1.5",
          toneLevel: 3,
          personalNote,
          ...(withCampaign
            ? { campaign: { slug: "nahverkehr", title: "Nahverkehr", textUnchanged: true } }
            : {}),
        },
        selection: { kind: "rathaus" },
      }),
      headers: new Headers(),
    } as Parameters<typeof POST>[0]);
  }

  function personalNotePassed(): unknown {
    const input = jest.mocked(generateLetter).mock.calls[0]![0];
    return input.personalNote;
  }

  it("gibt die getrimmte Notiz bei unverändertem Haupttext weiter", async () => {
    jest.mocked(getPublicCampaignBySlug).mockResolvedValue(campaign as never);
    const response = await post(mainText, `  ${NOTE}  `);
    expect(response.status).toBe(200);
    expect(personalNotePassed()).toBe(NOTE);
  });

  it("akzeptiert die Notiz auch bei einer Textvariante", async () => {
    jest.mocked(getPublicCampaignBySlug).mockResolvedValue(campaign as never);
    const response = await post(`${variantText}\n`, NOTE);
    expect(response.status).toBe(200);
    expect(personalNotePassed()).toBe(NOTE);
  });

  it("verwirft die Notiz bei bearbeitetem Text", async () => {
    jest.mocked(getPublicCampaignBySlug).mockResolvedValue(campaign as never);
    const response = await post(`${mainText} Und noch ein eigener Satz dazu.`, NOTE);
    expect(response.status).toBe(200);
    expect(personalNotePassed()).toBeUndefined();
  });

  it("verwirft die Notiz ohne Kampagne und bei leerer oder zu langer Notiz", async () => {
    jest.mocked(getPublicCampaignBySlug).mockResolvedValue(campaign as never);

    await post(mainText, NOTE, false);
    expect(personalNotePassed()).toBeUndefined();

    jest.mocked(generateLetter).mockClear();
    await post(mainText, "   ");
    expect(personalNotePassed()).toBeUndefined();

    jest.mocked(generateLetter).mockClear();
    await post(mainText, "a".repeat(401));
    expect(personalNotePassed()).toBeUndefined();
  });
});
