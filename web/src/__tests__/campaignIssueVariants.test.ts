import {
  campaignIssueAlternativesSchema,
  getCampaignIssueTexts,
  restoreCampaignIssueDraft,
  selectCampaignIssueText,
  type CampaignIssueVariantSource,
} from "@/lib/campaigns/issueVariants";

const main = "Hauptanliegen: eine bessere und verlässliche öffentliche Versorgung für alle Menschen.";
const alternativeOne = "Erstes alternatives Anliegen mit mindestens fünfzig Zeichen für den Test.";
const alternativeTwo = "Zweites alternatives Anliegen mit mindestens fünfzig Zeichen für den Test.";

function source(overrides: Partial<CampaignIssueVariantSource> = {}): CampaignIssueVariantSource {
  return {
    issueText: main,
    issueTextAlternativesBase: main,
    issueTextAlternatives: [],
    ...overrides,
  };
}

describe("campaignIssueAlternativesSchema", () => {
  it("accepts zero to two trimmed alternatives and rejects duplicates", () => {
    expect(campaignIssueAlternativesSchema.parse([])).toEqual([]);
    expect(campaignIssueAlternativesSchema.parse([` ${alternativeOne} `])).toEqual([alternativeOne]);
    expect(campaignIssueAlternativesSchema.parse([alternativeOne, alternativeTwo])).toHaveLength(2);
    expect(campaignIssueAlternativesSchema.safeParse([alternativeOne, alternativeOne]).success).toBe(false);
  });

  it("rejects more than two alternatives and text outside the length limits", () => {
    expect(campaignIssueAlternativesSchema.safeParse([alternativeOne, alternativeTwo, main]).success).toBe(false);
    expect(campaignIssueAlternativesSchema.safeParse(["x".repeat(49)]).success).toBe(false);
    expect(campaignIssueAlternativesSchema.safeParse(["x".repeat(4001)]).success).toBe(false);
  });
});

describe("getCampaignIssueTexts", () => {
  it("returns one, two, or three available texts", () => {
    expect(getCampaignIssueTexts(source())).toEqual([main]);
    expect(getCampaignIssueTexts(source({ issueTextAlternatives: [alternativeOne] }))).toEqual([main, alternativeOne]);
    expect(getCampaignIssueTexts(source({ issueTextAlternatives: [alternativeOne, alternativeTwo] })))
      .toEqual([main, alternativeOne, alternativeTwo]);
  });

  it("falls back when the base is missing or stale or the alternatives are invalid", () => {
    for (const input of [
      source({ issueTextAlternativesBase: null, issueTextAlternatives: [alternativeOne] }),
      source({ issueTextAlternativesBase: "old base", issueTextAlternatives: [alternativeOne] }),
      source({ issueTextAlternatives: "not an array" }),
      source({ issueTextAlternatives: ["too short"] }),
      source({ issueTextAlternatives: [alternativeOne, alternativeTwo, main] }),
      source({ issueTextAlternatives: [alternativeOne, alternativeOne] }),
    ]) {
      expect(getCampaignIssueTexts(input)).toEqual([main]);
    }
  });

  it("removes an alternative identical to the main text", () => {
    expect(getCampaignIssueTexts(source({ issueTextAlternatives: [main, alternativeOne] })))
      .toEqual([main, alternativeOne]);
  });
});

describe("selectCampaignIssueText", () => {
  it("selects evenly across deterministic interval boundaries", () => {
    const input = source({ issueTextAlternatives: [alternativeOne, alternativeTwo] });
    expect(selectCampaignIssueText(input, () => 0)).toBe(main);
    expect(selectCampaignIssueText(input, () => 1 / 3)).toBe(alternativeOne);
    expect(selectCampaignIssueText(input, () => 2 / 3)).toBe(alternativeTwo);
    expect(selectCampaignIssueText(input, () => 1)).toBe(alternativeTwo);
  });

  it("preserves a nonempty personal draft without calling random", () => {
    const random = jest.fn(() => 0);
    const draft = "  Mein persönliches Anliegen mit eigenen Worten.  ";
    expect(restoreCampaignIssueDraft(source({ issueTextAlternatives: [alternativeOne] }), draft, random)).toBe(draft);
    expect(random).not.toHaveBeenCalled();
  });

  it("chooses a campaign text when there is no saved draft", () => {
    expect(restoreCampaignIssueDraft(source({ issueTextAlternatives: [alternativeOne] }), "  ", () => 0.9))
      .toBe(alternativeOne);
  });
});
