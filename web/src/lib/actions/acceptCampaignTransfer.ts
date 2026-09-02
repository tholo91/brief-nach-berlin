"use server";

import { redirect } from "next/navigation";
import { getCampaignById } from "@/lib/campaigns/repository";
import { setCampaignManagementSession } from "@/lib/campaigns/session";
import {
  consumeCampaignTransfer,
  createCampaignToken,
  revokeCampaignToken,
} from "@/lib/campaigns/tokens";
import { sendCampaignCreatorEmail } from "@/lib/email/sendCampaignCreatorEmail";

const SESSION_TTL_SECONDS = 60 * 60 * 2;

function formValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function acceptCampaignTransferAction(formData: FormData): Promise<void> {
  const token = formValue(formData, "token");
  let location = "/kampagne/verwalten?transfer=error";
  let manageTokenId: string | null = null;

  try {
    if (token) {
      const accepted = await consumeCampaignTransfer(token);
      if (accepted) {
        const campaign = await getCampaignById(accepted.campaignId);
        if (
          campaign &&
          campaign.creatorEmail.trim().toLowerCase() ===
            accepted.recipientEmail.trim().toLowerCase()
        ) {
          await setCampaignManagementSession(
            campaign.id,
            campaign.creatorEmail,
            SESSION_TTL_SECONDS
          );

          const { token: manageToken, record } = await createCampaignToken(
            campaign.id,
            "manage"
          );
          manageTokenId = record.id;
          const sent = await sendCampaignCreatorEmail({
            kind: campaign.status === "awaiting_approval" ? "management_pending" : "management",
            recipientEmail: campaign.creatorEmail,
            campaignTitle: campaign.title,
            slug: campaign.slug,
            token: manageToken,
            creatorName: campaign.creatorName,
            adminCopy: true,
            campaignStatus:
              campaign.status === "awaiting_approval" ||
              campaign.status === "active" ||
              campaign.status === "paused"
                ? campaign.status
                : undefined,
          });

          if (!sent.success) {
            await revokeCampaignToken(record.id);
            location = "/kampagne/verwalten?transfer=mail_failed";
          } else {
            location = "/kampagne/verwalten?transfer=accepted";
          }
        }
      }
    }
  } catch (error) {
    if (manageTokenId) {
      try {
        await revokeCampaignToken(manageTokenId);
      } catch (cleanupError) {
        console.error("[acceptCampaignTransferAction] token cleanup failed:", cleanupError);
      }
    }
    console.error("[acceptCampaignTransferAction] failed:", error);
  }

  redirect(location);
}
