import { NextResponse, type NextRequest } from "next/server";
import {
  CAMPAIGN_MANAGEMENT_SESSION_COOKIE,
  createCampaignManagementSessionValue,
} from "@/lib/campaigns/session";
import {
  getUsableCampaignToken,
  getUsableCampaignTransferToken,
} from "@/lib/campaigns/tokens";
import { getCampaignById } from "@/lib/campaigns/repository";

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
      response.headers.set(
        "Location",
        `/kampagne/verwalten/uebernehmen?token=${encodeURIComponent(token)}`
      );
      return response;
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
