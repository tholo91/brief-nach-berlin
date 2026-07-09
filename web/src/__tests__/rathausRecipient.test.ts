/**
 * Tests für den synthetischen Rathaus-Empfänger (LOCK-5):
 * kein politicianId, Stadtstaat-Verhalten, Adress-Konvention.
 */

import {
  buildRathausRecipient,
  RathausRecipientNotApplicable,
} from "@/lib/lookup/rathausRecipient";

describe("buildRathausRecipient", () => {
  it("baut eine Stadtverwaltung ohne id/politicianId", () => {
    const r = buildRathausRecipient({
      gemeindeName: "Köln",
      plz: "50667",
      bundeslandKey: "NW",
    });
    expect(r).toEqual({
      kind: "rathaus",
      level: "Kommune",
      recipientKind: "stadtverwaltung",
      gemeindeName: "Köln",
      plz: "50667",
      label: "Stadtverwaltung Köln",
      postalAddress: "Stadtverwaltung Köln, 50667 Köln",
    });
    expect("id" in r).toBe(false);
    expect("politicianId" in r).toBe(false);
  });

  it("nutzt für Berlin das Bezirksamt mit Bezirksnamen", () => {
    const r = buildRathausRecipient({
      gemeindeName: "Berlin",
      plz: "10245",
      bundeslandKey: "BE",
      bezirk: "Friedrichshain-Kreuzberg",
    });
    expect(r.recipientKind).toBe("bezirksamt");
    expect(r.label).toBe("Bezirksamt Friedrichshain-Kreuzberg");
    expect(r.postalAddress).toBe("Bezirksamt Friedrichshain-Kreuzberg, 10245 Berlin");
  });

  it("fällt in Berlin ohne Bezirksdaten auf die Stadtverwaltung zurück", () => {
    const r = buildRathausRecipient({
      gemeindeName: "Berlin",
      plz: "10999",
      bundeslandKey: "BE",
      bezirk: null,
    });
    expect(r.recipientKind).toBe("stadtverwaltung");
    expect(r.label).toBe("Stadtverwaltung Berlin");
  });

  it("wirft für Hamburg und Bremen (Einheitsgemeinde)", () => {
    expect(() =>
      buildRathausRecipient({ gemeindeName: "Hamburg", plz: "20095", bundeslandKey: "HH" })
    ).toThrow(RathausRecipientNotApplicable);
    expect(() =>
      buildRathausRecipient({ gemeindeName: "Bremen", plz: "28195", bundeslandKey: "HB" })
    ).toThrow(RathausRecipientNotApplicable);
  });

  it("nutzt Kommas als Adresszeilen-Trenner (buildEmailHtml-Konvention)", () => {
    const r = buildRathausRecipient({
      gemeindeName: "Bergisch Gladbach",
      plz: "51429",
      bundeslandKey: "NW",
    });
    const lines = r.postalAddress.split(",").map((s) => s.trim());
    expect(lines).toEqual(["Stadtverwaltung Bergisch Gladbach", "51429 Bergisch Gladbach"]);
  });
});
