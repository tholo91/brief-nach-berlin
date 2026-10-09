"use server";

import { z } from "zod";
import { getActiveCampaignBySlug } from "@/lib/campaigns/repository";
import {
  CAMPAIGN_REPORT_MESSAGE_MAX,
  CAMPAIGN_REPORT_MESSAGE_MIN,
  CAMPAIGN_REPORT_REASONS,
  CAMPAIGN_REPORT_REASON_LABELS,
  CAMPAIGN_REPORT_ROLES,
  CAMPAIGN_REPORT_ROLE_LABELS,
} from "@/lib/campaigns/reportOptions";
import { campaignSlugSchema } from "@/lib/campaigns/schema";
import { sendCampaignCreatorEmail } from "@/lib/email/sendCampaignCreatorEmail";
import {
  sendCampaignReportAdminEmail,
  sendCampaignReportConfirmationEmail,
} from "@/lib/email/sendCampaignReportEmails";
import { checkRateLimit, getClientIp, hashIdentifier, LIMITS } from "@/lib/rateLimit";

// Server-Action für "Stimmt was nicht?" auf der Kampagnenseite (DSA Art. 16).
// Die Kampagne wird serverseitig geladen, die Ersteller-Mail verlässt den
// Server nie. Nichts wird gespeichert. Gibt nur { success } zurück.

const reportSchema = z.object({
  slug: campaignSlugSchema,
  reason: z.enum(CAMPAIGN_REPORT_REASONS),
  role: z.enum(CAMPAIGN_REPORT_ROLES),
  message: z
    .string()
    .trim()
    .min(CAMPAIGN_REPORT_MESSAGE_MIN)
    .max(CAMPAIGN_REPORT_MESSAGE_MAX),
  reporterEmail: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().email().max(200).optional()
  ),
  goodFaith: z.literal(true),
});

export type ReportCampaignResult = { success: boolean };

export async function reportCampaignAction(
  input: unknown
): Promise<ReportCampaignResult> {
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) return { success: false };

  const ipHash = hashIdentifier(await getClientIp());
  const limit = checkRateLimit(
    `report-campaign:ip:${ipHash}`,
    LIMITS.REPORT_CAMPAIGN_PER_IP.max,
    LIMITS.REPORT_CAMPAIGN_PER_IP.windowMs
  );
  if (!limit.allowed) return { success: false };

  const { slug, reason, role, message, reporterEmail } = parsed.data;

  try {
    const campaign = await getActiveCampaignBySlug(slug);
    if (!campaign) return { success: false };

    const reasonLabel = CAMPAIGN_REPORT_REASON_LABELS[reason];
    const sent = await sendCampaignCreatorEmail({
      kind: "report",
      recipientEmail: campaign.creatorEmail,
      campaignTitle: campaign.title,
      slug: campaign.slug,
      creatorName: campaign.creatorName,
      adminCopy: true,
      report: {
        reasonLabel,
        roleLabel: CAMPAIGN_REPORT_ROLE_LABELS[role],
        message,
      },
    });
    if (!sent.success) return { success: false };

    if (reporterEmail) {
      await Promise.all([
        sendCampaignReportAdminEmail({
          reporterEmail,
          slug: campaign.slug,
          campaignTitle: campaign.title,
          reasonLabel,
        }),
        sendCampaignReportConfirmationEmail({
          reporterEmail,
          campaignTitle: campaign.title,
        }),
      ]);
    }
    return { success: true };
  } catch {
    console.error(`[reportCampaign] unexpected error for slug ${slug}`);
    return { success: false };
  }
}
