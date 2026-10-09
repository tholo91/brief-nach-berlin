jest.mock("next/server", () => ({
  ...jest.requireActual("next/server"),
  after: jest.fn(),
}));
jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@/lib/lookup/resolveRecipient", () => ({ resolveRecipientSelection: jest.fn() }));
jest.mock("@/lib/lookup/routingToken", () => ({ verifyRoutingToken: jest.fn() }));
jest.mock("@/lib/moderation/moderateText", () => ({ moderateText: jest.fn() }));
jest.mock("@/lib/generation/generateLetter", () => ({ generateLetter: jest.fn() }));
jest.mock("@/lib/enrichment/fetchMdbContext", () => ({ fetchMdbContext: jest.fn() }));
jest.mock("@/lib/email/sendLetterEmail", () => ({
  sendLetterEmail: jest.fn(),
  prepareLetterEmail: jest.fn(),
}));
jest.mock("@/lib/email/sendFollowupEmail", () => ({ sendFollowupEmail: jest.fn() }));
jest.mock("@/lib/email/computeFollowupSlot", () => ({ computeFollowupSlot: jest.fn() }));
jest.mock("@/lib/email/buildDebugPayload", () => ({ buildDebugPayload: jest.fn() }));
jest.mock("@/lib/rateLimit", () => ({
  checkRateLimit: jest.fn(),
  hashIdentifier: jest.fn(),
  LIMITS: {
    LETTERS_PER_IP: { max: 10, windowMs: 3_600_000 },
    LETTERS_PER_EMAIL: { max: 3, windowMs: 86_400_000 },
  },
}));
jest.mock("@/lib/counter", () => ({ incrementLetterCounters: jest.fn() }));
jest.mock("@/lib/campaigns/repository", () => ({ getActiveCampaignBySlug: jest.fn() }));
jest.mock("@/lib/campaigns/milestoneNotification", () => ({
  claimAndSendCampaignMilestone: jest.fn(),
}));
jest.mock("@/lib/actions/letterSignals", () => ({
  markLetterSignalGeneratedAction: jest.fn(async () => ({ ok: true })),
}));
jest.mock("@/lib/mistral", () => ({
  MistralProviderUnavailableError: class extends Error {},
  MistralStageError: class extends Error {
    readonly stage: string;
    readonly statusCode: number | undefined;
    readonly cause: unknown;
    constructor(stage: string, cause: unknown) {
      super(`Mistral ${stage} failed`);
      this.name = "MistralStageError";
      this.stage = stage;
      this.cause = cause;
      this.statusCode = typeof (cause as { status?: unknown })?.status === "number"
        ? (cause as { status: number }).status
        : undefined;
    }
  },
}));

import { after } from "next/server";
import { POST } from "@/app/api/generate-letter/route";
import { claimAndSendCampaignMilestone } from "@/lib/campaigns/milestoneNotification";
import { sendLetterEmail, prepareLetterEmail } from "@/lib/email/sendLetterEmail";
import { generateLetter } from "@/lib/generation/generateLetter";
import { resolveRecipientSelection } from "@/lib/lookup/resolveRecipient";
import { moderateText } from "@/lib/moderation/moderateText";
import { checkRateLimit, hashIdentifier } from "@/lib/rateLimit";
import { getActiveCampaignBySlug } from "@/lib/campaigns/repository";
import { incrementLetterCounters } from "@/lib/counter";
import { MistralStageError } from "@/lib/mistral";

function requestWith(body: unknown) {
  return {
    json: async () => body,
    headers: new Headers(),
  } as Parameters<typeof POST>[0];
}

describe("generate-letter RecipientSelection hardening", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.LANDTAG_ROUTING_ENABLED = "false";
    process.env.LETTER_PROMPT_LEVEL_AWARE = "true";
    process.env.LETTER_SIGNAL_TOKEN_SECRET = "generate-letter-route-test-secret";
    process.env.LETTER_SIGNAL_EMAIL_HASH_SECRET = "generate-letter-route-email-test-secret";
  });

  it("liefert einen persönlichen Brief aus, ohne ihn durch moderateText abzubrechen", async () => {
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
    jest.mocked(checkRateLimit).mockReturnValue({ allowed: true });
    jest.mocked(hashIdentifier).mockReturnValue("hashed");
    jest.mocked(resolveRecipientSelection).mockReturnValue({
      ok: true,
      availableCount: 1,
      relation: "institutional",
      recipient,
    });
    jest.mocked(generateLetter).mockResolvedValue({
      letter: "Sachlich umformulierter persönlicher Brief.",
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
    jest.mocked(moderateText).mockResolvedValue({
      flagged: true,
      categories: ["hate_and_discrimination"],
    });

    const response = await POST(requestWith({
      wizardData: {
        plz: "28203",
        email: "test@example.org",
        issueText: "Verdammt, hier muss sich endlich etwas ändern.",
        letterLength: "1.5",
        toneLevel: 5,
      },
      selection: { kind: "rathaus" },
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      letterText: "Sachlich umformulierter persönlicher Brief.",
    });
    expect(moderateText).not.toHaveBeenCalled();
  });

  it("behandelt eine beendete Kampagne wie einen freien Brief ohne Kampagnenzähler", async () => {
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
    jest.mocked(checkRateLimit).mockReturnValue({ allowed: true });
    jest.mocked(hashIdentifier).mockReturnValue("hashed");
    jest.mocked(getActiveCampaignBySlug).mockResolvedValue({
      slug: "alte-kampagne",
      targetLevel: "Bund",
      targetState: null,
      targetRecipient: null,
      targetPoliticianIds: [],
      topic: null,
      endsAt: "2026-01-01T22:59:59.000Z",
    } as never);
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

    const response = await POST(requestWith({
      wizardData: {
        plz: "28203",
        email: "test@example.org",
        issueText: "Ein ausreichend langes Anliegen für den Test.",
        letterLength: "1.5",
        toneLevel: 3,
        campaign: { slug: "alte-kampagne", title: "Alte Kampagne" },
      },
      selection: { kind: "rathaus" },
    }));

    expect(response.status).toBe(200);
    expect(incrementLetterCounters).toHaveBeenCalledWith(undefined);
    expect(resolveRecipientSelection).toHaveBeenCalledWith(
      "28203",
      { kind: "rathaus" },
      expect.objectContaining({ campaignSlug: null, campaignFixedRecipient: null }),
    );
  });

  it.each([
    { kind: "mdl", selectedPoliticianId: "12" },
    { kind: "landesregierung", selectedPoliticianId: 1 },
    { kind: "landesregierung", address: "Manipulierte Adresse" },
    { kind: "landesregierung", bundeslandKey: "BY" },
    { kind: "rathaus", selectedPoliticianId: 1 },
    { kind: "anderes" },
  ])("weist eine ungültige Auswahl am finalen API-Boundary ab", async (selection) => {
    const response = await POST(requestWith({ wizardData: {}, selection }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Ungültige Anfrage." });
  });

  it("maps a staged provider 400 to a technical upstream response", async () => {
    jest.mocked(checkRateLimit).mockReturnValue({ allowed: true });
    jest.mocked(hashIdentifier).mockReturnValue("hashed");
    jest.mocked(resolveRecipientSelection).mockReturnValue({
      ok: true,
      availableCount: 1,
      relation: "institutional",
      recipient: {
        kind: "rathaus",
        level: "Kommune",
        recipientKind: "buergermeisteramt",
        gemeindeName: "Musterstadt",
        plz: "28203",
        label: "Bürgermeisteramt Musterstadt",
        postalAddress: "Musterstraße 1",
        address: { source: "fallback" },
      },
    });
    jest.mocked(generateLetter).mockRejectedValue(
      new MistralStageError("generation", Object.assign(new Error("Bad schema"), { status: 400 })),
    );

    const response = await POST(requestWith({
      wizardData: {
        plz: "28203",
        email: "test@example.org",
        issueText: "Ein ausreichend langes Anliegen für den Test.",
        letterLength: "1.5",
        toneLevel: 3,
      },
      selection: { kind: "rathaus" },
    }));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({
      errorId: expect.any(String),
      detail: { name: "MistralStageError", status: 400, stage: "generation" },
      retrySafe: true,
    });
  });

  describe("Meilenstein-Mail im after()-Block", () => {
    beforeEach(() => {
      jest.spyOn(console, "error").mockImplementation(() => undefined);
      jest.spyOn(console, "log").mockImplementation(() => undefined);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

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

    function arrange(campaign: unknown, letterNumber: number) {
      jest.mocked(checkRateLimit).mockReturnValue({ allowed: true });
      jest.mocked(hashIdentifier).mockReturnValue("hashed");
      jest.mocked(getActiveCampaignBySlug).mockResolvedValue(campaign as never);
      jest.mocked(incrementLetterCounters).mockResolvedValue(letterNumber);
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
    }

    function postLetter(campaign?: { slug: string; title: string }) {
      return POST(requestWith({
        wizardData: {
          plz: "28203",
          email: "test@example.org",
          issueText: "Ein ausreichend langes Anliegen für den Test.",
          letterLength: "1.5",
          toneLevel: 3,
          ...(campaign ? { campaign } : {}),
        },
        selection: { kind: "rathaus" },
      }));
    }

    async function runAfter() {
      expect(after).toHaveBeenCalledTimes(1);
      await (jest.mocked(after).mock.calls[0]![0] as () => Promise<void>)();
    }

    it("löst den Claim einmal für die laufende Kampagne aus", async () => {
      arrange(
        {
          slug: "laufende-kampagne",
          targetLevel: "Bund",
          targetState: null,
          targetRecipient: null,
          targetPoliticianIds: [],
          topic: null,
          endsAt: null,
        },
        1234,
      );

      const response = await postLetter({ slug: "laufende-kampagne", title: "Laufende Kampagne" });
      await runAfter();

      expect(response.status).toBe(200);
      expect(incrementLetterCounters).toHaveBeenCalledWith("laufende-kampagne");
      expect(claimAndSendCampaignMilestone).toHaveBeenCalledTimes(1);
      expect(claimAndSendCampaignMilestone).toHaveBeenCalledWith("laufende-kampagne");
    });

    it("löst keinen Claim für einen Brief ohne Kampagne aus", async () => {
      arrange(null, 1234);

      await postLetter();
      await runAfter();

      expect(claimAndSendCampaignMilestone).not.toHaveBeenCalled();
    });

    it("löst keinen Claim für eine beendete Kampagne aus", async () => {
      arrange(
        {
          slug: "alte-kampagne",
          targetLevel: "Bund",
          targetState: null,
          targetRecipient: null,
          targetPoliticianIds: [],
          topic: null,
          endsAt: "2026-01-01T22:59:59.000Z",
        },
        1234,
      );

      await postLetter({ slug: "alte-kampagne", title: "Alte Kampagne" });
      await runAfter();

      expect(claimAndSendCampaignMilestone).not.toHaveBeenCalled();
    });
  });
});
