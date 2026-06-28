"use server";

import { revalidatePath } from "next/cache";
import {
  archiveCampaign,
  CampaignRepositoryError,
} from "@/lib/campaigns/repository";
import { getCampaignManagementSession } from "@/lib/campaigns/session";

export type ArchiveCampaignResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function archiveCampaignAction(
  campaignId: string
): Promise<ArchiveCampaignResult> {
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
    const campaign = await archiveCampaign(campaignId);
    revalidatePath(`/kampagne/${campaign.slug}`);
    revalidatePath("/kampagne/verwalten");
    return {
      ok: true,
      message: "Kampagne archiviert. Die öffentliche Seite bleibt offline, die Historie bleibt erhalten.",
    };
  } catch (error) {
    if (error instanceof CampaignRepositoryError) {
      return {
        ok: false,
        message: "Diese Kampagne kann in ihrem aktuellen Status nicht archiviert werden.",
      };
    }
    console.error("[archiveCampaignAction] failed:", error);
    return {
      ok: false,
      message: "Die Kampagne konnte gerade nicht archiviert werden.",
    };
  }
}
