import { BrevoClient } from "@getbrevo/brevo";
import { APP_NAME, APP_URL, EMAIL_SENDER_NAME } from "@/lib/config";
import {
  buildCampaignCreatorEmailHtml,
  type CampaignCreatorEmailKind,
} from "./buildCampaignCreatorEmailHtml";

const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) {
  throw new Error("[brief-nach-berlin] BREVO_API_KEY environment variable is not set");
}
const brevo = new BrevoClient({ apiKey });

export interface SendCampaignCreatorEmailParams {
  kind: CampaignCreatorEmailKind;
  recipientEmail: string;
  campaignTitle: string;
  slug: string;
  token: string;
  creatorName?: string | null;
}

function campaignUrl(slug: string): string {
  return `${APP_URL}/kampagne/${slug}`;
}

function actionUrl(kind: CampaignCreatorEmailKind, token: string): string {
  if (kind === "verify_email") {
    return `${APP_URL}/kampagne/verifizieren?token=${encodeURIComponent(token)}`;
  }
  return `${APP_URL}/kampagne/verwalten?token=${encodeURIComponent(token)}`;
}

export async function sendCampaignCreatorEmail(
  params: SendCampaignCreatorEmailParams
): Promise<{ success: boolean; messageId?: string }> {
  try {
    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject:
        params.kind === "verify_email"
          ? `${APP_NAME}: Kampagne bestätigen`
          : `${APP_NAME}: Kampagne verwalten`,
      htmlContent: buildCampaignCreatorEmailHtml({
        kind: params.kind,
        campaignTitle: params.campaignTitle,
        slug: params.slug,
        campaignUrl: campaignUrl(params.slug),
        actionUrl: actionUrl(params.kind, params.token),
        creatorName: params.creatorName,
      }),
      sender: {
        name: EMAIL_SENDER_NAME,
        email: process.env.BREVO_SENDER_EMAIL || "brief@brief-nach-berlin.de",
      },
      to: [{ email: params.recipientEmail }],
      tags: [`campaign-${params.kind}`],
    });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("[brief-nach-berlin] campaign creator email failed:", error);
    return { success: false };
  }
}
