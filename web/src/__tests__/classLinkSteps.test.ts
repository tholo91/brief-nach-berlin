import { STEP_INFO, validateClassLinkStep } from "@/components/schule/classLinkHelpers";

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
