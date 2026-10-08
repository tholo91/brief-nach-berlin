"use server";

import { revalidatePath } from "next/cache";
import {
  CampaignRepositoryError,
  getCampaignById,
  pauseCampaign,
} from "@/lib/campaigns/repository";
import { CAMPAIGN_ENDED_MESSAGE, isCampaignEnded } from "@/lib/campaigns/endDate";
import { getCampaignManagementSession } from "@/lib/campaigns/session";

export type PauseCampaignResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function pauseCampaignAction(
  campaignId: string
): Promise<PauseCampaignResult> {
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

  try {
    const campaign = await pauseCampaign(campaignId);
    revalidatePath(`/kampagne/${campaign.slug}`);
    revalidatePath("/kampagne/verwalten");
    return {
      ok: true,
      message: "Kampagne pausiert. Die öffentliche Seite ist nicht mehr erreichbar.",
    };
  } catch (error) {
    if (error instanceof CampaignRepositoryError) {
      return {
        ok: false,
        message: "Nur aktive Kampagnen können pausiert werden.",
      };
    }
    console.error("[pauseCampaignAction] failed:", error);
    return {
      ok: false,
      message: "Die Kampagne konnte gerade nicht pausiert werden.",
    };
  }
}
