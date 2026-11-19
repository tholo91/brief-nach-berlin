/**
 * Schulmodus-Empfänger: Token-Ebene vor Router, Landesminister nach Ressort,
 * Regierungsspitze als Fallback. Die Ministerdaten sind eine Inline-Fixture.
 */

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
        {
          ressorts: ["umwelt"],
          officeName: "Die Senatorin für Umwelt",
          name: "Test Umwelt",
          title: "Senatorin für Umwelt",
          salutation: "Sehr geehrte Frau Senatorin Umwelt,",
          addressLines: ["Senatorin Test Umwelt", "Die Senatorin für Umwelt", "Teststraße 2", "28195 Bremen"],
          source: { title: "Fixture", url: "https://example.org/umwelt", verifiedAt: "2026-11-19" },
          unverified: true,
        },
      ],
    },
  },
}));

import { resolveSchoolRecipient } from "@/lib/schule/schoolRecipient";
import { resolveRecipientSelection } from "@/lib/lookup/resolveRecipient";
import { getLandesministerRecipient } from "@/lib/lookup/landesministerRecipient";
import { recipientSelectionSchema } from "@/lib/validation/wizardSchemas";

const HB_PLZ = "28195";
const BE_PLZ = "10115";

describe("getLandesministerRecipient", () => {
  it("baut Fachminister:in aus Land und Ressort", () => {
    const minister = getLandesministerRecipient("HB", "bildung");
    expect(minister).toMatchObject({
      kind: "landesminister",
      level: "Land",
      ressort: "bildung",
      bundeslandKey: "HB",
      bundeslandName: "Bremen",
      salutation: "Sehr geehrter Herr Senator Bildung,",
      label: "Senator Test Bildung",
      officeName: "Der Senator für Kinder und Bildung",
    });
    expect(minister?.postalAddress).toBe(
      "Senator Test Bildung, Der Senator für Kinder und Bildung, Teststraße 1, 28195 Bremen"
    );
  });

  it("überspringt unverifizierte Einträge, unbekannte Länder und fehlende Ressorts", () => {
    expect(getLandesministerRecipient("HB", "umwelt")).toBeNull();
    expect(getLandesministerRecipient("HB", "verkehr")).toBeNull();
    expect(getLandesministerRecipient("NW", "bildung")).toBeNull();
  });

  it("toleriert fehlende Daten", () => {
    expect(getLandesministerRecipient("HB", "bildung", {})).toBeNull();
    expect(getLandesministerRecipient("HB", "bildung", { states: {} })).toBeNull();
  });
});

describe("resolveRecipientSelection landesminister", () => {
  it("löst Bundesland aus der PLZ und das Ressort aus der Auswahl auf", () => {
    const result = resolveRecipientSelection(HB_PLZ, { kind: "landesminister", ressort: "bildung" });
    expect(result).toMatchObject({ ok: true, relation: "institutional", recipient: { kind: "landesminister" } });
  });

  it("liefert not_found ohne verifizierten Eintrag oder in einem anderen Land", () => {
    expect(resolveRecipientSelection(HB_PLZ, { kind: "landesminister", ressort: "umwelt" })).toEqual({
      ok: false,
      reason: "not_found",
    });
    expect(resolveRecipientSelection(BE_PLZ, { kind: "landesminister", ressort: "bildung" })).toEqual({
      ok: false,
      reason: "not_found",
    });
  });

  it("die Auswahl nimmt nur einen Ressort-Code, keine Minister-ID", () => {
    expect(recipientSelectionSchema.safeParse({ kind: "landesminister", ressort: "bildung" }).success).toBe(true);
    expect(recipientSelectionSchema.safeParse({ kind: "landesminister", ressort: "zauberei" }).success).toBe(false);
    expect(
      recipientSelectionSchema.safeParse({ kind: "landesminister", ressort: "bildung", name: "x" }).success
    ).toBe(false);
  });
});

describe("resolveSchoolRecipient", () => {
  const land = (ressort?: "bildung" | "umwelt" | "verkehr") => ({
    primary: { level: "Land" as const },
    ressort,
  });

  it("Bremen + Ressort bildung: Fachminister:in mit Begründung", () => {
    const result = resolveSchoolRecipient({ plz: HB_PLZ, routing: land("bildung") });
    expect(result?.level).toBe("Land");
    expect(result?.selection).toEqual({ kind: "landesminister", ressort: "bildung" });
    expect(result?.recipient).toMatchObject({ kind: "landesminister", name: "Test Bildung" });
    expect(result?.reason).toBe(
      "Für dein Thema ist in Bremen der Senator für Kinder und Bildung zuständig."
    );
  });

  it("Bremen ohne Ressort: Schulkontext nimmt Bildung als Standard", () => {
    const result = resolveSchoolRecipient({ plz: HB_PLZ, routing: land() });
    expect(result?.selection).toEqual({ kind: "landesminister", ressort: "bildung" });
    expect(result?.recipient).toMatchObject({ kind: "landesminister", name: "Test Bildung" });
    expect(result?.reason).toContain("Schule");
  });

  it("ohne Ressort und ohne verifizierte Bildung im Land: Regierungsspitze", () => {
    const result = resolveSchoolRecipient({ plz: BE_PLZ, routing: land() });
    expect(result?.selection).toEqual({ kind: "landesregierung", addressee: "head" });
    expect(result?.reason).toContain("kein einzelnes Ressort");
  });

  it("Bremen ohne Ressort, Hauptthema Bildung: Fachminister:in Bildung", () => {
    const result = resolveSchoolRecipient({
      plz: HB_PLZ,
      routing: { primary: { level: "Land" }, topic: { topicCategories: ["bildung", "kultur_sport"] } },
    });
    expect(result?.selection).toEqual({ kind: "landesminister", ressort: "bildung" });
  });

  it("Bremen ohne Ressort, mehrdeutiges Hauptthema: Bildung als Standard", () => {
    const result = resolveSchoolRecipient({
      plz: HB_PLZ,
      routing: { primary: { level: "Land" }, topic: { topicCategories: ["kultur_sport", "bildung"] } },
    });
    expect(result?.recipient).toMatchObject({ kind: "landesminister", ressort: "bildung" });
  });

  it("Bremen mit Ressort ohne verifizierten Eintrag: Regierungsspitze", () => {
    const unverified = resolveSchoolRecipient({ plz: HB_PLZ, routing: land("umwelt") });
    const missing = resolveSchoolRecipient({ plz: HB_PLZ, routing: land("verkehr") });
    expect(unverified?.recipient).toMatchObject({ kind: "landesregierung", addressee: "head" });
    expect(missing?.recipient).toMatchObject({ kind: "landesregierung", addressee: "head" });
  });

  it("Token-Ebene Land schlägt den Router, Ressort kommt trotzdem aus dem Router", () => {
    const result = resolveSchoolRecipient({
      plz: HB_PLZ,
      tokenLevel: "Land",
      routing: { primary: { level: "Bund" }, ressort: "bildung" },
    });
    expect(result?.recipient).toMatchObject({ kind: "landesminister" });
  });

  it("Token-Ebene Bund: MdB des Wahlkreises, auch wenn der Router Land sagt", () => {
    const result = resolveSchoolRecipient({ plz: HB_PLZ, tokenLevel: "Bund", routing: land("bildung") });
    expect(result?.level).toBe("Bund");
    expect(result?.recipient).toMatchObject({ kind: "mdb", level: "Bund" });
    expect(result?.selection.kind).toBe("mdb");
    expect(result?.relation).toBe("local");
    expect(result?.reason).toContain("Bundestag");
  });

  it("automatisch ohne Routing: Bund", () => {
    expect(resolveSchoolRecipient({ plz: HB_PLZ, routing: null })?.recipient.kind).toBe("mdb");
  });

  it("automatisch, Router sagt Kommune: Rathaus, in Stadtstaaten die Regierungsspitze", () => {
    const stadtstaat = resolveSchoolRecipient({ plz: HB_PLZ, routing: { primary: { level: "Kommune" } } });
    expect(stadtstaat?.recipient).toMatchObject({ kind: "landesminister", ressort: "bildung" });

    const koeln = resolveSchoolRecipient({ plz: "50667", routing: { primary: { level: "Kommune" } } });
    expect(koeln?.level).toBe("Kommune");
    expect(koeln?.recipient.kind).toBe("rathaus");
    expect(koeln?.reason).toContain("vor Ort");
  });

  it("Kommune nur über automatisch: die Token-Ebene kennt kein Kommune", () => {
    // ClassLevel erlaubt nur Land und Bund; eine Kommune-Wahl ist nur über den Router möglich.
    const result = resolveSchoolRecipient({ plz: "50667", tokenLevel: "Land", routing: { primary: { level: "Kommune" } } });
    expect(result?.recipient.kind).toBe("landesregierung");
  });
});
