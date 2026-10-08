"use server";

import { revalidatePath } from "next/cache";
import {
  CAMPAIGN_ENDED_MESSAGE,
  formatCampaignEndDate,
  isCampaignEnded,
  parseCampaignEndDateInput,
} from "@/lib/campaigns/endDate";
import {
  CampaignRepositoryError,
  endCampaignNow,
  getCampaignById,
  setCampaignEndsAt,
} from "@/lib/campaigns/repository";
import type { Campaign } from "@/lib/campaigns/schema";
import { getCampaignManagementSession } from "@/lib/campaigns/session";

export type CampaignEndResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

type OwnedCampaign =
  | { ok: true; campaign: Campaign }
  | { ok: false; message: string };

async function loadOwnedCampaign(campaignId: string): Promise<OwnedCampaign> {
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

  const campaign = await getCampaignById(campaignId);
  if (!campaign || campaign.creatorEmail.toLowerCase() !== session.creatorEmail.toLowerCase()) {
    return { ok: false, message: "Dieser Verwaltungslink ist nicht mehr gültig." };
  }
  if (isCampaignEnded(campaign, new Date())) {
    return { ok: false, message: CAMPAIGN_ENDED_MESSAGE };
  }
  return { ok: true, campaign };
}

function revalidateCampaign(slug: string): void {
  revalidatePath(`/kampagne/${slug}`);
  revalidatePath("/kampagne/verwalten");
  revalidatePath("/");
}

export async function endCampaignAction(
  campaignId: string
): Promise<CampaignEndResult> {
  const owned = await loadOwnedCampaign(campaignId);
  if (!owned.ok) return owned;

  try {
    const campaign = await endCampaignNow(campaignId);
    revalidateCampaign(campaign.slug);
    return {
      ok: true,
      message: "Kampagne beendet. Die Seite zeigt ab jetzt den Endstand.",
    };
  } catch (error) {
    if (error instanceof CampaignRepositoryError) {
      return {
        ok: false,
        message: "Diese Kampagne kann in ihrem aktuellen Status nicht beendet werden.",
      };
    }
    console.error("[endCampaignAction] failed:", error);
    return {
      ok: false,
      message: "Die Kampagne konnte gerade nicht beendet werden.",
    };
  }
}

export async function updateCampaignEndDateAction(
  campaignId: string,
  endDate: string
): Promise<CampaignEndResult> {
  const owned = await loadOwnedCampaign(campaignId);
  if (!owned.ok) return owned;

  const parsed = parseCampaignEndDateInput(endDate, new Date());
  if (!parsed.ok) return { ok: false, message: parsed.message };

  try {
    const campaign = await setCampaignEndsAt(campaignId, parsed.endsAt);
    revalidateCampaign(campaign.slug);
    return {
      ok: true,
      message: parsed.endsAt
        ? `Enddatum gespeichert: ${formatCampaignEndDate(parsed.endsAt)}.`
        : "Enddatum entfernt. Die Kampagne läuft ohne festes Ende.",
    };
  } catch (error) {
    if (error instanceof CampaignRepositoryError) {
      return {
        ok: false,
        message: "Das Enddatum kann in diesem Status nicht geändert werden.",
      };
    }
    console.error("[updateCampaignEndDateAction] failed:", error);
    return {
      ok: false,
      message: "Das Enddatum konnte gerade nicht gespeichert werden.",
    };
  }
}
