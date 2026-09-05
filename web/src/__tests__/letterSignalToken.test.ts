jest.mock("server-only", () => ({}), { virtual: true });

import {
  bindLetterSignalIssue,
  createGenerationProof,
  createLetterSignalContext,
  doesGenerationProofMatch,
  hashLetterSignalEmail,
  verifyGenerationProof,
  verifyLetterSignalContext,
} from "@/lib/letterSignals/token";
import { buildLetterSignalContext } from "@/lib/letterSignals/context";
import type { LetterSignalContext } from "@/lib/letterSignals/types";
import type { LandesregierungRecipient } from "@/lib/lookup/landesregierungRecipient";

const signal: LetterSignalContext = {
  letterId: "6f5a0e93-3bb8-43cf-bb94-9bb7d0052ed0",
  plz: "28203",
  bundeslandKey: "HB",
  politicalLevel: "Land" as const,
  recipientKind: "landesregierung" as const,
  issueBinding: "b".repeat(64),
  topicCategories: ["bildung"],
  topicLabels: ["Lehrermangel"],
  topicTaxonomyVersion: "v1",
  topicSource: "routing" as const,
  topicModel: "mistral-small-latest",
  campaignSlug: null,
  emailLookupHash: "a".repeat(64),
};

const recipient: LandesregierungRecipient = {
  kind: "landesregierung",
  level: "Land",
  institutionKind: "senat",
  bundeslandKey: "HB",
  bundeslandName: "Bremen",
  label: "Senat der Freien Hansestadt Bremen",
  officeName: "Senatskanzlei",
  postalAddress: "Am Markt 21, 28195 Bremen",
  address: {
    addressLines: ["Am Markt 21", "28195 Bremen"],
    sourceTitle: "Test",
    sourceUrl: "https://example.org",
    sourceStand: "2026-09-02",
  },
};

describe("letter signal tokens", () => {
  const originalSecret = process.env.LETTER_SIGNAL_TOKEN_SECRET;
  const originalEmailHashSecret = process.env.LETTER_SIGNAL_EMAIL_HASH_SECRET;

  beforeEach(() => {
    process.env.LETTER_SIGNAL_TOKEN_SECRET = "test-letter-signal-secret";
    process.env.LETTER_SIGNAL_EMAIL_HASH_SECRET = "test-letter-signal-email-hash-secret";
  });

  afterAll(() => {
    if (originalSecret === undefined) delete process.env.LETTER_SIGNAL_TOKEN_SECRET;
    else process.env.LETTER_SIGNAL_TOKEN_SECRET = originalSecret;
    if (originalEmailHashSecret === undefined) delete process.env.LETTER_SIGNAL_EMAIL_HASH_SECRET;
    else process.env.LETTER_SIGNAL_EMAIL_HASH_SECRET = originalEmailHashSecret;
  });

  it("round-trips a purpose-bound context without letter or issue text", () => {
    const token = createLetterSignalContext(signal, 1_700_000_000);
    const verified = verifyLetterSignalContext(token, 1_700_000_030);

    expect(verified).toMatchObject(signal);
    expect(token).not.toContain("Lehrermangel");
    expect(token).not.toContain("anliegen");
  });

  it("rejects tampered, expired and wrong-purpose tokens", () => {
    const context = createLetterSignalContext(signal, 1_700_000_000);
    const proof = createGenerationProof(signal.letterId, 1_700_000_000);

    expect(verifyLetterSignalContext(`${context}x`, 1_700_000_030)).toBeNull();
    expect(verifyLetterSignalContext(context, 1_700_086_401)).toBeNull();
    expect(verifyGenerationProof(context, 1_700_000_030)).toBeNull();
    expect(verifyLetterSignalContext(proof, 1_700_000_030)).toBeNull();
  });

  it("binds a proof to exactly one generated letter", () => {
    const proof = createGenerationProof(signal.letterId, 1_700_000_000);

    expect(verifyGenerationProof(proof, 1_700_000_030)).toMatchObject({ letterId: signal.letterId });
  });

  it("binds a production proof to issue, postcode, recipient, campaign and letter", () => {
    const input = {
      letterId: signal.letterId,
      issueText: "Mehr Geld für Schulen",
      plz: "28203",
      recipient,
      letterText: "Sehr geehrte Damen und Herren, ...",
      campaignSlug: "schulfinanzierung",
    };
    const verified = verifyGenerationProof(createGenerationProof(input));

    expect(verified).not.toBeNull();
    expect(doesGenerationProofMatch(verified!, input)).toBe(true);
    expect(doesGenerationProofMatch(verified!, {
      ...input,
      letterText: "Manipulierter Brief",
    })).toBe(false);
  });

  it("uses a case- and whitespace-insensitive HMAC lookup", () => {
    expect(hashLetterSignalEmail(" Test@Example.org ")).toBe(
      hashLetterSignalEmail("test@example.org"),
    );
    expect(hashLetterSignalEmail("test@example.org")).not.toBe("test@example.org");
  });

  it("binds the complete normalized issue text", () => {
    const sharedPrefix = "a".repeat(1_600);
    expect(bindLetterSignalIssue(`${sharedPrefix} Ende A`)).not.toBe(
      bindLetterSignalIssue(`${sharedPrefix} Ende B`),
    );
    expect(bindLetterSignalIssue("  Mehr   Platz für Busse ")).toBe(
      bindLetterSignalIssue("Mehr Platz für Busse"),
    );
  });

  it("creates an immediate safe fallback topic when routing has no topic", () => {
    const built = buildLetterSignalContext({
      data: {
        locale: "de",
        plz: "28203",
        email: "test@example.org",
        issueText: "Ein politisches Anliegen",
        toneLevel: 3,
      },
      recipient,
      letterId: signal.letterId,
      topic: null,
      campaignSlug: null,
    });

    expect(built?.context).toMatchObject({
      topicCategories: ["sonstiges"],
      topicLabels: ["Allgemeines Anliegen"],
      topicSource: "routing_fallback",
      topicModel: "local-fallback",
    });
  });
});
