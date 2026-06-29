"use server";

import {
  activateVerifiedCampaign,
  CampaignRepositoryError,
  getCampaignById,
  markEmailVerified,
  setCampaignModeration,
} from "@/lib/campaigns/repository";
import {
  createCampaignToken,
  getUsableCampaignToken,
  revokeCampaignToken,
  revokeCampaignTokensForCampaign,
} from "@/lib/campaigns/tokens";
import { moderateText } from "@/lib/moderation/moderateText";
import { sendCampaignCreatorEmail } from "@/lib/email/sendCampaignCreatorEmail";

export type VerifyCampaignEmailResult =
  | { status: "activated"; title: string; slug: string; message: string }
  | { status: "already_used"; message: string }
  | { status: "blocked"; title: string; message: string }
  | { status: "invalid"; message: string }
  | { status: "error"; message: string };

async function moderateCurrentPublicText(issueText: string, description: string | null) {
  const checks = [await moderateText(issueText)];
  if (description) checks.push(await moderateText(description));
  const categories = [...new Set(checks.flatMap((check) => check.categories))];
  return { flagged: checks.some((check) => check.flagged), categories };
}

export async function verifyCampaignEmailAction(
  token: string | null | undefined
): Promise<VerifyCampaignEmailResult> {
  if (!token) {
    return {
      status: "invalid",
      message: "Dieser Bestätigungslink ist unvollständig.",
    };
  }

  try {
    const tokenRecord = await getUsableCampaignToken(token, "verify_email");
    if (!tokenRecord) {
      return {
        status: "already_used",
        message:
          "Dieser Bestätigungslink wurde bereits genutzt oder ist abgelaufen. Wenn deine Kampagne schon aktiv ist, findest du den Verwaltungslink in der späteren E-Mail.",
      };
    }

    const campaign = await getCampaignById(tokenRecord.campaignId);
    if (!campaign) {
      return {
        status: "invalid",
        message: "Zu diesem Link wurde keine Kampagne gefunden.",
      };
    }

    if (campaign.status === "active" && campaign.emailVerifiedAt) {
      return {
        status: "activated",
        title: campaign.title,
        slug: campaign.slug,
        message: "Diese Kampagne ist bereits aktiv.",
      };
    }

    const verified = campaign.emailVerifiedAt
      ? campaign
      : await markEmailVerified(campaign.id);

    const moderation = await moderateCurrentPublicText(
      campaign.issueText,
      campaign.description
    );
    if (moderation.flagged) {
      await setCampaignModeration(campaign.id, "rejected", moderation.categories);
      return {
        status: "blocked",
        title: campaign.title,
        message:
          "Die E-Mail ist bestätigt, aber der aktuelle Kampagnentext wurde nicht freigeschaltet. Bitte überarbeite den Text, bevor er öffentlich wird.",
      };
    }

    const approved = await setCampaignModeration(
      verified.id,
      "approved",
      moderation.categories
    );
    const activated = await activateVerifiedCampaign(approved);
    await revokeCampaignTokensForCampaign(activated.id, "manage");
    const { token: manageToken } = await createCampaignToken(activated.id, "manage");
    await revokeCampaignToken(tokenRecord.id);
    const sent = await sendCampaignCreatorEmail({
      kind: "management",
      recipientEmail: activated.creatorEmail,
      campaignTitle: activated.title,
      slug: activated.slug,
      token: manageToken,
    });

    if (!sent.success) {
      return {
        status: "activated",
        title: activated.title,
        slug: activated.slug,
        message:
          "Die Kampagne ist aktiv. Die Verwaltungs-E-Mail konnte gerade nicht verschickt werden.",
      };
    }

    return {
      status: "activated",
      title: activated.title,
      slug: activated.slug,
      message:
        "Deine E-Mail ist bestätigt. Die Kampagne ist jetzt aktiv und die Verwaltungs-E-Mail ist unterwegs.",
    };
  } catch (error) {
    if (error instanceof CampaignRepositoryError) {
      console.error("[verifyCampaignEmailAction] repository failed:", error.message);
    } else {
      console.error("[verifyCampaignEmailAction] failed:", error);
    }
    return {
      status: "error",
      message:
        "Die Bestätigung konnte gerade nicht abgeschlossen werden. Bitte versuch es später noch einmal.",
    };
  }
}
