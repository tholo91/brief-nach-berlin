"use server";

import { revalidatePath } from "next/cache";
import {
  CampaignRepositoryError,
  pauseCampaign,
} from "@/lib/campaigns/repository";
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
