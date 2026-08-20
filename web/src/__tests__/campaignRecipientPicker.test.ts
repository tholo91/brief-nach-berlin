import {
  bundRecipientsForCampaign,
  filterCampaignRecipients,
  initialPoliticianId,
  visibleLocalCampaignRecipients,
} from "@/lib/campaign-recipient-picker";

const direct = {
  id: 1,
  firstName: "Mahmut",
  lastName: "Özdemir",
  party: "SPD",
  wahlkreisName: "Duisburg II",
  isDirect: true,
  committees: ["Ausschuss für Arbeit und Soziales"],
};

const list = {
  id: 2,
  firstName: "Anna",
  lastName: "Beispiel",
  party: "Bündnis 90/Die Grünen",
  wahlkreisName: "Bremen I",
  isDirect: false,
  committees: ["Ausschuss für Umwelt und Klimaschutz"],
};

describe("campaign recipient picker", () => {
  it("preselects a local direct mandate and a sole local list mandate", () => {
    expect(
      initialPoliticianId([list, direct], {
        ambiguousLand: false,
        campaignRestricted: true,
        campaignRestrictedNoLocalMatch: false,
      })
    ).toBe(direct.id);
    expect(
      initialPoliticianId([list], {
        ambiguousLand: false,
        campaignRestricted: true,
        campaignRestrictedNoLocalMatch: false,
      })
    ).toBe(list.id);
  });

  it("does not make an arbitrary selection without a local campaign match", () => {
    expect(
      initialPoliticianId([direct, list], {
        ambiguousLand: false,
        campaignRestricted: true,
        campaignRestrictedNoLocalMatch: true,
      })
    ).toBeNull();
  });

  it("keeps multiple non-direct local matches unselected", () => {
    expect(
      initialPoliticianId([list, { ...list, id: 3 }], {
        ambiguousLand: false,
        campaignRestricted: true,
        campaignRestrictedNoLocalMatch: false,
      })
    ).toBeNull();
  });

  it("collapses local matches to the preselected person until expanded", () => {
    expect(visibleLocalCampaignRecipients([direct, list], direct.id, false)).toEqual([direct]);
    expect(visibleLocalCampaignRecipients([direct, list], direct.id, true)).toEqual([direct, list]);
  });

  it("searches fallback recipients by name, party, constituency and committee", () => {
    expect(filterCampaignRecipients([direct, list], "ozdemir")).toEqual([direct]);
    expect(filterCampaignRecipients([direct, list], "grunen")).toEqual([list]);
    expect(filterCampaignRecipients([direct, list], "bremen")).toEqual([list]);
    expect(filterCampaignRecipients([direct, list], "klimaschutz")).toEqual([list]);
  });

  it("combines text search with multi-party OR filtering", () => {
    expect(filterCampaignRecipients([direct, list], "ausschuss", ["SPD"])).toEqual([direct]);
    expect(
      filterCampaignRecipients([direct, list], "ausschuss", [
        "SPD",
        "Bündnis 90/Die Grünen",
      ])
    ).toEqual([direct, list]);
  });

  it("keeps the server-filtered campaign list instead of restoring all routed PLZ MdBs", () => {
    expect(bundRecipientsForCampaign([direct], [direct, list], true)).toEqual([direct]);
    expect(bundRecipientsForCampaign([direct], [direct, list], false)).toEqual([direct, list]);
  });
});
