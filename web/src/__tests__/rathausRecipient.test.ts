import {
  buildRathausRecipient,
  RathausRecipientNotApplicable,
} from "@/lib/lookup/rathausRecipient";

const officialAddress = {
  ags: "05315000",
  streetAddress: "Rathaus",
  postalCode: "50667",
  city: "Köln",
  sourceTitle: "Destatis: Anschriften der Gemeinde- und Stadtverwaltungen in Deutschland",
  sourceUrl: "https://www.destatis.de/anschriften",
  sourceStand: "31.01.2026",
};

describe("buildRathausRecipient", () => {
  it("baut ein Bürgermeisteramt ohne id/politicianId", () => {
    const recipient = buildRathausRecipient({
      gemeindeName: "Köln",
      plz: "50667",
      bundeslandKey: "NW",
    });

    expect(recipient).toEqual({
      kind: "rathaus",
      level: "Kommune",
      recipientKind: "buergermeisteramt",
      gemeindeName: "Köln",
      plz: "50667",
      label: "Zuständiges Bürgermeisteramt",
      postalAddress: "Zuständiges Bürgermeisteramt",
      address: { source: "fallback" },
    });
    expect("id" in recipient).toBe(false);
    expect("politicianId" in recipient).toBe(false);
  });

  it("übernimmt eine vollständige amtliche Anschrift", () => {
    const recipient = buildRathausRecipient({
      gemeindeName: "Köln",
      plz: "50667",
      bundeslandKey: "NW",
      officialAddress,
    });

    expect(recipient.address).toEqual({ source: "destatis", ...officialAddress });
    expect(recipient.postalAddress).toBe(
      "Bürgermeisteramt Köln, Rathaus, 50667 Köln"
    );
  });

  it("nutzt für Berlin das Bezirksamt und nie die Destatis-Senatsanschrift", () => {
    const recipient = buildRathausRecipient({
      gemeindeName: "Berlin",
      plz: "10245",
      bundeslandKey: "BE",
      bezirk: "Friedrichshain-Kreuzberg",
      officialAddress,
    });

    expect(recipient.recipientKind).toBe("bezirksamt");
    expect(recipient.label).toBe("Bezirksamt Friedrichshain-Kreuzberg");
    expect(recipient.postalAddress).toBe("Bezirksamt Friedrichshain-Kreuzberg");
    expect(recipient.address).toEqual({ source: "fallback" });
  });

  it("bleibt in Berlin ohne Bezirksdaten beim allgemeinen Bezirksamt", () => {
    const recipient = buildRathausRecipient({
      gemeindeName: "Berlin",
      plz: "10999",
      bundeslandKey: "BE",
      bezirk: null,
    });

    expect(recipient.recipientKind).toBe("bezirksamt");
    expect(recipient.label).toBe("Zuständiges Bezirksamt in Berlin");
  });

  it("wirft für Hamburg und Bremen (Einheitsgemeinde)", () => {
    expect(() =>
      buildRathausRecipient({ gemeindeName: "Hamburg", plz: "20095", bundeslandKey: "HH" })
    ).toThrow(RathausRecipientNotApplicable);
    expect(() =>
      buildRathausRecipient({ gemeindeName: "Bremen", plz: "28195", bundeslandKey: "HB" })
    ).toThrow(RathausRecipientNotApplicable);
  });
});
