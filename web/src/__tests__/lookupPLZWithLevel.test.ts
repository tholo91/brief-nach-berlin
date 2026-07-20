/**
 * Datengetriebene Tests für den ebenen-bewussten PLZ-Lookup (999.6).
 * Läuft gegen die echten Build-Artefakte (politicians-cache,
 * plz-bundesland-mapping, plz-landtagswahlkreis-mapping).
 */

import { lookupPLZWithLevel, buildCoverageHint, lookupPLZ } from "@/lib/lookup/plzLookup";
import plzBundesland from "../../data/plz-bundesland-mapping.json";

const STATE_KEYS = [
  "BB", "BE", "BW", "BY", "HB", "HE", "HH", "MV",
  "NI", "NW", "RP", "SH", "SL", "SN", "ST", "TH",
] as const;

describe("lookupPLZWithLevel", () => {
  it("NRW-PLZ (50667 Köln): Land abgedeckt, Kommune = Bürgermeisteramt Köln", () => {
    const r = lookupPLZWithLevel("50667");
    expect(r.bundeslandKey).toBe("NW");
    expect(r.coverage.landSupported).toBe(true);
    expect(r.byLevel.Land).toHaveLength(1);
    expect(r.byLevel.Land[0]).toMatchObject({
      kind: "landesregierung",
      level: "Land",
      bundeslandKey: "NW",
    });
    expect(r.optionalByLevel.Land.length).toBeGreaterThan(0);
    expect(r.byLevel.Kommune).toHaveLength(1);
    expect(r.byLevel.Kommune[0].label).toBe("Bürgermeisteramt Köln");
    expect(r.byLevel.Kommune[0].address.source).toBe("destatis");
    expect(r.byLevel.Bund.length).toBeGreaterThan(0);
    expect(r.coverage.landAmbiguous).toBe(true);
    expect(r.coverage.landWahlkreisIds.length).toBeGreaterThan(1);
  });

  it.each(STATE_KEYS)("%s erhält aus einer realen PLZ genau einen Regierungs-Default", (key) => {
    const plz = Object.entries(plzBundesland).find(([, entry]) => entry.bundeslandKey === key)?.[0];
    expect(plz).toBeTruthy();
    const result = lookupPLZWithLevel(plz!);
    expect(result.byLevel.Land).toHaveLength(1);
    expect(result.byLevel.Land[0]).toMatchObject({
      kind: "landesregierung",
      bundeslandKey: key,
    });
  });

  it("Bremen 28203 zeigt genau den Senat als Default und hält 72 MdLs optional", () => {
    const result = lookupPLZWithLevel("28203");
    expect(result.byLevel.Land).toHaveLength(1);
    expect(result.byLevel.Land[0]).toMatchObject({
      institutionKind: "senat",
      bundeslandKey: "HB",
    });
    expect(result.optionalByLevel.Land).toHaveLength(72);
  });

  it("Hamburg (20095): Einheitsgemeinde, keine Kommune, aber Senat (Land)", () => {
    const r = lookupPLZWithLevel("20095");
    expect(r.bundeslandKey).toBe("HH");
    expect(r.byLevel.Kommune).toHaveLength(0);
    expect(r.coverage.kommuneSupported).toBe(false);
    expect(r.coverage.stadtstaatEinheitsgemeinde).toBe(true);
    expect(r.coverage.landSupported).toBe(true);
    expect(r.byLevel.Land).toHaveLength(1);
    expect(r.byLevel.Land[0].institutionKind).toBe("senat");
  });

  it("Berlin (10245): mehrere Bezirke werden ehrlich als mehrdeutig behandelt", () => {
    const r = lookupPLZWithLevel("10245");
    expect(r.bundeslandKey).toBe("BE");
    expect(r.byLevel.Kommune).toHaveLength(1);
    expect(r.byLevel.Kommune[0].recipientKind).toBe("bezirksamt");
    expect(r.byLevel.Kommune[0].label).toBe("Zuständiges Bezirksamt in Berlin");
    expect(r.byLevel.Kommune[0].label).not.toContain("Friedrichshain-Kreuzberg");
    expect(r.byLevel.Kommune[0].address).toEqual({ source: "fallback" });
    expect(r.coverage.kommuneAmbiguous).toBe(true);
    expect(r.coverage.kommuneBezirke).toEqual(["Friedrichshain-Kreuzberg", "Pankow"]);
    expect(r.coverage.landSupported).toBe(true);
    expect(r.byLevel.Land).toHaveLength(1);
    expect(r.byLevel.Land[0].institutionKind).toBe("senat");
  });

  it("Berlin mit genau einem Bezirk behält die konkrete Bezirksamts-Zuordnung", () => {
    const r = lookupPLZWithLevel("10115");
    expect(r.coverage.kommuneAmbiguous).toBe(false);
    expect(r.coverage.kommuneBezirke).toEqual(["Mitte"]);
    expect(r.byLevel.Kommune[0].label).toBe("Bezirksamt Mitte");
    expect(r.byLevel.Kommune[0].address).toEqual({ source: "fallback" });
  });

  it.each([
    ["47051", "Bürgermeisteramt Duisburg", "Burgplatz 19", "47051", "Duisburg"],
    ["32105", "Bürgermeisteramt Bad Salzuflen", "Rudolph-Brandes-Allee 19", "32105", "Bad Salzuflen"],
    ["65183", "Bürgermeisteramt Wiesbaden", "Schlossplatz 6", "65183", "Wiesbaden"],
    ["60311", "Bürgermeisteramt Frankfurt am Main", "Römerberg 23", "60311", "Frankfurt am Main"],
  ])(
    "%s nutzt die vollständige Destatis-Anschrift",
    (plz, label, streetAddress, postalCode, city) => {
      const recipient = lookupPLZWithLevel(plz).byLevel.Kommune[0];
      expect(recipient.label).toBe(label);
      expect(recipient.address).toMatchObject({
        source: "destatis",
        streetAddress,
        postalCode,
        city,
        sourceStand: "31.01.2026",
      });
    }
  );

  it("Frankfurter Großempfänger-PLZ wird nicht riskant über den Kreis zugeordnet", () => {
    const recipient = lookupPLZWithLevel("60261").byLevel.Kommune[0];
    expect(recipient.label).toBe("Zuständiges Bürgermeisteramt");
    expect(recipient.address).toEqual({ source: "fallback" });
    expect(recipient.postalAddress).toBe("Zuständiges Bürgermeisteramt");
  });

  it("unbekannte PLZ (00000): keine Anreicherung, Ebenen leer bis auf Bund-Fallback", () => {
    const r = lookupPLZWithLevel("00000");
    expect(r.bundeslandKey).toBeNull();
    expect(r.byLevel.Land).toHaveLength(0);
    expect(r.byLevel.Kommune).toHaveLength(0);
    // Bund behält den heutigen Fallback-Eintrag (id -1)
    expect(r.byLevel.Bund).toHaveLength(1);
    expect(r.byLevel.Bund[0].id).toBe(-1);
  });

  it("Legacy-lookupPLZ liefert nur Bundestagsabgeordnete (keine MdL-Kollisionen)", () => {
    // Landtagswahlkreis-Nummern kollidieren mit BTW-Nummern; seit landtag[]
    // befüllt ist, darf der flache Lookup nur bundestag[] filtern.
    const { politicians } = lookupPLZ("50667");
    expect(politicians.every((p) => p.level === "Bund")).toBe(true);
  });
});

describe("buildCoverageHint", () => {
  it("Land empfohlen, aber nicht abgedeckt: ehrlicher Beta-Fallback ohne Gedankenstrich", () => {
    const r = lookupPLZWithLevel("50667");
    const hint = buildCoverageHint(
      { ...r, coverage: { ...r.coverage, landSupported: false } },
      "Land"
    );
    expect(hint).toContain("in der Beta noch nicht sauber abgedeckt");
    expect(hint).toContain("Bundestagsabgeordneten");
    expect(hint).not.toContain("—");
    expect(hint).not.toContain("weitergeben");
  });

  it("Kommune in Stadtstaat: erklärt die Einheitsgemeinde", () => {
    const r = lookupPLZWithLevel("20095");
    const hint = buildCoverageHint(r, "Kommune");
    expect(hint).toContain("Hamburg");
    expect(hint).toContain("Land");
    expect(hint).toContain("Senat der Freien und Hansestadt Hamburg");
    expect(hint).not.toContain("Abgeordnet");
  });

  it("abgedeckte Ebene: kein Hinweis", () => {
    const r = lookupPLZWithLevel("50667");
    expect(buildCoverageHint(r, "Land")).toBeNull();
    expect(buildCoverageHint(r, "Bund")).toBeNull();
  });
});
