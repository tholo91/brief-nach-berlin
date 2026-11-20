import { STEP_INFO, validateClassLinkStep } from "@/components/schule/classLinkHelpers";
import { SCHULE_MAX_CHARS } from "@/lib/schule/youth";

describe("validateClassLinkStep", () => {
  it("blocks step 1 without Klasse or valid PLZ", () => {
    expect(validateClassLinkStep(1, { klasse: "", plz: "28195" })).toMatch(/Klassenstufe/);
    expect(validateClassLinkStep(1, { klasse: "7", plz: "2819" })).toMatch(/fünfstellige/);
    expect(validateClassLinkStep(1, { klasse: "7", plz: "28195" })).toBe("");
  });

  it("lets steps 2 and 3 pass and has no em dashes", () => {
    expect(validateClassLinkStep(2, { klasse: "", plz: "" })).toBe("");
    expect(validateClassLinkStep(3, { klasse: "", plz: "" })).toBe("");
    expect(JSON.stringify(STEP_INFO)).not.toMatch(/[–—]/);
  });
});

describe("validateClassLinkStep: Schule und Ort", () => {
  const base = { klasse: "7", plz: "28195" };

  it("lässt das optionale Feld leer oder gefüllt zu", () => {
    expect(validateClassLinkStep(1, base)).toBe("");
    expect(validateClassLinkStep(1, { ...base, schule: "" })).toBe("");
    expect(validateClassLinkStep(1, { ...base, schule: "   " })).toBe("");
    expect(validateClassLinkStep(1, { ...base, schule: "Oberschule am Leibnizplatz, Bremen" })).toBe("");
  });

  it("meldet nur die Länge", () => {
    expect(validateClassLinkStep(1, { ...base, schule: "x".repeat(SCHULE_MAX_CHARS) })).toBe("");
    expect(validateClassLinkStep(1, { ...base, schule: "x".repeat(SCHULE_MAX_CHARS + 1) })).toContain(
      String(SCHULE_MAX_CHARS),
    );
  });

  it("prüft Klasse und PLZ weiter zuerst", () => {
    expect(validateClassLinkStep(1, { klasse: "", plz: "28195", schule: "x".repeat(99) })).toMatch(/Klassenstufe/);
  });
});
