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
import {
  lockWizardToClassToken,
  resolveSchoolMode,
  resolveYouthLandMinister,
  resolveYouthLetterContext,
} from "@/lib/schule/youthContext";
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

describe("resolveYouthLetterContext: Schule und Ort", () => {
  const SCHULE = "Oberschule am Leibnizplatz, Bremen";

  it("nimmt die Schule nur aus dem signierten Token", () => {
    const withSchule = youthData({ classToken: signClassToken({ klasse: 7, plz: HB_PLZ, schule: SCHULE }) });
    expect(resolveYouthLetterContext(withSchule)).toEqual({ klasse: 12, viaClassLink: true, schule: SCHULE });
  });

  it("ignoriert eine vom Client mitgeschickte Schule", () => {
    const forged = {
      ...youthData({ classToken: signClassToken({ klasse: 7, plz: HB_PLZ }) }),
      schule: "Gefälschte Schule",
      classSchule: "Gefälschte Schule",
    };
    expect(resolveYouthLetterContext(forged)).toEqual({ klasse: 12, viaClassLink: true });
    const noToken = { ...youthData({ classToken: undefined }), schule: "Gefälschte Schule" };
    expect(resolveYouthLetterContext(noToken)).toEqual({ klasse: 12, viaClassLink: false });
    const badToken = { ...youthData({ classToken: "x.y" }), schule: "Gefälschte Schule" };
    expect(resolveYouthLetterContext(badToken)).toEqual({ klasse: 12, viaClassLink: false });
  });

  it("gibt Erwachsenen nie eine Schule", () => {
    const adult = youthData({
      audience: undefined,
      classToken: signClassToken({ klasse: 7, plz: HB_PLZ, schule: SCHULE }),
    });
    expect(resolveYouthLetterContext(adult)).toBeUndefined();
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

  it("ohne Ressort im Routing geht der Brief an Bildung, ohne Bildung an die Regierungsspitze", async () => {
    const routing = routingToken({ primary: { level: "Land", confidence: "high" } });
    expect(await selectPoliticianAction(youthData(), { kind: "mdb_later" }, routing)).toMatchObject({
      preCheckOk: true,
      recipient: { kind: "landesminister", ressort: "bildung", bundeslandKey: "HB" },
    });
    const berlin = youthData({ classToken: signClassToken({ klasse: 7, plz: BE_PLZ }) });
    expect(await selectPoliticianAction(berlin, { kind: "mdb_later" }, routing)).toMatchObject({
      preCheckOk: true,
      recipient: { kind: "landesregierung", addressee: "head", bundeslandKey: "BE" },
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

  it("Jugend ohne Klassen-Token darf Landesminister wählen, der Server löst Land und Ressort auf", async () => {
    const data = youthData({ classToken: undefined, plz: HB_PLZ });
    expect(await selectPoliticianAction(data, { kind: "landesminister", ressort: "bildung" })).toMatchObject({
      preCheckOk: true,
      recipient: { kind: "landesminister", ressort: "bildung", bundeslandKey: "HB" },
    });
    const ohneDaten = youthData({ classToken: undefined, plz: BE_PLZ });
    expect(await selectPoliticianAction(ohneDaten, { kind: "landesminister", ressort: "bildung" })).toMatchObject({
      error: "server_error",
    });
  });

  it("resolveYouthLandMinister: nur Jugend ohne Klassenlink und ohne Kampagne", () => {
    const routing = { primary: { level: "Land" as const } };
    const noLink = { audience: "jung", klasse: 7, plz: HB_PLZ };
    expect(resolveYouthLandMinister(noLink, routing)).toMatchObject({ kind: "landesminister", ressort: "bildung" });
    expect(resolveYouthLandMinister({ ...noLink, plz: BE_PLZ }, routing)).toBeNull();
    expect(resolveYouthLandMinister({ ...noLink, audience: undefined }, routing)).toBeNull();
    expect(resolveYouthLandMinister({ ...noLink, campaign: { slug: "k" } }, routing)).toBeNull();
    expect(resolveYouthLandMinister(youthData(), routing)).toBeNull();
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
