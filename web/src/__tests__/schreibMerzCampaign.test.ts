import {
  SCHREIB_MERZ_CAMPAIGN,
  composeSpecialCampaignIssue,
  getSpecialCampaignBySlug,
  toggleSpecialCampaignTopic,
} from "@/lib/campaigns/specialCampaigns";

describe("Schreib-Merz special campaign", () => {
  it("exposes exactly six distinct, editable topic starters", () => {
    const { topics } = SCHREIB_MERZ_CAMPAIGN;

    expect(topics).toHaveLength(6);
    expect(new Set(topics.map((topic) => topic.id))).toHaveProperty("size", 6);
    for (const topic of topics) {
      expect(topic.title.trim()).not.toBe("");
      expect(topic.shortDescription.trim()).not.toBe("");
      expect(topic.issueText.trim()).not.toBe("");
    }
  });

  it("is the only registered special-campaign slug", () => {
    expect(getSpecialCampaignBySlug("schreib-merz")).toBe(
      SCHREIB_MERZ_CAMPAIGN,
    );
    expect(getSpecialCampaignBySlug("andere-kampagne")).toBeNull();
  });

  it("selects no more than two topics and removes only the toggled topic", () => {
    const first = toggleSpecialCampaignTopic([], "wohnen");
    const second = toggleSpecialCampaignTopic(first, "klima");
    const rejectedThird = toggleSpecialCampaignTopic(second, "digitales");

    expect(first).toEqual(["wohnen"]);
    expect(second).toEqual(["wohnen", "klima"]);
    expect(rejectedThird).toEqual(["wohnen", "klima"]);
    expect(rejectedThird).not.toBe(second);
    expect(toggleSpecialCampaignTopic(second, "wohnen")).toEqual(["klima"]);
  });

  it("composes topic blocks, personal text, and one shared request in order", () => {
    const issue = composeSpecialCampaignIssue({
      selectedTopicIds: ["wohnen", "klima"],
      topicTexts: {
        wohnen: "  Mein Absatz zum Wohnen.  ",
        klima: "Mein Absatz zum Klima.",
      },
      personalText: "  Meine persönliche Ergänzung. ",
      sharedRequest: "  Meine gemeinsame Bitte.  ",
    });

    expect(issue).toBe(
      "Mein Absatz zum Wohnen.\n\nMein Absatz zum Klima.\n\n" +
        "Meine persönliche Ergänzung.\n\nMeine gemeinsame Bitte.",
    );
    expect(issue.match(/Meine gemeinsame Bitte\./g)).toHaveLength(1);
  });

  it("omits empty editable blocks without leaving duplicate separators", () => {
    expect(
      composeSpecialCampaignIssue({
        selectedTopicIds: ["wohnen", "klima"],
        topicTexts: { wohnen: "", klima: "Klima bleibt." },
        personalText: "   ",
        sharedRequest: "Bitte bleibt.",
      }),
    ).toBe("Klima bleibt.\n\nBitte bleibt.");
  });
});
