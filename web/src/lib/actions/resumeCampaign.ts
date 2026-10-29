"use server";

import { revalidatePath } from "next/cache";
import {
  CampaignRepositoryError,
  getCampaignById,
  activateVerifiedCampaign,
} from "@/lib/campaigns/repository";
import { CAMPAIGN_ENDED_MESSAGE, isCampaignEnded } from "@/lib/campaigns/endDate";
import { getCampaignManagementSession } from "@/lib/campaigns/session";

export type ResumeCampaignResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function resumeCampaignAction(
  campaignId: string
): Promise<ResumeCampaignResult> {
  const session = await getCampaignManagementSession();
  if (!session) {
    return {
      ok: false,
      message: "Der Verwaltungszugriff ist abgelaufen. Bitte öffne den Link aus der E-Mail erneut.",
    };
  }
  if (campaignId !== session.campaignId) {
    return { ok: false, message: "Dieser Verwaltungslink gehört nicht zu dieser Kampagne." };
  }

  const currentCampaign = await getCampaignById(campaignId);
  if (!currentCampaign || currentCampaign.creatorEmail.toLowerCase() !== session.creatorEmail.toLowerCase()) {
    return { ok: false, message: "Dieser Verwaltungslink ist nicht mehr gültig." };
  }

  if (isCampaignEnded(currentCampaign, new Date())) {
    return { ok: false, message: CAMPAIGN_ENDED_MESSAGE };
  }

  if (currentCampaign.status !== "paused") {
    return { ok: false, message: "Nur pausierte Kampagnen können fortgesetzt werden." };
  }

  try {
    const campaign = await activateVerifiedCampaign(currentCampaign);
    revalidatePath(`/kampagne/${campaign.slug}`);
    revalidatePath("/kampagne/verwalten");
    return {
      ok: true,
      message: "Kampagne fortgesetzt. Sie taucht wieder in den Übersichten auf.",
    };
  } catch (error) {
    if (error instanceof CampaignRepositoryError) {
      return {
        ok: false,
        message: "Nur pausierte Kampagnen können fortgesetzt werden.",
      };
    }
    console.error("[resumeCampaignAction] failed:", error);
    return {
      ok: false,
      message: "Die Kampagne konnte gerade nicht fortgesetzt werden.",
    };
  }
}
