import { NextResponse, type NextRequest } from "next/server";
import {
  CAMPAIGN_MANAGEMENT_SESSION_COOKIE,
  createCampaignManagementSessionValue,
} from "@/lib/campaigns/session";
import { getUsableCampaignToken } from "@/lib/campaigns/tokens";

const SESSION_TTL_SECONDS = 60 * 60 * 2;

export async function GET(request: NextRequest) {
  const response = new NextResponse(null, {
    status: 303,
    headers: { Location: "/kampagne/verwalten" },
  });

  const token = request.nextUrl.searchParams.get("token");
  if (token) {
    const record = await getUsableCampaignToken(token, "manage");
    if (record) {
      response.cookies.set({
        name: CAMPAIGN_MANAGEMENT_SESSION_COOKIE,
        value: createCampaignManagementSessionValue(
          record.campaignId,
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
