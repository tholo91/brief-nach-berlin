import { NextResponse, type NextRequest } from "next/server";
import {
  CAMPAIGN_MANAGEMENT_SESSION_COOKIE,
  createCampaignManagementSessionValue,
} from "@/lib/campaigns/session";
import {
  consumeCampaignTransfer,
  createCampaignToken,
  getUsableCampaignToken,
  getUsableCampaignTransferToken,
} from "@/lib/campaigns/tokens";
import { getCampaignById } from "@/lib/campaigns/repository";
import { sendCampaignCreatorEmail } from "@/lib/email/sendCampaignCreatorEmail";

const SESSION_TTL_SECONDS = 60 * 60 * 2;

export async function GET(request: NextRequest) {
  const response = new NextResponse(null, {
    status: 303,
    headers: { Location: "/kampagne/verwalten" },
  });

  const token = request.nextUrl.searchParams.get("token");
  if (token) {
    const transfer = await getUsableCampaignTransferToken(token);
    if (transfer) {
      try {
        const accepted = await consumeCampaignTransfer(token);
        if (!accepted || accepted.campaignId !== transfer.campaignId) {
          response.headers.set("Location", "/kampagne/verwalten?transfer=error");
          return response;
        }

        const campaign = await getCampaignById(accepted.campaignId);
        if (!campaign || campaign.creatorEmail !== accepted.recipientEmail) {
          response.headers.set("Location", "/kampagne/verwalten?transfer=error");
          return response;
        }

        const { token: manageToken } = await createCampaignToken(
          campaign.id,
          "manage"
        );
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

        const location = sent.success
          ? "/kampagne/verwalten?transfer=accepted"
          : "/kampagne/verwalten?transfer=mail_failed";
        response.headers.set("Location", location);
        response.cookies.set({
          name: CAMPAIGN_MANAGEMENT_SESSION_COOKIE,
          value: createCampaignManagementSessionValue(
            campaign.id,
            campaign.creatorEmail,
            SESSION_TTL_SECONDS
          ),
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/kampagne",
          maxAge: SESSION_TTL_SECONDS,
        });
        return response;
      } catch {
        response.headers.set("Location", "/kampagne/verwalten?transfer=error");
        return response;
      }
    }

    const record = await getUsableCampaignToken(token, "manage");
    if (record) {
      const campaign = await getCampaignById(record.campaignId);
      if (!campaign) return response;
      response.cookies.set({
        name: CAMPAIGN_MANAGEMENT_SESSION_COOKIE,
        value: createCampaignManagementSessionValue(
          record.campaignId,
          campaign.creatorEmail,
          SESSION_TTL_SECONDS
        ),
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/kampagne",
        maxAge: SESSION_TTL_SECONDS,
      });
    }
  }

  return response;
}
