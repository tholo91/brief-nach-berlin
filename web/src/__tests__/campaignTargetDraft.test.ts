import { normalizeCampaignTargetDraft } from "@/lib/campaigns/targetDraft";

const base = {
  targetLevel: "Fixed" as const,
  targetState: "HE",
  targetMode: "specific",
  targetPoliticianIds: [1, 2],
  fixedOrganizationName: "Beispielorganisation",
  fixedPersonName: "Frau Dr. Beispiel",
  fixedSalutation: "Sehr geehrte Frau Dr. Beispiel,",
  fixedStreet: "Beispielstraße",
  fixedHouseNumber: "1",
  fixedPostalCode: "12345",
  fixedCity: "Beispielstadt",
};

describe("campaign target draft normalization", () => {
  it("behält bei Fixed die Adresse und löscht Land/MdB-Daten", () => {
    expect(normalizeCampaignTargetDraft(base)).toEqual({
      ...base,
      targetState: "",
      targetMode: "default",
      targetPoliticianIds: [],
    });
  });

  it.each(["Bund", "Land"] as const)(
    "löscht beim Wechsel zu %s alle Fixed-Adressfelder",
    (targetLevel) => {
      const result = normalizeCampaignTargetDraft({ ...base, targetLevel });
      expect(result).toMatchObject({
        fixedOrganizationName: "",
        fixedPersonName: "",
        fixedSalutation: "Sehr geehrte Damen und Herren,",
        fixedStreet: "",
        fixedHouseNumber: "",
        fixedPostalCode: "",
        fixedCity: "",
      });
    },
  );

  it("behält ein Bundesland ausschließlich bei Land", () => {
    expect(normalizeCampaignTargetDraft({ ...base, targetLevel: "Land" }).targetState).toBe("HE");
    expect(normalizeCampaignTargetDraft({ ...base, targetLevel: "Bund" }).targetState).toBe("");
  });
});
