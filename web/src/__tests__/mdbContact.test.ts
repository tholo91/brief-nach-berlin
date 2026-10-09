import { buildMdbContacts, findOfficeRecord } from "@/lib/lookup/mdbContact";
import { lookupMdbContactAction } from "@/lib/actions/lookupMdbContact";

const records = [
  {
    bundestagId: "1",
    name: "Schneider (Erfurt), Carsten",
    party: "SPD",
    profileUrl: "https://www.bundestag.de/abgeordnete/biografien/S/schneider_carsten-1",
    constituencyOffice: { rawLines: ["Wahlkreisbüro Erfurt", "Hauptstraße 1", "99084 Erfurt"] },
  },
  {
    bundestagId: "2",
    name: "Hoffmann, Alexander",
    party: "CDU/CSU",
    profileUrl: "https://www.bundestag.de/abgeordnete/biografien/H/hoffmann_alexander-2",
  },
  {
    bundestagId: "3",
    name: "Hoffmann, Philip M. A.",
    party: "CDU/CSU",
    profileUrl: "https://www.bundestag.de/abgeordnete/biografien/H/hoffmann_philip-3",
  },
  {
    bundestagId: "4",
    name: "Wadephul, Dr. Johann David",
    party: "CDU/CSU",
    profileUrl: "https://www.bundestag.de/abgeordnete/biografien/W/wadephul_johann-4",
  },
];

describe("findOfficeRecord", () => {
  it("matches names with parenthesised place and extra first names", () => {
    expect(
      findOfficeRecord({ firstName: "Carsten", lastName: "Schneider", party: "SPD" }, records)?.bundestagId
    ).toBe("1");
    expect(
      findOfficeRecord({ firstName: "Johann", lastName: "Wadephul", party: "CDU/CSU" }, records)?.bundestagId
    ).toBe("4");
  });

  it("separates same last names by first name", () => {
    expect(
      findOfficeRecord({ firstName: "Philip", lastName: "Hoffmann", party: "CDU/CSU" }, records)?.bundestagId
    ).toBe("3");
  });

  it("returns null when party differs or nothing matches", () => {
    expect(
      findOfficeRecord({ firstName: "Carsten", lastName: "Schneider", party: "AfD" }, records)
    ).toBeNull();
    expect(
      findOfficeRecord({ firstName: "Jürgen", lastName: "Kögel", party: "AfD" }, records)
    ).toBeNull();
  });
});

describe("buildMdbContacts", () => {
  it("returns contacts with a profile link for a real PLZ", () => {
    const contacts = buildMdbContacts("28195");
    expect(contacts.length).toBeGreaterThan(0);
    for (const contact of contacts) {
      expect(contact.name.length).toBeGreaterThan(2);
      expect(contact.profileUrl).toMatch(/^https:\/\//);
    }
  });

  it("returns an empty list for an unknown PLZ", () => {
    expect(buildMdbContacts("00000")).toEqual([]);
  });
});

describe("lookupMdbContactAction", () => {
  it("rejects malformed PLZ", async () => {
    expect(await lookupMdbContactAction("28a95")).toEqual({ ok: false, reason: "invalid" });
  });

  it("reports unknown PLZ", async () => {
    expect(await lookupMdbContactAction("00000")).toEqual({ ok: false, reason: "not_found" });
  });

  it("returns contacts for a known PLZ", async () => {
    const result = await lookupMdbContactAction("28195");
    expect(result.ok).toBe(true);
  });
});
