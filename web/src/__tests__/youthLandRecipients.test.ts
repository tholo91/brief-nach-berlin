/**
 * Jugend ohne Klassenlink: Die Landesliste zeigt die Fachminister:in zuerst und vorausgewählt.
 * Erwachsene bleiben unverändert. Mistral gemockt.
 */

jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@/lib/mistral", () => ({
  mistral: { chat: { complete: jest.fn() } },
  withMistralRetry: <T,>(_label: string, fn: () => Promise<T>) => fn(),
  MISTRAL_MODELS: { letter: "mistral-large-latest", levelRouting: "mistral-small-latest" },
  MistralStageError: class extends Error {},
}));
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

import { resolveYouthLandMinister } from "@/lib/schule/youthContext";

const youth = { audience: "jung", klasse: 8, plz: "28195" };

describe("Jugend ohne Klassenlink, Landesebene", () => {
  it("bietet Fachminister:in aus Router-Ressort an", () => {
    expect(resolveYouthLandMinister(youth, { primary: { level: "Land" }, ressort: "bildung" })).toMatchObject({
      kind: "landesminister",
      ressort: "bildung",
      label: "Senator Test Bildung",
    });
  });

  it("nimmt Bildung, wenn Router und Thema kein Ressort nennen", () => {
    expect(resolveYouthLandMinister(youth, { primary: { level: "Land" } })).toMatchObject({ ressort: "bildung" });
    expect(resolveYouthLandMinister(youth, null)).toMatchObject({ ressort: "bildung" });
  });

  it("gibt für Erwachsene nichts zurück", () => {
    expect(resolveYouthLandMinister({ ...youth, audience: undefined, klasse: undefined }, null)).toBeNull();
  });

  it("gibt nichts zurück, wenn für das Land keine Daten vorliegen", () => {
    expect(resolveYouthLandMinister({ ...youth, plz: "10115" }, null)).toBeNull();
  });
});
