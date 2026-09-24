import "server-only";

import { routeToLevel } from "@/lib/lookup/levelRouter";
import { saveCampaignTopic } from "./repository";

/**
 * Best effort only: Kampagnen bleiben nutzbar, wenn Mistral gerade nicht
 * erreichbar ist. Der nächste inhaltliche Speichervorgang versucht es erneut.
 */
export async function classifyAndSaveCampaignTopic(
  campaignId: string,
  issueText: string,
): Promise<void> {
  try {
    const routing = await routeToLevel(issueText);
    if (!routing.topic) {
      console.warn("[campaign-topic] classifier returned no valid topic", { campaignId });
      return;
    }
    await saveCampaignTopic(campaignId, issueText, {
      ...routing.topic,
      topicSource: "campaign",
    });
  } catch (error) {
    // No campaign text or other creator data in logs.
    console.error("[campaign-topic] background classification failed", {
      campaignId,
      name: error instanceof Error ? error.name : "NonError",
    });
  }
}
