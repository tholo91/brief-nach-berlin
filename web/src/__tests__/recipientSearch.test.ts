import {
  getAllBundestagPoliticians,
  getBundestagPoliticianBundesland,
  getLandtagPoliticiansForBundesland,
  lookupPLZ,
  lookupPLZWithLevel,
} from "@/lib/lookup/plzLookup";
import { resolveRecipientSelection } from "@/lib/lookup/resolveRecipient";
import {
  RECIPIENT_SEARCH_PAGE_SIZE,
  searchAlternativeRecipients,
} from "@/lib/lookup/recipientSearch";

describe("alternative recipient search", () => {
  const plz = "50667";

  it("wartet auf Partei oder mindestens zwei Suchzeichen", () => {
    expect(searchAlternativeRecipients({ level: "Bund", plz }).items).toEqual([]);
    expect(
      searchAlternativeRecipients({ level: "Bund", plz, query: "a" }).items
    ).toEqual([]);
  });

  it("kombiniert genau einen Partei-Filter mit dem Suchtext", () => {
    const candidate = getAllBundestagPoliticians().find(
      (person) =>
        person.party &&
        person.lastName.length >= 2 &&
        !lookupPLZ(plz).politicians.some((local) => local.id === person.id)
    );
    expect(candidate).toBeDefined();
    const result = searchAlternativeRecipients({
      level: "Bund",
      plz,
      party: candidate!.party,
      query: candidate!.lastName.slice(0, 2),
    });
    expect(result.items.some((person) => person.id === candidate!.id)).toBe(true);
    expect(result.items.every((person) => person.party === candidate!.party)).toBe(true);
  });

  it("liefert zwölf Treffer pro Seite und schließt lokale Duplikate aus", () => {
    const result = searchAlternativeRecipients({ level: "Bund", plz, party: "SPD" });
    const localIds = new Set(lookupPLZ(plz).politicians.map((person) => person.id));
    expect(result.items).toHaveLength(RECIPIENT_SEARCH_PAGE_SIZE);
    expect(result.items.every((person) => !localIds.has(person.id))).toBe(true);
    expect(result.nextOffset).toBe(RECIPIENT_SEARCH_PAGE_SIZE);
  });

  it("sortiert MdBs aus demselben Bundesland vor anderen Treffern", () => {
    const result = searchAlternativeRecipients({ level: "Bund", plz, party: "SPD" });
    const flags = result.items.map(
      (person) => getBundestagPoliticianBundesland(person) === "NW"
    );
    const firstForeign = flags.indexOf(false);
    if (firstForeign >= 0) {
      expect(flags.slice(firstForeign).every((flag) => !flag)).toBe(true);
    }
  });

  it("sucht Ausschüsse nur beim Bund", () => {
    const candidate = getAllBundestagPoliticians().find(
      (person) =>
        person.committees?.some((committee) => committee.length >= 2) &&
        !lookupPLZ(plz).politicians.some((local) => local.id === person.id)
    );
    expect(candidate).toBeDefined();
    const committee = candidate!.committees![0];
    const bundResult = searchAlternativeRecipients({ level: "Bund", plz, query: committee });
    expect(bundResult.total).toBeGreaterThan(0);
    expect(
      searchAlternativeRecipients({ level: "Land", plz, query: committee }).items
    ).toEqual([]);
  });

  it("begrenzt die Land-Suche auf das eigene Bundesland", () => {
    const result = searchAlternativeRecipients({ level: "Land", plz, party: "SPD" });
    const localIds = new Set(
      lookupPLZWithLevel(plz).optionalByLevel.Land.map((person) => person.id)
    );
    expect(result.items.every((person) => person.bundeslandKey === "NW")).toBe(true);
    expect(result.items.every((person) => !localIds.has(person.id))).toBe(true);
  });
});

describe("free recipient resolution", () => {
  const plz = "50667";

  it("akzeptiert jedes aktuelle MdB im freien Flow", () => {
    const localIds = new Set(lookupPLZ(plz).politicians.map((person) => person.id));
    const nonLocal = getAllBundestagPoliticians().find((person) => !localIds.has(person.id));
    const result = resolveRecipientSelection(plz, {
      kind: "mdb",
      selectedPoliticianId: nonLocal!.id,
    });
    expect(result).toMatchObject({ ok: true, relation: "outside_constituency" });
  });

  it("weist unbekannte IDs ab", () => {
    expect(
      resolveRecipientSelection(plz, { kind: "mdb", selectedPoliticianId: -999999 })
    ).toEqual({ ok: false, reason: "not_found" });
  });

  it("akzeptiert MdLs nur aus dem eigenen Bundesland", () => {
    const localIds = new Set(
      lookupPLZWithLevel(plz).optionalByLevel.Land.map((person) => person.id)
    );
    const sameState = getLandtagPoliticiansForBundesland("NW").find(
      (person) => !localIds.has(person.id)
    );
    const foreign = getLandtagPoliticiansForBundesland("BY")[0];
    expect(
      resolveRecipientSelection(plz, { kind: "mdl", selectedPoliticianId: sameState!.id })
    ).toMatchObject({ ok: true, relation: "outside_constituency" });
    expect(
      resolveRecipientSelection(plz, { kind: "mdl", selectedPoliticianId: foreign.id })
    ).toEqual({ ok: false, reason: "not_found" });
  });

  it("behält Kampagnen bei ihrer Allowlist", () => {
    const localIds = new Set(lookupPLZ(plz).politicians.map((person) => person.id));
    const target = getAllBundestagPoliticians().find((person) => !localIds.has(person.id))!;
    expect(
      resolveRecipientSelection(
        plz,
        { kind: "mdb", selectedPoliticianId: target.id },
        { campaignSlug: "test-kampagne", allowedPoliticianIds: [target.id] }
      )
    ).toMatchObject({ ok: true });
    expect(
      resolveRecipientSelection(
        plz,
        { kind: "mdb", selectedPoliticianId: target.id },
        { campaignSlug: "test-kampagne", allowedPoliticianIds: [] }
      )
    ).toEqual({ ok: false, reason: "not_found" });
  });

  it("erlaubt mdb_later nur ohne reale lokale MdBs", () => {
    expect(resolveRecipientSelection("29216", { kind: "mdb_later" })).toMatchObject({
      ok: true,
      relation: "unassigned",
      recipient: { kind: "mdb_later" },
    });
    expect(resolveRecipientSelection(plz, { kind: "mdb_later" })).toEqual({
      ok: false,
      reason: "not_found",
    });
  });
});
