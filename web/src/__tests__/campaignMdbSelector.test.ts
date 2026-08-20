import {
  filterCampaignPoliticians,
  MdbCampaignHiddenInputs,
  mergeCampaignPoliticianIds,
} from "@/components/campaigns/MdbCampaignSelector";
import type { Politician } from "@/lib/types/politician";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const people: Politician[] = [
  {
    id: 1,
    politicianId: 101,
    firstName: "Anna",
    lastName: "Nord",
    title: null,
    party: "SPD",
    wahlkreisId: 1,
    wahlkreisName: "Bremen I",
    level: "Bund",
    postalAddress: "Berlin",
    isDirect: true,
    abgeordnetenwatchUrl: null,
    committees: ["Ausschuss für lange Ausschussnamen"],
  },
  {
    id: 2,
    politicianId: 102,
    firstName: "Berta",
    lastName: "Süd",
    title: null,
    party: "CDU/CSU",
    wahlkreisId: 2,
    wahlkreisName: "Hamburg-Mitte",
    level: "Bund",
    postalAddress: "Berlin",
    isDirect: false,
    abgeordnetenwatchUrl: null,
  },
  {
    id: 3,
    politicianId: 103,
    firstName: "Carla",
    lastName: "West",
    title: null,
    party: "Die Linke",
    wahlkreisId: 3,
    wahlkreisName: "Bremen II",
    level: "Bund",
    postalAddress: "Berlin",
    isDirect: false,
  },
];

describe("MdB campaign selector filtering", () => {
  it("combines text search with multi-party OR filtering", () => {
    expect(filterCampaignPoliticians(people, "Bremen", ["SPD", "Die Linke"]).map((person) => person.id)).toEqual([1, 3]);
    expect(filterCampaignPoliticians(people, "Bremen", ["CDU/CSU", "Die Linke"]).map((person) => person.id)).toEqual([3]);
  });

  it("adds all currently filtered results without duplicates", () => {
    expect(mergeCampaignPoliticianIds([2], [people[0]!, people[1]!])).toEqual([2, 1]);
  });

  it("serializes every selected MdB for the final form step", () => {
    const html = renderToStaticMarkup(
      createElement(MdbCampaignHiddenInputs, { selectedIds: [2, 3] })
    );

    expect(html).toContain('name="targetPoliticianId" value="2"');
    expect(html).toContain('name="targetPoliticianId" value="3"');
  });
});
