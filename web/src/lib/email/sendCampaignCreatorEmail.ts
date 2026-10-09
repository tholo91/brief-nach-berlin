import { BrevoClient } from "@getbrevo/brevo";
import { APP_NAME, APP_URL, EMAIL_SENDER_NAME, FOUNDER_EMAIL } from "@/lib/config";
import { formatLetterCount } from "@/lib/campaigns/milestones";
import {
  buildCampaignCreatorEmailHtml,
  type CampaignCreatorEmailKind,
  type CampaignReportEmailParams,
} from "./buildCampaignCreatorEmailHtml";

const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) {
  throw new Error("[brief-nach-berlin] BREVO_API_KEY environment variable is not set");
}
const brevo = new BrevoClient({ apiKey });

interface SendCampaignCreatorEmailBase {
  recipientEmail: string;
  campaignTitle: string;
  slug: string;
  creatorName?: string | null;
  adminCopy?: boolean;
  campaignStatus?: "awaiting_approval" | "active" | "paused";
  milestone?: { count: number; milestones: number[] };
  ended?: { count: number };
}

export type SendCampaignCreatorEmailParams =
  | (SendCampaignCreatorEmailBase & {
      kind: Exclude<CampaignCreatorEmailKind, "report">;
      token: string;
    })
  | (SendCampaignCreatorEmailBase & {
      kind: "report";
      report: CampaignReportEmailParams;
    });

function campaignUrl(slug: string): string {
  return `${APP_URL}/kampagne/${slug}`;
}

function actionUrl(params: SendCampaignCreatorEmailParams): string {
  if (params.kind === "report") return campaignUrl(params.slug);
  const { kind, token } = params;
  if (kind === "verify_email") {
    return `${APP_URL}/kampagne/verifizieren?token=${encodeURIComponent(token)}`;
  }
  return `${APP_URL}/kampagne/verwalten?token=${encodeURIComponent(token)}`;
}

function milestoneImageUrl(slug: string, count: number): string {
  return `${APP_URL}/kampagne/${encodeURIComponent(slug)}/meilenstein/${count}/bild`;
}

export async function sendCampaignCreatorEmail(
  params: SendCampaignCreatorEmailParams
): Promise<{ success: boolean; messageId?: string }> {
  try {
    const milestone =
      params.kind === "milestone" && params.milestone
        ? {
            ...params.milestone,
            imageUrl: milestoneImageUrl(params.slug, params.milestone.count),
            downloadUrl: `${milestoneImageUrl(params.slug, params.milestone.count)}?download=1`,
          }
        : undefined;
    const ended = params.kind === "ended" && params.ended
      ? {
          count: params.ended.count,
          imageUrl: milestoneImageUrl(params.slug, params.ended.count),
          downloadUrl: `${milestoneImageUrl(params.slug, params.ended.count)}?download=1`,
        }
      : undefined;
    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject:
        params.kind === "verify_email"
          ? `${APP_NAME}: Kampagne bestätigen`
          : params.kind === "management_pending"
            ? `${APP_NAME}: Kampagne wartet auf Freigabe`
            : params.kind === "report"
              ? `${APP_NAME}: Hinweis zu deiner Kampagne`
              : params.kind === "milestone" && params.milestone
                ? `${formatLetterCount(params.milestone.count)} Briefe für „${params.campaignTitle}“`
                : params.kind === "ended" && params.ended
                  ? `Danke für ${formatLetterCount(params.ended.count)} Briefe zu „${params.campaignTitle}“`
                  : `${APP_NAME}: Kampagne verwalten`,
      htmlContent: buildCampaignCreatorEmailHtml({
        kind: params.kind,
        campaignTitle: params.campaignTitle,
        slug: params.slug,
        campaignUrl: campaignUrl(params.slug),
        actionUrl: actionUrl(params),
        creatorName: params.creatorName,
        campaignStatus: params.campaignStatus,
        milestone,
        ended,
        report: params.kind === "report" ? params.report : undefined,
      }),
      sender: {
        name: EMAIL_SENDER_NAME,
        email: process.env.BREVO_SENDER_EMAIL || "brief@brief-nach-berlin.de",
      },
      to: [{ email: params.recipientEmail }],
      bcc:
        params.adminCopy && process.env.THOMAS_MAIL
          ? [{ email: process.env.THOMAS_MAIL }]
          : undefined,
      replyTo:
        params.kind === "report" || params.kind === "ended"
          ? { email: FOUNDER_EMAIL }
          : undefined,
      tags: [`campaign-${params.kind}`],
    });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("[brief-nach-berlin] campaign creator email failed:", error);
    return { success: false };
  }
}
