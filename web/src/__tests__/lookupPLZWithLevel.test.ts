/**
 * Datengetriebene Tests für den ebenen-bewussten PLZ-Lookup (999.6).
 * Läuft gegen die echten Build-Artefakte (politicians-cache,
 * plz-bundesland-mapping, plz-landtagswahlkreis-mapping).
 */

import { lookupPLZWithLevel, buildCoverageHint, lookupPLZ } from "@/lib/lookup/plzLookup";

describe("lookupPLZWithLevel", () => {
  it("NRW-PLZ (50667 Köln): Land abgedeckt, Kommune = Stadtverwaltung Köln", () => {
    const r = lookupPLZWithLevel("50667");
    expect(r.bundeslandKey).toBe("NW");
    expect(r.coverage.landSupported).toBe(true);
    expect(r.byLevel.Land.length).toBeGreaterThan(0);
    expect(r.byLevel.Land.every((p) => p.level === "Land" && p.bundeslandKey === "NW")).toBe(true);
    expect(r.byLevel.Kommune).toHaveLength(1);
    expect(r.byLevel.Kommune[0].label).toBe("Stadtverwaltung Köln");
    expect(r.byLevel.Bund.length).toBeGreaterThan(0);
  });

  it("Hamburg (20095): Einheitsgemeinde, keine Kommune, aber Bürgerschaft (Land)", () => {
    const r = lookupPLZWithLevel("20095");
    expect(r.bundeslandKey).toBe("HH");
    expect(r.byLevel.Kommune).toHaveLength(0);
    expect(r.coverage.kommuneSupported).toBe(false);
    expect(r.coverage.stadtstaatEinheitsgemeinde).toBe(true);
    expect(r.coverage.landSupported).toBe(true);
    expect(r.byLevel.Land.length).toBeGreaterThan(0);
  });

  it("Berlin (10245): Bezirksamt Friedrichshain-Kreuzberg + Abgeordnetenhaus", () => {
    const r = lookupPLZWithLevel("10245");
    expect(r.bundeslandKey).toBe("BE");
    expect(r.byLevel.Kommune).toHaveLength(1);
    expect(r.byLevel.Kommune[0].recipientKind).toBe("bezirksamt");
    expect(r.byLevel.Kommune[0].label).toContain("Bezirksamt");
    expect(r.coverage.landSupported).toBe(true);
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
  it("Land empfohlen, aber nicht abgedeckt: ehrlicher Bund-Übergang ohne Gedankenstrich", () => {
    const r = lookupPLZWithLevel("50667");
    const hint = buildCoverageHint(
      { ...r, coverage: { ...r.coverage, landSupported: false } },
      "Land"
    );
    expect(hint).toContain("kommt bald dazu");
    expect(hint).toContain("Bundestagsabgeordneten");
    expect(hint).not.toContain("—");
    expect(hint).not.toContain("weitergeben");
  });

  it("Kommune in Stadtstaat: erklärt die Einheitsgemeinde", () => {
    const r = lookupPLZWithLevel("20095");
    const hint = buildCoverageHint(r, "Kommune");
    expect(hint).toContain("Hamburg");
    expect(hint).toContain("Land");
  });

  it("abgedeckte Ebene: kein Hinweis", () => {
    const r = lookupPLZWithLevel("50667");
    expect(buildCoverageHint(r, "Land")).toBeNull();
    expect(buildCoverageHint(r, "Bund")).toBeNull();
  });
});
