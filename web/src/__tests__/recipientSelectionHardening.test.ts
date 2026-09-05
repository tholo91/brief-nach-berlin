jest.mock("@/lib/lookup/resolveRecipient", () => ({
  resolveRecipientSelection: jest.fn(),
}));
jest.mock("@/lib/lookup/routingToken", () => ({
  verifyRoutingToken: jest.fn(),
  verifyRoutingTokenEnvelope: jest.fn(() => null),
  deriveRoutingLetterId: jest.fn(() => "11111111-1111-4111-8111-111111111111"),
}));
jest.mock("@/lib/letterSignals/context", () => ({ buildLetterSignalContext: jest.fn(() => null) }));
jest.mock("@/lib/moderation/moderateText", () => ({ moderateText: jest.fn() }));
jest.mock("@/lib/email/sendLetterEmail", () => ({
  sendLetterEmail: jest.fn(),
  prepareLetterEmail: jest.fn(),
}));
jest.mock("@/lib/email/buildDebugPayload", () => ({ buildResendDebugPayload: jest.fn() }));
jest.mock("@/lib/rateLimit", () => ({
  checkRateLimit: jest.fn(),
  getClientIp: jest.fn(),
  hashIdentifier: jest.fn(),
  LIMITS: {
    RESEND_PER_IP: { max: 3, windowMs: 3_600_000 },
    RESEND_PER_EMAIL: { max: 2, windowMs: 3_600_000 },
  },
}));

import { selectPoliticianAction } from "@/lib/actions/selectPolitician";
import { resendLetterAction } from "@/lib/actions/resendLetter";
import { resolveRecipientSelection } from "@/lib/lookup/resolveRecipient";
import { checkRateLimit } from "@/lib/rateLimit";
import { moderateText } from "@/lib/moderation/moderateText";
import { prepareLetterEmail, sendLetterEmail } from "@/lib/email/sendLetterEmail";
import { buildResendDebugPayload } from "@/lib/email/buildDebugPayload";
import { buildLetterSignalContext } from "@/lib/letterSignals/context";
import type { WizardData } from "@/lib/types/wizard";
import type { RecipientSelection } from "@/lib/lookup/rathausRecipient";
import { createGenerationProof } from "@/lib/letterSignals/token";

const mockedResolveRecipientSelection = jest.mocked(resolveRecipientSelection);
const mockedCheckRateLimit = jest.mocked(checkRateLimit);
const mockedModerateText = jest.mocked(moderateText);
const mockedPrepareLetterEmail = jest.mocked(prepareLetterEmail);
const mockedSendLetterEmail = jest.mocked(sendLetterEmail);
const mockedBuildResendDebugPayload = jest.mocked(buildResendDebugPayload);
const mockedBuildLetterSignalContext = jest.mocked(buildLetterSignalContext);

const data: WizardData = {
  plz: "50667",
  email: "test@example.org",
  issueText: "Lehrermangel an unserer Schule",
  letterLength: "1",
};

const mdbRecipient = {
  kind: "mdb" as const,
  politicianId: 1,
  title: null,
  wahlkreisId: 1,
  wahlkreisName: "Köln",
  level: "Bund" as const,
  id: 1,
  firstName: "Max",
  lastName: "Muster",
  party: "Test",
  state: "Nordrhein-Westfalen",
  constituency: "Köln",
  postalAddress: "Platz der Republik 1, 11011 Berlin",
  profileUrl: "https://example.org",
  committees: [],
  roles: [],
  isDirect: false,
  abgeordnetenwatchUrl: null,
};

describe("RecipientSelection server hardening", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.LANDTAG_ROUTING_ENABLED = "false";
    process.env.LETTER_PROMPT_LEVEL_AWARE = "true";
    process.env.LETTER_SIGNAL_TOKEN_SECRET = "recipient-selection-test-secret";
    mockedCheckRateLimit.mockReturnValue({ allowed: true });
    mockedResolveRecipientSelection.mockReturnValue({
      ok: true,
      recipient: mdbRecipient,
      availableCount: 1,
    });
  });

  it("weist eine strukturell ungültige Auswahl in selectPoliticianAction ab", async () => {
    const malformed = { kind: "mdb", selectedPoliticianId: "1" } as unknown as RecipientSelection;

    await expect(selectPoliticianAction({ ...data }, malformed)).resolves.toMatchObject({
      error: "server_error",
      message: "Ungültige Eingabe.",
    });
    expect(mockedResolveRecipientSelection).not.toHaveBeenCalled();
  });

  it("prüft eine MdL-Auswahl serverseitig auch ohne frühere Release-Flags", async () => {
    await expect(
      selectPoliticianAction({ ...data }, { kind: "mdl", selectedPoliticianId: 12 })
    ).resolves.toMatchObject({ preCheckOk: true });
    expect(mockedResolveRecipientSelection).toHaveBeenCalledWith("50667", {
      kind: "mdl",
      selectedPoliticianId: 12,
    });
  });

  it("prüft die Landesregierung serverseitig auch ohne frühere Release-Flags", async () => {
    await expect(
      selectPoliticianAction({ ...data }, { kind: "landesregierung" })
    ).resolves.toMatchObject({ preCheckOk: true });
    expect(mockedResolveRecipientSelection).toHaveBeenCalledWith("50667", {
      kind: "landesregierung",
    });
  });

  it("akzeptiert Landesregierung ohne Client-ID", async () => {
    mockedResolveRecipientSelection.mockReturnValue({
      ok: true,
      recipient: {
        kind: "landesregierung",
        level: "Land",
        institutionKind: "landesregierung",
        bundeslandKey: "NW",
        bundeslandName: "Nordrhein-Westfalen",
        label: "Landesregierung Nordrhein-Westfalen",
        officeName: "Staatskanzlei des Landes Nordrhein-Westfalen",
        postalAddress: "Amtliche Adresse",
        address: {
          addressLines: ["Amtliche Adresse"],
          sourceTitle: "Amtliche Quelle",
          sourceUrl: "https://www.land.nrw/",
          sourceStand: "2026-07-20",
        },
      },
      availableCount: 1,
    });

    await expect(
      selectPoliticianAction({ ...data }, { kind: "landesregierung" })
    ).resolves.toMatchObject({ preCheckOk: true });
    expect(mockedResolveRecipientSelection).toHaveBeenCalledWith("50667", {
      kind: "landesregierung",
    });
  });

  it("bleibt bei der Landesregierung auch mit früher deaktiviertem Prompt serverseitig", async () => {
    process.env.LANDTAG_ROUTING_ENABLED = "true";
    process.env.LETTER_PROMPT_LEVEL_AWARE = "false";

    await expect(
      selectPoliticianAction({ ...data }, { kind: "landesregierung" })
    ).resolves.toMatchObject({ preCheckOk: true });
    expect(mockedResolveRecipientSelection).toHaveBeenCalledWith("50667", {
      kind: "landesregierung",
    });
  });

  it("behält die numerische Legacy-Bund-Auswahl bei deaktiviertem Flag bei", async () => {
    await expect(selectPoliticianAction({ ...data }, 1)).resolves.toMatchObject({
      preCheckOk: true,
      recipient: mdbRecipient,
    });
    expect(mockedResolveRecipientSelection).toHaveBeenCalledWith("50667", {
      kind: "mdb",
      selectedPoliticianId: 1,
    });
  });

  it("mintet den freiwilligen Karten-Kontext schon beim Pre-Check vor der Briefgenerierung", async () => {
    mockedBuildLetterSignalContext.mockReturnValue({
      context: {} as never,
      token: "pre-generation-signal-context",
    });

    await expect(
      selectPoliticianAction({ ...data }, { kind: "mdb", selectedPoliticianId: 1 }),
    ).resolves.toMatchObject({
      preCheckOk: true,
      letterSignalContext: "pre-generation-signal-context",
    });
    expect(mockedBuildLetterSignalContext).toHaveBeenCalledWith(expect.objectContaining({
      data,
      recipient: mdbRecipient,
    }));
  });

  it("weist eine strukturell ungültige Auswahl in resendLetterAction vor Limits ab", async () => {
    const malformed = { kind: "rathaus", selectedPoliticianId: 1 } as unknown as RecipientSelection;

    await expect(resendLetterAction({ ...data }, malformed, "Ein gültiger Brieftext")).resolves.toMatchObject({
      error: "validation",
      message: "Ungültige Eingabe.",
    });
    expect(mockedCheckRateLimit).not.toHaveBeenCalled();
  });

  it("weist einen manipulierten Generierungsnachweis beim Resend ab", async () => {
    await expect(
      resendLetterAction(
        { ...data },
        { kind: "mdb", selectedPoliticianId: 1 },
        "Ein gültiger Brieftext",
        "not-a-valid-generation-proof",
      ),
    ).resolves.toMatchObject({ error: "validation" });
    expect(mockedCheckRateLimit).not.toHaveBeenCalled();
    expect(mockedSendLetterEmail).not.toHaveBeenCalled();
  });

  it("weist einen gültig signierten, aber kreuzgebundenen Resend ab", async () => {
    const proof = createGenerationProof({
      letterId: "11111111-1111-4111-8111-111111111111",
      issueText: data.issueText,
      plz: data.plz,
      recipient: mdbRecipient,
      letterText: "Ursprünglicher Brieftext",
      campaignSlug: null,
    });

    await expect(
      resendLetterAction(
        { ...data },
        { kind: "mdb", selectedPoliticianId: 1 },
        "Manipulierter Brieftext",
        proof,
      ),
    ).resolves.toMatchObject({ error: "validation" });
    expect(mockedModerateText).not.toHaveBeenCalled();
    expect(mockedSendLetterEmail).not.toHaveBeenCalled();
  });

  it("akzeptiert eine strukturell gültige Rathaus-Auswahl am Resend-Boundary", async () => {
    mockedModerateText.mockResolvedValue({ flagged: false, categories: [] });
    mockedBuildResendDebugPayload.mockReturnValue({} as never);
    mockedPrepareLetterEmail.mockReturnValue({ feedbackToken: "token", params: {} as never });
    mockedSendLetterEmail.mockResolvedValue({ success: true, messageId: "id" });
    await expect(
      resendLetterAction({ ...data }, { kind: "rathaus" }, "Ein gültiger Brieftext")
    ).resolves.toMatchObject({ success: true });
    expect(mockedResolveRecipientSelection).toHaveBeenCalledWith("50667", { kind: "rathaus" });
  });

  it("Resend leitet die Landesregierung erneut aus der PLZ ab", async () => {
    process.env.LANDTAG_ROUTING_ENABLED = "true";
    const recipient = {
      kind: "landesregierung" as const,
      level: "Land" as const,
      institutionKind: "landesregierung" as const,
      bundeslandKey: "NW",
      bundeslandName: "Nordrhein-Westfalen",
      label: "Landesregierung Nordrhein-Westfalen",
      officeName: "Staatskanzlei des Landes Nordrhein-Westfalen",
      postalAddress: "Amtliche Adresse",
      address: {
        addressLines: ["Amtliche Adresse"],
        sourceTitle: "Amtliche Quelle",
        sourceUrl: "https://www.land.nrw/",
        sourceStand: "2026-07-20",
      },
    };
    mockedResolveRecipientSelection.mockReturnValue({ ok: true, recipient, availableCount: 1 });
    mockedModerateText.mockResolvedValue({ flagged: false, categories: [] });
    mockedBuildResendDebugPayload.mockReturnValue({} as never);
    mockedPrepareLetterEmail.mockReturnValue({
      feedbackToken: "token",
      params: {} as never,
    });
    mockedSendLetterEmail.mockResolvedValue({ success: true, messageId: "id" });

    await expect(
      resendLetterAction({ ...data }, { kind: "landesregierung" }, "Ein gültiger Brieftext")
    ).resolves.toEqual({ success: true });
    expect(mockedResolveRecipientSelection).toHaveBeenCalledWith("50667", {
      kind: "landesregierung",
    });
    expect(mockedPrepareLetterEmail).toHaveBeenCalledWith(
      expect.objectContaining({ recipient })
    );
  });
});
