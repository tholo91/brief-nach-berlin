jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@/lib/lookup/plzLookup", () => {
  const actual = jest.requireActual("@/lib/lookup/plzLookup");
  return {
    ...actual,
    lookupPLZ: jest.fn((plz: string) => actual.lookupPLZ(plz)),
    getAllBundestagPoliticians: jest.fn(() => actual.getAllBundestagPoliticians()),
  };
});

import {
  campaignAllowedPoliticianIds,
  campaignBackupRecipient,
  campaignSelectionAllowed,
  resolveCampaignRecipientRule,
} from "@/lib/lookup/campaignRecipientRule";
import { parseCampaignPartyRule } from "@/lib/campaigns/schema";
import * as plzLookupModule from "@/lib/lookup/plzLookup";
import type { Politician } from "@/lib/types/politician";

const actualLookup = jest.requireActual("@/lib/lookup/plzLookup") as typeof plzLookupModule;
const allMdbs = actualLookup.getAllBundestagPoliticians();
const normalize = (value: string) => value.replace(/­/g, "").trim();

const backupRow = {
  organizationName: "Bundesministerium für Bildung, Familie, Senioren, Frauen und Jugend",
  personName: "Frau Bundesministerin Karin Prien",
  role: "Bundesministerin für Bildung, Familie, Senioren, Frauen und Jugend",
  salutation: "Sehr geehrte Frau Bundesministerin Prien,",
  street: "Glinkastraße",
  houseNumber: "24",
  postalCode: "10117",
  city: "Berlin",
  countryCode: "DE" as const,
};

const partyCampaign = {
  targetLevel: "Bund" as const,
  targetPoliticianIds: [] as number[],
  targetParties: ["CDU/CSU", "SPD"],
  backupRecipient: backupRow,
};

describe("campaignAllowedPoliticianIds", () => {
  beforeEach(() => jest.clearAllMocks());

  it("dedups IDs without a party rule and never loads the MdB list", () => {
    expect(
      campaignAllowedPoliticianIds({ targetLevel: "Bund", targetPoliticianIds: [7, 7, 999999] })
    ).toEqual({ restricted: true, allowedPoliticianIds: [7, 999999] });
    expect(plzLookupModule.getAllBundestagPoliticians).not.toHaveBeenCalled();
  });

  it("stays unrestricted without IDs and parties", () => {
    expect(
      campaignAllowedPoliticianIds({ targetLevel: "Bund", targetPoliticianIds: [] })
    ).toEqual({ restricted: false, allowedPoliticianIds: [] });
  });

  it("allows exactly the MdBs of the configured parties", () => {
    const result = campaignAllowedPoliticianIds(partyCampaign);
    expect(result.restricted).toBe(true);
    expect(result.allowedPoliticianIds.length).toBeGreaterThan(0);
    const byId = new Map(allMdbs.map((p) => [p.id, p]));
    for (const id of result.allowedPoliticianIds) {
      expect(["CDU/CSU", "SPD"]).toContain(normalize(byId.get(id)!.party));
    }
    const expected = allMdbs.filter((p) => ["CDU/CSU", "SPD"].includes(normalize(p.party)));
    expect(result.allowedPoliticianIds).toHaveLength(expected.length);
  });

  it("intersects parties with explicit IDs", () => {
    const spd = allMdbs.find((p) => p.party === "SPD")!;
    const linke = allMdbs.find((p) => p.party === "Die Linke")!;
    expect(
      campaignAllowedPoliticianIds({
        ...partyCampaign,
        targetPoliticianIds: [spd.id, linke.id],
      })
    ).toEqual({ restricted: true, allowedPoliticianIds: [spd.id] });
  });

  it("makes a typo visible: restricted with an empty list", () => {
    expect(
      campaignAllowedPoliticianIds({ ...partyCampaign, targetParties: ["CSU"] })
    ).toEqual({ restricted: true, allowedPoliticianIds: [] });
  });

  it("ignores the soft hyphen and surrounding whitespace on both sides", () => {
    const green = allMdbs.find((p) => normalize(p.party) === "BÜNDNIS 90/DIE GRÜNEN");
    expect(green).toBeDefined();
    const result = campaignAllowedPoliticianIds({
      ...partyCampaign,
      targetParties: ["  BÜNDNIS 90/DIE GRÜNEN "],
    });
    expect(result.allowedPoliticianIds).toContain(green!.id);
  });

  it("ignores target_parties outside Bund", () => {
    expect(
      campaignAllowedPoliticianIds({
        targetLevel: "Land",
        targetPoliticianIds: [],
        targetParties: ["SPD"],
      })
    ).toEqual({ restricted: false, allowedPoliticianIds: [] });
  });
});

describe("resolveCampaignRecipientRule", () => {
  beforeEach(() => jest.clearAllMocks());

  it("is unrestricted for no campaign", () => {
    expect(resolveCampaignRecipientRule(null, "28195")).toEqual({
      restricted: false,
      allowedPoliticianIds: [],
      backupRecipient: null,
    });
  });

  it("returns no backup for a PLZ with a coalition MdB (28195)", () => {
    expect(resolveCampaignRecipientRule(partyCampaign, "28195").backupRecipient).toBeNull();
  });

  it.each(["10243", "06249", "29216"])(
    "returns the backup for PLZ %s without a local party match",
    (plz) => {
      const rule = resolveCampaignRecipientRule(partyCampaign, plz);
      expect(rule.restricted).toBe(true);
      expect(rule.backupRecipient).toMatchObject({
        kind: "campaign_fixed",
        salutation: "Sehr geehrte Frau Bundesministerin Prien,",
        role: backupRow.role,
      });
    }
  );

  it("counts a list MdB as a local match", () => {
    const listMdb: Politician = {
      ...allMdbs.find((p) => p.party === "SPD")!,
      isDirect: false,
    };
    jest.mocked(plzLookupModule.lookupPLZ).mockReturnValueOnce({
      wahlkreisIds: [1],
      politicians: [listMdb],
    });
    expect(resolveCampaignRecipientRule(partyCampaign, "10243").backupRecipient).toBeNull();
  });

  it("falls back to today's nationwide search without a backup", () => {
    const rule = resolveCampaignRecipientRule(
      { ...partyCampaign, backupRecipient: null },
      "10243"
    );
    expect(rule.restricted).toBe(true);
    expect(rule.backupRecipient).toBeNull();
    expect(rule.allowedPoliticianIds.length).toBeGreaterThan(0);
  });

  it("does not look up the PLZ when no backup is configured", () => {
    resolveCampaignRecipientRule({ targetLevel: "Bund", targetPoliticianIds: [1] }, "10243");
    expect(plzLookupModule.lookupPLZ).not.toHaveBeenCalled();
  });

  it("ignores a backup without any restriction", () => {
    expect(
      campaignBackupRecipient({
        targetLevel: "Bund",
        targetPoliticianIds: [],
        backupRecipient: backupRow,
      })
    ).toBeNull();
  });
});

describe("campaignSelectionAllowed", () => {
  const withBackup = resolveCampaignRecipientRule(partyCampaign, "10243");
  const local = resolveCampaignRecipientRule(partyCampaign, "28195");

  it("accepts campaign_fixed only with a backup", () => {
    expect(campaignSelectionAllowed(withBackup, "campaign_fixed")).toBe(true);
    expect(campaignSelectionAllowed(local, "campaign_fixed")).toBe(false);
  });

  it("accepts mdb only with a non-empty allowed list", () => {
    expect(campaignSelectionAllowed(local, "mdb")).toBe(true);
    expect(
      campaignSelectionAllowed(
        resolveCampaignRecipientRule({ ...partyCampaign, targetParties: ["CSU"] }, "28195"),
        "mdb"
      )
    ).toBe(false);
  });

  it("rejects every other kind in a restricted campaign, allows all otherwise", () => {
    expect(campaignSelectionAllowed(local, "mdb_later")).toBe(false);
    expect(campaignSelectionAllowed(local, "rathaus")).toBe(false);
    expect(
      campaignSelectionAllowed(
        { restricted: false, allowedPoliticianIds: [], backupRecipient: null },
        "rathaus"
      )
    ).toBe(true);
  });
});

describe("parseCampaignPartyRule", () => {
  it("parses parties and a valid backup", () => {
    const result = parseCampaignPartyRule({
      target_level: "Bund",
      target_parties: [" SPD ", "", "CDU/CSU"],
      backup_recipient: backupRow,
    });
    expect(result.targetParties).toEqual(["SPD", "CDU/CSU"]);
    expect(result.backupRecipient?.role).toBe(backupRow.role);
  });

  it("tolerates an invalid backup without throwing", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(
      parseCampaignPartyRule({
        target_level: "Bund",
        target_parties: ["SPD"],
        backup_recipient: { salutation: "x" },
      })
    ).toEqual({ targetParties: ["SPD"], backupRecipient: null });
    spy.mockRestore();
  });

  it("returns empty values for other target levels and missing columns", () => {
    expect(
      parseCampaignPartyRule({
        target_level: "Land",
        target_parties: ["SPD"],
        backup_recipient: backupRow,
      })
    ).toEqual({ targetParties: [], backupRecipient: null });
    expect(parseCampaignPartyRule({ target_level: "Bund" })).toEqual({
      targetParties: [],
      backupRecipient: null,
    });
  });
});
