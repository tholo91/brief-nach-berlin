jest.mock("next/server", () => ({
  ...jest.requireActual("next/server"),
  after: jest.fn(),
}));
jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@/lib/lookup/resolveRecipient", () => ({ resolveRecipientSelection: jest.fn() }));
jest.mock("@/lib/lookup/routingToken", () => ({ verifyRoutingToken: jest.fn() }));
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
  checkRateLimit: jest.fn(() => ({ allowed: true })),
  checkOriginRateLimit: jest.fn(() => ({ allowed: true })),
  hashIdentifier: jest.fn(() => "hashed"),
  LIMITS: {
    LETTERS_PER_IP: { max: 10, windowMs: 3_600_000 },
    LETTERS_PER_EMAIL: { max: 3, windowMs: 86_400_000 },
  },
}));
jest.mock("@/lib/schule/classToken", () => ({
  verifyClassToken: jest.fn((token: unknown) =>
    token === "valid-token" ? { klasse: 8, plz: "28203", issuedAt: 0, bucketId: "bucket" } : null,
  ),
}));
jest.mock("@/lib/counter", () => ({ incrementLetterCounters: jest.fn(async () => 5) }));
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
jest.mock("@/lib/letterSignals/context", () => ({
  buildLetterSignalContext: jest.fn(() => ({ token: "signal-token", context: {} })),
  doesLetterSignalContextMatch: jest.fn(() => false),
}));
jest.mock("@/lib/mistral", () => ({
  MistralProviderUnavailableError: class extends Error {},
  MistralStageError: class extends Error {},
}));

import { after } from "next/server";
import { POST } from "@/app/api/generate-letter/route";
import { sendLetterEmail, prepareLetterEmail } from "@/lib/email/sendLetterEmail";
import { sendFollowupEmail } from "@/lib/email/sendFollowupEmail";
import { generateLetter } from "@/lib/generation/generateLetter";
import { resolveRecipientSelection } from "@/lib/lookup/resolveRecipient";
import { buildLetterSignalContext } from "@/lib/letterSignals/context";
import { markLetterSignalGeneratedAction } from "@/lib/actions/letterSignals";

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

function post(extra: Record<string, unknown> = {}, body: Record<string, unknown> = {}) {
  return POST({
    json: async () => ({
      wizardData: {
        plz: "28203",
        email: "test@example.org",
        issueText: "Ein ausreichend langes Anliegen für den Test.",
        letterLength: "1.5",
        toneLevel: 3,
        ...extra,
      },
      selection: { kind: "rathaus" },
      ...body,
    }),
    headers: new Headers(),
  } as Parameters<typeof POST>[0]);
}

async function runAfter() {
  expect(after).toHaveBeenCalledTimes(1);
  await (jest.mocked(after).mock.calls[0]![0] as () => Promise<void>)();
}

describe("generate-letter: Jugendmodus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => undefined);
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    process.env.BREVO_FOLLOWUP_ENABLED = "true";
    process.env.LETTER_SIGNAL_TOKEN_SECRET = "youth-route-test-secret";
    process.env.LETTER_SIGNAL_EMAIL_HASH_SECRET = "youth-route-email-test-secret";
    jest.mocked(resolveRecipientSelection).mockReturnValue({
      ok: true,
      availableCount: 1,
      relation: "institutional",
      recipient,
    });
    jest.mocked(generateLetter).mockResolvedValue({
      letter: "Ein Brief.",
      topic: null,
      selectedRecipient: recipient,
      selectedPolitician: null,
      politicalLevel: "Kommune",
      wordCount: 3,
      wordCountInRange: true,
      fallbackUsed: false,
      mdbContextUsed: false,
      retried: false,
      model: "test-model",
      temperature: 0,
      generationMs: 1,
    });
    jest.mocked(prepareLetterEmail).mockReturnValue({ params: {}, feedbackToken: "t" } as never);
    jest.mocked(sendLetterEmail).mockResolvedValue({ success: true });
    jest.mocked(sendFollowupEmail).mockResolvedValue({ success: true });
  });

  afterEach(() => {
    delete process.env.BREVO_FOLLOWUP_ENABLED;
  });

  it("reicht youth mit viaClassLink=true bei gültigem Klassen-Token durch", async () => {
    const response = await post({ audience: "jung", klasse: 8, classToken: "valid-token" });
    expect(response.status).toBe(200);
    expect(jest.mocked(generateLetter).mock.calls[0]![0].youth).toEqual({
      klasse: 8,
      viaClassLink: true,
    });
  });

  it("reicht youth mit viaClassLink=false ohne gültigen Token durch", async () => {
    await post({ audience: "jung", klasse: 10, classToken: "garbage" });
    expect(jest.mocked(generateLetter).mock.calls[0]![0].youth).toEqual({
      klasse: 10,
      viaClassLink: false,
    });
  });

  it("sendet im Jugendmodus nur die Briefkopie: keine Folge-Mail, kein Signal", async () => {
    const response = await post(
      { audience: "jung", klasse: 8 },
      { letterSignalContext: "ignored-token" },
    );
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.letterSignalContext).toBeNull();
    expect(buildLetterSignalContext).not.toHaveBeenCalled();

    await runAfter();
    expect(markLetterSignalGeneratedAction).not.toHaveBeenCalled();
    expect(sendFollowupEmail).not.toHaveBeenCalled();
    expect(sendLetterEmail).toHaveBeenCalledTimes(1);
    expect(jest.mocked(prepareLetterEmail).mock.calls[0]![0]).toMatchObject({ audience: "jung" });
  });

  it("fällt bei ungültiger Klasse auf den Erwachsenen-Flow zurück", async () => {
    const response = await post({ audience: "jung", klasse: 5, classToken: "valid-token" });
    expect(response.status).toBe(200);
    expect(jest.mocked(generateLetter).mock.calls[0]![0].youth).toBeUndefined();
    expect((await response.json()).letterSignalContext).toBe("signal-token");

    await runAfter();
    expect(markLetterSignalGeneratedAction).toHaveBeenCalledTimes(1);
    expect(sendFollowupEmail).toHaveBeenCalledTimes(1);
    expect(jest.mocked(prepareLetterEmail).mock.calls[0]![0].audience).toBeUndefined();
  });

  it("Erwachsenen-Request bleibt unverändert", async () => {
    const response = await post();
    expect((await response.json()).letterSignalContext).toBe("signal-token");
    expect(jest.mocked(generateLetter).mock.calls[0]![0].youth).toBeUndefined();

    await runAfter();
    expect(markLetterSignalGeneratedAction).toHaveBeenCalledTimes(1);
    expect(sendFollowupEmail).toHaveBeenCalledTimes(1);
    expect(jest.mocked(prepareLetterEmail).mock.calls[0]![0].audience).toBeUndefined();
  });
});
