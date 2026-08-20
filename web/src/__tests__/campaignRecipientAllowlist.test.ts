jest.mock("@/lib/lookup/plzLookup", () => {
  const actual = jest.requireActual("@/lib/lookup/plzLookup");
  return { ...actual, lookupPLZ: jest.fn(), lookupPLZWithLevel: jest.fn() };
});

import { resolveRecipientSelection } from "@/lib/lookup/resolveRecipient";
import * as plzLookupModule from "@/lib/lookup/plzLookup";
import type { Politician } from "@/lib/types/politician";
import politiciansJson from "../../data/politicians-cache.json";

const mockedLookupPLZ = jest.mocked(plzLookupModule.lookupPLZ);

const localMdb: Politician = {
  id: 999999,
  politicianId: 999999,
  firstName: "Lokal",
  lastName: "MdB",
  title: null,
  party: "SPD",
  wahlkreisId: 1,
  wahlkreisName: "Bremen",
  level: "Bund",
  postalAddress: "Platz der Republik 1, 11011 Berlin",
  isDirect: true,
  abgeordnetenwatchUrl: null,
};

const campaignMdb = (politiciansJson as { bundestag: Politician[] }).bundestag[0]!;

describe("campaign recipient allowlist", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedLookupPLZ.mockReturnValue({ wahlkreisIds: [1], politicians: [localMdb] });
  });

  it("keeps only allowlisted local MdBs when the PLZ matches", () => {
    expect(
      resolveRecipientSelection("28195", { kind: "mdb", selectedPoliticianId: 999999 }, {
        allowedPoliticianIds: [999999, campaignMdb.id],
      })
    ).toMatchObject({ ok: true, recipient: { id: 999999 }, availableCount: 1 });
  });

  it("falls back to the allowlisted campaign people when no local match exists", () => {
    mockedLookupPLZ.mockReturnValue({ wahlkreisIds: [1], politicians: [localMdb] });
    expect(
      resolveRecipientSelection("28195", { kind: "mdb", selectedPoliticianId: campaignMdb.id }, {
        allowedPoliticianIds: [campaignMdb.id],
      })
    ).toMatchObject({ ok: true, recipient: { id: campaignMdb.id }, availableCount: 1 });
  });

  it("rejects a person outside the campaign allowlist", () => {
    expect(
      resolveRecipientSelection("28195", { kind: "mdb", selectedPoliticianId: 999999 }, {
        allowedPoliticianIds: [campaignMdb.id],
      })
    ).toEqual({ ok: false, reason: "not_found" });
  });
});
