"use server";

import {
  blockCampaign,
  CampaignRepositoryError,
  getCampaignById,
  markEmailVerified,
} from "@/lib/campaigns/repository";
import {
  createCampaignToken,
  getUsableCampaignTokenForCampaign,
  getUsableCampaignToken,
  revokeCampaignToken,
  revokeCampaignTokensForCampaign,
} from "@/lib/campaigns/tokens";
import { moderateText } from "@/lib/moderation/moderateText";
import { sendCampaignCreatorEmail } from "@/lib/email/sendCampaignCreatorEmail";

export type VerifyCampaignEmailResult =
  | { status: "awaiting_approval"; title: string; message: string }
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

async function sendPendingManagementAccess(campaign: {
  id: string;
  creatorEmail: string;
  title: string;
  slug: string;
  creatorName: string | null;
}): Promise<VerifyCampaignEmailResult> {
  await revokeCampaignTokensForCampaign(campaign.id, "manage");
  const { token: manageToken, record } = await createCampaignToken(campaign.id, "manage");
  const sent = await sendCampaignCreatorEmail({
    kind: "management_pending",
    recipientEmail: campaign.creatorEmail,
    campaignTitle: campaign.title,
    slug: campaign.slug,
    token: manageToken,
    creatorName: campaign.creatorName,
  });

  if (!sent.success) {
    await revokeCampaignToken(record.id);
    return {
      status: "error",
      message:
        "Deine E-Mail ist bestätigt. Die Verwaltungs-E-Mail konnte gerade nicht verschickt werden. Bitte öffne den Bestätigungslink später noch einmal.",
    };
  }

  return {
    status: "awaiting_approval",
    title: campaign.title,
    message:
      "Deine E-Mail ist bestätigt. Die Kampagne wartet jetzt auf Freigabe und dein Verwaltungslink ist unterwegs.",
  };
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

    if (campaign.emailVerifiedAt) {
      if (campaign.status === "awaiting_approval") {
        const managementToken = await getUsableCampaignTokenForCampaign(
          campaign.id,
          "manage"
        );
        if (!managementToken) {
          return sendPendingManagementAccess(campaign);
        }
        return {
          status: "awaiting_approval",
          title: campaign.title,
          message:
            "Deine E-Mail ist bereits bestätigt. Die Kampagne wartet auf Freigabe.",
        };
      }
      return {
        status: "already_used",
        message:
          "Diese E-Mail ist bereits bestätigt. Nutze für Änderungen den Verwaltungslink aus deiner E-Mail.",
      };
    }

    const verified = await markEmailVerified(campaign.id);

    const moderation = await moderateCurrentPublicText(
      campaign.issueText,
      campaign.description
    );
    if (moderation.flagged) {
      await blockCampaign(campaign.id, moderation.categories);
      return {
        status: "blocked",
        title: campaign.title,
        message:
          "Die E-Mail ist bestätigt, aber der aktuelle Kampagnentext wurde nicht freigeschaltet. Bitte überarbeite den Text, bevor er öffentlich wird.",
      };
    }

    return sendPendingManagementAccess(verified);
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
