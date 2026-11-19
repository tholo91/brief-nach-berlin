/**
 * Schulmodus serverseitig: PLZ, Klasse und Ebene kommen aus dem Klassen-Token,
 * nie aus der Client-Eingabe. Erwachsene bleiben unverändert. Mistral gemockt.
 */

jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@/lib/mistral", () => ({
  mistral: { chat: { complete: jest.fn() } },
  withMistralRetry: <T,>(_label: string, fn: () => Promise<T>) => fn(),
  MISTRAL_MODELS: { letter: "mistral-large-latest", levelRouting: "mistral-small-latest" },
  MistralStageError: class extends Error {},
}));
jest.mock("@/lib/letterSignals/context", () => ({ buildLetterSignalContext: jest.fn(() => null) }));
jest.mock("@/lib/campaigns/repository", () => ({ getPublicCampaignBySlug: jest.fn() }));
jest.mock("../../data/landesminister.json", () => ({
  lastUpdated: "2026-11-19",
  states: {
    HB: {
      stateName: "Bremen",
      ministers: [
        {
          ressorts: ["bildung"],
          officeName: "Der Senator für Kinder und Bildung",
          name: "Test Bildung",
          title: "Senator für Kinder und Bildung",
          salutation: "Sehr geehrter Herr Senator Bildung,",
          addressLines: ["Senator Test Bildung", "Der Senator für Kinder und Bildung", "Teststraße 1", "28195 Bremen"],
          source: { title: "Fixture", url: "https://example.org/bildung", verifiedAt: "2026-11-19" },
        },
      ],
    },
  },
}));

import { selectPoliticianAction } from "@/lib/actions/selectPolitician";
import { signClassToken } from "@/lib/schule/classToken";
import { lockWizardToClassToken, resolveSchoolMode } from "@/lib/schule/youthContext";
import { hashRoutingIssue, normalizeRoutingIssue, signRoutingToken } from "@/lib/lookup/routingToken";
import type { WizardData } from "@/lib/types/wizard";
import type { RoutingResult } from "@/lib/lookup/levelRouter";

const HB_PLZ = "28195";
const BE_PLZ = "10115";
const ISSUE = "Unsere Schultoiletten sind kaputt und es gibt kein Papier.";

beforeAll(() => {
  process.env.FEEDBACK_TOKEN_SECRET = "test-school-trust-secret";
});

function routingToken(routing: Partial<RoutingResult> & { primary: RoutingResult["primary"] }): string {
  return signRoutingToken({
    issueHash: hashRoutingIssue(normalizeRoutingIssue(ISSUE)),
    routing: { reasoning: "", ...routing },
  });
}

function youthData(overrides: Partial<WizardData> = {}): WizardData {
  return {
    plz: BE_PLZ,
    email: "schule@example.org",
    issueText: ISSUE,
    letterLength: "1",
    audience: "jung",
    klasse: 12,
    classToken: signClassToken({ klasse: 7, plz: HB_PLZ }),
    ...overrides,
  };
}

describe("lockWizardToClassToken", () => {
  it("setzt die PLZ aus dem gültigen Token statt aus der Client-Eingabe, die Klasse bleibt", () => {
    const data = youthData();
    lockWizardToClassToken(data);
    expect(data.plz).toBe(HB_PLZ);
    expect(data.klasse).toBe(12);
  });

  it("lässt Daten ohne Jugend-Audience oder mit ungültigem Token unverändert", () => {
    const adult = youthData({ audience: undefined });
    lockWizardToClassToken(adult);
    expect(adult.plz).toBe(BE_PLZ);
    expect(adult.klasse).toBe(12);

    const forged = youthData({ classToken: "a.b" });
    lockWizardToClassToken(forged);
    expect(forged.plz).toBe(BE_PLZ);
  });
});

describe("resolveSchoolMode", () => {
  it("gilt nur mit Jugend-Audience, gültigem Token und ohne Kampagne", () => {
    const token = signClassToken({ klasse: 7, plz: HB_PLZ, level: "Land" });
    expect(resolveSchoolMode({ audience: "jung", klasse: 7, classToken: token })).toEqual({
      plz: HB_PLZ,
      level: "Land",
    });
    expect(resolveSchoolMode({ audience: "jung", klasse: 7, classToken: signClassToken({ klasse: 7, plz: HB_PLZ }) }))
      .toEqual({ plz: HB_PLZ });
    expect(resolveSchoolMode({ klasse: 7, classToken: token })).toBeNull();
    expect(resolveSchoolMode({ audience: "jung", klasse: 7, classToken: "x" })).toBeNull();
    expect(
      resolveSchoolMode({ audience: "jung", klasse: 7, classToken: token, campaign: { slug: "kampagne" } })
    ).toBeNull();
  });
});

describe("selectPoliticianAction im Schulmodus", () => {
  it("nimmt PLZ aus dem Token und das Ressort aus dem signierten Routing, nicht die Client-Auswahl", async () => {
    const result = await selectPoliticianAction(
      youthData(),
      { kind: "mdb_later" },
      routingToken({ primary: { level: "Land", confidence: "high" }, ressort: "bildung" })
    );
    expect(result).toMatchObject({
      preCheckOk: true,
      recipient: { kind: "landesminister", bundeslandKey: "HB", ressort: "bildung" },
    });
  });

  it("Token-Ebene Bund liefert den MdB der Token-PLZ, nicht der Client-PLZ", async () => {
    const data = youthData({ classToken: signClassToken({ klasse: 7, plz: HB_PLZ, level: "Bund" }) });
    const result = await selectPoliticianAction(
      data,
      { kind: "landesregierung" },
      routingToken({ primary: { level: "Land", confidence: "high" }, ressort: "bildung" })
    );
    expect(result).toMatchObject({ preCheckOk: true, recipient: { kind: "mdb", level: "Bund" } });
    if (!("recipient" in result) || result.recipient.kind !== "mdb") throw new Error("expected mdb");
    expect(result.recipient.wahlkreisName).toMatch(/Bremen/);
  });

  it("ohne Ressort im Routing geht der Brief an die Regierungsspitze", async () => {
    const result = await selectPoliticianAction(
      youthData(),
      { kind: "mdb_later" },
      routingToken({ primary: { level: "Land", confidence: "high" } })
    );
    expect(result).toMatchObject({
      preCheckOk: true,
      recipient: { kind: "landesregierung", addressee: "head", bundeslandKey: "HB" },
    });
  });

  it("Erwachsene dürfen keine Landesminister wählen und behalten ihre Auswahl", async () => {
    const adult: WizardData = { ...youthData(), audience: undefined, klasse: undefined, classToken: undefined, plz: HB_PLZ };
    expect(await selectPoliticianAction(adult, { kind: "landesminister", ressort: "bildung" })).toMatchObject({
      error: "server_error",
    });
    expect(await selectPoliticianAction({ ...adult }, { kind: "landesregierung", addressee: "head" })).toMatchObject({
      preCheckOk: true,
      recipient: { kind: "landesregierung", addressee: "head" },
    });
  });

  it("Jugend ohne Klassen-Token bleibt wie bisher: Client-PLZ und Client-Auswahl", async () => {
    const data = youthData({ classToken: undefined, plz: HB_PLZ });
    const result = await selectPoliticianAction(data, { kind: "landesregierung" });
    expect(result).toMatchObject({
      preCheckOk: true,
      recipient: { kind: "landesregierung", addressee: "institution" },
    });
  });
});
