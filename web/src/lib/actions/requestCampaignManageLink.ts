"use server";

import { z } from "zod";
import { getManageableCampaignsByCreatorEmail } from "@/lib/campaigns/repository";
import { createCampaignToken, revokeCampaignToken } from "@/lib/campaigns/tokens";
import { sendCampaignCreatorEmail } from "@/lib/email/sendCampaignCreatorEmail";
import { checkRateLimit, getClientIp, hashIdentifier, LIMITS } from "@/lib/rateLimit";

export type RequestCampaignManageLinkResult =
  | { ok: true }
  | { ok: false; reason: "validation" | "rate_limited" | "server_error" };

const emailSchema = z.string().trim().toLowerCase().email().max(200);

// Answers { ok: true } for every valid request, whether or not the address owns campaigns,
// so the response cannot be used to probe who runs a campaign. The plain address is never logged.
export async function requestCampaignManageLinkAction(
  email: string
): Promise<RequestCampaignManageLinkResult> {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) return { ok: false, reason: "validation" };
  const normalizedEmail = parsed.data;

  const ipLimit = checkRateLimit(
    `manage-link:ip:${hashIdentifier(await getClientIp())}`,
    LIMITS.MANAGE_LINK_PER_IP.max,
    LIMITS.MANAGE_LINK_PER_IP.windowMs
  );
  if (!ipLimit.allowed) return { ok: false, reason: "rate_limited" };
  const emailLimit = checkRateLimit(
    `manage-link:email:${hashIdentifier(normalizedEmail)}`,
    LIMITS.MANAGE_LINK_PER_EMAIL.max,
    LIMITS.MANAGE_LINK_PER_EMAIL.windowMs
  );
  if (!emailLimit.allowed) return { ok: false, reason: "rate_limited" };

  let campaigns;
  try {
    campaigns = await getManageableCampaignsByCreatorEmail(normalizedEmail);
  } catch (error) {
    console.error(
      "[requestCampaignManageLink] lookup failed",
      error instanceof Error ? error.message : "unknown error"
    );
    return { ok: false, reason: "server_error" };
  }

  for (const campaign of campaigns) {
    let tokenId: string | null = null;
    try {
      const { token, record } = await createCampaignToken(campaign.id, "manage");
      tokenId = record.id;
      const sent = await sendCampaignCreatorEmail({
        kind: campaign.status === "awaiting_approval" ? "management_pending" : "management",
        recipientEmail: campaign.creatorEmail,
        campaignTitle: campaign.title,
        slug: campaign.slug,
        token,
        creatorName: campaign.creatorName,
        campaignStatus:
          campaign.status === "awaiting_approval" ||
          campaign.status === "active" ||
          campaign.status === "paused"
            ? campaign.status
            : undefined,
      });
      if (!sent.success) {
        await revokeCampaignToken(record.id);
        tokenId = null;
        console.error("[requestCampaignManageLink] mail failed for campaign", campaign.id);
      }
    } catch (error) {
      console.error(
        "[requestCampaignManageLink] campaign failed",
        campaign.id,
        error instanceof Error ? error.message : "unknown error"
      );
      if (tokenId) {
        try {
          await revokeCampaignToken(tokenId);
        } catch {
          console.error("[requestCampaignManageLink] token cleanup failed for campaign", campaign.id);
        }
      }
    }
  }

  return { ok: true };
}
