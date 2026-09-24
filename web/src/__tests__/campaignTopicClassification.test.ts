jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@/lib/lookup/levelRouter", () => ({ routeToLevel: jest.fn() }));
jest.mock("@/lib/campaigns/repository", () => ({ saveCampaignTopic: jest.fn() }));

import { classifyAndSaveCampaignTopic } from "@/lib/campaigns/classifyTopic";
import { routeToLevel } from "@/lib/lookup/levelRouter";
import { saveCampaignTopic } from "@/lib/campaigns/repository";

describe("campaign topic classification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("stores the validated campaign topic without exposing the campaign text", async () => {
    jest.mocked(routeToLevel).mockResolvedValue({
      primary: { level: "Land", confidence: "high" },
      reasoning: "Schulwege fallen in die Verantwortung der Länder.",
      topic: {
        topicCategories: ["verkehr_mobilitaet"],
        topicLabels: ["Sichere Straßen"],
        topicTaxonomyVersion: "v1",
        topicSource: "routing",
        topicModel: "mistral-small-latest",
      },
    });

    await classifyAndSaveCampaignTopic(
      "11111111-1111-4111-8111-111111111111",
      "Sichere Schulwege brauchen Tempo 30 und sichere Querungen.",
    );

    expect(saveCampaignTopic).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      "Sichere Schulwege brauchen Tempo 30 und sichere Querungen.",
      expect.objectContaining({ topicSource: "campaign" }),
    );
  });

  it("keeps the campaign usable when classification has no valid topic", async () => {
    jest.mocked(routeToLevel).mockResolvedValue({
      primary: { level: "Land", confidence: "high" },
      reasoning: "Schulwege fallen in die Verantwortung der Länder.",
      topic: null,
    });

    await expect(
      classifyAndSaveCampaignTopic(
        "11111111-1111-4111-8111-111111111111",
        "Sichere Schulwege brauchen Tempo 30 und sichere Querungen.",
      ),
    ).resolves.toBeUndefined();

    expect(saveCampaignTopic).not.toHaveBeenCalled();
  });
});
