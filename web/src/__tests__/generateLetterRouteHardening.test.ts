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
jest.mock("@/lib/mistral", () => ({ MistralProviderUnavailableError: class extends Error {} }));

import { POST } from "@/app/api/generate-letter/route";

function requestWith(body: unknown) {
  return {
    json: async () => body,
    headers: new Headers(),
  } as Parameters<typeof POST>[0];
}

describe("generate-letter RecipientSelection hardening", () => {
  beforeEach(() => {
    process.env.LANDTAG_ROUTING_ENABLED = "false";
    process.env.LETTER_PROMPT_LEVEL_AWARE = "true";
  });

  it("sperrt Land/Kommune auch bei aktivem Routing, solange der Ebenen-Prompt aus ist", async () => {
    process.env.LANDTAG_ROUTING_ENABLED = "true";
    process.env.LETTER_PROMPT_LEVEL_AWARE = "false";

    const response = await POST(requestWith({
      wizardData: {},
      selection: { kind: "rathaus" },
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Empfänger nicht verfügbar." });
  });

  it.each([
    { kind: "mdl", selectedPoliticianId: 12 },
    { kind: "rathaus" },
  ])("sperrt $kind am finalen API-Boundary, wenn das Flag aus ist", async (selection) => {
    const response = await POST(requestWith({ wizardData: {}, selection }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Empfänger nicht verfügbar." });
  });

  it.each([
    { kind: "mdl", selectedPoliticianId: "12" },
    { kind: "rathaus", selectedPoliticianId: 1 },
    { kind: "anderes" },
  ])("weist eine ungültige Auswahl am finalen API-Boundary ab", async (selection) => {
    const response = await POST(requestWith({ wizardData: {}, selection }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Ungültige Anfrage." });
  });
});
