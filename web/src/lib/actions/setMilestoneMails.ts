"use server";

import { revalidatePath } from "next/cache";
import {
  getCampaignById,
  setCampaignMilestoneMailsEnabled,
} from "@/lib/campaigns/repository";
import { CAMPAIGN_ENDED_MESSAGE, isCampaignEnded } from "@/lib/campaigns/endDate";
import { getCampaignManagementSession } from "@/lib/campaigns/session";

export type SetMilestoneMailsResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function setMilestoneMailsAction(
  campaignId: string,
  enabled: boolean
): Promise<SetMilestoneMailsResult> {
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
  if (typeof enabled !== "boolean") {
    return { ok: false, message: "Die Einstellung konnte gerade nicht gespeichert werden." };
  }

  try {
    const currentCampaign = await getCampaignById(campaignId);
    if (
      !currentCampaign ||
      currentCampaign.creatorEmail.toLowerCase() !== session.creatorEmail.toLowerCase()
    ) {
      return { ok: false, message: "Dieser Verwaltungslink ist nicht mehr gültig." };
    }
    if (isCampaignEnded(currentCampaign, new Date())) {
      return { ok: false, message: CAMPAIGN_ENDED_MESSAGE };
    }

    await setCampaignMilestoneMailsEnabled(campaignId, enabled);
    revalidatePath("/kampagne/verwalten");
    return {
      ok: true,
      message: enabled ? "Meilenstein-Mails sind an." : "Meilenstein-Mails sind aus.",
    };
  } catch (error) {
    console.error(
      "[setMilestoneMailsAction] failed:",
      error instanceof Error ? error.message : String(error)
    );
    return {
      ok: false,
      message: "Die Einstellung konnte gerade nicht gespeichert werden.",
    };
  }
}
