jest.mock("@/lib/mistral", () => ({}));

import { describeSchoolRecipient } from "@/lib/schule/schoolRecipientView";
import type { Recipient } from "@/lib/lookup/rathausRecipient";

const minister: Recipient = {
  kind: "landesminister",
  level: "Land",
  ressort: "bildung",
  name: "Test Bildung",
  title: "Senatorin",
  salutation: "Sehr geehrte Frau Senatorin Bildung,",
  bundeslandKey: "HB",
  bundeslandName: "Bremen",
  label: "Senatorin Test Bildung",
  officeName: "Die Senatorin für Kinder und Bildung",
  postalAddress: "Senatorin Test Bildung, Rembertiring 8-12, 28195 Bremen",
  address: {
    addressLines: ["Senatorin Test Bildung", "Die Senatorin für Kinder und Bildung", "Rembertiring 8-12", "28195 Bremen"],
    sourceTitle: "Quelle",
    sourceUrl: "https://example.org",
    sourceStand: "2026-11-19",
  },
};

describe("describeSchoolRecipient", () => {
  it("shows a minister with office and the address without the repeated name", () => {
    expect(describeSchoolRecipient(minister)).toEqual({
      badge: "Landesregierung",
      name: "Senatorin Test Bildung",
      office: "Die Senatorin für Kinder und Bildung",
      addressLines: ["Die Senatorin für Kinder und Bildung", "Rembertiring 8-12", "28195 Bremen"],
    });
  });

  it("shows an MdB with title, party and Wahlkreis", () => {
    const view = describeSchoolRecipient({
      kind: "mdb",
      id: 1,
      politicianId: 1,
      firstName: "Anna",
      lastName: "Beispiel",
      title: "Dr.",
      party: "SPD",
      wahlkreisId: 54,
      wahlkreisName: "Bremen I",
      level: "Bund",
      postalAddress: "Platz der Republik 1, 11011 Berlin",
      isDirect: true,
      abgeordnetenwatchUrl: null,
    });
    expect(view).toEqual({
      badge: "Bundestag",
      name: "Dr. Anna Beispiel (SPD)",
      office: "Wahlkreis Bremen I",
      addressLines: ["Platz der Republik 1, 11011 Berlin"],
    });
  });

  it("shows a Rathaus with the official address and survives a missing one", () => {
    const base = {
      kind: "rathaus" as const,
      level: "Kommune" as const,
      recipientKind: "buergermeisteramt" as const,
      gemeindeName: "Köln",
      plz: "50667",
      label: "Bürgermeisteramt Köln",
      postalAddress: "Bürgermeisteramt Köln",
    };
    expect(
      describeSchoolRecipient({
        ...base,
        address: {
          source: "official",
          sourceName: "Destatis",
          streetAddress: "Rathausplatz 1",
          postalCode: "50667",
          city: "Köln",
          sourceTitle: "t",
          sourceUrl: "https://example.org",
          sourceStand: "2026-01-01",
        },
      }),
    ).toEqual({ badge: "Rathaus", name: "Bürgermeisteramt Köln", addressLines: ["Rathausplatz 1", "50667 Köln"] });
    expect(describeSchoolRecipient({ ...base, address: { source: "fallback" } }).addressLines).toEqual([]);
  });
});
